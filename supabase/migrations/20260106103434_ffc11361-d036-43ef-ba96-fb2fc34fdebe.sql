-- Add product classification columns to catalog_items
ALTER TABLE catalog_items 
ADD COLUMN product_type text DEFAULT 'board',
ADD COLUMN thickness text,
ADD COLUMN usage_types text[] DEFAULT '{}';

-- Add comments for clarity
COMMENT ON COLUMN catalog_items.product_type IS 'Product type: board, laminate, compact_laminate, solid_surface, veneer, hardware, metallic';
COMMENT ON COLUMN catalog_items.thickness IS 'Thickness: 16mm, 18mm, 21mm, sheet, etc.';
COMMENT ON COLUMN catalog_items.usage_types IS 'Valid applications: doors, panels, kicks, bench_tops, carcass, splashbacks';

-- Delete Standard Finishes supplier and its products
DELETE FROM catalog_items 
WHERE supplier_id = (SELECT id FROM suppliers WHERE name = 'Standard Finishes');

DELETE FROM suppliers WHERE name = 'Standard Finishes';

-- Insert standard metallic kick finishes (no supplier - these are universal)
INSERT INTO catalog_items (name, color, material, product_type, usage_types, image_url, is_active)
VALUES 
  ('Brushed Stainless Steel', 'Stainless', 'Stainless Steel', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Brushed Aluminium', 'Silver', 'Aluminium', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Polished Aluminium', 'Silver', 'Aluminium', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Brushed Brass', 'Brass', 'Brass', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Polished Brass', 'Brass', 'Brass', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Matt Black', 'Black', 'Powder Coat', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Satin Black', 'Black', 'Powder Coat', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Matt White', 'White', 'Powder Coat', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Gloss White', 'White', 'Powder Coat', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Raw Aluminium', 'Silver', 'Aluminium', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Brushed Bronze', 'Bronze', 'Bronze', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Oil Rubbed Bronze', 'Bronze', 'Bronze', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Champagne', 'Champagne', 'Anodised Aluminium', 'metallic', ARRAY['kicks'], '/placeholder.svg', true),
  ('Titanium', 'Titanium', 'Anodised Aluminium', 'metallic', ARRAY['kicks'], '/placeholder.svg', true);

-- Set default usage_types for existing products based on supplier category
UPDATE catalog_items ci
SET usage_types = CASE 
  WHEN s.category = 'bench_tops' THEN ARRAY['bench_tops']
  WHEN s.category = 'doors_panels' THEN ARRAY['doors', 'panels']
  WHEN s.category = 'hardware' THEN ARRAY[]::text[]
  ELSE ARRAY['doors']
END
FROM suppliers s
WHERE ci.supplier_id = s.id 
AND ci.usage_types = '{}';

-- Create index for faster filtering
CREATE INDEX idx_catalog_items_usage_types ON catalog_items USING GIN(usage_types);
CREATE INDEX idx_catalog_items_product_type ON catalog_items(product_type);