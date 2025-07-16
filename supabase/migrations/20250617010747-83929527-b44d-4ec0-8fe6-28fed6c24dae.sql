
-- Update tasks table to match the expected schema for task management
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS reward_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS external_link TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_completions INTEGER;

-- Update existing data to use new columns
UPDATE public.tasks 
SET reward_amount = reward,
    external_link = link,
    status = CASE 
      WHEN completed = true THEN 'completed'
      ELSE 'pending'
    END;

-- Create table for user task completions with proper columns
ALTER TABLE public.user_task_completions 
ADD COLUMN IF NOT EXISTS reward_claimed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;
