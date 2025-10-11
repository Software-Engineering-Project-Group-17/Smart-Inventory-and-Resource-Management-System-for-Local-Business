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

interface OrderItem {
  inventory_id: number;
  quantity: number;
  unit_price: number;
}

export async function POST(request: NextRequest) {
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

    const { items, shipping_address, payment_method } = await request.json();

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get customer data
      const customerQuery = `
        SELECT c.id, c.customer_name, c.customer_email
        FROM customer c
        INNER JOIN app_user u ON c.user_id = u.user_id
        WHERE u.firebase_uid = $1
      `;
      const customerResult = await client.query(customerQuery, [firebaseUid]);

      if (customerResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      const customer = customerResult.rows[0];

      // Get branch ID from environment variable
      const branchId = process.env.BRANCH_ID;
      if (!branchId) {
        return NextResponse.json(
          { error: "Branch ID not configured" },
          { status: 500 }
        );
      }

      // Validate inventory and calculate total
      let totalAmount = 0;
      const validatedItems: OrderItem[] = [];

      for (const item of items) {
        const inventoryQuery = `
          SELECT inventory_id, inventory_name, unit_price, quantity
          FROM inventory_item
          WHERE inventory_id = $1 AND branch_id = $2
        `;
        const inventoryResult = await client.query(inventoryQuery, [
          item.inventory_id,
          parseInt(branchId),
        ]);

        if (inventoryResult.rows.length === 0) {
          throw new Error(`Product with ID ${item.inventory_id} not found`);
        }

        const inventory = inventoryResult.rows[0];

        if (inventory.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${inventory.inventory_name}. Available: ${inventory.quantity}, Requested: ${item.quantity}`
          );
        }

        const itemTotal = inventory.unit_price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          inventory_id: item.inventory_id,
          quantity: item.quantity,
          unit_price: inventory.unit_price,
        });
      }

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          customer_id: customer.id.toString(),
          customer_name: customer.customer_name,
          customer_email: customer.customer_email,
        },
      });

      // Create order in database
      const orderQuery = `
        INSERT INTO customer_order (
          customer_id, 
          total_amount, 
          order_status, 
          payment_status,
          shipping_address,
          stripe_payment_intent_id,
          branch_id,
          created_at
        )
        VALUES ($1, $2, 'pending', 'unpaid', $3, $4, $5, now())
        RETURNING id
      `;

      const orderResult = await client.query(orderQuery, [
        customer.id,
        totalAmount,
        shipping_address || null,
        paymentIntent.id,
        parseInt(branchId),
      ]);

      const orderId = orderResult.rows[0].id;

      // Create order items
      for (const item of validatedItems) {
        const orderItemQuery = `
          INSERT INTO order_item (
            order_id, 
            inventory_id, 
            quantity, 
            unit_price, 
            total_price
          )
          VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(orderItemQuery, [
          orderId,
          item.inventory_id,
          item.quantity,
          item.unit_price,
          item.unit_price * item.quantity,
        ]);

        // NOTE: We don't update inventory quantity here anymore.
        // Stock will only be updated when payment is confirmed via webhook.
        // This allows customers to create orders and pay later without reducing stock prematurely.
      }

      await client.query("COMMIT");

      return NextResponse.json({
        order_id: orderId,
        client_secret: paymentIntent.client_secret,
        total_amount: totalAmount,
        status: "created",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
