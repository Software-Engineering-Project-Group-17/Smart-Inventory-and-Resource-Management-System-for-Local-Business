-- Migration: Add owner_id column to branch table
-- This aligns the database schema with the Branch entity that already has the owner field

BEGIN;

-- Add owner_id column to branch table
ALTER TABLE branch 
ADD COLUMN owner_id BIGINT REFERENCES "user"(user_id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_branch_owner_id ON branch(owner_id);

-- Optional: Update existing branches to have an owner
-- You can uncomment and modify this section if you want to assign existing branches to a specific owner
-- UPDATE branch SET owner_id = (SELECT user_id FROM "user" WHERE email = 'owner@inventory.com' LIMIT 1);

-- Verify the change
\d branch;

COMMIT;
