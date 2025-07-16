
-- Fix the GROUP BY error in get_comprehensive_referral_stats function
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
  
  -- Get total spin tickets
  SELECT COALESCE(SUM(amount), 0)::INTEGER INTO total_spin_tickets
  FROM public.user_rewards 
  WHERE username = username_param 
  AND reward_type = 'referral_bonus' 
  AND reward_category = 'spin_tickets';
  
  RETURN json_build_object(
    'totalReferrals', verified_referrals,
    'pendingReferrals', pending_referrals,
    'totalEarnings', total_space_coins,
    'totalTonRewards', total_ton_rewards,
    'totalSpinTickets', total_spin_tickets,
    'referralHistory', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', id,
          'referred_username', referred_username,
          'verification_status', verification_status,
          'created_at', created_at,
          'verified_at', verified_at
        ) ORDER BY created_at DESC
      ), '[]'::json)
      FROM public.user_referrals 
      WHERE referrer_username = username_param
    )
  );
END;
$$ LANGUAGE plpgsql;
