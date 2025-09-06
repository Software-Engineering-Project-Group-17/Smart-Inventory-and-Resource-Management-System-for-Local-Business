-- NOTIFICATION TABLE ENHANCEMENT MIGRATION
-- This migration updates the existing notification table to support the new notification system
-- Date: September 6, 2025
-- 
-- This migration adds columns needed for:
-- - Low stock alerts
-- - Restock completion notifications
-- - Branch-based notifications
-- - Read/unread status tracking
-- - Notification types and metadata

-- ========================================
-- STEP 1: CREATE NOTIFICATION TYPE ENUM
-- ========================================

-- Create notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('low_stock', 'restock_completion', 'stock_update', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$ LANGUAGE plpgsql;

-- ========================================
-- STEP 2: ADD NEW COLUMNS TO NOTIFICATION TABLE
-- ========================================

-- Add branch_id column (required for branch-based notifications)
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS branch_id BIGINT;

-- Add title column (for notification titles)
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Add message column (rename from content for consistency)
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS message TEXT;

-- Add notification_type column
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS notification_type notification_type DEFAULT 'system';

-- Add inventory_id column (for inventory-related notifications)
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS inventory_id BIGINT;

-- Add metadata column (for additional notification data)
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add is_read column (for read/unread status)
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add updated_at column (for tracking when notifications are read)
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ========================================
-- STEP 3: MIGRATE EXISTING DATA
-- ========================================

-- Migrate existing content to message column and add default title
UPDATE notification 
SET 
    message = content,
    title = CASE 
        WHEN content IS NOT NULL THEN 'System Notification'
        ELSE 'Notification'
    END
WHERE message IS NULL AND content IS NOT NULL;

-- Set default branch_id for existing notifications (if there are any)
-- This will set to branch 1 for any existing notifications without a branch
UPDATE notification 
SET branch_id = 1 
WHERE branch_id IS NULL;

-- ========================================
-- STEP 4: ADD CONSTRAINTS AND INDEXES
-- ========================================

-- Add foreign key constraint for branch_id
ALTER TABLE notification 
ADD CONSTRAINT notification_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;

-- Add foreign key constraint for inventory_id (optional reference)
ALTER TABLE notification 
ADD CONSTRAINT notification_inventory_id_fkey 
FOREIGN KEY (inventory_id) REFERENCES inventory_item(inventory_id) ON DELETE SET NULL;

-- Make branch_id NOT NULL (since all notifications should belong to a branch)
ALTER TABLE notification 
ALTER COLUMN branch_id SET NOT NULL;

-- Make title NOT NULL
UPDATE notification SET title = 'Notification' WHERE title IS NULL;
ALTER TABLE notification 
ALTER COLUMN title SET NOT NULL;

-- Make message NOT NULL
UPDATE notification SET message = 'No message' WHERE message IS NULL;
ALTER TABLE notification 
ALTER COLUMN message SET NOT NULL;

-- ========================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Index for branch-based queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_notification_branch_id ON notification(branch_id);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON notification(is_read);

-- Index for notification type
CREATE INDEX IF NOT EXISTS idx_notification_type ON notification(notification_type);

-- Index for inventory-related notifications
CREATE INDEX IF NOT EXISTS idx_notification_inventory_id ON notification(inventory_id);

-- Index for created_at (for ordering)
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notification(created_at DESC);

-- Composite index for branch and read status (common query)
CREATE INDEX IF NOT EXISTS idx_notification_branch_read ON notification(branch_id, is_read);

-- Composite index for branch and created_at (for recent notifications)
CREATE INDEX IF NOT EXISTS idx_notification_branch_created ON notification(branch_id, created_at DESC);

-- ========================================
-- STEP 6: CREATE TRIGGER FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on notification updates
DROP TRIGGER IF EXISTS trigger_update_notification_updated_at ON notification;
CREATE TRIGGER trigger_update_notification_updated_at
    BEFORE UPDATE ON notification
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- ========================================
-- STEP 7: DROP OLD COLUMN (OPTIONAL)
-- ========================================

-- Optionally drop the old content column since we've migrated to message
-- Uncomment the next line if you want to remove the old content column
-- ALTER TABLE notification DROP COLUMN IF EXISTS content;

-- ========================================
-- STEP 8: ADD COMMENTS FOR DOCUMENTATION
-- ========================================

-- Add table and column comments for documentation
COMMENT ON TABLE notification IS 'System notifications for branches including low stock alerts and restock completions';
COMMENT ON COLUMN notification.branch_id IS 'Branch that this notification belongs to';
COMMENT ON COLUMN notification.title IS 'Short title for the notification';
COMMENT ON COLUMN notification.message IS 'Full notification message';
COMMENT ON COLUMN notification.notification_type IS 'Type of notification: low_stock, restock_completion, stock_update, system';
COMMENT ON COLUMN notification.inventory_id IS 'Optional reference to inventory item for inventory-related notifications';
COMMENT ON COLUMN notification.metadata IS 'Additional JSON data for the notification (quantities, thresholds, etc.)';
COMMENT ON COLUMN notification.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN notification.updated_at IS 'Timestamp when notification was last updated (e.g., marked as read)';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification' 
ORDER BY ordinal_position;

-- Show notification type enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'notification_type'::regtype 
ORDER BY enumlabel;

-- Success message
SELECT 'NOTIFICATION TABLE MIGRATION COMPLETED SUCCESSFULLY!' AS status;
SELECT 'The notification table now supports low stock alerts, restock notifications, and branch-based notifications.' AS description;
