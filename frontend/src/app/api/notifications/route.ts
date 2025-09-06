import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get user's branch_id from staff table
    const staffResult = await sql`
      SELECT branch_id 
      FROM staff s
      JOIN app_user u ON s.user_id = u.user_id
      WHERE u.email = ${userEmail}
      LIMIT 1
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    const branchId = staffResult[0].branch_id;

    // Get notifications for the user's branch, ordered by creation date (newest first)
    const notifications = await sql`
      SELECT 
        n.id,
        n.title,
        n.message,
        n.notification_type,
        n.is_read,
        n.created_at,
        n.inventory_id,
        n.metadata,
        ii.inventory_name,
        ii.quantity as current_quantity,
        ii.low_stock_threshold
      FROM notification n
      LEFT JOIN inventory_item ii ON n.inventory_id = ii.inventory_id
      WHERE n.branch_id = ${branchId}
      ORDER BY n.created_at DESC
      LIMIT 50
    `;

    // Get unread count
    const unreadCount = await sql`
      SELECT COUNT(*) as count
      FROM notification
      WHERE branch_id = ${branchId} AND is_read = false
    `;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: parseInt(unreadCount[0].count),
      branchId,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, userEmail } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || !userEmail) {
      return NextResponse.json(
        { error: "Notification IDs array and user email are required" },
        { status: 400 }
      );
    }

    // Get user's branch_id from staff table for security
    const staffResult = await sql`
      SELECT branch_id 
      FROM staff s
      JOIN app_user u ON s.user_id = u.user_id
      WHERE u.email = ${userEmail}
      LIMIT 1
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    const branchId = staffResult[0].branch_id;

    // Mark notifications as read (only for user's branch for security)
    await sql`
      UPDATE notification 
      SET is_read = true, updated_at = now()
      WHERE id = ANY(${notificationIds}) 
      AND branch_id = ${branchId}
    `;

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branchId,
      title,
      message,
      notificationType,
      inventoryId,
      metadata,
    } = body;

    if (!branchId || !title || !message || !notificationType) {
      return NextResponse.json(
        {
          error:
            "Branch ID, title, message, and notification type are required",
        },
        { status: 400 }
      );
    }

    // Insert notification
    const result = await sql`
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
        ${title}, 
        ${message}, 
        ${message},
        ${notificationType}, 
        ${inventoryId || null}, 
        ${metadata ? JSON.stringify(metadata) : null}, 
        false, 
        now()
      )
      RETURNING id, created_at
    `;

    return NextResponse.json({
      success: true,
      notification: result[0],
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
