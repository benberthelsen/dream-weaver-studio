-- Update supplier URLs that are broken or incorrect
UPDATE suppliers SET website_url = 'https://www.smartstone.com.au/' WHERE slug = 'smartstone';
UPDATE suppliers SET website_url = 'https://www.lithostonequartzsurfaces.com.au/' WHERE slug = 'lithostone';
UPDATE suppliers SET website_url = 'https://www.ydlstone.com.au/products/' WHERE slug = 'ydl-stone';
UPDATE suppliers SET website_url = 'https://www.hafele.com.au/en/' WHERE slug = 'hafele';