
-- Create table for tracking TON rewards
CREATE TABLE IF NOT EXISTS public.user_ton_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  reward_type TEXT NOT NULL DEFAULT 'referral_bonus',
  source_referral_id UUID REFERENCES public.simple_referrals(id) ON DELETE SET NULL,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_ton_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for TON rewards
CREATE POLICY "Users can view their own TON rewards" 
  ON public.user_ton_rewards 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can insert TON rewards" 
  ON public.user_ton_rewards 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_ton_rewards_username ON public.user_ton_rewards(username);
CREATE INDEX IF NOT EXISTS idx_user_ton_rewards_user_id ON public.user_ton_rewards(user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_ton_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ton_rewards_updated_at
    BEFORE UPDATE ON public.user_ton_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_ton_rewards_updated_at();
