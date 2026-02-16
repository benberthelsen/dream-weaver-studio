
-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name_first text NOT NULL,
  name_last text NOT NULL,
  email text NOT NULL,
  phone text,
  project_type text NOT NULL,
  message text NOT NULL,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public insert-only (anyone can submit the contact form)
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- No SELECT/UPDATE/DELETE for anonymous users (admin access will be added when auth is implemented)
