import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { admin } from "@/lib/firebase-admin";
import Stripe from "stripe";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const { id } = await params;

    const orderId = parseInt(id);
    const { action } = await request.json();

    if (!action || !["cancel", "pay"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'cancel' or 'pay'" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Verify order belongs to the authenticated customer
      const orderOwnershipQuery = `
        SELECT co.id, co.order_status, co.payment_status, co.stripe_payment_intent_id, co.total_amount,
               c.id as customer_id, c.customer_name, c.customer_email
        FROM customer_order co
        INNER JOIN customer c ON co.customer_id = c.id
        INNER JOIN "user" u ON c.user_id = u.user_id
        WHERE co.id = $1 AND u.firebase_uid = $2
      `;
      const orderResult = await client.query(orderOwnershipQuery, [
        orderId,
        firebaseUid,
      ]);

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Order not found or access denied" },
          { status: 404 }
        );
      }

      const order = orderResult.rows[0];

      if (action === "cancel") {
        // Can only cancel pending orders
        if (order.order_status !== "pending") {
          return NextResponse.json(
            { error: "Only pending orders can be cancelled" },
            { status: 400 }
          );
        }

        // If order was paid, we need to handle refund (for future implementation)
        if (order.payment_status === "paid") {
          return NextResponse.json(
            {
              error:
                "Paid orders cannot be cancelled directly. Please contact support for refunds.",
            },
            { status: 400 }
          );
        }

        // Get order items for future reference (no need to restore inventory since we don't reduce on order creation)
        const orderItemsQuery = `
          SELECT inventory_id, quantity
          FROM order_item
          WHERE order_id = $1
        `;
        await client.query(orderItemsQuery, [orderId]);

        // Note: No need to restore inventory since stock is only reduced when payment is confirmed

        // Update order status to cancelled
        const updateOrderQuery = `
          UPDATE customer_order 
          SET order_status = 'cancelled', updated_at = now()
          WHERE id = $1
        `;
        await client.query(updateOrderQuery, [orderId]);

        // Cancel the Stripe payment intent if it exists and is not paid
        try {
          if (
            order.stripe_payment_intent_id &&
            order.payment_status === "unpaid"
          ) {
            await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
          }
        } catch (stripeError) {
          console.error("Error cancelling Stripe payment intent:", stripeError);
          // Don't fail the whole operation if Stripe cancellation fails
        }

        await client.query("COMMIT");

        return NextResponse.json({
          message: "Order cancelled successfully",
          order_id: orderId,
          status: "cancelled",
        });
      } else if (action === "pay") {
        // Can only pay for unpaid orders
        if (order.payment_status !== "unpaid") {
          return NextResponse.json(
            { error: "Order is already paid or cannot be paid" },
            { status: 400 }
          );
        }

        if (order.order_status === "cancelled") {
          return NextResponse.json(
            { error: "Cannot pay for cancelled orders" },
            { status: 400 }
          );
        }

        // Create or retrieve the existing payment intent
        let paymentIntent;
        try {
          if (order.stripe_payment_intent_id) {
            // Retrieve existing payment intent
            paymentIntent = await stripe.paymentIntents.retrieve(
              order.stripe_payment_intent_id
            );

            // If it's cancelled or succeeded, create a new one
            if (
              paymentIntent.status === "canceled" ||
              paymentIntent.status === "succeeded"
            ) {
              paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(order.total_amount * 100),
                currency: "usd",
                metadata: {
                  order_id: orderId.toString(),
                  customer_id: order.customer_id.toString(),
                  customer_name: order.customer_name,
                  customer_email: order.customer_email,
                },
              });

              // Update the order with the new payment intent ID
              const updatePaymentIntentQuery = `
                UPDATE customer_order 
                SET stripe_payment_intent_id = $1, updated_at = now()
                WHERE id = $2
              `;
              await client.query(updatePaymentIntentQuery, [
                paymentIntent.id,
                orderId,
              ]);
            }
          } else {
            // Create new payment intent
            paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round(order.total_amount * 100),
              currency: "usd",
              metadata: {
                order_id: orderId.toString(),
                customer_id: order.customer_id.toString(),
                customer_name: order.customer_name,
                customer_email: order.customer_email,
              },
            });

            // Update the order with the payment intent ID
            const updatePaymentIntentQuery = `
              UPDATE customer_order 
              SET stripe_payment_intent_id = $1, updated_at = now()
              WHERE id = $2
            `;
            await client.query(updatePaymentIntentQuery, [
              paymentIntent.id,
              orderId,
            ]);
          }
        } catch (stripeError) {
          console.error("Error with Stripe payment intent:", stripeError);
          throw new Error("Failed to prepare payment. Please try again.");
        }

        await client.query("COMMIT");

        return NextResponse.json({
          message: "Payment intent ready",
          order_id: orderId,
          client_secret: paymentIntent.client_secret,
          total_amount: order.total_amount,
          status: "payment_ready",
        });
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
