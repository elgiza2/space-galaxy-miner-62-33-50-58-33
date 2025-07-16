
-- Create simple referrals table
CREATE TABLE IF NOT EXISTS public.simple_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_username TEXT NOT NULL,
  referred_username TEXT NOT NULL UNIQUE, -- Each user can only be referred once
  referrer_reward NUMERIC DEFAULT 1000,
  referred_reward NUMERIC DEFAULT 2000,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simple_referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for simple referrals
CREATE POLICY "Users can view referrals" 
  ON public.simple_referrals 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create referrals" 
  ON public.simple_referrals 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simple_referrals_referrer ON public.simple_referrals(referrer_username);
CREATE INDEX IF NOT EXISTS idx_simple_referrals_referred ON public.simple_referrals(referred_username);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_simple_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_simple_referrals_updated_at
    BEFORE UPDATE ON public.simple_referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_simple_referrals_updated_at();
