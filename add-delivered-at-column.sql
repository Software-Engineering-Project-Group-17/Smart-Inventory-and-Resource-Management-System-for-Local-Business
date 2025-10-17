-- Add delivered_at column to supplier_order table for delivery tracking
-- This allows tracking when orders are actually delivered vs when they're paid

-- Add the delivered_at column to track delivery completion
ALTER TABLE supplier_order 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE NULL;

-- Add an index for performance on delivery status queries
CREATE INDEX IF NOT EXISTS idx_supplier_order_delivered_at ON supplier_order(delivered_at);

-- Add a comment explaining the column
COMMENT ON COLUMN supplier_order.delivered_at IS 'Timestamp when the order was marked as delivered and inventory was updated';

-- Verify the column was added
SELECT 'delivered_at column added successfully to supplier_order table' AS status;