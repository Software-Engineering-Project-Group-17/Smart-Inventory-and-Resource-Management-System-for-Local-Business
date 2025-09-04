-- Enhanced Customer Order Schema Migration
-- Run this in NEON SQL Editor to create complete order management tables
-- Date: September 4, 2025

-- ========================================
-- STEP 1: ENHANCE CUSTOMER_ORDER TABLE
-- ========================================

-- Update customer_order table with all required fields
DO $$ BEGIN
    -- Add missing columns to customer_order if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN customer_id BIGINT;
        ALTER TABLE customer_order ADD CONSTRAINT customer_order_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE SET NULL;
    END IF;

    -- Add additional order management columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_order' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE customer_order ADD COLUMN total_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
        ALTER TABLE customer_order ADD COLUMN order_status order_status NOT NULL DEFAULT 'pending';
        ALTER TABLE customer_order ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'unpaid';
        ALTER TABLE customer_order ADD COLUMN shipping_address TEXT;
        ALTER TABLE customer_order ADD COLUMN stripe_payment_intent_id VARCHAR(255);
        ALTER TABLE customer_order ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        ALTER TABLE customer_order ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        ALTER TABLE customer_order ADD COLUMN notes TEXT;
    END IF;
END $$;

-- ========================================
-- STEP 2: ENHANCE ORDER_ITEM TABLE
-- ========================================

-- Update order_item table with all required fields
DO $$ BEGIN
    -- Add missing columns to order_item if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'order_id'
    ) THEN
        ALTER TABLE order_item ADD COLUMN order_id BIGINT;
        ALTER TABLE order_item ADD CONSTRAINT order_item_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES customer_order(id) ON DELETE CASCADE;
    END IF;

    -- Add order item details
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_item' 
        AND column_name = 'inventory_id'
    ) THEN
        ALTER TABLE order_item ADD COLUMN inventory_id BIGINT NOT NULL;
        ALTER TABLE order_item ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE order_item ADD COLUMN unit_price NUMERIC(12,2) NOT NULL;
        ALTER TABLE order_item ADD COLUMN total_price NUMERIC(12,2) NOT NULL;
        
        -- Add foreign key to inventory_item
        ALTER TABLE order_item ADD CONSTRAINT order_item_inventory_id_fkey 
        FOREIGN KEY (inventory_id) REFERENCES inventory_item(inventory_id) ON DELETE RESTRICT;
    END IF;
END $$;

-- ========================================
-- STEP 3: ENHANCE PAYMENT TABLE
-- ========================================

-- Update payment table with Stripe integration
DO $$ BEGIN
    -- Add missing columns to payment if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment' 
        AND column_name = 'order_id'
    ) THEN
        ALTER TABLE payment ADD COLUMN order_id BIGINT;
        ALTER TABLE payment ADD CONSTRAINT payment_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES customer_order(id) ON DELETE CASCADE;
    END IF;

    -- Add payment details
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment' 
        AND column_name = 'amount'
    ) THEN
        ALTER TABLE payment ADD COLUMN amount NUMERIC(12,2) NOT NULL;
        ALTER TABLE payment ADD COLUMN payment_method VARCHAR(50) DEFAULT 'stripe';
        ALTER TABLE payment ADD COLUMN stripe_payment_intent_id VARCHAR(255);
        ALTER TABLE payment ADD COLUMN stripe_charge_id VARCHAR(255);
        ALTER TABLE payment ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'unpaid';
        ALTER TABLE payment ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE payment ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        ALTER TABLE payment ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- ========================================
-- STEP 4: ADD INDEXES FOR PERFORMANCE
-- ========================================

-- Order management indexes
CREATE INDEX IF NOT EXISTS idx_customer_order_customer_id ON customer_order(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_status ON customer_order(order_status);
CREATE INDEX IF NOT EXISTS idx_customer_order_payment_status ON customer_order(payment_status);
CREATE INDEX IF NOT EXISTS idx_customer_order_stripe_intent ON customer_order(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_created_at ON customer_order(created_at);

-- Order item indexes
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_inventory_id ON order_item(inventory_id);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_stripe_intent ON payment(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(payment_status);

-- ========================================
-- STEP 5: CREATE HELPFUL VIEWS
-- ========================================

-- Order summary view with customer and item details
CREATE OR REPLACE VIEW order_summary_view AS
SELECT 
    co.id as order_id,
    co.total_amount,
    co.order_status,
    co.payment_status,
    co.created_at as order_date,
    c.customer_name,
    c.customer_email,
    COUNT(oi.id) as item_count,
    STRING_AGG(ii.inventory_name, ', ') as items
FROM customer_order co
LEFT JOIN customer c ON co.customer_id = c.id
LEFT JOIN order_item oi ON co.id = oi.order_id
LEFT JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
GROUP BY co.id, co.total_amount, co.order_status, co.payment_status, co.created_at, c.customer_name, c.customer_email;

-- Customer order history view
CREATE OR REPLACE VIEW customer_order_history_view AS
SELECT 
    c.id as customer_id,
    c.customer_name,
    c.customer_email,
    co.id as order_id,
    co.total_amount,
    co.order_status,
    co.payment_status,
    co.created_at as order_date,
    COUNT(oi.id) as items_count
FROM customer c
LEFT JOIN customer_order co ON c.id = co.customer_id
LEFT JOIN order_item oi ON co.id = oi.order_id
GROUP BY c.id, c.customer_name, c.customer_email, co.id, co.total_amount, co.order_status, co.payment_status, co.created_at
ORDER BY co.created_at DESC;

-- ========================================
-- STEP 6: ADD TRIGGERS
-- ========================================

-- Update timestamp trigger for customer_order
DROP TRIGGER IF EXISTS update_customer_order_updated_at ON customer_order;
CREATE TRIGGER update_customer_order_updated_at
    BEFORE UPDATE ON customer_order
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 7: ADD COMMENTS
-- ========================================

COMMENT ON TABLE customer_order IS 'Customer orders with payment integration';
COMMENT ON TABLE order_item IS 'Individual items within customer orders';
COMMENT ON TABLE payment IS 'Payment records linked to orders with Stripe integration';

COMMENT ON COLUMN customer_order.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
COMMENT ON COLUMN customer_order.shipping_address IS 'Customer shipping address for order delivery';
COMMENT ON COLUMN payment.stripe_payment_intent_id IS 'Stripe Payment Intent ID';
COMMENT ON COLUMN payment.stripe_charge_id IS 'Stripe Charge ID when payment is completed';
COMMENT ON COLUMN payment.metadata IS 'Additional payment metadata in JSON format';

-- ========================================
-- VERIFICATION
-- ========================================

-- Verify the migration completed successfully
SELECT 'Order management schema migration completed successfully!' AS status;

-- Show enhanced table structures
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN ('customer_order', 'order_item', 'payment')
GROUP BY table_name
ORDER BY table_name;
