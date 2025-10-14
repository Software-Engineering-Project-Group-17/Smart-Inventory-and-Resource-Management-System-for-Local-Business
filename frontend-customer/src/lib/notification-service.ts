import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface NotificationData {
  branchId: string | number;
  title: string;
  message: string;
  notificationType:
    | "low_stock"
    | "restock_completion"
    | "stock_update"
    | "system";
  inventoryId?: string | number;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          INSERT INTO notification (
            branch_id, 
            title, 
            message, 
            content,
            notification_type, 
            inventory_id, 
            metadata, 
            is_read
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, false)
          RETURNING id, created_at
        `,
          [
            data.branchId,
            data.title,
            data.message,
            data.message,
            data.notificationType,
            data.inventoryId || null,
            data.metadata ? JSON.stringify(data.metadata) : null,
          ]
        );

        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  /**
   * Check and create low stock notifications for an inventory item
   */
  static async checkAndCreateLowStockNotification(
    inventoryId: string | number,
    branchId: string | number
  ) {
    try {
      const client = await pool.connect();
      try {
        // Get inventory item details
        const inventoryResult = await client.query(
          `
          SELECT 
            ii.inventory_id,
            ii.inventory_name,
            ii.quantity,
            ii.low_stock_threshold,
            ii.branch_id,
            c.category_name
          FROM inventory_item ii
          LEFT JOIN category c ON ii.category_id = c.id
          WHERE ii.inventory_id = $1 AND ii.branch_id = $2
        `,
          [inventoryId, branchId]
        );

        if (inventoryResult.rows.length === 0) {
          return null;
        }

        const item = inventoryResult.rows[0];

        // Check if stock is at or below threshold
        if (item.quantity <= item.low_stock_threshold) {
          const title = `Low Stock Alert: ${item.inventory_name}`;
          const message = `${item.inventory_name} is running low. Current stock: ${item.quantity}, Threshold: ${item.low_stock_threshold}`;

          const result = await this.createNotification({
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
            },
          });

          return result;
        }

        return null;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error checking low stock:", error);
      throw new Error("Failed to check low stock notification");
    }
  }

  /**
   * Create restock completion notification
   */
  static async createRestockCompletionNotification(
    inventoryId: string | number,
    previousQuantity: number,
    newQuantity: number,
    branchId: string | number
  ) {
    try {
      const client = await pool.connect();
      try {
        // Get inventory item details
        const inventoryResult = await client.query(
          `
          SELECT 
            ii.inventory_id,
            ii.inventory_name,
            ii.branch_id,
            c.category_name
          FROM inventory_item ii
          LEFT JOIN category c ON ii.category_id = c.id
          WHERE ii.inventory_id = $1 AND ii.branch_id = $2
        `,
          [inventoryId, branchId]
        );

        if (inventoryResult.rows.length === 0) {
          return null;
        }

        const item = inventoryResult.rows[0];
        const quantityAdded = newQuantity - previousQuantity;

        const title = `Stock Replenished: ${item.inventory_name}`;
        const message = `${item.inventory_name} has been restocked. Added: ${quantityAdded} units. New total: ${newQuantity}`;

        const result = await this.createNotification({
          branchId: item.branch_id,
          title,
          message,
          notificationType: "restock_completion",
          inventoryId: item.inventory_id,
          metadata: {
            previousQuantity,
            newQuantity,
            quantityAdded,
            categoryName: item.category_name,
          },
        });

        return result;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error creating restock notification:", error);
      throw new Error("Failed to create restock notification");
    }
  }

  /**
   * Get all notifications for a branch
   */
  static async getNotificationsByBranch(
    branchId: string | number,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          SELECT 
            n.*,
            ii.inventory_name,
            c.category_name
          FROM notification n
          LEFT JOIN inventory_item ii ON n.inventory_id = ii.inventory_id
          LEFT JOIN category c ON ii.category_id = c.id
          WHERE n.branch_id = $1
          ORDER BY n.created_at DESC
          LIMIT $2 OFFSET $3
        `,
          [branchId, limit, offset]
        );

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string | number) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          UPDATE notification 
          SET is_read = true, updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
          [notificationId]
        );

        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  }

  /**
   * Get unread notification count for a branch
   */
  static async getUnreadCount(branchId: string | number) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          SELECT COUNT(*) as count
          FROM notification
          WHERE branch_id = $1 AND is_read = false
        `,
          [branchId]
        );

        return parseInt(result.rows[0].count);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw new Error("Failed to get unread notification count");
    }
  }
}
