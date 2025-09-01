-- Alternative migration that preserves existing data
-- This attempts to convert existing TEXT data to TEXT[] format

-- Step 1: Add new temporary column
ALTER TABLE staff ADD COLUMN staff_types_new TEXT[] DEFAULT '{}';

-- Step 2: Convert existing data (if any exists)
-- This handles cases where staff_types might contain comma-separated values
UPDATE staff SET staff_types_new = 
  CASE 
    WHEN staff_types = '{}' OR staff_types = '' OR staff_types IS NULL THEN '{}'::TEXT[]
    WHEN staff_types LIKE '%,%' THEN string_to_array(replace(replace(staff_types, '{', ''), '}', ''), ',')
    ELSE ARRAY[replace(replace(staff_types, '{', ''), '}', '')]
  END;

-- Step 3: Drop old column
ALTER TABLE staff DROP COLUMN staff_types;

-- Step 4: Rename new column
ALTER TABLE staff RENAME COLUMN staff_types_new TO staff_types;

-- Step 5: Set NOT NULL constraint
ALTER TABLE staff ALTER COLUMN staff_types SET NOT NULL;

-- Verify the result
SELECT id, first_name, last_name, staff_types FROM staff LIMIT 5;
