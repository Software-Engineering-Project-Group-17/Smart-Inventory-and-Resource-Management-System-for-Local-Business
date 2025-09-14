import { NextRequest, NextResponse } from "next/server";
import { auth } from "firebase-admin";
import { query } from "@/lib/db";

// GET /api/supplier/branches - Get branches that have restock requests for this supplier
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Get supplier info
    const supplierQuery = `
      SELECT s.id
      FROM supplier s
      JOIN app_user u ON s.user_id = u.user_id
      WHERE u.firebase_uid = $1
    `;
    const supplierResult = await query(supplierQuery, [firebaseUid]);

    if (supplierResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    const supplier = supplierResult.rows[0];

    // Get branches that have restock requests where this supplier has created orders
    // OR all branches if we want to show all available branches
    const branchesQuery = `
      SELECT DISTINCT
        b.id,
        b.name,
        b.location,
        b.contact_number,
        b.description,
        COUNT(DISTINCT rr.id) as total_requests,
        COUNT(DISTINCT so.id) as supplier_orders_count,
        COUNT(CASE WHEN so.payment_status = 'paid' THEN 1 END) as paid_orders_count
      FROM branches b
      LEFT JOIN restock_request rr ON b.id = rr.branch_id
      LEFT JOIN supplier_order so ON rr.id = so.restock_request_id AND so.supplier_id = $1
      WHERE rr.id IS NOT NULL -- Only include branches that have restock requests
      GROUP BY b.id, b.name, b.location, b.contact_number, b.description
      ORDER BY b.name
    `;

    const branchesResult = await query(branchesQuery, [supplier.id]);

    // Also get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT rr.branch_id) as branches_with_requests,
        COUNT(DISTINCT rr.id) as total_requests,
        COUNT(DISTINCT so.id) as total_supplier_orders
      FROM restock_request rr
      LEFT JOIN supplier_order so ON rr.id = so.restock_request_id AND so.supplier_id = $1
    `;

    const statsResult = await query(statsQuery, [supplier.id]);

    return NextResponse.json({
      success: true,
      data: branchesResult.rows,
      statistics: statsResult.rows[0],
    });
  } catch (error) {
    console.error("Error fetching supplier branches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
