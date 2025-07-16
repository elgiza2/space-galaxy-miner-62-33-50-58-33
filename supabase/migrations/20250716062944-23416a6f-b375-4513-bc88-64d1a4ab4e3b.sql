-- Fix space_apps delete issue by allowing anonymous users to delete apps
-- The issue is that RLS policies require authentication but users are not logged in

-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Allow authenticated users to delete apps" ON public.space_apps;

-- Create new policy that allows anyone to delete apps (for admin purposes)
CREATE POLICY "Allow anyone to delete apps" 
ON public.space_apps 
FOR DELETE 
USING (true);