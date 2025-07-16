-- Fix RLS policies for space_apps table to allow proper insertion and management

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.space_apps;
DROP POLICY IF EXISTS "Allow public read access to active apps" ON public.space_apps;
DROP POLICY IF EXISTS "Allow authenticated users to view all apps" ON public.space_apps;
DROP POLICY IF EXISTS "Allow authenticated users to create apps" ON public.space_apps;
DROP POLICY IF EXISTS "Allow authenticated users to update apps" ON public.space_apps;
DROP POLICY IF EXISTS "Allow authenticated users to delete apps" ON public.space_apps;

-- Create new policies that properly allow app management
-- Allow anyone to read active apps (for public display)
CREATE POLICY "Allow public read access to active apps" 
ON public.space_apps 
FOR SELECT 
USING (is_active = true);

-- Allow authenticated users to view all apps (for admin panels)
CREATE POLICY "Allow authenticated users to view all apps" 
ON public.space_apps 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to create apps
CREATE POLICY "Allow authenticated users to create apps" 
ON public.space_apps 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update apps
CREATE POLICY "Allow authenticated users to update apps" 
ON public.space_apps 
FOR UPDATE 
TO authenticated
USING (true);

-- Allow authenticated users to delete apps
CREATE POLICY "Allow authenticated users to delete apps" 
ON public.space_apps 
FOR DELETE 
TO authenticated
USING (true);