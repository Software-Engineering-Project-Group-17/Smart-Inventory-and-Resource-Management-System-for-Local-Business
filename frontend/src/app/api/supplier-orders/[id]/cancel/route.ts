import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Parastoo } from "next/font/google";

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const orderId = id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get user info from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`Cancelling supplier order ${orderId} by user ${userEmail}`);

    // Check if order exists and can be cancelled
    const [existingOrder] = await sql`
      SELECT 
        so.id,
        so.payment_status,
        so.order_status,
        s.supplier_name
      FROM supplier_order so
      LEFT JOIN supplier s ON so.supplier_id = s.id
      WHERE so.id = ${orderId}
    `;

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be cancelled
    if (existingOrder.payment_status === "paid") {
      return NextResponse.json(
        {
          error:
            "Cannot cancel a paid order. Please contact support for refunds.",
        },
        { status: 400 }
      );
    }

    if (existingOrder.order_status === "cancelled") {
      return NextResponse.json(
        { error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    if (existingOrder.order_status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel a completed order" },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    await sql`
      UPDATE supplier_order 
      SET 
        order_status = 'cancelled',
        updated_at = now()
      WHERE id = ${orderId}
    `;

    console.log(`Successfully cancelled supplier order ${orderId}`);

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order_id: orderId,
    });
  } catch (error) {
    console.error("Error cancelling supplier order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
