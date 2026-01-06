-- First delete duplicates, keeping only the oldest one (lowest id)
WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY supplier_id, name, image_url ORDER BY created_at) as rn
    FROM catalog_items
)
DELETE FROM catalog_items WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Now add unique constraint to prevent future duplicates
ALTER TABLE catalog_items ADD CONSTRAINT catalog_items_unique_product 
  UNIQUE (supplier_id, name, image_url);