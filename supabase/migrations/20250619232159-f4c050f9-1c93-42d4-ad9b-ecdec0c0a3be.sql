
-- First, let's create a more robust referral system with proper reward tracking
-- Update user_referrals table to support better tracking
ALTER TABLE public.user_referrals 
ADD COLUMN IF NOT EXISTS ton_reward NUMERIC DEFAULT 0.005,
ADD COLUMN IF NOT EXISTS spin_reward INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS space_coin_reward NUMERIC DEFAULT 2000;

-- Create a user_rewards table to track all rewards given to users
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT,
  reward_type TEXT NOT NULL, -- 'referral_bonus', 'signup_bonus', 'task_completion', etc.
  reward_category TEXT NOT NULL, -- 'space_coins', 'ton', 'spin_tickets'
  amount NUMERIC NOT NULL,
  source_referral_id UUID REFERENCES public.user_referrals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_type ON public.user_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_created_at ON public.user_rewards(created_at);

-- Create a function to process referral rewards comprehensively
CREATE OR REPLACE FUNCTION public.process_comprehensive_referral_reward(
  referral_id UUID,
  referred_username TEXT,
  referrer_username TEXT
) RETURNS JSON AS $$
DECLARE
  reward_result JSON;
  referral_record public.user_referrals;
BEGIN
  -- Get the referral record
  SELECT * INTO referral_record FROM public.user_referrals WHERE id = referral_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Referral not found');
  END IF;
  
  -- Update referral status to verified
  UPDATE public.user_referrals 
  SET verification_status = 'verified', 
      verified_at = now()
  WHERE id = referral_id;
  
  -- Award SPACE coins to the new user (referred user)
  INSERT INTO public.user_rewards (
    user_id, username, reward_type, reward_category, amount, source_referral_id
  ) VALUES (
    'telegram_' || referred_username, referred_username, 'signup_via_referral', 'space_coins', 2000, referral_id
  );
  
  -- Award rewards to the referrer
  -- 1. SPACE coins reward
  INSERT INTO public.user_rewards (
    user_id, username, reward_type, reward_category, amount, source_referral_id
  ) VALUES (
    'telegram_' || referrer_username, referrer_username, 'referral_bonus', 'space_coins', 1000, referral_id
  );
  
  -- 2. TON reward (tracked for future distribution)
  INSERT INTO public.user_rewards (
    user_id, username, reward_type, reward_category, amount, source_referral_id, claimed
  ) VALUES (
    'telegram_' || referrer_username, referrer_username, 'referral_bonus', 'ton', 0.005, referral_id, false
  );
  
  -- 3. Space coins reward (using spin_tickets category for compatibility)
  INSERT INTO public.user_rewards (
    user_id, username, reward_type, reward_category, amount, source_referral_id
  ) VALUES (
    'telegram_' || referrer_username, referrer_username, 'referral_bonus', 'space_coins_bonus', 1000, referral_id
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Referral rewards processed successfully',
    'referred_user_bonus', 2000,
    'referrer_space_bonus', 1000,
    'referrer_ton_bonus', 0.005,
    'referrer_space_bonus_extra', 1000
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get comprehensive referral stats
CREATE OR REPLACE FUNCTION public.get_comprehensive_referral_stats(username_param TEXT)
RETURNS JSON AS $$
DECLARE
  stats JSON;
  total_space_coins NUMERIC := 0;
  total_ton_rewards NUMERIC := 0;
  total_spin_tickets INTEGER := 0;
  verified_referrals INTEGER := 0;
  pending_referrals INTEGER := 0;
BEGIN
  -- Get verified referrals count
  SELECT COUNT(*) INTO verified_referrals
  FROM public.user_referrals 
  WHERE referrer_username = username_param 
  AND verification_status = 'verified';
  
  -- Get pending referrals count
  SELECT COUNT(*) INTO pending_referrals
  FROM public.user_referrals 
  WHERE referrer_username = username_param 
  AND verification_status = 'pending';
  
  -- Get total SPACE coins from referrals
  SELECT COALESCE(SUM(amount), 0) INTO total_space_coins
  FROM public.user_rewards 
  WHERE username = username_param 
  AND reward_type = 'referral_bonus' 
  AND reward_category = 'space_coins';
  
  -- Get total TON rewards
  SELECT COALESCE(SUM(amount), 0) INTO total_ton_rewards
  FROM public.user_rewards 
  WHERE username = username_param 
  AND reward_type = 'referral_bonus' 
  AND reward_category = 'ton';
  
  -- Get total space coins bonus
  SELECT COALESCE(SUM(amount), 0)::INTEGER INTO total_spin_tickets
  FROM public.user_rewards 
  WHERE username = username_param 
  AND reward_type = 'referral_bonus' 
  AND reward_category = 'space_coins_bonus';
  
  RETURN json_build_object(
    'totalReferrals', verified_referrals,
    'pendingReferrals', pending_referrals,
    'totalEarnings', total_space_coins,
    'totalTonRewards', total_ton_rewards,
    'totalSpinTickets', total_spin_tickets,
    'referralHistory', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'referred_username', referred_username,
          'verification_status', verification_status,
          'created_at', created_at,
          'verified_at', verified_at
        )
      )
      FROM public.user_referrals 
      WHERE referrer_username = username_param
      ORDER BY created_at DESC
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on user_rewards table
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_rewards
CREATE POLICY "Users can view their own rewards" 
  ON public.user_rewards 
  FOR SELECT 
  USING (true); -- Allow viewing for analytics purposes

CREATE POLICY "Service can insert rewards" 
  ON public.user_rewards 
  FOR INSERT 
  WITH CHECK (true); -- Allow service to insert rewards
