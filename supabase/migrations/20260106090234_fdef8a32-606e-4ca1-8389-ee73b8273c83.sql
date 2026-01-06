-- Create scrape_jobs table for tracking scrape progress
CREATE TABLE public.scrape_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  urls_mapped INTEGER DEFAULT 0,
  urls_to_scrape INTEGER DEFAULT 0,
  pages_scraped INTEGER DEFAULT 0,
  pages_failed INTEGER DEFAULT 0,
  products_found INTEGER DEFAULT 0,
  products_inserted INTEGER DEFAULT 0,
  current_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access for realtime updates
CREATE POLICY "Anyone can view scrape jobs" 
ON public.scrape_jobs 
FOR SELECT 
USING (true);

-- Allow service role to insert/update (edge functions)
CREATE POLICY "Service role can manage scrape jobs"
ON public.scrape_jobs
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable realtime for scrape_jobs
ALTER TABLE public.scrape_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scrape_jobs;