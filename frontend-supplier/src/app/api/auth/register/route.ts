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

export async function POST(request: NextRequest) {
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

    const { firebase_uid, email, name, supplier_data } = await request.json();

    if (decodedToken.uid !== firebase_uid) {
      return NextResponse.json({ error: "Token mismatch" }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT user_id FROM "user" WHERE firebase_uid = $1',
        [firebase_uid]
      );

      if (existingUser.rows.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      // Get supplier role ID
      const roleResult = await client.query(
        "SELECT id FROM roles WHERE role = $1",
        ["SUPPLIER"]
      );

      if (roleResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Supplier role not found" },
          { status: 500 }
        );
      }

      const supplierRoleId = roleResult.rows[0].id;

      // Create user
      const userResult = await client.query(
        `INSERT INTO "user" (firebase_uid, email, name, role_id, account_status, is_active)
         VALUES ($1, $2, $3, $4, 'active', true)
         RETURNING user_id`,
        [firebase_uid, email, name, supplierRoleId]
      );

      const userId = userResult.rows[0].user_id;

      // Create supplier
      const supplierResult = await client.query(
        `INSERT INTO supplier (user_id, supplier_name, supplier_email, supplier_tel, address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, supplier_name, supplier_email, supplier_tel, address, created_at`,
        [
          userId,
          supplier_data.supplier_name,
          supplier_data.supplier_email,
          supplier_data.supplier_tel || null,
          supplier_data.address || null,
        ]
      );

      await client.query("COMMIT");

      const supplier = supplierResult.rows[0];

      return NextResponse.json({
        success: true,
        user: {
          user_id: userId,
          firebase_uid,
          email,
          name,
          role: "SUPPLIER",
        },
        supplier,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Failed to register supplier",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
