
-- Update the tasks RLS policies to allow better task creation
-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;

-- Create new policies that work better for the task system
CREATE POLICY "Anyone can view tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (true);

-- Allow creating tasks without authentication for admin functions
CREATE POLICY "Allow task creation" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (true);

-- Allow updating tasks without authentication for admin functions  
CREATE POLICY "Allow task updates" 
  ON public.tasks 
  FOR UPDATE 
  USING (true);

-- Allow deleting tasks without authentication for admin functions
CREATE POLICY "Allow task deletion" 
  ON public.tasks 
  FOR DELETE 
  USING (true);
