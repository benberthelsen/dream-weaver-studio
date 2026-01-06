-- Drop the existing constraint
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_unique_product;

-- Add new constraint on supplier_id + name only
ALTER TABLE catalog_items ADD CONSTRAINT catalog_items_unique_product_name 
  UNIQUE (supplier_id, name);