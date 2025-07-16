
-- Create a service to handle referral tracking
CREATE TABLE public.referral_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_telegram_id BIGINT NOT NULL,
  referred_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for referral_tracking table
CREATE POLICY "Anyone can view referral tracking" 
  ON public.referral_tracking 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create referral tracking" 
  ON public.referral_tracking 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update referral tracking" 
  ON public.referral_tracking 
  FOR UPDATE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_referral_tracking_referrer ON public.referral_tracking(referrer_profile_id);
CREATE INDEX idx_referral_tracking_referred_telegram ON public.referral_tracking(referred_telegram_id);
CREATE INDEX idx_referral_tracking_referred_profile ON public.referral_tracking(referred_profile_id);

-- Function to give referral rewards
CREATE OR REPLACE FUNCTION public.process_referral_reward(
  referrer_id UUID,
  reward_amount NUMERIC DEFAULT 100
) RETURNS VOID AS $$
BEGIN
  -- Add reward to referrer's earnings
  UPDATE public.profiles 
  SET earnings = COALESCE(earnings, 0) + reward_amount,
      updated_at = now()
  WHERE id = referrer_id;
END;
$$ LANGUAGE plpgsql;
