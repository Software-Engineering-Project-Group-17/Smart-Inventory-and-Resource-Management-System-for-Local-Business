-- COMPREHENSIVE DATABASE MIGRATION - ALL MISSING COLUMNS
-- This migration ensures ALL required columns exist for the complete order management system
-- Run this in NEON SQL Editor to add all missing columns across all tables
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

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending_activation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- STEP 2: ENSURE USER TABLE HAS ALL REQUIRED COLUMNS
-- ========================================

-- Add is_active column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE "user" ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added is_active column to user table';
    END IF;
END $$;

-- Add role_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' 
        AND column_name = 'role_id'
    ) THEN
        ALTER TABLE "user" ADD COLUMN role_id BIGINT;
        RAISE NOTICE 'Added role_id column to user table';
    END IF;
END $$;

-- ========================================
-- STEP 3: ENSURE CUSTOMER TABLE HAS ALL REQUIRED COLUMNS
-- ========================================

-- Add user_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE customer ADD COLUMN user_id BIGINT;
        RAISE NOTICE 'Added user_id column to customer';
    END IF;
END $$;

-- Add customer_name column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer' 
        AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE customer ADD COLUMN customer_name VARCHAR(255);
        RAISE NOTICE 'Added customer_name column to customer';
    END IF;
END $$;

-- Add customer_email column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer' 
        AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE customer ADD COLUMN customer_email VARCHAR(255);
        RAISE NOTICE 'Added customer_email column to customer';
    END IF;
END $$;

-- Add customer_tel column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer' 
        AND column_name = 'customer_tel'
    ) THEN
        ALTER TABLE customer ADD COLUMN customer_tel VARCHAR(20);
        RAISE NOTICE 'Added customer_tel column to customer';
    END IF;
END $$;

-- Add address column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE customer ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column to customer';
    END IF;
END $$;

-- Add loyalty_points column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer' 
        AND column_name = 'loyalty_points'
    ) THEN
        ALTER TABLE customer ADD COLUMN loyalty_points INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added loyalty_points column to customer';
    END IF;
END $$;

-- ========================================
-- STEP 4: ENSURE INVENTORY_ITEM TABLE HAS ALL REQUIRED COLUMNS
-- ========================================

-- Add unit_price column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_item' 
        AND column_name = 'unit_price'
    ) THEN
        ALTER TABLE inventory_item ADD COLUMN unit_price NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added unit_price column to inventory_item';
    END IF;
END $$;

-- Add quantity column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_item' 
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE inventory_item ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added quantity column to inventory_item';
    END IF;
END $$;

-- Add inventory_name column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_item' 
        AND column_name = 'inventory_name'
    ) THEN
        ALTER TABLE inventory_item ADD COLUMN inventory_name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Item';
        RAISE NOTICE 'Added inventory_name column to inventory_item';
    END IF;
END $$;

-- Add image_url column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_item' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE inventory_item ADD COLUMN image_url VARCHAR(500);
        RAISE NOTICE 'Added image_url column to inventory_item';
    END IF;
END $$;

-- Add branch_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_item' 
        AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE inventory_item ADD COLUMN branch_id BIGINT;
        RAISE NOTICE 'Added branch_id column to inventory_item';
    END IF;
END $$;

-- ========================================
-- STEP 5: ENSURE CUSTOMER_ORDER TABLE HAS ALL REQUIRED COLUMNS
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
-- STEP 6: ENSURE ORDER_ITEM TABLE HAS ALL REQUIRED COLUMNS
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
-- STEP 7: ENSURE BRANCHES TABLE HAS REQUIRED COLUMNS
-- ========================================

-- Add name column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branches' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE branches ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Default Branch';
        RAISE NOTICE 'Added name column to branches';
    END IF;
END $$;

-- Add location column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branches' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE branches ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to branches';
    END IF;
END $$;

-- Add owner_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branches' 
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE branches ADD COLUMN owner_id BIGINT;
        RAISE NOTICE 'Added owner_id column to branches';
    END IF;
END $$;

-- ========================================
-- STEP 8: ADD FOREIGN KEY CONSTRAINTS (if missing)
-- ========================================

-- Add foreign key constraint for user.role_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_role_id_fkey' 
        AND table_name = 'user'
    ) THEN
        ALTER TABLE "user" 
        ADD CONSTRAINT user_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for user.role_id';
    END IF;
END $$;

