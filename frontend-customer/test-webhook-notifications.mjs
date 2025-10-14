// Test script to verify webhook notification logic
import { NotificationService } from "../lib/notification-service";

async function testWebhookNotificationLogic() {
  console.log("🧪 TESTING WEBHOOK NOTIFICATION LOGIC");
  console.log("===================================\n");

  try {
    // Test with Shelf Bracket (ID: 11, Branch: 3) - known to be low stock
    console.log("Testing with Shelf Bracket (ID: 11, Branch: 3)...");

    const result = await NotificationService.checkAndCreateLowStockNotification(
      11,
      3
    );

    if (result) {
      console.log("✅ SUCCESS: Notification created");
      console.log("Notification ID:", result.id);
      console.log("Created at:", result.created_at);
    } else {
      console.log(
        "ℹ️ No notification created (stock above threshold or recent notification exists)"
      );
    }

    // Test with Tape Measure (ID: 14, Branch: 3) - also known to be low stock
    console.log("\nTesting with Tape Measure (ID: 14, Branch: 3)...");

    const result2 =
      await NotificationService.checkAndCreateLowStockNotification(14, 3);

    if (result2) {
      console.log("✅ SUCCESS: Notification created");
      console.log("Notification ID:", result2.id);
      console.log("Created at:", result2.created_at);
    } else {
      console.log(
        "ℹ️ No notification created (stock above threshold or recent notification exists)"
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testWebhookNotificationLogic();
