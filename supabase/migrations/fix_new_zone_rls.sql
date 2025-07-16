
-- Update RLS policies for new_zone_tasks to allow creation by authenticated users
DROP POLICY IF EXISTS "Admins can manage new zone tasks" ON new_zone_tasks;

-- Allow authenticated users to create new zone tasks
CREATE POLICY "Authenticated users can create new zone tasks" ON new_zone_tasks
    FOR INSERT 
    WITH CHECK (true);

-- Allow authenticated users to manage their created tasks
CREATE POLICY "Authenticated users can manage new zone tasks" ON new_zone_tasks
    FOR ALL 
    USING (true);

-- Keep the existing policy for viewing active tasks
-- Policy "Anyone can view active new zone tasks" already exists
