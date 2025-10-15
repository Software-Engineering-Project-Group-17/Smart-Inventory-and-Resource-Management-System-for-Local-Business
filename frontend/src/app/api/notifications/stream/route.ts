import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get('userEmail');

  if (!userEmail) {
    return new Response('User email is required', { status: 400 });
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  
  let controller: ReadableStreamDefaultController<any>;
  let intervalId: NodeJS.Timeout;
  let isActive = true;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Function to fetch and send notifications
      const sendNotifications = async () => {
        if (!isActive) return;

        try {
          // Get user's branch_id from staff table (matching existing API structure)
          const staffResult = await sql`
            SELECT branch_id 
            FROM staff s
            JOIN app_user u ON s.user_id = u.user_id
            WHERE u.email = ${userEmail}
            LIMIT 1
          `;

          if (staffResult.length === 0) {
            return;
          }

          const branchId = staffResult[0].branch_id;

          // Fetch notifications for the user's branch (matching existing API structure)
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

          // Count unread notifications (matching existing API structure)
          const unreadCountResult = await sql`
            SELECT COUNT(*) as count
            FROM notification
            WHERE branch_id = ${branchId} AND is_read = false
          `;

          const unreadCount = parseInt(unreadCountResult[0].count);

          // Send the data
          const data = {
            type: 'notification_update',
            notifications,
            unreadCount,
            branchId: branchId.toString(),
            timestamp: new Date().toISOString()
          };

          if (isActive && controller) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          }
        } catch (error) {
          if (isActive && controller) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                message: 'Failed to fetch notifications' 
              })}\n\n`)
            );
          }
        }
      };

      // Send initial notifications
      sendNotifications();

      // Set interval to send notifications every 10 seconds
      intervalId = setInterval(sendNotifications, 10000);
    },

    cancel() {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}