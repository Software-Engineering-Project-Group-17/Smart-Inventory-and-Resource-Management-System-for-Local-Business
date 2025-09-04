-- Migration: Add category_img_url to category table
-- Run this in NEON SQL Editor to add image URL support for categories
-- Date: September 4, 2025

-- Add category_img_url column to category table
DO $$ BEGIN
    -- Check if the column doesn't already exist before adding it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'category' 
        AND column_name = 'category_img_url'
    ) THEN
        ALTER TABLE category 
        ADD COLUMN category_img_url VARCHAR(500);
        
        -- Add a comment to document the column purpose
        COMMENT ON COLUMN category.category_img_url IS 'URL or path to the category image (optional)';
        
        RAISE NOTICE 'Successfully added category_img_url column to category table';
    ELSE
        RAISE NOTICE 'Column category_img_url already exists in category table';
    END IF;
END $$;

-- Optional: Add an index for better performance when filtering by image presence
CREATE INDEX IF NOT EXISTS idx_category_has_image 
ON category(category_img_url) 
WHERE category_img_url IS NOT NULL;

-- Optional: Add some sample data to test the new column (uncomment if needed)
-- UPDATE category 
-- SET category_img_url = 'https://example.com/images/category-default.jpg' 
-- WHERE category_img_url IS NULL 
-- LIMIT 3;

-- Verify the migration
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'category' 
AND column_name = 'category_img_url';

-- Show table structure after migration
\d category;

-- Show all categories with their image status
SELECT 
    id,
    category_name,
    CASE 
        WHEN category_img_url IS NOT NULL THEN 'Has Image'
        ELSE 'No Image'
    END as image_status,
    category_img_url
FROM category
ORDER BY category_name;
