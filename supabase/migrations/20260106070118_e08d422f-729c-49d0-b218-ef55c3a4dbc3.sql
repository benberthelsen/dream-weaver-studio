-- Create categories table for cabinet products
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalog items table for laminates, handles, stones, etc.
CREATE TABLE public.catalog_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  brand TEXT,
  color TEXT,
  material TEXT,
  price DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved boards table (public for now, no auth required)
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Board',
  description TEXT,
  canvas_data JSONB NOT NULL DEFAULT '[]',
  preview_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and catalog items (built-in catalog)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Catalog items are viewable by everyone" 
ON public.catalog_items FOR SELECT USING (true);

-- Public access for boards (no auth for MVP)
CREATE POLICY "Boards are viewable by everyone" 
ON public.boards FOR SELECT USING (is_public = true);

CREATE POLICY "Anyone can create boards" 
ON public.boards FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their boards" 
ON public.boards FOR UPDATE USING (true);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Laminates', 'laminates', 'Decorative surface laminates for cabinets', 'layers'),
('Handles', 'handles', 'Cabinet handles and pulls', 'grip-vertical'),
('Stone Benchtops', 'stone-benchtops', 'Engineered stone and natural stone surfaces', 'square'),
('Edge Profiles', 'edge-profiles', 'Benchtop edge finishing options', 'ruler');

-- Insert sample catalog items
INSERT INTO public.catalog_items (category_id, name, description, image_url, brand, color, material) VALUES
-- Laminates
((SELECT id FROM public.categories WHERE slug = 'laminates'), 'Arctic White', 'Clean matte white laminate', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Laminex', 'White', 'HPL'),
((SELECT id FROM public.categories WHERE slug = 'laminates'), 'Charcoal Oak', 'Dark wood grain laminate', 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400', 'Laminex', 'Charcoal', 'HPL'),
((SELECT id FROM public.categories WHERE slug = 'laminates'), 'Natural Walnut', 'Warm walnut wood texture', 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400', 'Polytec', 'Brown', 'Melamine'),
((SELECT id FROM public.categories WHERE slug = 'laminates'), 'Slate Grey', 'Modern grey matte finish', 'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=400', 'Formica', 'Grey', 'HPL'),
-- Handles
((SELECT id FROM public.categories WHERE slug = 'handles'), 'Brushed Nickel Bar', 'Modern bar handle in brushed nickel', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Hafele', 'Silver', 'Stainless Steel'),
((SELECT id FROM public.categories WHERE slug = 'handles'), 'Matte Black Pull', 'Contemporary black cabinet pull', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Kethy', 'Black', 'Aluminium'),
((SELECT id FROM public.categories WHERE slug = 'handles'), 'Brass Knob', 'Classic brass cabinet knob', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Lo & Co', 'Gold', 'Brass'),
-- Stone Benchtops
((SELECT id FROM public.categories WHERE slug = 'stone-benchtops'), 'Calacatta Marble', 'White marble with grey veining', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', 'Caesarstone', 'White', 'Quartz'),
((SELECT id FROM public.categories WHERE slug = 'stone-benchtops'), 'Jet Black', 'Solid black quartz surface', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', 'Silestone', 'Black', 'Quartz'),
((SELECT id FROM public.categories WHERE slug = 'stone-benchtops'), 'Concrete Grey', 'Industrial concrete look', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', 'Essastone', 'Grey', 'Engineered Stone'),
-- Edge Profiles
((SELECT id FROM public.categories WHERE slug = 'edge-profiles'), 'Square Edge', 'Clean modern square profile', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Standard', 'Various', 'Stone'),
((SELECT id FROM public.categories WHERE slug = 'edge-profiles'), 'Bullnose', 'Rounded bullnose edge', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Standard', 'Various', 'Stone'),
((SELECT id FROM public.categories WHERE slug = 'edge-profiles'), 'Waterfall', 'Mitered waterfall edge', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Standard', 'Various', 'Stone');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();