import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";
import { NotificationService } from "@/lib/notification-service";

const sql = neon(process.env.DATABASE_URL!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const sig = (await headersList).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log(`Webhook received: ${event.type}`);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err);
    return NextResponse.json(
      { error: `Webhook Error: ${err}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment succeeded: ${paymentIntent.id}`);

      try {
        await handlePaymentSuccess(paymentIntent);
      } catch (error) {
        console.error("Error handling payment success:", error);
        return NextResponse.json(
          { error: "Failed to process payment success" },
          { status: 500 }
        );
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment failed: ${failedPayment.id}`);

      try {
        await handlePaymentFailure(failedPayment);
      } catch (error) {
        console.error("Error handling payment failure:", error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const supplier_order_id = paymentIntent.metadata.supplier_order_id;

  if (!supplier_order_id) {
    console.error("No supplier_order_id in payment intent metadata");
    return;
  }

  console.log(`Processing successful payment for order ${supplier_order_id}`);

  // First check if this payment has already been processed
  const [existingOrder] = await sql`
    SELECT payment_status, id 
    FROM supplier_order 
    WHERE id = ${supplier_order_id}
  `;

  if (!existingOrder) {
    console.error(`Supplier order ${supplier_order_id} not found`);
    return;
  }

  if (existingOrder.payment_status === "paid") {
    console.log(
      `Payment for order ${supplier_order_id} already processed, skipping`
    );
    return;
  }

  // Start transaction
  try {
    // Update supplier order payment status
    await sql`
      UPDATE supplier_order 
      SET 
        payment_status = 'paid',
        stripe_payment_intent_id = ${paymentIntent.id},
        updated_at = now()
      WHERE id = ${supplier_order_id}
    `;

    console.log(
      `Updated supplier order ${supplier_order_id} payment status to paid`
    );

    // Get supplier order details including restock request ID
    const [supplierOrder] = await sql`
      SELECT 
        so.*,
        rr.id as restock_request_id,
        rr.status as request_status
      FROM supplier_order so
      LEFT JOIN restock_request rr ON so.restock_request_id = rr.id
      WHERE so.id = ${supplier_order_id}
    `;

    if (!supplierOrder) {
      console.error(`Supplier order ${supplier_order_id} not found`);
      return;
    }

    // Get all supplier order items to update inventory
    const orderItems = await sql`
      SELECT 
        soi.*,
        i.inventory_id,
        i.quantity as current_quantity
      FROM supplier_order_item soi
      LEFT JOIN inventory_item i ON soi.inventory_id = i.inventory_id
      WHERE soi.supplier_order_id = ${supplier_order_id}
    `;

    console.log(`Found ${orderItems.length} items to update in inventory`);

    // Update inventory quantities
    for (const item of orderItems) {
      if (item.inventory_id) {
        const previousQuantity = Number(item.current_quantity);
        const newQuantity = previousQuantity + Number(item.offered_quantity);

        await sql`
          UPDATE inventory_item 
          SET 
            quantity = ${newQuantity}
          WHERE inventory_id = ${item.inventory_id}
        `;

        console.log(
          `Updated inventory ${item.inventory_id}: ${item.current_quantity} -> ${newQuantity} (added ${item.offered_quantity})`
        );

        // Create restock completion notification
        try {
          await NotificationService.createRestockCompletionNotification(
            item.inventory_id,
            previousQuantity,
            newQuantity
          );
        } catch (notificationError) {
          console.error(
            `Failed to create restock notification for item ${item.inventory_id}:`,
            notificationError
          );
          // Don't fail the payment processing if notification fails
        }
      }
    }

    // Check if all orders for this restock request are paid
    const unpaidOrders = await sql`
      SELECT COUNT(*) as count
      FROM supplier_order 
      WHERE restock_request_id = ${supplierOrder.restock_request_id}
      AND payment_status != 'paid'
    `;

    // If all orders are paid, update restock request status
    if (Number(unpaidOrders[0].count) === 0) {
      await sql`
        UPDATE restock_request 
        SET 
          status = 'completed',
          updated_at = now()
        WHERE id = ${supplierOrder.restock_request_id}
      `;

      console.log(
        `Updated restock request ${supplierOrder.restock_request_id} status to completed`
      );
    }

    console.log("Payment success processing completed successfully");
  } catch (error) {
    console.error("Error in payment success transaction:", error);
    throw error;
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const supplier_order_id = paymentIntent.metadata.supplier_order_id;

  if (!supplier_order_id) {
    console.error("No supplier_order_id in payment intent metadata");
    return;
  }

  console.log(`Processing failed payment for order ${supplier_order_id}`);

  try {
    // Update supplier order payment status to failed
    await sql`
      UPDATE supplier_order 
      SET 
        payment_status = 'failed',
        stripe_payment_intent_id = ${paymentIntent.id},
        updated_at = now()
      WHERE id = ${supplier_order_id}
    `;

    console.log(
      `Updated supplier order ${supplier_order_id} payment status to failed`
    );
  } catch (error) {
    console.error("Error updating payment failure status:", error);
    throw error;
  }
}
