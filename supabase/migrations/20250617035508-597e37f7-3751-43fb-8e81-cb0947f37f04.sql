
-- Create a more comprehensive referral tracking system
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_username TEXT NOT NULL, -- The person who made the referral
  referred_username TEXT NOT NULL, -- The person who was referred
  referrer_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  reward_amount NUMERIC DEFAULT 1000,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_username) -- Each user can only be referred once
);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own referrals" 
  ON public.user_referrals 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create referrals" 
  ON public.user_referrals 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update referral status" 
  ON public.user_referrals 
  FOR UPDATE 
  USING (true);

-- Create function to process referral verification
CREATE OR REPLACE FUNCTION public.verify_referral(referral_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  referral_record public.user_referrals;
  result json;
BEGIN
  -- Get the referral record
  SELECT * INTO referral_record FROM public.user_referrals WHERE id = referral_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Referral not found');
  END IF;
  
  -- Update verification status
  UPDATE public.user_referrals 
  SET verification_status = 'verified', 
      verified_at = now()
  WHERE id = referral_id;
  
  -- Add reward to referrer's earnings
  UPDATE public.profiles 
  SET earnings = COALESCE(earnings, 0) + referral_record.reward_amount,
      updated_at = now()
  WHERE id = referral_record.referrer_profile_id;
  
  RETURN json_build_object('success', true, 'message', 'Referral verified successfully');
END;
$$;

-- Create function to claim referral reward
CREATE OR REPLACE FUNCTION public.claim_referral_reward(referral_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  referral_record public.user_referrals;
BEGIN
  -- Get the referral record
  SELECT * INTO referral_record FROM public.user_referrals 
  WHERE id = referral_id AND verification_status = 'verified' AND reward_claimed = false;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Referral not found or already claimed');
  END IF;
  
  -- Mark reward as claimed
  UPDATE public.user_referrals 
  SET reward_claimed = true, 
      claimed_at = now()
  WHERE id = referral_id;
  
  RETURN json_build_object('success', true, 'message', 'Reward claimed successfully');
END;
$$;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON public.user_referrals(referrer_username);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON public.user_referrals(referred_username);
CREATE INDEX IF NOT EXISTS idx_user_referrals_status ON public.user_referrals(verification_status);
