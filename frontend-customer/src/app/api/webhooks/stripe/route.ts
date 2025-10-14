import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import Stripe from "stripe";
import { NotificationService } from "@/lib/notification-service";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log("🎯 WEBHOOK CALLED - Timestamp:", new Date().toISOString());
  
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;
  
  console.log("📡 Webhook details:", {
    bodyLength: body?.length || 0,
    hasSignature: !!sig,
    signaturePreview: sig?.substring(0, 20) + "...",
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("✅ Webhook signature verified successfully");
    console.log("📋 Event type:", event.type, "Event ID:", event.id);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
        case "payment_intent.succeeded":
          console.log("💰 Processing payment_intent.succeeded");
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log("🆔 Payment Intent ID:", paymentIntent.id);

          const client = await pool.connect();
          try {
            await client.query("BEGIN");          // Get order details
          const orderQuery = `
            SELECT id, order_status, payment_status
            FROM customer_order 
            WHERE stripe_payment_intent_id = $1
          `;
          const orderResult = await client.query(orderQuery, [
            paymentIntent.id,
          ]);

          if (orderResult.rows.length === 0) {
            console.error(
              `Order not found for payment intent: ${paymentIntent.id}`
            );
            break;
          }

          const order = orderResult.rows[0];

          // Only update stock if payment wasn't already processed
          if (order.payment_status !== "paid") {
            // Get order items to update inventory
            const orderItemsQuery = `
              SELECT inventory_id, quantity
              FROM order_item
              WHERE order_id = $1
            `;
            const itemsResult = await client.query(orderItemsQuery, [order.id]);

            // Update inventory quantities (reduce stock for paid orders)
            for (const item of itemsResult.rows) {
              const branchId = parseInt(process.env.BRANCH_ID || "3");

              const updateInventoryQuery = `
                UPDATE inventory_item 
                SET quantity = quantity - $1
                WHERE inventory_id = $2 AND quantity >= $1 AND branch_id = $3
              `;
              const updateResult = await client.query(updateInventoryQuery, [
                item.quantity,
                item.inventory_id,
                branchId,
              ]);

              // Check if stock was sufficient
              if (updateResult.rowCount === 0) {
                // Get item name for error logging
                const itemNameQuery = `
                  SELECT inventory_name
                  FROM inventory_item
                  WHERE inventory_id = $1
                `;
                const itemNameResult = await client.query(itemNameQuery, [
                  item.inventory_id,
                ]);
                const itemName =
                  itemNameResult.rows[0]?.inventory_name ||
                  `Item ${item.inventory_id}`;

                console.error(
                  `Insufficient stock for ${itemName} (ID: ${item.inventory_id}) when processing payment for order ${order.id}`
                );

                // You might want to handle this case differently - maybe set order to processing
                // and send notification to admin about stock issue
              } else {
                console.log(`✅ Successfully reduced inventory for item ${item.inventory_id} by ${item.quantity} units`);
                
                // Check for low stock notification after successful inventory update
                console.log(`🔍 Checking low stock for item ${item.inventory_id} in branch ${branchId}`);
                try {
                  // Get updated inventory details for notification
                  const inventoryAfterUpdate = await client.query(`
                    SELECT inventory_name, quantity, low_stock_threshold
                    FROM inventory_item 
                    WHERE inventory_id = $1 AND branch_id = $2
                  `, [item.inventory_id, branchId]);
                  
                  if (inventoryAfterUpdate.rows.length > 0) {
                    const updatedItem = inventoryAfterUpdate.rows[0];
                    console.log(`📊 Item ${updatedItem.inventory_name}: Current=${updatedItem.quantity}, Threshold=${updatedItem.low_stock_threshold}`);
                    
                    const notificationResult = await NotificationService.checkAndCreateLowStockNotification(
                      item.inventory_id,
                      branchId
                    );
                    if (notificationResult) {
                      console.log(`✅ Created low stock notification:`, notificationResult);
                    } else {
                      console.log(`ℹ️ No notification needed for item ${item.inventory_id} (stock above threshold)`);
                    }
                  }
                } catch (notificationError) {
                  console.error(
                    `❌ Failed to check low stock notification for item ${item.inventory_id}:`,
                    notificationError
                  );
                  console.error('Notification error details:', notificationError);
                  // Don't fail the payment processing if notification fails
                }
              }
            }
          }

          // Update order status to completed and payment status to paid
          const updateOrderQuery = `
            UPDATE customer_order 
            SET 
              order_status = 'completed',
              payment_status = 'paid',
              updated_at = now()
            WHERE id = $1
          `;

          await client.query(updateOrderQuery, [order.id]);

          await client.query("COMMIT");

          console.log(
            `Payment succeeded and stock updated for order ${order.id} with payment intent: ${paymentIntent.id}`
          );
        } catch (error) {
          await client.query("ROLLBACK");
          console.error("Error processing payment success:", error);
          throw error;
        } finally {
          client.release();
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;

        // Update order status to cancelled
        const cancelOrderQuery = `
          UPDATE customer_order 
          SET 
            order_status = 'cancelled',
            updated_at = now()
          WHERE stripe_payment_intent_id = $1
        `;

        await pool.query(cancelOrderQuery, [failedPayment.id]);

        console.log(
          `Payment failed for order with payment intent: ${failedPayment.id}`
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
