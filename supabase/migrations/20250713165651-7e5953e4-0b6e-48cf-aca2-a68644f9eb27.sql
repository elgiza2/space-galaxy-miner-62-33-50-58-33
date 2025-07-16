
-- Fix RLS policies to allow task creation without authentication for admin panel
DROP POLICY IF EXISTS "Authenticated users can create new zone tasks" ON new_zone_tasks;
DROP POLICY IF EXISTS "Authenticated users can manage new zone tasks" ON new_zone_tasks;

-- Allow anyone to create new zone tasks (for admin panel functionality)
CREATE POLICY "Allow task creation for admin panel" ON new_zone_tasks
    FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to manage new zone tasks (for admin panel functionality)  
CREATE POLICY "Allow task management for admin panel" ON new_zone_tasks
    FOR ALL 
    USING (true);

-- Update and delete policies for full management
CREATE POLICY "Allow task updates for admin panel" ON new_zone_tasks
    FOR UPDATE 
    USING (true);

CREATE POLICY "Allow task deletion for admin panel" ON new_zone_tasks
    FOR DELETE 
    USING (true);
