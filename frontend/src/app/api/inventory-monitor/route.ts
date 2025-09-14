import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId } = body;

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking inventory status for branch ${branchId}...`);

    // Get all inventory items for the specified branch
    const inventoryItems = await sql`
      SELECT 
        inventory_id,
        inventory_name,
        quantity,
        low_stock_threshold,
        branch_id
      FROM inventory_item 
      WHERE branch_id = ${branchId}
      ORDER BY inventory_name
    `;

    console.log(`📊 Found ${inventoryItems.length} inventory items to check`);

    let lowStockItems = [];
    let stockUpdatedItems = [];
    let notificationsCreated = 0;
    let duplicatesSkipped = 0;

    // Check each inventory item for low stock
    for (const item of inventoryItems) {
      const isLowStock = item.quantity <= item.low_stock_threshold;

      if (isLowStock) {
        // Check if we already have a recent low stock notification for this item
        const existingLowStockNotification = await sql`
          SELECT id, created_at 
          FROM notification 
          WHERE branch_id = ${branchId} 
            AND inventory_id = ${item.inventory_id}
            AND notification_type = 'low_stock'
            AND is_read = false
            AND created_at > NOW() - INTERVAL '24 hours'
          LIMIT 1
        `;

        if (existingLowStockNotification.length === 0) {
          // Create low stock notification
          const notificationResult = await sql`
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
              ${branchId}, 
              'Low Stock Alert', 
              ${`${item.inventory_name} is running low. Current stock: ${item.quantity}, Threshold: ${item.low_stock_threshold}`}, 
              ${`${item.inventory_name} is running low. Current stock: ${item.quantity}, Threshold: ${item.low_stock_threshold}`},
              'low_stock', 
              ${item.inventory_id}, 
              ${JSON.stringify({
                current_quantity: item.quantity,
                threshold: item.low_stock_threshold,
                item_name: item.inventory_name,
              })}, 
              false, 
              NOW()
            )
            RETURNING id, created_at
          `;

          lowStockItems.push({
            inventory_id: item.inventory_id,
            inventory_name: item.inventory_name,
            quantity: item.quantity,
            low_stock_threshold: item.low_stock_threshold,
            branch_id: item.branch_id,
            notificationId: notificationResult[0].id,
          });
          notificationsCreated++;
          console.log(
            `⚠️  Created low stock notification for ${item.inventory_name} (${item.quantity}/${item.low_stock_threshold})`
          );
        } else {
          duplicatesSkipped++;
          console.log(
            `⏭️  Skipped duplicate low stock notification for ${item.inventory_name}`
          );
        }
      } else {
        // Item is not low stock, check if we should create a stock update notification
        // Only create if stock was recently updated (we'll check for recent quantity changes)

        // For now, we'll add items that have good stock levels to the stockUpdatedItems array
        // You could extend this to track actual stock changes by comparing with previous values
        if (item.quantity > item.low_stock_threshold * 1.5) {
          // Good stock level
          stockUpdatedItems.push({
            inventory_id: item.inventory_id,
            inventory_name: item.inventory_name,
            quantity: item.quantity,
            low_stock_threshold: item.low_stock_threshold,
            branch_id: item.branch_id,
          });
        }
      }
    }

    // Optional: Create a summary notification if multiple items are low stock
    if (lowStockItems.length > 3) {
      const existingSummaryNotification = await sql`
        SELECT id 
        FROM notification 
        WHERE branch_id = ${branchId} 
          AND notification_type = 'system'
          AND title = 'Multiple Low Stock Items'
          AND is_read = false
          AND created_at > NOW() - INTERVAL '6 hours'
        LIMIT 1
      `;

      if (existingSummaryNotification.length === 0) {
        await sql`
          INSERT INTO notification (
            branch_id, 
            title, 
            message, 
            content,
            notification_type, 
            metadata, 
            is_read, 
            created_at
          )
          VALUES (
            ${branchId}, 
            'Multiple Low Stock Items', 
            ${`${lowStockItems.length} items are currently below their stock thresholds. Please review inventory levels.`}, 
            ${`${lowStockItems.length} items are currently below their stock thresholds. Please review inventory levels.`},
            'system', 
            ${JSON.stringify({
              low_stock_count: lowStockItems.length,
              items: lowStockItems.map((item) => ({
                name: item.inventory_name,
                quantity: item.quantity,
                threshold: item.low_stock_threshold,
              })),
            })}, 
            false, 
            NOW()
          )
        `;
        notificationsCreated++;
        console.log(
          `📋 Created summary notification for ${lowStockItems.length} low stock items`
        );
      }
    }

    const response = {
      success: true,
      branchId: parseInt(branchId),
      summary: {
        totalItems: inventoryItems.length,
        lowStockItems: lowStockItems.length,
        stockUpdatedItems: stockUpdatedItems.length,
        notificationsCreated,
        duplicatesSkipped,
      },
      lowStockItems: lowStockItems.map((item) => ({
        inventory_id: item.inventory_id,
        inventory_name: item.inventory_name,
        quantity: item.quantity,
        low_stock_threshold: item.low_stock_threshold,
        notificationId: item.notificationId,
      })),
      message: `Inventory check completed. ${notificationsCreated} new notifications created, ${duplicatesSkipped} duplicates skipped.`,
    };

    console.log(`✅ Inventory monitoring completed:`, response.summary);

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error in inventory monitoring:", error);
    return NextResponse.json(
      {
        error: "Failed to monitor inventory status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check inventory status without creating notifications (for testing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    // Get all inventory items for the specified branch with their status
    const inventoryItems = await sql`
      SELECT 
        inventory_id,
        inventory_name,
        quantity,
        low_stock_threshold,
        branch_id,
        CASE 
          WHEN quantity <= low_stock_threshold THEN 'low_stock'
          WHEN quantity <= (low_stock_threshold * 1.5) THEN 'moderate_stock'
          ELSE 'good_stock'
        END as stock_status
      FROM inventory_item 
      WHERE branch_id = ${branchId}
      ORDER BY 
        CASE 
          WHEN quantity <= low_stock_threshold THEN 1
          WHEN quantity <= (low_stock_threshold * 1.5) THEN 2
          ELSE 3
        END,
        inventory_name
    `;

    const summary = {
      totalItems: inventoryItems.length,
      lowStock: inventoryItems.filter(
        (item) => item.stock_status === "low_stock"
      ).length,
      moderateStock: inventoryItems.filter(
        (item) => item.stock_status === "moderate_stock"
      ).length,
      goodStock: inventoryItems.filter(
        (item) => item.stock_status === "good_stock"
      ).length,
    };

    return NextResponse.json({
      success: true,
      branchId: parseInt(branchId),
      summary,
      inventoryItems,
    });
  } catch (error) {
    console.error("Error checking inventory status:", error);
    return NextResponse.json(
      { error: "Failed to check inventory status" },
      { status: 500 }
    );
  }
}
