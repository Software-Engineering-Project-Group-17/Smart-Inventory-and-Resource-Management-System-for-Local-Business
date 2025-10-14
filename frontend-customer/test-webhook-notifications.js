// Test script to simulate the webhook processing for existing paid orders
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Notification Service (simplified for testing)
class NotificationService {
  static async createNotification(data) {
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
  }

  static async checkAndCreateLowStockNotification(inventoryId, branchId) {
    const client = await pool.connect();
    try {
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
      if (item.quantity <= item.low_stock_threshold) {
        const title = `Low Stock Alert: ${item.inventory_name}`;
        const message = `${item.inventory_name} is running low. Current stock: ${item.quantity}, Threshold: ${item.low_stock_threshold}`;

        return await this.createNotification({
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
            source: "customer_webhook_test",
          },
        });
      }
      return null;
    } finally {
      client.release();
    }
  }
}

async function testWebhookNotifications() {
  try {
    console.log("🧪 Testing Customer Webhook Notification System...\n");

    // Simulate webhook processing for recent paid orders
    const client = await pool.connect();

    // Get recent paid orders with Stripe payment intents
    const orders = await client.query(`
      SELECT DISTINCT co.id, co.stripe_payment_intent_id, co.branch_id
      FROM customer_order co
      WHERE co.stripe_payment_intent_id IS NOT NULL 
        AND co.payment_status = 'paid'
      ORDER BY co.created_at DESC
      LIMIT 3
    `);

    console.log(
      `Found ${orders.rows.length} recent paid online orders to test...\n`
    );

    for (const order of orders.rows) {
      console.log(
        `📦 Processing Order ${order.id} (Payment Intent: ${order.stripe_payment_intent_id})`
      );

      // Get order items
      const orderItems = await client.query(
        `
        SELECT inventory_id, quantity
        FROM order_item
        WHERE order_id = $1
      `,
        [order.id]
      );

      console.log(`  Found ${orderItems.rows.length} items in order`);

      // Simulate the webhook inventory update and notification check
      for (const item of orderItems.rows) {
        console.log(`  🔍 Checking item ${item.inventory_id}...`);

        try {
          const notification =
            await NotificationService.checkAndCreateLowStockNotification(
              item.inventory_id,
              order.branch_id || 3
            );

          if (notification) {
            console.log(
              `    ✅ Created low stock notification: ${notification.id}`
            );
          } else {
            console.log(
              `    ℹ️  No notification needed (stock above threshold)`
            );
          }
        } catch (error) {
          console.error(`    ❌ Error creating notification: ${error.message}`);
        }
      }
      console.log("");
    }

    client.release();

    // Show recent notifications
    console.log("📋 Recent notifications in database:");
    const notifications = await pool.query(`
      SELECT id, title, notification_type, created_at, 
             CASE WHEN metadata IS NOT NULL THEN metadata->>'source' ELSE 'unknown' END as source
      FROM notification 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.table(notifications.rows);

    console.log("\n✅ Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testWebhookNotifications();
