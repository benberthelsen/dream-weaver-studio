-- Allow authenticated admin tooling to fully manage contact submissions.
-- Anonymous/public users remain insert-only via existing policy.
CREATE POLICY "Authenticated users can manage contact submissions"
ON public.contact_submissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
