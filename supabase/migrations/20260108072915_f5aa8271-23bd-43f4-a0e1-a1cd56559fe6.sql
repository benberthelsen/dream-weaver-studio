-- ============================================================================
-- Phase 2: Data Hygiene - Backfill category_id and clean orphan items
-- Phase 3: Create queue table for chunked imports
-- ============================================================================

-- Step 1: Delete orphan catalog items (no supplier_id)
DELETE FROM public.catalog_items WHERE supplier_id IS NULL;

-- Step 2: Backfill category_id based on supplier category and product attributes
-- Map supplier categories to actual category IDs

-- Stone/bench top suppliers -> Stone Benchtops category
UPDATE public.catalog_items ci
SET category_id = '33f04a97-fba7-4a67-9ea7-84da822334ae'  -- Stone Benchtops
FROM public.suppliers s
WHERE ci.supplier_id = s.id
  AND ci.category_id IS NULL
  AND (
    s.category = 'bench_tops' 
    OR s.slug IN ('caesarstone', 'essastone', 'dekton', 'silestone', 'smartstone', 'lithostone', 'quantum-quartz', 'wk-stone', 'ydl-stone', 'ydl', 'lavistone')
    OR ci.product_type IN ('engineered_stone', 'quartz', 'ultra_compact', 'solid_surface')
    OR 'bench_tops' = ANY(ci.usage_types)
  );

-- Hardware suppliers -> Handles category  
UPDATE public.catalog_items ci
SET category_id = 'cd6ca340-a52e-409f-80e9-e969ba285944'  -- Handles
FROM public.suppliers s
WHERE ci.supplier_id = s.id
  AND ci.category_id IS NULL
  AND (
    s.category = 'hardware'
    OR s.slug = 'hafele'
    OR ci.product_type = 'hardware'
  );

-- Doors/Panels suppliers -> Laminates category (boards, laminates, veneers)
UPDATE public.catalog_items ci
SET category_id = 'cf281fc3-3de5-4579-84e0-0913baad7cef'  -- Laminates
FROM public.suppliers s
WHERE ci.supplier_id = s.id
  AND ci.category_id IS NULL
  AND (
    s.category = 'doors_panels'
    OR s.slug IN ('polytec', 'laminex', 'forestone', 'nikpol', 'egger', 'navurban', 'designerone')
    OR ci.product_type IN ('board', 'laminate', 'compact_laminate', 'veneer')
    OR 'doors' = ANY(ci.usage_types)
    OR 'panels' = ANY(ci.usage_types)
  );

-- Remaining items with kicks/splashbacks -> Edge Profiles category
UPDATE public.catalog_items ci
SET category_id = 'a1795291-c26e-4244-9111-b7b3b40c71d9'  -- Edge Profiles
WHERE ci.category_id IS NULL
  AND (
    'kicks' = ANY(ci.usage_types)
    OR 'splashbacks' = ANY(ci.usage_types)
  );

-- Any remaining items without category -> default to Laminates
UPDATE public.catalog_items
SET category_id = 'cf281fc3-3de5-4579-84e0-0913baad7cef'  -- Laminates
WHERE category_id IS NULL;

-- ============================================================================
-- Phase 3: Create scrape_job_urls table for chunked/queued imports
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scrape_job_urls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.scrape_jobs(id) ON DELETE CASCADE,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  products_found integer DEFAULT 0,
  products_inserted integer DEFAULT 0,
  error_message text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for efficient job-based queries
CREATE INDEX IF NOT EXISTS idx_scrape_job_urls_job_id ON public.scrape_job_urls(job_id);
CREATE INDEX IF NOT EXISTS idx_scrape_job_urls_status ON public.scrape_job_urls(job_id, status);

-- Enable RLS
ALTER TABLE public.scrape_job_urls ENABLE ROW LEVEL SECURITY;

-- RLS policies for scrape_job_urls
CREATE POLICY "Anyone can view scrape job urls"
  ON public.scrape_job_urls FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage scrape job urls"
  ON public.scrape_job_urls FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add mode column to scrape_jobs for plan/work distinction
ALTER TABLE public.scrape_jobs ADD COLUMN IF NOT EXISTS mode text DEFAULT 'full';
ALTER TABLE public.scrape_jobs ADD COLUMN IF NOT EXISTS urls_queued integer DEFAULT 0;
ALTER TABLE public.scrape_jobs ADD COLUMN IF NOT EXISTS urls_completed integer DEFAULT 0;