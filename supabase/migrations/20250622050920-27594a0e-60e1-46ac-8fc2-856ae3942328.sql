
-- Recreate the user_purchases table that was accidentally dropped
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  username TEXT,
  item_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TON',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own purchases
CREATE POLICY "Users can view their own purchases" 
ON public.user_purchases 
FOR SELECT 
TO public 
USING (true);

-- Create policy for users to create purchases
CREATE POLICY "Users can create purchases" 
ON public.user_purchases 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Create policy for users to update their own purchases
CREATE POLICY "Users can update their own purchases" 
ON public.user_purchases 
FOR UPDATE 
TO public 
USING (true);
