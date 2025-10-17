-- Add 'shipped' status to order_status enum
-- Date: October 17, 2025

-- First check if 'shipped' already exists in the enum
DO $$ 
BEGIN
    -- Add 'shipped' to the order_status enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'shipped' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'order_status'
        )
    ) THEN
        ALTER TYPE order_status ADD VALUE 'shipped';
        RAISE NOTICE 'Added "shipped" status to order_status enum';
    ELSE
        RAISE NOTICE 'Status "shipped" already exists in order_status enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel as status_values 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
ORDER BY enumsortorder;