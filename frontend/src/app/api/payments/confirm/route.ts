import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id, status } = await request.json();

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Find the supplier order by payment intent ID
    const [supplierOrder] = await sql`
      SELECT * FROM supplier_order 
      WHERE stripe_payment_intent_id = ${payment_intent_id}
    `;

    if (!supplierOrder) {
      return NextResponse.json(
        { error: "Supplier order not found" },
        { status: 404 }
      );
    }

    if (status === "succeeded") {
      // Start transaction
      await sql`BEGIN`;

      try {
        // Update supplier order payment status
        await sql`
          UPDATE supplier_order 
          SET 
            payment_status = 'paid',
            order_status = 'processing',
            paid_at = now(),
            updated_at = now()
          WHERE id = ${supplierOrder.id}
        `;

        // Get supplier order items to update inventory
        const orderItems = await sql`
          SELECT 
            soi.inventory_id,
            soi.offered_quantity
          FROM supplier_order_item soi
          WHERE soi.supplier_order_id = ${supplierOrder.id}
        `;

        // Update inventory quantities
        for (const item of orderItems) {
          await sql`
            UPDATE inventory_item 
            SET 
              quantity = quantity + ${item.offered_quantity}
            WHERE inventory_id = ${item.inventory_id}
          `;
        }

        // Check if all supplier orders for this restock request are paid
        const unpaidOrders = await sql`
          SELECT COUNT(*) as count
          FROM supplier_order 
          WHERE restock_request_id = ${supplierOrder.restock_request_id}
          AND payment_status != 'paid'
        `;

        // If no unpaid orders, mark restock request as completed
        if (unpaidOrders[0].count === 0) {
          await sql`
            UPDATE restock_request 
            SET 
              status = 'completed',
              completed_at = now(),
              updated_at = now()
            WHERE id = ${supplierOrder.restock_request_id}
          `;
        } else {
          // Otherwise, mark as active (partially fulfilled)
          await sql`
            UPDATE restock_request 
            SET 
              status = 'active',
              updated_at = now()
            WHERE id = ${supplierOrder.restock_request_id}
          `;
        }

        await sql`COMMIT`;

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
        });
      } catch (error) {
        await sql`ROLLBACK`;
        throw error;
      }
    } else if (status === "payment_failed") {
      // Update supplier order to reflect failed payment
      await sql`
        UPDATE supplier_order 
        SET 
          payment_status = 'unpaid',
          updated_at = now()
        WHERE id = ${supplierOrder.id}
      `;

      return NextResponse.json({
        success: false,
        message: "Payment failed",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated",
    });
  } catch (error) {
    console.error("Error processing payment confirmation:", error);
    return NextResponse.json(
      { error: "Failed to process payment confirmation" },
      { status: 500 }
    );
  }
}
