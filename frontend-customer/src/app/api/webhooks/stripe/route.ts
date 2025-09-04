import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import Stripe from "stripe";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update order status to completed and payment status to paid
        const updateOrderQuery = `
          UPDATE customer_order 
          SET 
            order_status = 'completed',
            payment_status = 'paid',
            updated_at = now()
          WHERE stripe_payment_intent_id = $1
        `;

        await pool.query(updateOrderQuery, [paymentIntent.id]);

        console.log(
          `Payment succeeded for order with payment intent: ${paymentIntent.id}`
        );
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
