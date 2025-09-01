-- Migration to fix staff_types column to use PostgreSQL array type
-- Run this migration to enable proper staff_types array storage

-- First, check current data (optional)
-- SELECT staff_types FROM staff LIMIT 5;

-- Step 1: Temporarily allow NULL values for the column
ALTER TABLE staff ALTER COLUMN staff_types DROP NOT NULL;

-- Step 2: Drop the existing column
ALTER TABLE staff DROP COLUMN staff_types;

-- Step 3: Add the new column with proper array type
ALTER TABLE staff ADD COLUMN staff_types TEXT[] DEFAULT '{}';

-- Step 4: Set NOT NULL constraint back
ALTER TABLE staff ALTER COLUMN staff_types SET NOT NULL;

-- Step 5: Add sample data for existing staff (optional)
-- UPDATE staff SET staff_types = ARRAY['SALES'] WHERE staff_types = '{}';

-- Verify the change
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'staff' AND column_name = 'staff_types';

COMMENT ON COLUMN staff.staff_types IS 'Array of staff type permissions: SALES, INVENTORY, RESOURCES';
