import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Check if restock_request table exists and has data
    const restockRequestCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'restock_request'
    `;

    const restockRequestItemCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'restock_request_item'
    `;

    // Check staff table structure
    const staffCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'staff' 
      AND table_schema = 'public'
      ORDER BY column_name
    `;

    // Check user table structure
    const userCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND table_schema = 'public'
      ORDER BY column_name
    `;

    // Get sample staff data
    const staffSample = await sql`
      SELECT s.id, s.user_id, s.branch_id, u.email, u.firebase_uid
      FROM staff s
      LEFT JOIN "user" u ON s.user_id = u.user_id
      LIMIT 3
    `;

    // Check if there are any existing restock requests
    const existingRequests = await sql`
      SELECT COUNT(*) as count FROM restock_request
    `;

    return NextResponse.json({
      database_status: "connected",
      tables: {
        restock_request_exists: restockRequestCheck.length > 0,
        restock_request_item_exists: restockRequestItemCheck.length > 0,
      },
      staff_columns: staffCheck,
      user_columns: userCheck,
      staff_sample: staffSample,
      existing_requests_count: existingRequests[0]?.count || 0,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
