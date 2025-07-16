-- Fix RLS policies for new_zone_tasks to allow proper task creation
-- Remove restrictive policies and add simpler ones

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage new zone tasks" ON new_zone_tasks;
DROP POLICY IF EXISTS "Allow task creation for admin panel" ON new_zone_tasks;
DROP POLICY IF EXISTS "Allow task deletion for admin panel" ON new_zone_tasks;
DROP POLICY IF EXISTS "Allow task management for admin panel" ON new_zone_tasks;
DROP POLICY IF EXISTS "Allow task updates for admin panel" ON new_zone_tasks;
DROP POLICY IF EXISTS "Anyone can view active new zone tasks" ON new_zone_tasks;

-- Add new simplified policies
CREATE POLICY "Anyone can create new zone tasks" 
ON new_zone_tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view new zone tasks" 
ON new_zone_tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update new zone tasks" 
ON new_zone_tasks 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete new zone tasks" 
ON new_zone_tasks 
FOR DELETE 
USING (true);