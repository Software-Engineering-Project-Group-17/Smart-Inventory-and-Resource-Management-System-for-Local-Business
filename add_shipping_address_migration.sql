-- Add shipping_address column to customer_order table
-- Run this in NEON SQL Editor to add shipping address support
-- Date: September 4, 2025

-- ========================================
-- ADD SHIPPING ADDRESS COLUMN
-- ========================================

DO $$ BEGIN
    -- Check if the shipping_address column doesn't already exist before adding it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'shipping_address'
    ) THEN
        -- Add shipping_address column
        ALTER TABLE customer_order 
        ADD COLUMN shipping_address TEXT;
        
        -- Add a comment to document the column purpose
        COMMENT ON COLUMN customer_order.shipping_address IS 'Customer shipping address for order delivery';
        
        RAISE NOTICE 'Successfully added shipping_address column to customer_order table';
    ELSE
        RAISE NOTICE 'Column shipping_address already exists in customer_order table';
    END IF;
END $$;

-- ========================================
-- ADD STRIPE PAYMENT INTENT ID COLUMN (if not exists)
-- ========================================

DO $$ BEGIN
    -- Check if the stripe_payment_intent_id column doesn't already exist before adding it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        -- Add stripe_payment_intent_id column
        ALTER TABLE customer_order 
        ADD COLUMN stripe_payment_intent_id VARCHAR(255);
        
        -- Add a comment to document the column purpose
        COMMENT ON COLUMN customer_order.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_customer_order_stripe_intent 
        ON customer_order(stripe_payment_intent_id);
        
        RAISE NOTICE 'Successfully added stripe_payment_intent_id column to customer_order table';
    ELSE
        RAISE NOTICE 'Column stripe_payment_intent_id already exists in customer_order table';
    END IF;
END $$;

-- ========================================
-- ADD UPDATED_AT COLUMN (if not exists)
-- ========================================

DO $$ BEGIN
    -- Check if the updated_at column doesn't already exist before adding it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'updated_at'
    ) THEN
        -- Add updated_at column
        ALTER TABLE customer_order 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        
        -- Add a comment to document the column purpose
        COMMENT ON COLUMN customer_order.updated_at IS 'Timestamp when the order was last updated';
        
        RAISE NOTICE 'Successfully added updated_at column to customer_order table';
    ELSE
        RAISE NOTICE 'Column updated_at already exists in customer_order table';
    END IF;
END $$;

-- ========================================
-- CREATE TRIGGER FOR UPDATED_AT (if not exists)
-- ========================================

-- Create trigger to automatically update updated_at column
DO $$ BEGIN
    -- Check if trigger doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_customer_order_updated_at'
        AND event_object_table = 'customer_order'
    ) THEN
        -- Create the trigger
        CREATE TRIGGER update_customer_order_updated_at
            BEFORE UPDATE ON customer_order
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Successfully created update trigger for customer_order table';
    ELSE
        RAISE NOTICE 'Trigger update_customer_order_updated_at already exists';
    END IF;
END $$;

-- ========================================
-- VERIFICATION
-- ========================================

-- Verify the migration completed successfully
SELECT 'Shipping address migration completed successfully!' AS status;

-- Show updated table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customer_order' 
AND column_name IN ('shipping_address', 'stripe_payment_intent_id', 'updated_at')
ORDER BY column_name;

-- Show current customer_order table structure
\d customer_order;
