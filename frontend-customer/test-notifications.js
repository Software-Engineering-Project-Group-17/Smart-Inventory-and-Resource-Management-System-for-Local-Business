const { Pool } = require("pg");
const { NotificationService } = require("./src/lib/notification-service");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testNotifications() {
  try {
    console.log("Testing notification system...");

    // Test 1: Check if we can create a notification
    console.log("\n1. Testing notification creation...");
    const testNotification = await NotificationService.createNotification({
      branchId: 3,
      title: "Test Notification",
      message: "This is a test notification from customer app",
      notificationType: "system",
    });
    console.log("✅ Created test notification:", testNotification);

    // Test 2: Check recent customer orders
    console.log("\n2. Checking recent customer orders...");
    const client = await pool.connect();

    const orders = await client.query(`
      SELECT co.id, co.payment_status, co.created_at, co.stripe_payment_intent_id
      FROM customer_order co 
      WHERE co.payment_status = 'paid' 
      ORDER BY co.created_at DESC 
      LIMIT 3
    `);
    console.log("Recent paid orders:", orders.rows);

    // Test 3: Check inventory items that might trigger low stock
    console.log("\n3. Checking inventory for low stock items...");
    const inventory = await client.query(`
      SELECT inventory_id, inventory_name, quantity, low_stock_threshold, branch_id
      FROM inventory_item 
      WHERE branch_id = 3 AND quantity <= low_stock_threshold
      ORDER BY quantity ASC 
      LIMIT 3
    `);
    console.log("Low stock items in branch 3:", inventory.rows);

    // Test 4: Test low stock notification creation
    if (inventory.rows.length > 0) {
      console.log("\n4. Testing low stock notification...");
      const item = inventory.rows[0];
      const lowStockNotification =
        await NotificationService.checkAndCreateLowStockNotification(
          item.inventory_id,
          item.branch_id
        );
      console.log("✅ Low stock notification result:", lowStockNotification);
    }

    client.release();
    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    process.exit(0);
  }
}

testNotifications();
