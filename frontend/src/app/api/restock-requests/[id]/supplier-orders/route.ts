import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requestId = id;

    if (isNaN(Number(requestId))) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Get supplier orders for this restock request with all details
    const supplierOrders = await sql`
      SELECT 
        so.id,
        so.restock_request_id,
        so.supplier_id,
        so.order_status,
        so.payment_status,
        so.total_amount,
        so.estimated_delivery_date,
        so.actual_delivery_date,
        so.supplier_notes,
        so.created_at,
        so.updated_at,
        so.paid_at,
        so.cancelled_at,
        so.completed_at,
        so.stripe_payment_intent_id,
        so.payment_method,
        
        -- Supplier details
        s.supplier_name,
        s.supplier_email,
        s.supplier_tel
        
      FROM supplier_order so
      LEFT JOIN supplier s ON so.supplier_id = s.id
      WHERE so.restock_request_id = ${requestId}
      ORDER BY so.created_at DESC
    `;

    // Get items for each supplier order
    const ordersWithItems = await Promise.all(
      supplierOrders.map(async (order) => {
        const items = await sql`
          SELECT 
            soi.id,
            soi.supplier_order_id,
            soi.restock_request_item_id,
            soi.inventory_id,
            soi.supplier_item_name,
            soi.offered_quantity,
            soi.unit_price,
            soi.total_price,
            soi.supplier_item_description,
            soi.availability_status,
            soi.lead_time_days,
            
            -- Inventory details
            ii.inventory_name,
            c.category_name
            
          FROM supplier_order_item soi
          LEFT JOIN inventory_item ii ON soi.inventory_id = ii.inventory_id
          LEFT JOIN category c ON ii.category_id = c.id
          WHERE soi.supplier_order_id = ${order.id}
          ORDER BY ii.inventory_name
        `;

        return {
          ...order,
          items,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error("Error fetching supplier orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier orders" },
      { status: 500 }
    );
  }
}
