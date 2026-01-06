-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  scrape_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_ranges table
CREATE TABLE public.product_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, slug)
);

-- Add new columns to catalog_items
ALTER TABLE public.catalog_items 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
ADD COLUMN range_id UUID REFERENCES public.product_ranges(id) ON DELETE SET NULL,
ADD COLUMN sku TEXT,
ADD COLUMN finish_type TEXT,
ADD COLUMN dimensions TEXT,
ADD COLUMN hex_color TEXT,
ADD COLUMN source_url TEXT,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE;

-- Create inspiration_gallery table
CREATE TABLE public.inspiration_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  style_tags TEXT[] DEFAULT '{}',
  color_palette TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_boards table
CREATE TABLE public.saved_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Board',
  description TEXT,
  canvas_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_image_url TEXT,
  background TEXT DEFAULT 'white',
  style TEXT DEFAULT 'natural',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_boards ENABLE ROW LEVEL SECURITY;

-- RLS policies for suppliers (public read)
CREATE POLICY "Suppliers are viewable by everyone" 
ON public.suppliers FOR SELECT USING (is_active = true);

-- RLS policies for product_ranges (public read)
CREATE POLICY "Product ranges are viewable by everyone" 
ON public.product_ranges FOR SELECT USING (true);

-- RLS policies for inspiration_gallery (public read)
CREATE POLICY "Inspiration gallery is viewable by everyone" 
ON public.inspiration_gallery FOR SELECT USING (true);

-- RLS policies for saved_boards (public access for now)
CREATE POLICY "Saved boards are viewable by everyone" 
ON public.saved_boards FOR SELECT USING (is_public = true);

CREATE POLICY "Anyone can create saved boards" 
ON public.saved_boards FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update saved boards" 
ON public.saved_boards FOR UPDATE USING (true);

-- Add trigger for updated_at on saved_boards
CREATE TRIGGER update_saved_boards_updated_at
BEFORE UPDATE ON public.saved_boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_catalog_items_supplier ON public.catalog_items(supplier_id);
CREATE INDEX idx_catalog_items_range ON public.catalog_items(range_id);
CREATE INDEX idx_product_ranges_supplier ON public.product_ranges(supplier_id);
CREATE INDEX idx_inspiration_gallery_featured ON public.inspiration_gallery(featured);