import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { admin } from "@/lib/firebase-admin";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PATCH(request: NextRequest) {
  try {
    console.log("Customer update API called");

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

    const { customer_tel, address } = await request.json();

    console.log("Update data:", {
      customer_tel,
      address,
    });

    // Validate required fields
    if (!customer_tel || !address) {
      return NextResponse.json(
        { error: "Phone number and address are required" },
        { status: 400 }
      );
    }

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Find customer by Firebase UID
      const findCustomerQuery = `
        SELECT c.* 
        FROM customer c
        INNER JOIN app_user u ON c.user_id = u.user_id
        WHERE u.firebase_uid = $1
      `;

      const customerResult = await client.query(findCustomerQuery, [
        firebaseUid,
      ]);

      if (customerResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      const customer = customerResult.rows[0];

      // Update customer information
      const updateQuery = `
        UPDATE customer 
        SET customer_tel = $1, address = $2
        WHERE id = $3
        RETURNING *
      `;

      const updatedResult = await client.query(updateQuery, [
        customer_tel,
        address,
        customer.id,
      ]);

      console.log("Customer information updated:", updatedResult.rows[0]);
      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        customer: updatedResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
