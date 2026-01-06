-- Update existing supplier URLs to correct Australian websites
UPDATE suppliers SET website_url = 'https://www.cosentino.com/en-au/dekton/colours/' WHERE slug = 'dekton';
UPDATE suppliers SET website_url = 'https://www.cosentino.com/en-au/silestone/colours/' WHERE slug = 'silestone';
UPDATE suppliers SET website_url = 'https://newageveneers.com.au/navurban/' WHERE slug = 'navurban';
UPDATE suppliers SET website_url = 'https://www.hafele.com.au/en/products/furniture-fittings/' WHERE slug = 'hafele';

-- Fix Litostone -> Lithostone
UPDATE suppliers SET name = 'Lithostone', slug = 'lithostone', website_url = 'https://www.lithostonequartzsurfaces.com.au/' WHERE slug = 'litostone';

-- Update Designerone to Forest One brand page
UPDATE suppliers SET website_url = 'https://www.forest.one/products/our-brands/designer-one' WHERE slug = 'designerone';

-- Update YDL Stone
UPDATE suppliers SET website_url = 'https://www.ydlstone.com.au/colours/' WHERE slug = 'ydl-stone';

-- Add Essastone (by Laminex)
INSERT INTO suppliers (name, slug, website_url, is_active, category)
VALUES ('Essastone', 'essastone', 'https://www.laminex.com.au/products/benchtops/essastone', true, 'bench_tops')
ON CONFLICT (slug) DO UPDATE SET website_url = EXCLUDED.website_url;

-- Add Lavistone
INSERT INTO suppliers (name, slug, website_url, is_active, category)
VALUES ('Lavistone', 'lavistone', 'https://www.lavistone.com.au/', true, 'bench_tops')
ON CONFLICT (slug) DO UPDATE SET website_url = EXCLUDED.website_url;

-- Add ForestOne
INSERT INTO suppliers (name, slug, website_url, is_active, category)
VALUES ('ForestOne', 'forestone', 'https://www.forest.one/products', true, 'doors_panels')
ON CONFLICT (slug) DO UPDATE SET website_url = EXCLUDED.website_url;