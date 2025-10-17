import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// PATCH /api/supplier-orders/[id]/mark-shipped - Mark supplier order as shipped
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Get the current order details
    const orderResult = await sql`
      SELECT 
        so.id,
        so.supplier_id,
        so.order_status,
        so.payment_status,
        so.restock_request_id,
        s.supplier_name
      FROM supplier_order so
      INNER JOIN supplier s ON so.supplier_id = s.id
      WHERE so.id = ${orderId}
    `;

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Supplier order not found" },
        { status: 404 }
      );
    }

    const supplierOrder = orderResult[0] as any;

    // Check if order is paid before allowing shipping
    if (supplierOrder.payment_status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot mark unpaid order as shipped. Order must be paid first.",
        },
        { status: 400 }
      );
    }

    // Check if order is in a valid status to be shipped
    if (supplierOrder.order_status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot mark cancelled order as shipped",
        },
        { status: 400 }
      );
    }

    if (supplierOrder.order_status === "shipped") {
      return NextResponse.json(
        {
          success: false,
          message: "Order is already marked as shipped",
        },
        { status: 400 }
      );
    }

    // Update the order status to shipped
    await sql`
      UPDATE supplier_order 
      SET 
        order_status = 'shipped',
        updated_at = NOW()
      WHERE id = ${orderId}
    `;

    console.log(
      `✅ Supplier order ${orderId} marked as shipped by supplier ${supplierOrder.supplier_name}`
    );

    return NextResponse.json({
      success: true,
      message: "Order marked as shipped successfully",
      data: {
        orderId: orderId,
        status: "shipped",
        shippedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to mark supplier order as shipped:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark order as shipped",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
