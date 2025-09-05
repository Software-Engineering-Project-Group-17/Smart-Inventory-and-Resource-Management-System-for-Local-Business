import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";

const sql = neon(process.env.DATABASE_URL!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    console.log("Creating payment intent - start");
    const { supplier_order_id } = await request.json();
    console.log("Supplier order ID:", supplier_order_id);

    if (!supplier_order_id) {
      console.log("Error: No supplier order ID provided");
      return NextResponse.json(
        { error: "Supplier order ID is required" },
        { status: 400 }
      );
    }

    // Get supplier order details
    console.log("Fetching supplier order from database...");
    const [supplierOrder] = await sql`
      SELECT 
        so.*,
        s.supplier_name,
        rr.title as request_title
      FROM supplier_order so
      LEFT JOIN supplier s ON so.supplier_id = s.id
      LEFT JOIN restock_request rr ON so.restock_request_id = rr.id
      WHERE so.id = ${supplier_order_id}
    `;

    console.log("Supplier order found:", supplierOrder ? "Yes" : "No");
    if (supplierOrder) {
      console.log("Order amount:", supplierOrder.total_amount);
      console.log("Payment status:", supplierOrder.payment_status);
    }

    if (!supplierOrder) {
      console.log("Error: Supplier order not found");
      return NextResponse.json(
        { error: "Supplier order not found" },
        { status: 404 }
      );
    }

    if (supplierOrder.payment_status === "paid") {
      console.log("Error: Order already paid");
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(Number(supplierOrder.total_amount) * 100);
    console.log("Amount in cents:", amountInCents);

    // Create payment intent
    console.log("Creating Stripe payment intent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        supplier_order_id: supplier_order_id.toString(),
        supplier_name: supplierOrder.supplier_name || "Unknown Supplier",
        request_title: supplierOrder.request_title || "Restock Request",
      },
      description: `Payment for restock order from ${
        supplierOrder.supplier_name || "Supplier"
      }`,
    });

    console.log("Payment intent created:", paymentIntent.id);

    // Update supplier order with payment intent ID
    console.log("Updating supplier order with payment intent ID...");
    await sql`
      UPDATE supplier_order 
      SET 
        stripe_payment_intent_id = ${paymentIntent.id},
        updated_at = now()
      WHERE id = ${supplier_order_id}
    `;

    console.log("Payment intent creation successful - returning response");
    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: Number(supplierOrder.total_amount),
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Log specific Stripe errors
    if (error && typeof error === "object" && "type" in error) {
      console.error("Stripe error type:", (error as any).type);
      console.error("Stripe error code:", (error as any).code);
    }

    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
