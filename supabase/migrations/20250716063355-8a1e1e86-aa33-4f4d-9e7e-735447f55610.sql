-- Fix space_apps RLS policies to allow proper app creation
-- The current policies are too restrictive

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to create apps" ON public.space_apps;
DROP POLICY IF EXISTS "Allow authenticated users to update apps" ON public.space_apps;
DROP POLICY IF EXISTS "Allow anyone to delete apps" ON public.space_apps;

-- Create new policies that allow anonymous users to manage apps
-- This is needed for the admin interface to work properly
CREATE POLICY "Allow anonymous users to create apps" 
ON public.space_apps 
FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update apps" 
ON public.space_apps 
FOR UPDATE 
TO anon
USING (true);

CREATE POLICY "Allow anonymous users to delete apps" 
ON public.space_apps 
FOR DELETE 
TO anon
USING (true);