import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      inventoryId,
      quantityChange,
      changeType, // 'addition' or 'reduction'
      reason,
      userEmail,
    } = body;

    if (
      !inventoryId ||
      quantityChange === undefined ||
      !changeType ||
      !userEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: inventoryId, quantityChange, changeType, userEmail",
        },
        { status: 400 }
      );
    }

    console.log(
      `📦 Processing inventory update: ${changeType} of ${quantityChange} for item ${inventoryId}`
    );

    // Get the current inventory item details
    const inventoryItem = await sql`
      SELECT 
        inventory_id,
        inventory_name,
        quantity,
        low_stock_threshold,
        branch_id
      FROM inventory_item 
      WHERE inventory_id = ${inventoryId}
      LIMIT 1
    `;

    if (inventoryItem.length === 0) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    const item = inventoryItem[0];
    const currentQuantity = item.quantity;

    // Calculate new quantity based on change type
    let newQuantity;
    if (changeType === "addition") {
      newQuantity = currentQuantity + Math.abs(quantityChange);
    } else if (changeType === "reduction") {
      newQuantity = Math.max(0, currentQuantity - Math.abs(quantityChange));
    } else {
      return NextResponse.json(
        { error: "Invalid changeType. Must be 'addition' or 'reduction'" },
        { status: 400 }
      );
    }

    // Update the inventory quantity
    const updateResult = await sql`
      UPDATE inventory_item 
      SET quantity = ${newQuantity}
      WHERE inventory_id = ${inventoryId}
      RETURNING inventory_id, inventory_name, quantity
    `;

    if (updateResult.length === 0) {
      return NextResponse.json(
        { error: "Failed to update inventory item" },
        { status: 500 }
      );
    }

    const updatedItem = updateResult[0];

    // Check if we need to create notifications based on the new quantity
    let notificationsCreated = [];

    // Check for low stock after reduction
    if (changeType === "reduction" && newQuantity <= item.low_stock_threshold) {
      // Check if we already have a recent low stock notification
      const existingLowStockNotification = await sql`
        SELECT id 
        FROM notification 
        WHERE branch_id = ${item.branch_id} 
          AND inventory_id = ${inventoryId}
          AND notification_type = 'low_stock'
          AND is_read = false
          AND created_at > NOW() - INTERVAL '24 hours'
        LIMIT 1
      `;

      if (existingLowStockNotification.length === 0) {
        const lowStockNotification = await sql`
          INSERT INTO notification (
            branch_id, 
            title, 
            message, 
            content,
            notification_type, 
            inventory_id, 
            metadata, 
            is_read, 
            created_at
          )
          VALUES (
            ${item.branch_id}, 
            'Low Stock Alert', 
            ${`${item.inventory_name} is now running low after recent usage. Current stock: ${newQuantity}, Threshold: ${item.low_stock_threshold}`}, 
            ${`${item.inventory_name} is now running low after recent usage. Current stock: ${newQuantity}, Threshold: ${item.low_stock_threshold}`},
            'low_stock', 
            ${inventoryId}, 
            ${JSON.stringify({
              previous_quantity: currentQuantity,
              current_quantity: newQuantity,
              threshold: item.low_stock_threshold,
              change_amount: quantityChange,
              change_type: changeType,
              reason: reason || "Stock reduction",
            })}, 
            false, 
            NOW()
          )
          RETURNING id, created_at
        `;

        notificationsCreated.push({
          type: "low_stock",
          id: lowStockNotification[0].id,
          message: `Low stock alert created for ${item.inventory_name}`,
        });

        console.log(
          `⚠️  Created low stock notification for ${item.inventory_name} after reduction`
        );
      }
    }

    // Check for stock replenishment after addition
    if (
      changeType === "addition" &&
      currentQuantity <= item.low_stock_threshold &&
      newQuantity > item.low_stock_threshold
    ) {
      const restockNotification = await sql`
        INSERT INTO notification (
          branch_id, 
          title, 
          message, 
          content,
          notification_type, 
          inventory_id, 
          metadata, 
          is_read, 
          created_at
        )
        VALUES (
          ${item.branch_id}, 
          'Stock Replenished', 
          ${`${item.inventory_name} has been restocked. Stock increased from ${currentQuantity} to ${newQuantity}`}, 
          ${`${item.inventory_name} has been restocked. Stock increased from ${currentQuantity} to ${newQuantity}`},
          'stock_update', 
          ${inventoryId}, 
          ${JSON.stringify({
            previous_quantity: currentQuantity,
            current_quantity: newQuantity,
            threshold: item.low_stock_threshold,
            change_amount: quantityChange,
            change_type: changeType,
            reason: reason || "Stock addition",
          })}, 
          false, 
          NOW()
        )
        RETURNING id, created_at
      `;

      notificationsCreated.push({
        type: "stock_update",
        id: restockNotification[0].id,
        message: `Stock replenishment notification created for ${item.inventory_name}`,
      });

      console.log(
        `✅ Created stock replenishment notification for ${item.inventory_name}`
      );

      // Mark any existing low stock notifications as read since the item is no longer low stock
      await sql`
        UPDATE notification 
        SET is_read = true, updated_at = NOW()
        WHERE branch_id = ${item.branch_id} 
          AND inventory_id = ${inventoryId}
          AND notification_type = 'low_stock'
          AND is_read = false
      `;
    }

    // Create a general stock update notification for significant changes
    if (
      Math.abs(quantityChange) >= 10 ||
      Math.abs(quantityChange) >= currentQuantity * 0.5
    ) {
      const stockUpdateNotification = await sql`
        INSERT INTO notification (
          branch_id, 
          title, 
          message, 
          content,
          notification_type, 
          inventory_id, 
          metadata, 
          is_read, 
          created_at
        )
        VALUES (
          ${item.branch_id}, 
          'Significant Stock Change', 
          ${`${item.inventory_name} stock ${
            changeType === "addition" ? "increased" : "decreased"
          } by ${quantityChange}. New quantity: ${newQuantity}`}, 
          ${`${item.inventory_name} stock ${
            changeType === "addition" ? "increased" : "decreased"
          } by ${quantityChange}. New quantity: ${newQuantity}`},
          'stock_update', 
          ${inventoryId}, 
          ${JSON.stringify({
            previous_quantity: currentQuantity,
            current_quantity: newQuantity,
            threshold: item.low_stock_threshold,
            change_amount: quantityChange,
            change_type: changeType,
            reason: reason || `Stock ${changeType}`,
            significant_change: true,
          })}, 
          false, 
          NOW()
        )
        RETURNING id, created_at
      `;

      notificationsCreated.push({
        type: "stock_update",
        id: stockUpdateNotification[0].id,
        message: `Significant stock change notification created for ${item.inventory_name}`,
      });

      console.log(
        `📊 Created significant stock change notification for ${item.inventory_name}`
      );
    }

    const response = {
      success: true,
      inventoryUpdate: {
        inventory_id: updatedItem.inventory_id,
        inventory_name: updatedItem.inventory_name,
        previous_quantity: currentQuantity,
        new_quantity: updatedItem.quantity,
        change_amount: quantityChange,
        change_type: changeType,
        reason: reason || `Stock ${changeType}`,
      },
      stockStatus: {
        is_low_stock: newQuantity <= item.low_stock_threshold,
        was_low_stock: currentQuantity <= item.low_stock_threshold,
        threshold: item.low_stock_threshold,
      },
      notificationsCreated,
      message: `Inventory updated successfully. ${notificationsCreated.length} notifications created.`,
    };

    console.log(`✅ Inventory update completed:`, response.inventoryUpdate);

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error updating inventory:", error);
    return NextResponse.json(
      {
        error: "Failed to update inventory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to get inventory item details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get("inventoryId");
    const branchId = searchParams.get("branchId");

    if (!inventoryId && !branchId) {
      return NextResponse.json(
        { error: "Either inventoryId or branchId is required" },
        { status: 400 }
      );
    }

    let inventoryItems;

    if (inventoryId) {
      // Get specific inventory item
      inventoryItems = await sql`
        SELECT 
          inventory_id,
          inventory_name,
          quantity,
          low_stock_threshold,
          branch_id,
          unit_price,
          CASE 
            WHEN quantity <= low_stock_threshold THEN 'low_stock'
            WHEN quantity <= (low_stock_threshold * 1.5) THEN 'moderate_stock'
            ELSE 'good_stock'
          END as stock_status
        FROM inventory_item 
        WHERE inventory_id = ${inventoryId}
        LIMIT 1
      `;
    } else {
      // Get all inventory items for a branch
      inventoryItems = await sql`
        SELECT 
          inventory_id,
          inventory_name,
          quantity,
          low_stock_threshold,
          branch_id,
          unit_price,
          CASE 
            WHEN quantity <= low_stock_threshold THEN 'low_stock'
            WHEN quantity <= (low_stock_threshold * 1.5) THEN 'moderate_stock'
            ELSE 'good_stock'
          END as stock_status
        FROM inventory_item 
        WHERE branch_id = ${branchId}
        ORDER BY inventory_name
      `;
    }

    if (inventoryItems.length === 0) {
      return NextResponse.json(
        { error: "No inventory items found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inventoryItems: inventoryId ? inventoryItems[0] : inventoryItems,
      count: inventoryItems.length,
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory details" },
      { status: 500 }
    );
  }
}
