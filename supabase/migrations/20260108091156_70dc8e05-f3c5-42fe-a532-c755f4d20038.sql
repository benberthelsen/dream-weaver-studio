-- Mark all legacy stuck jobs as failed so they don't get auto-resumed
UPDATE public.scrape_jobs 
SET 
  status = 'failed',
  error_message = 'Legacy job - not compatible with new chunked pipeline',
  completed_at = now()
WHERE 
  status IN ('pending', 'mapping', 'scraping')
  AND (urls_queued IS NULL OR urls_queued = 0)
  AND (mode IS NULL OR mode = 'full');