import { NextRequest, NextResponse } from "next/server";
import { requireAuth, createAuthResponse } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/**
 * Create restock completion notification
 */
async function createRestockCompletionNotification(
  inventoryId: string | number,
  previousQuantity: number,
  newQuantity: number,
  addedQuantity: number
) {
  try {
    // Get inventory item details and branch information for the notification
    const inventoryResult = await sql`
      SELECT 
        ii.inventory_name,
        ii.branch_id,
        b.name as branch_name
      FROM inventory_item ii
      LEFT JOIN branches b ON ii.branch_id = b.id
      WHERE ii.inventory_id = ${inventoryId}
    `;

    if (inventoryResult.length === 0) {
      console.error(`No inventory item found with ID ${inventoryId}`);
      return;
    }

    const inventoryItem = inventoryResult[0] as any;
    const message = `${inventoryItem.inventory_name} has been restocked. Added: ${addedQuantity} units. New total: ${newQuantity}`;

    // Create notification for branch users
    const notificationResult = await sql`
      INSERT INTO notification (
        user_id,
        type,
        title,
        message,
        metadata,
        created_at
      )
      SELECT 
        u.user_id,
        'restock_completion',
        'Inventory Restocked',
        ${message},
        ${JSON.stringify({
          inventory_id: inventoryId,
          inventory_name: inventoryItem.inventory_name,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          added_quantity: addedQuantity,
          branch_id: inventoryItem.branch_id,
          branch_name: inventoryItem.branch_name,
        })},
        NOW()
      FROM app_user u
      INNER JOIN staff s ON u.user_id = s.user_id
      WHERE s.branch_id = ${inventoryItem.branch_id}
        AND u.is_active = true
        AND s.is_active = true
      RETURNING *
    `;

    console.log(
      `✅ Created restock notification for ${inventoryItem.inventory_name}: +${addedQuantity} units (${previousQuantity} → ${newQuantity})`
    );

    return notificationResult;
  } catch (error) {
    console.error("Error creating restock completion notification:", error);
    throw error;
  }
}

// PATCH /api/supplier-orders/[id]/mark-delivered - Mark supplier order as delivered
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication - Only STAFF and BRANCH_MANAGER can mark orders as delivered
  const authResult = await requireAuth(request, [
    ROLES.STAFF,
    ROLES.BRANCH_MANAGER,
  ]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  try {
    const { user } = authResult;

    const { id } = await params;

    const orderId = id;

    // User is guaranteed to exist after authentication
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User data not available" },
        { status: 401 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get the authenticated user's information
    const userResult = await sql`
      SELECT 
        u.user_id,
        s.branch_id,
        s.id as staff_id
      FROM app_user u
      INNER JOIN staff s ON u.user_id = s.user_id
      WHERE u.firebase_uid = ${user.uid} AND u.is_active = true
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or not assigned to a branch",
        },
        { status: 404 }
      );
    }

    const userInfo = userResult[0] as any;

    // Get supplier order details and verify it belongs to user's branch
    const orderResult = await sql`
      SELECT 
        so.id,
        so.restock_request_id,
        so.order_status,
        so.payment_status,
        so.delivered_at,
        rr.branch_id,
        rr.title as restock_title
      FROM supplier_order so
      INNER JOIN restock_request rr ON so.restock_request_id = rr.id
      WHERE so.id = ${orderId}
        AND rr.branch_id = ${userInfo.branch_id}
    `;

    if (orderResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier order not found or not accessible",
        },
        { status: 404 }
      );
    }

    const supplierOrder = orderResult[0] as any;

    // Check if order is paid
    if (supplierOrder.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Cannot mark unpaid order as delivered" },
        { status: 400 }
      );
    }

    // Check if already delivered
    if (supplierOrder.delivered_at) {
      return NextResponse.json(
        { success: false, message: "Order is already marked as delivered" },
        { status: 400 }
      );
    }

    // Begin transaction
    await sql`BEGIN`;

    try {
      // Mark order as delivered by setting delivered_at
      await sql`
        UPDATE supplier_order 
        SET delivered_at = NOW()
        WHERE id = ${orderId}
      `;

      // Get order items for inventory update
      const orderItems = await sql`
        SELECT 
          soi.inventory_id,
          soi.offered_quantity,
          ii.inventory_name,
          ii.quantity as current_quantity
        FROM supplier_order_item soi
        INNER JOIN inventory_item ii ON soi.inventory_id = ii.inventory_id
        WHERE soi.supplier_order_id = ${orderId}
      `;

      console.log(
        `Found ${orderItems.length} items to update in inventory for delivery`
      );

      // Update inventory quantities and create restock notifications
      for (const item of orderItems) {
        if (item.inventory_id) {
          const previousQuantity = Number(item.current_quantity);
          const addedQuantity = Number(item.offered_quantity);
          const newQuantity = previousQuantity + addedQuantity;

          // Update inventory
          await sql`
            UPDATE inventory_item 
            SET quantity = ${newQuantity}
            WHERE inventory_id = ${item.inventory_id}
          `;

          console.log(
            `Updated inventory ${item.inventory_id}: ${previousQuantity} -> ${newQuantity} (added ${addedQuantity})`
          );

          // Create restock completion notification
          try {
            await createRestockCompletionNotification(
              item.inventory_id,
              previousQuantity,
              newQuantity,
              addedQuantity
            );
          } catch (notificationError) {
            console.error(
              `Failed to create restock notification for item ${item.inventory_id}:`,
              notificationError
            );
            // Don't fail the delivery process if notification fails
          }
        }
      }

      // Commit transaction
      await sql`COMMIT`;

      console.log(
        `✅ Supplier order ${orderId} marked as delivered and inventory updated`
      );

      return NextResponse.json({
        success: true,
        message: "Order marked as delivered and inventory updated successfully",
        data: {
          orderId: orderId,
          deliveredAt: new Date().toISOString(),
          itemsUpdated: orderItems.length,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Failed to mark supplier order as delivered:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark order as delivered",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
