import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { NotificationService } from "@/lib/notification-service";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log("Starting inventory monitoring check...");

    // Step 1: Get all inventory items that are currently at or below their low stock threshold
    const lowStockItems = await sql`
      SELECT 
        ii.inventory_id,
        ii.inventory_name,
        ii.quantity,
        ii.low_stock_threshold,
        ii.branch_id,
        c.category_name
      FROM inventory_item ii
      LEFT JOIN category c ON ii.category_id = c.id
      WHERE ii.quantity <= ii.low_stock_threshold
    `;

    console.log(
      `Found ${lowStockItems.length} items at or below low stock threshold`
    );

    let notificationsCreated = 0;

    // Step 2: For each low stock item, check if we need to create a notification
    for (const item of lowStockItems) {
      try {
        // Check if there's already a recent low stock notification for this item
        const existingNotification = await sql`
          SELECT id, created_at
          FROM notification 
          WHERE inventory_id = ${item.inventory_id} 
          AND notification_type = 'low_stock'
          AND created_at > now() - INTERVAL '24 hours'
          ORDER BY created_at DESC
          LIMIT 1
        `;

        if (existingNotification.length === 0) {
          // No recent notification exists, create one
          const title = `Low Stock Alert: ${item.inventory_name}`;
          const message = `${item.inventory_name} is running low. Current stock: ${item.quantity}, Threshold: ${item.low_stock_threshold}`;

          await NotificationService.createNotification({
            branchId: item.branch_id,
            title,
            message,
            notificationType: "low_stock",
            inventoryId: item.inventory_id,
            metadata: {
              currentQuantity: item.quantity,
              threshold: item.low_stock_threshold,
              categoryName: item.category_name,
              severity: item.quantity === 0 ? "critical" : "warning",
              triggeredBy: "monitoring_service",
            },
          });

          notificationsCreated++;
          console.log(
            `Created low stock notification for ${item.inventory_name} (ID: ${item.inventory_id})`
          );
        } else {
          console.log(
            `Skipping ${item.inventory_name} - recent notification exists (${existingNotification[0].created_at})`
          );
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.inventory_id}:`, itemError);
      }
    }

    // Step 3: Clean up old read notifications (optional maintenance)
    try {
      await NotificationService.cleanupOldNotifications();
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }

    const result = {
      success: true,
      message: `Monitoring check completed. Created ${notificationsCreated} new notifications.`,
      itemsChecked: lowStockItems.length,
      notificationsCreated,
      timestamp: new Date().toISOString(),
    };

    console.log("Monitoring check result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in inventory monitoring:", error);
    return NextResponse.json(
      {
        error: "Failed to run inventory monitoring",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get monitoring statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_inventory_items,
        COUNT(CASE WHEN quantity <= low_stock_threshold THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_items
      FROM inventory_item
    `;

    const recentNotifications = await sql`
      SELECT 
        COUNT(*) as recent_low_stock_notifications
      FROM notification 
      WHERE notification_type = 'low_stock'
      AND created_at > now() - INTERVAL '24 hours'
    `;

    return NextResponse.json({
      success: true,
      stats: {
        ...stats[0],
        recent_low_stock_notifications:
          recentNotifications[0].recent_low_stock_notifications,
      },
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting monitoring stats:", error);
    return NextResponse.json(
      { error: "Failed to get monitoring stats" },
      { status: 500 }
    );
  }
}
