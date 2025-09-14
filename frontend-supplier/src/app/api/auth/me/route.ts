import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);

    const client = await pool.connect();

    try {
      // Get user and supplier data
      const result = await client.query(
        `SELECT 
          u.user_id,
          u.firebase_uid,
          u.email,
          u.name,
          u.account_status,
          u.is_active,
          r.role,
          s.id as supplier_id,
          s.supplier_name,
          s.supplier_email,
          s.supplier_tel,
          s.address,
          s.created_at as supplier_created_at
         FROM app_user u
         LEFT JOIN roles r ON u.role_id = r.id
         LEFT JOIN supplier s ON u.user_id = s.user_id
         WHERE u.firebase_uid = $1 AND u.is_active = true`,
        [decodedToken.uid]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userData = result.rows[0];

      // Check if user has supplier role
      if (userData.role !== "SUPPLIER") {
        return NextResponse.json(
          { error: "User is not a supplier" },
          { status: 403 }
        );
      }

      // Check if supplier data exists
      if (!userData.supplier_id) {
        return NextResponse.json(
          { error: "Supplier profile not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          user_id: userData.user_id,
          firebase_uid: userData.firebase_uid,
          email: userData.email,
          name: userData.name,
          account_status: userData.account_status,
          role: userData.role,
        },
        supplier: {
          id: userData.supplier_id,
          user_id: userData.user_id,
          supplier_name: userData.supplier_name,
          supplier_email: userData.supplier_email,
          supplier_tel: userData.supplier_tel,
          address: userData.address,
          created_at: userData.supplier_created_at,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      {
        error: "Failed to authenticate user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
