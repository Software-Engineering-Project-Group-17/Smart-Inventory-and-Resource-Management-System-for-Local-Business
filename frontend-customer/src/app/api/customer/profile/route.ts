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

    // Get customer data from database
    const query = `
      SELECT 
        c.id,
        c.customer_name,
        c.customer_email,
        c.customer_tel,
        c.address,
        c.loyalty_points,
        c.created_at
      FROM customer c
      INNER JOIN app_user u ON c.user_id = u.user_id
      WHERE u.firebase_uid = $1
    `;

    const result = await pool.query(query, [firebaseUid]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