-- Add foreign key constraint for customer.user_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_user_id_fkey' 
        AND table_name = 'customer'
    ) THEN
        ALTER TABLE customer 
        ADD CONSTRAINT customer_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for customer.user_id';
    END IF;
END $$;

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

-- Add foreign key constraint for inventory_item.branch_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'inventory_item_branch_id_fkey' 
        AND table_name = 'inventory_item'
    ) THEN
        ALTER TABLE inventory_item 
        ADD CONSTRAINT inventory_item_branch_id_fkey 
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for inventory_item.branch_id';
    END IF;
END $$;

-- Add foreign key constraint for branches.owner_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'branches_owner_id_fkey' 
        AND table_name = 'branches'
    ) THEN
        ALTER TABLE branches 
        ADD CONSTRAINT branches_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES "user"(user_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for branches.owner_id';
    END IF;
END $$;

-- ========================================
-- STEP 9: ADD INDEXES FOR PERFORMANCE
-- ========================================

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_firebase_uid ON "user"(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_role_id ON "user"(role_id);

-- Customer table indexes
CREATE INDEX IF NOT EXISTS idx_customer_user_id ON customer(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(customer_email);

-- Inventory item indexes
CREATE INDEX IF NOT EXISTS idx_inventory_item_branch_id ON inventory_item(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_name ON inventory_item(inventory_name);

-- Customer order indexes
CREATE INDEX IF NOT EXISTS idx_customer_order_customer_id ON customer_order(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_status ON customer_order(order_status);
CREATE INDEX IF NOT EXISTS idx_customer_order_payment_status ON customer_order(payment_status);
CREATE INDEX IF NOT EXISTS idx_customer_order_stripe_intent ON customer_order(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_created_at ON customer_order(created_at);

-- Order item indexes
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_inventory_id ON order_item(inventory_id);

-- Branches indexes
CREATE INDEX IF NOT EXISTS idx_branches_owner_id ON branches(owner_id);

-- ========================================
-- STEP 10: CREATE OR UPDATE TRIGGERS
-- ========================================

-- Function for updating timestamps (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user updated_at
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_user_updated_at'
        AND event_object_table = 'user'
    ) THEN
        CREATE TRIGGER update_user_updated_at
            BEFORE UPDATE ON "user"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update trigger for user table';
    END IF;
END $$;

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
-- STEP 11: ENSURE DEFAULT DATA EXISTS
-- ========================================

-- Insert default roles if they don't exist
INSERT INTO roles (id, role, description) VALUES 
(1, 'OWNER', 'System administrator with full access'),
(2, 'BRANCH_MANAGER', 'Manager of a specific branch'),
(3, 'STAFF', 'Branch staff member'),
(4, 'SUPPLIER', 'External supplier'),
(5, 'CUSTOMER', 'Customer of the business')
ON CONFLICT (role) DO NOTHING;

-- Ensure default branch exists
INSERT INTO branches (id, name, location) VALUES 
(1, 'Default Branch', 'Main location')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STEP 12: VERIFICATION QUERIES
-- ========================================

-- Verify all tables have required columns
SELECT 'DATABASE MIGRATION VERIFICATION REPORT' AS report_title;

-- User table structure
SELECT 'USER TABLE COLUMNS:' AS section_title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user' 
ORDER BY ordinal_position;

-- Customer table structure
SELECT 'CUSTOMER TABLE COLUMNS:' AS section_title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customer' 
ORDER BY ordinal_position;

-- Inventory item table structure
SELECT 'INVENTORY_ITEM TABLE COLUMNS:' AS section_title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_item' 
ORDER BY ordinal_position;

-- Customer order table structure
SELECT 'CUSTOMER_ORDER TABLE COLUMNS:' AS section_title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customer_order' 
ORDER BY ordinal_position;

-- Order item table structure
SELECT 'ORDER_ITEM TABLE COLUMNS:' AS section_title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_item' 
ORDER BY ordinal_position;

-- Verify foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS:' AS section_title;
SELECT 
    tc.table_name, 
    tc.constraint_name, 
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
    AND tc.table_name IN ('user', 'customer', 'inventory_item', 'customer_order', 'order_item', 'branches')
ORDER BY tc.table_name, tc.constraint_name;

-- Final success message
SELECT '🎉 COMPREHENSIVE DATABASE MIGRATION COMPLETED SUCCESSFULLY! 🎉' AS final_status;
SELECT 'All required columns, constraints, and indexes have been added.' AS summary;
SELECT 'Your order management system is now ready for full operation.' AS next_steps;
