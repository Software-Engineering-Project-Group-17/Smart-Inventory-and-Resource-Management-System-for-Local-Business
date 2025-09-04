-- Comprehensive Order Tables Migration
-- This migration ensures all required columns exist for order management
-- Run this in NEON SQL Editor to add all missing columns
-- Date: September 4, 2025

-- ========================================
-- STEP 1: CREATE ENUM TYPES (if not exists)
-- ========================================

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- STEP 2: ENSURE CUSTOMER_ORDER TABLE HAS ALL REQUIRED COLUMNS
-- ========================================

-- Add customer_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN customer_id BIGINT;
        RAISE NOTICE 'Added customer_id column to customer_order';
    END IF;
END $$;

-- Add total_amount column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN total_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added total_amount column to customer_order';
    END IF;
END $$;

-- Add order_status column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'order_status'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN order_status order_status NOT NULL DEFAULT 'pending';
        RAISE NOTICE 'Added order_status column to customer_order';
    END IF;
END $$;

-- Add payment_status column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'unpaid';
        RAISE NOTICE 'Added payment_status column to customer_order';
    END IF;
END $$;

-- Add shipping_address column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN shipping_address TEXT;
        RAISE NOTICE 'Added shipping_address column to customer_order';
    END IF;
END $$;

-- Add stripe_payment_intent_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN stripe_payment_intent_id VARCHAR(255);
        RAISE NOTICE 'Added stripe_payment_intent_id column to customer_order';
    END IF;
END $$;

-- Add created_at column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        RAISE NOTICE 'Added created_at column to customer_order';
    END IF;
END $$;

-- Add updated_at column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        RAISE NOTICE 'Added updated_at column to customer_order';
    END IF;
END $$;

-- ========================================
-- STEP 3: ENSURE ORDER_ITEM TABLE HAS ALL REQUIRED COLUMNS
-- ========================================

-- Add order_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'order_id'
    ) THEN
        ALTER TABLE order_item ADD COLUMN order_id BIGINT;
        RAISE NOTICE 'Added order_id column to order_item';
    END IF;
END $$;

-- Add inventory_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'inventory_id'
    ) THEN
        ALTER TABLE order_item ADD COLUMN inventory_id BIGINT;
        RAISE NOTICE 'Added inventory_id column to order_item';
    END IF;
END $$;

-- Add quantity column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE order_item ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
        RAISE NOTICE 'Added quantity column to order_item';
    END IF;
END $$;

-- Add unit_price column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'unit_price'
    ) THEN
        ALTER TABLE order_item ADD COLUMN unit_price NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added unit_price column to order_item';
    END IF;
END $$;

-- Add total_price column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'total_price'
    ) THEN
        ALTER TABLE order_item ADD COLUMN total_price NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added total_price column to order_item';
    END IF;
END $$;

-- ========================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS (if missing)
-- ========================================

-- Add foreign key constraint for customer_order.customer_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_order_customer_id_fkey' 
        AND table_name = 'customer_order'
    ) THEN
        ALTER TABLE customer_order 
        ADD CONSTRAINT customer_order_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for customer_order.customer_id';
    END IF;
END $$;

-- Add foreign key constraint for order_item.order_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_item_order_id_fkey' 
        AND table_name = 'order_item'
    ) THEN
        ALTER TABLE order_item 
        ADD CONSTRAINT order_item_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES customer_order(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for order_item.order_id';
    END IF;
END $$;

-- Add foreign key constraint for order_item.inventory_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_item_inventory_id_fkey' 
        AND table_name = 'order_item'
    ) THEN
        ALTER TABLE order_item 
        ADD CONSTRAINT order_item_inventory_id_fkey 
        FOREIGN KEY (inventory_id) REFERENCES inventory_item(inventory_id) ON DELETE RESTRICT;
        RAISE NOTICE 'Added foreign key constraint for order_item.inventory_id';
    END IF;
END $$;

-- ========================================
-- STEP 5: ADD INDEXES FOR PERFORMANCE
-- ========================================

-- Customer order indexes
CREATE INDEX IF NOT EXISTS idx_customer_order_customer_id ON customer_order(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_status ON customer_order(order_status);
CREATE INDEX IF NOT EXISTS idx_customer_order_payment_status ON customer_order(payment_status);
CREATE INDEX IF NOT EXISTS idx_customer_order_stripe_intent ON customer_order(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_created_at ON customer_order(created_at);

-- Order item indexes
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_inventory_id ON order_item(inventory_id);

-- ========================================
-- STEP 6: CREATE OR UPDATE TRIGGERS
-- ========================================

-- Function for updating timestamps (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for customer_order updated_at
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_customer_order_updated_at'
        AND event_object_table = 'customer_order'
    ) THEN
        CREATE TRIGGER update_customer_order_updated_at
            BEFORE UPDATE ON customer_order
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update trigger for customer_order table';
    END IF;
END $$;

-- ========================================
-- STEP 7: ADD COLUMN COMMENTS
-- ========================================

COMMENT ON COLUMN customer_order.customer_id IS 'Foreign key reference to customer table';
COMMENT ON COLUMN customer_order.total_amount IS 'Total order amount in decimal format';
COMMENT ON COLUMN customer_order.order_status IS 'Current status of the order (pending, processing, completed, cancelled)';
COMMENT ON COLUMN customer_order.payment_status IS 'Payment status (paid, unpaid, refunded, failed)';
COMMENT ON COLUMN customer_order.shipping_address IS 'Customer shipping address for order delivery';
COMMENT ON COLUMN customer_order.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
COMMENT ON COLUMN customer_order.created_at IS 'Timestamp when the order was created';
COMMENT ON COLUMN customer_order.updated_at IS 'Timestamp when the order was last updated';

COMMENT ON COLUMN order_item.order_id IS 'Foreign key reference to customer_order table';
COMMENT ON COLUMN order_item.inventory_id IS 'Foreign key reference to inventory_item table';
COMMENT ON COLUMN order_item.quantity IS 'Quantity of items ordered';
COMMENT ON COLUMN order_item.unit_price IS 'Price per unit at time of order';
COMMENT ON COLUMN order_item.total_price IS 'Total price for this line item (quantity * unit_price)';

-- ========================================
-- STEP 8: VERIFICATION QUERIES
-- ========================================

-- Verify customer_order table structure
SELECT 'customer_order table columns:' AS info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customer_order' 
ORDER BY ordinal_position;

-- Verify order_item table structure
SELECT 'order_item table columns:' AS info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_item' 
ORDER BY ordinal_position;

-- Verify foreign key constraints
SELECT 'Foreign key constraints:' AS info;
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('customer_order', 'order_item')
ORDER BY tc.table_name, tc.constraint_name;

-- Final success message
SELECT 'Comprehensive order tables migration completed successfully!' AS status;
