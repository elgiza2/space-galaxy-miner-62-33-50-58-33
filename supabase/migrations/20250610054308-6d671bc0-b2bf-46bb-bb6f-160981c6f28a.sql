
-- Enable Row Level Security on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all tasks
CREATE POLICY "Anyone can view tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (true);

-- Create policy to allow authenticated users to create tasks
CREATE POLICY "Authenticated users can create tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to update tasks
CREATE POLICY "Authenticated users can update tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to delete tasks
CREATE POLICY "Authenticated users can delete tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);
