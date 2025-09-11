-- Add barcode field to inventory_item table
ALTER TABLE inventory_item
ADD COLUMN IF NOT EXISTS barcode VARCHAR(128) UNIQUE;