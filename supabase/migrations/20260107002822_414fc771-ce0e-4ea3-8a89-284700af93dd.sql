-- Clean up junk products
DELETE FROM catalog_items WHERE 
  name LIKE '%.jpg' OR 
  name LIKE '%.png' OR
  name LIKE '%.webp' OR
  name LIKE 'http%' OR
  name IN ('Quick View', 'More info', 'Add to Cart', 'Moodboards', 'Bathrooms', 'Kitchens', 'View All', 'Learn More') OR
  LENGTH(name) < 3 OR
  LENGTH(name) > 100;

-- Reclassify ForestOne plywood products as carcass boards
UPDATE catalog_items 
SET product_type = 'board', usage_types = ARRAY['carcass']
WHERE (LOWER(name) LIKE '%hoop pine%' OR LOWER(name) LIKE '%plywood%' OR LOWER(name) LIKE '%ply%')
  AND product_type != 'board';

-- Reclassify EGGER boards
UPDATE catalog_items
SET product_type = 'board', usage_types = ARRAY['doors', 'panels'], thickness = '18mm'
WHERE source_url LIKE '%forest.one%' 
  AND (name ~ '^[UH][0-9]{3,4}' OR name LIKE '%ST19%' OR name LIKE '%EPD%' OR name LIKE '%EHD%')
  AND product_type != 'board';