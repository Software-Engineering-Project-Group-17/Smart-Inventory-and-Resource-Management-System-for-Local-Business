import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface RestockRequestDetail {
  id: number;
  branch_id: number;
  created_by: number;
  title: string;
  description: string;
  status: "draft" | "pending" | "active" | "completed" | "cancelled";
  total_estimated_cost: number;
  priority: "low" | "medium" | "high" | "urgent";
  required_by_date: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;

  // Branch details
  branch_name: string;
  branch_location: string;

  // Creator details
  created_by_name: string;
  created_by_email: string;

  // Items in this request
  items: Array<{
    id: number;
    inventory_id: number;
    product_name: string;
    product_code?: string;
    requested_quantity: number;
    current_stock: number;
    unit_price: number;
    total_cost: number;
    notes?: string;
    created_at: string;
  }>;

  // Supplier orders for this request
  supplier_orders: Array<{
    id: number;
    supplier_id: number;
    supplier_name: string;
    supplier_email: string;
    total_amount: number;
    payment_status: "pending" | "processing" | "paid" | "failed" | "refunded";
    delivery_status: "pending" | "shipped" | "delivered" | "cancelled";
    expected_delivery_date?: string;
    created_at: string;
    items_count: number;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requestId = id;

    const numericRequestId = Number(requestId);
    if (isNaN(numericRequestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Get detailed restock request information
      const restockRequestQuery = `
        SELECT 
          rr.id,
          rr.title,
          rr.description,
          rr.status,
          rr.priority,
          rr.total_estimated_cost,
          rr.required_by_date,
          rr.created_at,
          rr.updated_at,
          rr.notes,
          
          -- Branch information
          b.id as branch_id,
          b.name as branch_name,
          b.location as branch_location,
          b.contact_number as branch_contact,
          b.description as branch_description,
          
          -- Creator information
          u.user_id as created_by_id,
          u.name as created_by_name,
          u.email as created_by_email
          
        FROM restock_request rr
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        WHERE rr.id = $1
      `;

      const requestResult = await client.query(restockRequestQuery, [
        requestId,
      ]);

      if (requestResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Restock request not found" },
          { status: 404 }
        );
      }

      const requestData = requestResult.rows[0];

      // Get all items in this restock request
      const itemsQuery = `
        SELECT 
          rri.id,
          rri.inventory_id,
          rri.requested_quantity,
          rri.estimated_unit_price,
          rri.notes as item_notes,
          rri.created_at as item_created_at,
          
          -- Inventory item information
          ii.inventory_name,
          ii.quantity as current_stock,
          ii.low_stock_threshold,
          ii.unit_price as current_unit_price,
          ii.image_url,
          
          -- Category information
          c.id as category_id,
          c.category_name,
          c.category_img_url
          
        FROM restock_request_item rri
        LEFT JOIN inventory_item ii ON rri.inventory_id = ii.inventory_id
        LEFT JOIN category c ON ii.category_id = c.id
        WHERE rri.restock_request_id = $1
        ORDER BY rri.id
      `;

      const itemsResult = await client.query(itemsQuery, [requestId]);

      // Get existing supplier orders for this request (if any)
      const supplierOrdersQuery = `
        SELECT 
          so.id,
          so.supplier_id,
          so.order_status,
          so.payment_status,
          so.total_amount,
          so.estimated_delivery_date,
          so.supplier_notes,
          so.created_at,
          
          -- Supplier information
          s.supplier_name,
          s.supplier_email,
          s.supplier_tel,
          
          -- Order items count
          COUNT(soi.id) as items_count,
          SUM(soi.offered_quantity) as total_offered_quantity
          
        FROM supplier_order so
        LEFT JOIN supplier s ON so.supplier_id = s.id
        LEFT JOIN supplier_order_item soi ON so.id = soi.supplier_order_id
        WHERE so.restock_request_id = $1
        GROUP BY so.id, s.supplier_name, s.supplier_email, s.supplier_tel
        ORDER BY so.created_at DESC
      `;

      const supplierOrdersResult = await client.query(supplierOrdersQuery, [
        requestId,
      ]);

      // Process and structure the response
      const restockRequest = {
        id: requestData.id,
        title: requestData.title,
        description: requestData.description,
        status: requestData.status,
        priority: requestData.priority,
        total_estimated_cost: parseFloat(requestData.total_estimated_cost) || 0,
        required_by_date: requestData.required_by_date,
        created_at: requestData.created_at,
        updated_at: requestData.updated_at,
        notes: requestData.notes,

        branch: {
          id: requestData.branch_id,
          name: requestData.branch_name,
          location: requestData.branch_location,
          contact_number: requestData.branch_contact,
          description: requestData.branch_description,
        },

        created_by: {
          id: requestData.created_by_id,
          name: requestData.created_by_name,
          email: requestData.created_by_email,
        },

        items: itemsResult.rows.map((item) => ({
          id: item.id,
          inventory_id: item.inventory_id,
          inventory_name: item.inventory_name,
          requested_quantity: parseInt(item.requested_quantity),
          estimated_unit_price: parseFloat(item.estimated_unit_price) || 0,
          current_stock: parseInt(item.current_stock) || 0,
          low_stock_threshold: parseInt(item.low_stock_threshold) || 0,
          current_unit_price: parseFloat(item.current_unit_price) || 0,
          image_url: item.image_url,
          notes: item.item_notes,
          created_at: item.item_created_at,
          category: {
            id: item.category_id,
            name: item.category_name,
            image_url: item.category_img_url,
          },
        })),

        supplier_orders: supplierOrdersResult.rows.map((order) => ({
          id: order.id,
          supplier_id: order.supplier_id,
          supplier_name: order.supplier_name,
          supplier_email: order.supplier_email,
          supplier_tel: order.supplier_tel,
          order_status: order.order_status,
          payment_status: order.payment_status,
          total_amount: parseFloat(order.total_amount) || 0,
          estimated_delivery_date: order.estimated_delivery_date,
          supplier_notes: order.supplier_notes,
          created_at: order.created_at,
          items_count: parseInt(order.items_count) || 0,
          total_offered_quantity: parseInt(order.total_offered_quantity) || 0,
        })),

        statistics: {
          total_items: itemsResult.rows.length,
          total_quantity_requested: itemsResult.rows.reduce(
            (sum, item) => sum + parseInt(item.requested_quantity),
            0
          ),
          total_estimated_value: itemsResult.rows.reduce(
            (sum, item) =>
              sum +
              parseInt(item.requested_quantity) *
                (parseFloat(item.estimated_unit_price) || 0),
            0
          ),
          supplier_orders_count: supplierOrdersResult.rows.length,
        },
      };

      return NextResponse.json({
        success: true,
        data: restockRequest,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching restock request details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch restock request details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
