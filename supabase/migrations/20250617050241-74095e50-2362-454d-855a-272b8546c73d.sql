
-- Create table to track user activity and sessions
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Using TEXT to match existing pattern
  username TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'task_completion', 'purchase')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table to track purchases
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT,
  item_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Create table to track current active users
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, session_start)
);

-- Enable RLS on all tables
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (assuming admin role will be implemented)
CREATE POLICY "Allow all access for now" ON public.user_activity FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON public.user_purchases FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON public.user_sessions FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_purchases_created_at ON public.user_purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_user_purchases_amount ON public.user_purchases(amount);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);

-- Create function to get task completion statistics
CREATE OR REPLACE FUNCTION public.get_task_completion_stats()
RETURNS TABLE (
  task_id UUID,
  task_title TEXT,
  completion_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as task_id,
    t.title as task_title,
    COUNT(utc.id) as completion_count
  FROM public.tasks t
  LEFT JOIN public.user_task_completions utc ON t.id = utc.task_id
  GROUP BY t.id, t.title
  ORDER BY completion_count DESC;
END;
$$;

-- Create function to get current active users count
CREATE OR REPLACE FUNCTION public.get_current_active_users()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Consider users active if they had activity in the last 5 minutes
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.user_sessions
    WHERE is_active = true 
    AND last_activity > now() - INTERVAL '5 minutes'
  );
END;
$$;

-- Create function to get users active in the last hour
CREATE OR REPLACE FUNCTION public.get_last_hour_active_users()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.user_activity
    WHERE created_at > now() - INTERVAL '1 hour'
  );
END;
$$;

-- Create function to get top purchasers
CREATE OR REPLACE FUNCTION public.get_top_purchasers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  username TEXT,
  total_spent NUMERIC,
  purchase_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.username,
    SUM(up.amount) as total_spent,
    COUNT(*) as purchase_count
  FROM public.user_purchases up
  WHERE up.status = 'completed'
  GROUP BY up.username
  ORDER BY total_spent DESC
  LIMIT limit_count;
END;
$$;
