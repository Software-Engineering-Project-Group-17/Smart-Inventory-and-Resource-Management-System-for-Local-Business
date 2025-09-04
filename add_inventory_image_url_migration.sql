-- Migration: Add image_url to inventory_item table
-- Run this in NEON SQL Editor to add image URL support for inventory items
-- Date: September 4, 2025

-- Add image_url column to inventory_item table
DO $$ BEGIN
    -- Check if the column doesn't already exist before adding it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_item' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE inventory_item 
        ADD COLUMN image_url VARCHAR(500);
        
        -- Add a comment to document the column purpose
        COMMENT ON COLUMN inventory_item.image_url IS 'URL or path to the inventory item image';
        
        RAISE NOTICE 'Successfully added image_url column to inventory_item table';
    ELSE
        RAISE NOTICE 'Column image_url already exists in inventory_item table';
    END IF;
END $$;

-- Optional: Add an index for better performance when filtering by image presence
CREATE INDEX IF NOT EXISTS idx_inventory_item_has_image 
ON inventory_item(image_url) 
WHERE image_url IS NOT NULL;

-- Optional: Add some sample data to test the new column (uncomment if needed)
-- UPDATE inventory_item 
-- SET image_url = 'https://example.com/images/default-item.jpg' 
-- WHERE image_url IS NULL 
-- LIMIT 3;

-- Verify the migration
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_item' 
AND column_name = 'image_url';

-- Show table structure after migration
\d inventory_item;
