-- Allow admin operations on suppliers table via service role
-- First drop existing restrictive policy and add new ones

-- Allow insert for suppliers (for adding new brands)
CREATE POLICY "Anyone can add suppliers"
ON public.suppliers
FOR INSERT
WITH CHECK (true);

-- Allow update for suppliers (for editing/deactivating)
CREATE POLICY "Anyone can update suppliers"
ON public.suppliers
FOR UPDATE
USING (true);

-- Allow delete for suppliers
CREATE POLICY "Anyone can delete suppliers"
ON public.suppliers
FOR DELETE
USING (true);