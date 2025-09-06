import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface NotificationData {
  branchId: string | number;
  title: string;
  message: string;
  notificationType: 'low_stock' | 'restock_completion' | 'stock_update' | 'system';
  inventoryId?: string | number;
  metadata?: Record<string, any>;
}

export class NotificationService {
  
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData) {
    try {
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
          ${data.branchId}, 
          ${data.title}, 
          ${data.message}, 
          ${data.message},
          ${data.notificationType}, 
          ${data.inventoryId || null}, 
          ${data.metadata ? JSON.stringify(data.metadata) : null}, 
          false, 
          now()
        )
        RETURNING id, created_at
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Check and create low stock notifications for an inventory item
   */
  static async checkAndCreateLowStockNotification(inventoryId: string | number) {
    try {
      // Get inventory item details
      const inventoryItem = await sql`
        SELECT 
          ii.inventory_id,
          ii.inventory_name,
          ii.quantity,
          ii.low_stock_threshold,
          ii.branch_id,
          c.category_name
        FROM inventory_item ii
        LEFT JOIN category c ON ii.category_id = c.id
        WHERE ii.inventory_id = ${inventoryId}
      `;

      if (inventoryItem.length === 0) {
        return null;
      }

      const item = inventoryItem[0];
      
      // Check if stock is at or below threshold
      if (item.quantity <= item.low_stock_threshold) {
        // Check if we already have a recent low stock notification for this item
        const existingNotification = await sql`
          SELECT id 
          FROM notification 
          WHERE inventory_id = ${inventoryId} 
          AND notification_type = 'low_stock'
          AND created_at > now() - INTERVAL '24 hours'
          LIMIT 1
        `;

        // Only create notification if no recent one exists
        if (existingNotification.length === 0) {
          const title = `Low Stock Alert: ${item.inventory_name}`;
          const message = `${item.inventory_name} is running low. Current stock: ${item.quantity}, Threshold: ${item.low_stock_threshold}`;
          
          return await this.createNotification({
            branchId: item.branch_id,
            title,
            message,
            notificationType: 'low_stock',
            inventoryId: item.inventory_id,
            metadata: {
              currentQuantity: item.quantity,
              threshold: item.low_stock_threshold,
              categoryName: item.category_name,
              severity: item.quantity === 0 ? 'critical' : 'warning'
            }
          });
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking low stock:', error);
      throw new Error('Failed to check low stock notification');
    }
  }

  /**
   * Create restock completion notification
   */
  static async createRestockCompletionNotification(
    inventoryId: string | number, 
    previousQuantity: number, 
    newQuantity: number
  ) {
    try {
      // Get inventory item details
      const inventoryItem = await sql`
        SELECT 
          ii.inventory_id,
          ii.inventory_name,
          ii.branch_id,
          c.category_name
        FROM inventory_item ii
        LEFT JOIN category c ON ii.category_id = c.id
        WHERE ii.inventory_id = ${inventoryId}
      `;

      if (inventoryItem.length === 0) {
        return null;
      }

      const item = inventoryItem[0];
      const quantityIncrease = newQuantity - previousQuantity;
      
      const title = `Stock Replenished: ${item.inventory_name}`;
      const message = `${item.inventory_name} has been restocked. Stock increased by ${quantityIncrease} units (${previousQuantity} → ${newQuantity})`;
      
      return await this.createNotification({
        branchId: item.branch_id,
        title,
        message,
        notificationType: 'restock_completion',
        inventoryId: item.inventory_id,
        metadata: {
          previousQuantity,
          newQuantity,
          quantityIncrease,
          categoryName: item.category_name
        }
      });
      
    } catch (error) {
      console.error('Error creating restock completion notification:', error);
      throw new Error('Failed to create restock completion notification');
    }
  }

  /**
   * Batch check low stock for all items in a branch
   */
  static async checkAllLowStock(branchId: string | number) {
    try {
      // Get all items that are at or below threshold
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
        WHERE ii.branch_id = ${branchId}
        AND ii.quantity <= ii.low_stock_threshold
      `;

      const notifications = [];
      
      for (const item of lowStockItems) {
        // Check if we already have a recent notification for this item
        const existingNotification = await sql`
          SELECT id 
          FROM notification 
          WHERE inventory_id = ${item.inventory_id} 
          AND notification_type = 'low_stock'
          AND created_at > now() - INTERVAL '24 hours'
          LIMIT 1
        `;

        if (existingNotification.length === 0) {
          const title = `Low Stock Alert: ${item.inventory_name}`;
          const message = `${item.inventory_name} is running low. Current stock: ${item.quantity}, Threshold: ${item.low_stock_threshold}`;
          
          const notification = await this.createNotification({
            branchId: item.branch_id,
            title,
            message,
            notificationType: 'low_stock',
            inventoryId: item.inventory_id,
            metadata: {
              currentQuantity: item.quantity,
              threshold: item.low_stock_threshold,
              categoryName: item.category_name,
              severity: item.quantity === 0 ? 'critical' : 'warning'
            }
          });
          
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error checking all low stock:', error);
      throw new Error('Failed to check all low stock notifications');
    }
  }

  /**
   * Clean up old read notifications (older than 30 days)
   */
  static async cleanupOldNotifications() {
    try {
      await sql`
        DELETE FROM notification 
        WHERE is_read = true 
        AND created_at < now() - INTERVAL '30 days'
      `;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }
}
