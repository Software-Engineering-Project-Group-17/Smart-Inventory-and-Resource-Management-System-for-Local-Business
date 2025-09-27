import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { admin } from "@/lib/firebase-admin";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
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

    const client = await pool.connect();

    try {
      // Get customer ID from firebase UID
      const customerQuery = `
        SELECT c.id
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

      const customerId = customerResult.rows[0].id;

      // Get all orders for this customer with order items
      const ordersQuery = `
        SELECT 
          co.id as order_id,
          co.total_amount,
          co.order_status,
          co.payment_status,
          co.shipping_address,
          co.stripe_payment_intent_id,
          co.created_at,
          co.updated_at,
          
          -- Order items details
          oi.id as item_id,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          
          -- Product details
          ii.inventory_id,
          ii.inventory_name,
          ii.image_url
          
        FROM customer_order co
        LEFT JOIN order_item oi ON co.id = oi.order_id
        LEFT JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
        WHERE co.customer_id = $1
        ORDER BY co.created_at DESC, oi.id ASC
      `;

      const ordersResult = await client.query(ordersQuery, [customerId]);

      // Group the results by order
      const ordersMap = new Map();

      ordersResult.rows.forEach((row) => {
        const orderId = row.order_id;

        if (!ordersMap.has(orderId)) {
          ordersMap.set(orderId, {
            id: row.order_id,
            total_amount: parseFloat(row.total_amount),
            order_status: row.order_status,
            payment_status: row.payment_status,
            shipping_address: row.shipping_address,
            stripe_payment_intent_id: row.stripe_payment_intent_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            items: [],
          });
        }

        // Add item if it exists (some orders might not have items due to LEFT JOIN)
        if (row.item_id) {
          ordersMap.get(orderId).items.push({
            id: row.item_id,
            quantity: row.quantity,
            unit_price: parseFloat(row.unit_price),
            total_price: parseFloat(row.total_price),
            product: {
              inventory_id: row.inventory_id,
              inventory_name: row.inventory_name,
              image_url: row.image_url,
            },
          });
        }
      });

      // Convert map to array
      const orders = Array.from(ordersMap.values());

      return NextResponse.json({
        orders,
        total_orders: orders.length,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
