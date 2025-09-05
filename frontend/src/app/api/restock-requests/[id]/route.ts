import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Get the restock request with details
    const [restockRequest] = await sql`
      SELECT 
        rr.id,
        rr.branch_id,
        rr.created_by,
        rr.title,
        rr.description,
        rr.status,
        rr.total_estimated_cost,
        rr.priority,
        rr.required_by_date,
        rr.created_at,
        rr.updated_at,
        rr.completed_at,
        rr.notes,
        
        -- Creator details
        u.name as created_by_name,
        u.email as created_by_email,
        
        -- Branch details
        b.name as branch_name,
        b.location as branch_location,
        
        -- Request statistics
        COUNT(rri.id) as item_count,
        SUM(rri.requested_quantity) as total_quantity_requested
        
      FROM restock_request rr
      LEFT JOIN "user" u ON rr.created_by = u.user_id
      LEFT JOIN branches b ON rr.branch_id = b.id
      LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
      WHERE rr.id = ${requestId}
      GROUP BY rr.id, rr.branch_id, rr.created_by, rr.title, rr.description, rr.status, rr.total_estimated_cost, rr.priority, rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, u.name, u.email, b.name, b.location
    `;

    if (!restockRequest) {
      return NextResponse.json(
        { error: "Restock request not found" },
        { status: 404 }
      );
    }

    // Get request items
    const requestItems = await sql`
      SELECT 
        rri.id,
        rri.restock_request_id,
        rri.inventory_id,
        rri.requested_quantity,
        rri.estimated_unit_price,
        rri.notes,
        rri.created_at,
        
        -- Inventory details
        ii.inventory_name,
        ii.quantity as current_stock,
        ii.low_stock_threshold,
        c.category_name
        
      FROM restock_request_item rri
      LEFT JOIN inventory_item ii ON rri.inventory_id = ii.inventory_id
      LEFT JOIN category c ON ii.category_id = c.id
      WHERE rri.restock_request_id = ${requestId}
      ORDER BY ii.inventory_name
    `;

    return NextResponse.json({
      success: true,
      request: {
        ...restockRequest,
        items: requestItems,
      },
    });
  } catch (error) {
    console.error("Error fetching restock request details:", error);
    return NextResponse.json(
      { error: "Failed to fetch restock request details" },
      { status: 500 }
    );
  }
}
