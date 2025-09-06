import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { NotificationService } from "@/lib/notification-service";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId, checkAll = false } = body;

    if (!branchId && !checkAll) {
      return NextResponse.json(
        { error: "Branch ID is required or set checkAll to true" },
        { status: 400 }
      );
    }

    let createdNotifications = [];

    if (checkAll) {
      // Check all branches for low stock
      const branches = await sql`
        SELECT DISTINCT branch_id FROM inventory_item
      `;

      for (const branch of branches) {
        const notifications = await NotificationService.checkAllLowStock(
          branch.branch_id
        );
        createdNotifications.push(...notifications);
      }
    } else {
      // Check specific branch
      const notifications = await NotificationService.checkAllLowStock(
        branchId
      );
      createdNotifications.push(...notifications);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdNotifications.length} low stock notifications`,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error("Error checking low stock:", error);
    return NextResponse.json(
      { error: "Failed to check low stock" },
      { status: 500 }
    );
  }
}

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

    // Get current low stock items for the branch
    const lowStockItems = await sql`
      SELECT 
        ii.inventory_id,
        ii.inventory_name,
        ii.quantity,
        ii.low_stock_threshold,
        ii.branch_id,
        c.category_name,
        CASE 
          WHEN ii.quantity = 0 THEN 'critical'
          WHEN ii.quantity <= ii.low_stock_threshold * 0.5 THEN 'severe'
          ELSE 'warning'
        END as severity
      FROM inventory_item ii
      LEFT JOIN category c ON ii.category_id = c.id
      WHERE ii.branch_id = ${branchId}
      AND ii.quantity <= ii.low_stock_threshold
      ORDER BY 
        CASE 
          WHEN ii.quantity = 0 THEN 1
          WHEN ii.quantity <= ii.low_stock_threshold * 0.5 THEN 2
          ELSE 3
        END,
        ii.quantity ASC
    `;

    return NextResponse.json({
      success: true,
      lowStockItems,
      count: lowStockItems.length,
    });
  } catch (error) {
    console.error("Error getting low stock items:", error);
    return NextResponse.json(
      { error: "Failed to get low stock items" },
      { status: 500 }
    );
  }
}
