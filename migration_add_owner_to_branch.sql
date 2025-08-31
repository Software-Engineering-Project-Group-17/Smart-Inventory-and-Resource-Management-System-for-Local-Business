-- Migration to add owner_id to branch table
-- This aligns the database schema with our Java entity

BEGIN;

-- Add owner_id column to branch table
ALTER TABLE branch 
ADD COLUMN owner_id BIGINT REFERENCES "user"(user_id) ON DELETE SET NULL;

-- Create an index for better query performance
CREATE INDEX idx_branch_owner_id ON branch(owner_id);

-- Optionally, set a default owner for existing branches
-- You can update this to assign existing branches to specific owners
-- UPDATE branch SET owner_id = (SELECT user_id FROM "user" WHERE role_id = (SELECT id FROM roles WHERE role = 'OWNER') LIMIT 1);

COMMIT;
