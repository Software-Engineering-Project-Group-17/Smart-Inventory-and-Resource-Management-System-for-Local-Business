import { NextRequest, NextResponse } from "next/server";
import { auth } from "firebase-admin";
import { query } from "@/lib/db";

// POST /api/supplier/orders - Create a new supplier order
export async function POST(request: NextRequest) {
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
      SELECT s.id, s.supplier_name
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

    // Parse request body
    const body = await request.json();
    const {
      restock_request_id,
      estimated_delivery_date,
      supplier_notes,
      items,
    } = body;

    // Validate required fields
    if (
      !restock_request_id ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields: restock_request_id and items" },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (
        !item.restock_request_item_id ||
        !item.inventory_id ||
        !item.offered_quantity ||
        !item.unit_price
      ) {
        return NextResponse.json(
          {
            error:
              "Each item must have restock_request_item_id, inventory_id, offered_quantity, and unit_price",
          },
          { status: 400 }
        );
      }
      if (item.offered_quantity <= 0 || item.unit_price < 0) {
        return NextResponse.json(
          {
            error:
              "Offered quantity must be positive and unit price must be non-negative",
          },
          { status: 400 }
        );
      }
    }

    // Start transaction
    await query("BEGIN");

    try {
      // Verify restock request exists and is active
      const restockQuery = `
        SELECT id, status
        FROM restock_request
        WHERE id = $1
      `;
      const restockResult = await query(restockQuery, [restock_request_id]);

      if (restockResult.rows.length === 0) {
        await query("ROLLBACK");
        return NextResponse.json(
          { error: "Restock request not found" },
          { status: 404 }
        );
      }

      const restockRequest = restockResult.rows[0];
      if (
        restockRequest.status === "completed" ||
        restockRequest.status === "cancelled"
      ) {
        await query("ROLLBACK");
        return NextResponse.json(
          {
            error:
              "Cannot create order for completed or cancelled restock request",
          },
          { status: 400 }
        );
      }

      // Calculate total amount
      const totalAmount = items.reduce((sum: number, item: any) => {
        return sum + item.offered_quantity * item.unit_price;
      }, 0);

      // Create supplier order
      const orderQuery = `
        INSERT INTO supplier_order (
          restock_request_id,
          supplier_id,
          order_status,
          payment_status,
          total_amount,
          estimated_delivery_date,
          supplier_notes
        ) VALUES ($1, $2, 'pending', 'unpaid', $3, $4, $5)
        RETURNING id, created_at
      `;

      const orderResult = await query(orderQuery, [
        restock_request_id,
        supplier.id,
        totalAmount,
        estimated_delivery_date || null,
        supplier_notes || null,
      ]);

      const supplierOrder = orderResult.rows[0];

      // Create supplier order items
      for (const item of items) {
        const totalPrice = item.offered_quantity * item.unit_price;

        const itemQuery = `
          INSERT INTO supplier_order_item (
            supplier_order_id,
            restock_request_item_id,
            inventory_id,
            supplier_item_name,
            offered_quantity,
            unit_price,
            total_price,
            supplier_item_description,
            availability_status,
            lead_time_days
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;

        await query(itemQuery, [
          supplierOrder.id,
          item.restock_request_item_id,
          item.inventory_id,
          item.supplier_item_name || null,
          item.offered_quantity,
          item.unit_price,
          totalPrice,
          item.supplier_item_description || null,
          item.availability_status || "available",
          item.lead_time_days || 0,
        ]);
      }

      // Update restock request status to active if it's pending
      if (restockRequest.status === "pending") {
        await query(
          "UPDATE restock_request SET status = 'active' WHERE id = $1",
          [restock_request_id]
        );
      }

      await query("COMMIT");

      // Return success response
      return NextResponse.json({
        success: true,
        data: {
          order_id: supplierOrder.id,
          total_amount: totalAmount,
          items_count: items.length,
          created_at: supplierOrder.created_at,
        },
        message: "Supplier order created successfully",
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating supplier order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/supplier/orders - Get supplier's orders
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

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const offset = (page - 1) * limit;
    const branchId = searchParams.get("branch_id"); // Optional branch filter

    // Build WHERE clause for branch filtering
    let whereClause = "WHERE so.supplier_id = $1";
    let queryParams = [supplier.id];
    let paramIndex = 2;

    if (branchId) {
      const numericBranchId = parseInt(branchId);
      if (!isNaN(numericBranchId)) {
        whereClause += ` AND rr.branch_id = $${paramIndex}`;
        queryParams.push(numericBranchId);
        paramIndex++;
      }
    }

    // Get orders with restock request details
    const ordersQuery = `
      SELECT 
        so.id,
        so.restock_request_id,
        so.order_status,
        so.payment_status,
        so.total_amount,
        so.estimated_delivery_date,
        so.actual_delivery_date,
        so.supplier_notes,
        so.created_at,
        so.updated_at,
        rr.title as request_title,
        rr.status as request_status,
        rr.priority as request_priority,
        rr.required_by_date,
        rr.branch_id,
        b.name as branch_name,
        b.location as branch_location,
        b.contact_number as branch_contact,
        COUNT(soi.id) as items_count,
        SUM(soi.offered_quantity) as total_quantity_offered
      FROM supplier_order so
      JOIN restock_request rr ON so.restock_request_id = rr.id
      JOIN branches b ON rr.branch_id = b.id
      LEFT JOIN supplier_order_item soi ON so.id = soi.supplier_order_id
      ${whereClause}
      GROUP BY so.id, rr.id, b.id
      ORDER BY so.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const ordersResult = await query(ordersQuery, queryParams);

    // Get total count with branch filter
    const countQuery = `
      SELECT COUNT(*) as total
      FROM supplier_order so
      JOIN restock_request rr ON so.restock_request_id = rr.id
      ${whereClause}
    `;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const countResult = await query(countQuery, countParams);
    const totalOrders = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: ordersResult.rows,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1,
      },
      filters: {
        branch_id: branchId ? parseInt(branchId) : null,
        supplier_id: supplier.id,
      },
    });
  } catch (error) {
    console.error("Error fetching supplier orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
