// Utility function to trigger SSE notification updates
// This can be called from other API routes when new notifications are created

export const triggerNotificationUpdate = async (branchId: string) => {
  try {
    // In a production environment, you might use Redis pub/sub or WebSocket
    // For now, we'll rely on the polling mechanism in the SSE endpoint
    console.log(`Notification update triggered for branch: ${branchId}`);
    
    // You could implement a more sophisticated notification system here
    // For example, using Redis to notify the SSE endpoint of new notifications
    
    return { success: true };
  } catch (error) {
    console.error('Error triggering notification update:', error);
    return { success: false, error };
  }
};

// Function to create a new notification and trigger updates
export const createNotification = async (
  branchId: string,
  title: string,
  message: string,
  notificationType: 'low_stock' | 'restock_completion' | 'stock_update' | 'system',
  inventoryId?: number,
  metadata?: any
) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);

    // Insert the notification (using correct table name and columns)
    const result = await sql`
      INSERT INTO notification (
        branch_id, 
        title, 
        message,
        content, 
        notification_type, 
        inventory_id, 
        metadata, 
        is_read
      ) VALUES (
        ${branchId}, 
        ${title}, 
        ${message},
        ${message}, 
        ${notificationType}, 
        ${inventoryId || null}, 
        ${metadata ? JSON.stringify(metadata) : null}, 
        false
      ) RETURNING id
    `;

    // Trigger notification update
    await triggerNotificationUpdate(branchId);

    return { success: true, notificationId: result[0].id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};