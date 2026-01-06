-- Move Hafele from kick_finishes to hardware category
UPDATE suppliers 
SET category = 'hardware' 
WHERE name = 'Hafele';

-- Create Standard Finishes supplier for kick finishes
INSERT INTO suppliers (name, slug, category, is_active, website_url)
VALUES ('Standard Finishes', 'standard-finishes', 'kick_finishes', true, NULL);

-- Add standard metallic kick finish products
INSERT INTO catalog_items (name, supplier_id, image_url, color, material, finish_type, is_active)
SELECT 
  finish_name,
  (SELECT id FROM suppliers WHERE slug = 'standard-finishes'),
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  color_value,
  material_value,
  finish_value,
  true
FROM (VALUES
  ('Brushed Stainless Steel', 'Silver', 'Stainless Steel', 'Brushed'),
  ('Polished Stainless Steel', 'Silver', 'Stainless Steel', 'Polished'),
  ('Brushed Aluminium', 'Silver', 'Aluminium', 'Brushed'),
  ('Anodised Aluminium', 'Silver', 'Aluminium', 'Anodised'),
  ('Raw Aluminium', 'Natural', 'Aluminium', 'Raw'),
  ('Brushed Brass', 'Gold', 'Brass', 'Brushed'),
  ('Polished Brass', 'Gold', 'Brass', 'Polished'),
  ('Brushed Copper', 'Copper', 'Copper', 'Brushed'),
  ('Matt Black', 'Black', 'Powder Coated', 'Matt'),
  ('Gloss Black', 'Black', 'Powder Coated', 'Gloss'),
  ('Matt White', 'White', 'Powder Coated', 'Matt'),
  ('Gloss White', 'White', 'Powder Coated', 'Gloss'),
  ('Graphite', 'Charcoal', 'Powder Coated', 'Matt'),
  ('Champagne', 'Gold', 'Anodised Aluminium', 'Brushed')
) AS t(finish_name, color_value, material_value, finish_value);