import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { admin } from "@/lib/firebase-admin";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    console.log("Customer creation API called");

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid authorization header");
      return NextResponse.json(
        { error: "No valid authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    console.log("Token received, verifying...");

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    console.log("Firebase token verified for UID:", firebaseUid);

    const { customer_name, customer_email, customer_tel, address } =
      await request.json();

    console.log("Customer data:", {
      customer_name,
      customer_email,
      customer_tel,
      address,
    });

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // First, create or get user record
      const userQuery = `
        INSERT INTO app_user (firebase_uid, email, name, role_id, is_active, account_status)
        VALUES ($1, $2, $3, (SELECT id FROM roles WHERE role = 'CUSTOMER'), true, 'active')
        ON CONFLICT (firebase_uid) 
        DO UPDATE SET 
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          updated_at = now()
        RETURNING user_id
      `;

      const userResult = await client.query(userQuery, [
        firebaseUid,
        customer_email,
        customer_name,
      ]);
      const userId = userResult.rows[0].user_id;
      console.log("User created/updated with ID:", userId);

      // Then create customer record
      const customerQuery = `
        INSERT INTO customer (user_id, customer_name, customer_email, customer_tel, address, loyalty_points)
        VALUES ($1, $2, $3, $4, $5, 0)
        RETURNING *
      `;

      const customerResult = await client.query(customerQuery, [
        userId,
        customer_name,
        customer_email,
        customer_tel || null,
        address || null,
      ]);

      console.log("Customer created:", customerResult.rows[0]);
      await client.query("COMMIT");

      return NextResponse.json(customerResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
