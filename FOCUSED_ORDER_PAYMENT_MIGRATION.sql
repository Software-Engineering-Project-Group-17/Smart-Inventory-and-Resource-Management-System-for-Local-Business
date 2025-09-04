-- FOCUSED MIGRATION: Order, Payment & Customer Process Only
-- This migration adds ONLY the missing columns needed for the specific API operations
-- Run this in NEON SQL Editor to add missing columns for order/payment/customer creation
-- Date: September 4, 2025

-- ========================================
-- STEP 1: CREATE REQUIRED ENUM TYPES (if not exists)
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
-- STEP 2: ADD MISSING COLUMNS TO CUSTOMER_ORDER TABLE
-- ========================================

-- Based on orders/create/route.ts API requirements:
-- customer_id, total_amount, order_status, payment_status, shipping_address, stripe_payment_intent_id, created_at

DO $$ BEGIN
    -- Add shipping_address column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN shipping_address TEXT;
        RAISE NOTICE 'Added shipping_address column to customer_order';
    END IF;
END $$;

DO $$ BEGIN
    -- Add stripe_payment_intent_id column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN stripe_payment_intent_id VARCHAR(255);
        RAISE NOTICE 'Added stripe_payment_intent_id column to customer_order';
    END IF;
END $$;

DO $$ BEGIN
    -- Add updated_at column if missing (needed for webhook updates)
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
-- STEP 3: ADD MISSING COLUMNS TO ORDER_ITEM TABLE  
-- ========================================

-- Based on orders/create/route.ts API requirements:
-- order_id, inventory_id, quantity, unit_price, total_price

DO $$ BEGIN
    -- Add unit_price column if missing (THIS FIXES YOUR ORIGINAL ERROR)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'unit_price'
    ) THEN
        ALTER TABLE order_item ADD COLUMN unit_price NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added unit_price column to order_item';
    END IF;
END $$;

DO $$ BEGIN
    -- Add total_price column if missing
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
-- STEP 4: ADD MISSING COLUMNS TO CUSTOMER TABLE
-- ========================================

-- Based on customer/create/route.ts API requirements:
-- user_id, customer_name, customer_email, customer_tel, address, loyalty_points

DO $$ BEGIN
    -- Add customer_tel column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer' 
        AND column_name = 'customer_tel'
    ) THEN
        ALTER TABLE customer ADD COLUMN customer_tel VARCHAR(20);
        RAISE NOTICE 'Added customer_tel column to customer';
    END IF;
END $$;

-- ========================================
-- STEP 5: ADD MISSING COLUMNS TO USER TABLE (for customer creation)
-- ========================================

-- Based on customer/create/route.ts API requirements:
-- firebase_uid, email, name, role_id, is_active, account_status, updated_at

DO $$ BEGIN
    -- Add is_active column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE "user" ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added is_active column to user';
    END IF;
END $$;

-- ========================================
-- STEP 6: ADD INDEXES FOR PERFORMANCE (only for new columns)
-- ========================================

-- Index for Stripe payment intent lookups (critical for webhook performance)
CREATE INDEX IF NOT EXISTS idx_customer_order_stripe_intent 
ON customer_order(stripe_payment_intent_id);

-- Index for customer order lookups
CREATE INDEX IF NOT EXISTS idx_customer_order_customer_id 
ON customer_order(customer_id);

-- Index for order item queries
CREATE INDEX IF NOT EXISTS idx_order_item_order_id 
ON order_item(order_id);

-- ========================================
-- STEP 7: CREATE TRIGGER FOR UPDATED_AT (if not exists)
-- ========================================

-- Function for updating timestamps (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for customer_order updated_at (needed for webhook updates)
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
-- STEP 8: ADD COLUMN COMMENTS (for documentation)
-- ========================================

COMMENT ON COLUMN customer_order.shipping_address IS 'Customer shipping address for order delivery';
COMMENT ON COLUMN customer_order.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
COMMENT ON COLUMN customer_order.updated_at IS 'Timestamp when the order was last updated (used by webhooks)';

COMMENT ON COLUMN order_item.unit_price IS 'Price per unit at time of order (fixes original error)';
COMMENT ON COLUMN order_item.total_price IS 'Total price for this line item (quantity * unit_price)';

COMMENT ON COLUMN customer.customer_tel IS 'Customer phone number (optional)';

COMMENT ON COLUMN "user".is_active IS 'Whether the user account is active (used in customer creation)';

-- ========================================
-- STEP 9: VERIFICATION QUERIES
-- ========================================

-- Verify the focused migration completed successfully
SELECT 'FOCUSED MIGRATION FOR ORDER/PAYMENT/CUSTOMER PROCESS COMPLETED!' AS status;

-- Show added columns for customer_order table
SELECT 'CUSTOMER_ORDER TABLE - NEW COLUMNS:' AS section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customer_order' 
AND column_name IN ('shipping_address', 'stripe_payment_intent_id', 'updated_at')
ORDER BY column_name;

-- Show added columns for order_item table
SELECT 'ORDER_ITEM TABLE - NEW COLUMNS:' AS section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_item' 
AND column_name IN ('unit_price', 'total_price')
ORDER BY column_name;

-- Show added columns for customer table
SELECT 'CUSTOMER TABLE - NEW COLUMNS:' AS section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customer' 
AND column_name IN ('customer_tel')
ORDER BY column_name;

-- Show added columns for user table
SELECT 'USER TABLE - NEW COLUMNS:' AS section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('is_active')
ORDER BY column_name;

-- Final success message
SELECT '✅ All missing columns for order/payment/customer APIs have been added!' AS final_status;
SELECT 'Your order creation process should now work without errors.' AS next_steps;
