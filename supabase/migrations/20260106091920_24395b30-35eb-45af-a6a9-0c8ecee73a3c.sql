-- Add category column to suppliers
ALTER TABLE suppliers ADD COLUMN category text DEFAULT 'doors_panels';

-- Update existing suppliers with correct categories based on their product type
-- Bench Tops (stone surfaces)
UPDATE suppliers SET category = 'bench_tops' WHERE name ILIKE '%caesarstone%' OR name ILIKE '%dekton%' OR name ILIKE '%silestone%' OR name ILIKE '%smartstone%' OR name ILIKE '%ydl%' OR name ILIKE '%litostone%' OR name ILIKE '%stone%';

-- Kick Finishes (handles, edges)
UPDATE suppliers SET category = 'kick_finishes' WHERE name ILIKE '%hafele%' OR name ILIKE '%kick%' OR name ILIKE '%edge%';

-- Doors and Panels is the default for everything else (Polytec, Laminex, Nikpol, etc.)

-- Create liked_items table for storing favorite colors
CREATE TABLE public.liked_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id uuid NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(catalog_item_id, session_id)
);

-- Enable RLS
ALTER TABLE public.liked_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view their own liked items
CREATE POLICY "Users can view their liked items" 
ON public.liked_items 
FOR SELECT 
USING (true);

-- Allow anyone to add liked items
CREATE POLICY "Anyone can add liked items" 
ON public.liked_items 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to delete their liked items
CREATE POLICY "Anyone can delete their liked items" 
ON public.liked_items 
FOR DELETE 
USING (true);