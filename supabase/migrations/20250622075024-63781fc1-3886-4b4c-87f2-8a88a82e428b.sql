
-- Update the claim_daily_login_reward function to include 0.2 TON for day 7
CREATE OR REPLACE FUNCTION public.claim_daily_login_reward(
  p_telegram_id BIGINT,
  p_day INTEGER
) RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  space_reward NUMERIC;
  ticket_reward INTEGER := 1;
  bonus_ton NUMERIC := 0;
  streak_record RECORD;
BEGIN
  -- Calculate space reward based on day (1K, 2K, 3K, 5K, 7K, 10K, 15K)
  CASE p_day
    WHEN 1 THEN space_reward := 1000;
    WHEN 2 THEN space_reward := 2000;
    WHEN 3 THEN space_reward := 3000;
    WHEN 4 THEN space_reward := 5000;
    WHEN 5 THEN space_reward := 7000;
    WHEN 6 THEN space_reward := 10000;
    WHEN 7 THEN 
      space_reward := 15000;
      bonus_ton := 0.2;
    ELSE space_reward := 1000;
  END CASE;
  
  -- Get current streak record
  SELECT * INTO streak_record 
  FROM public.user_daily_login_streak 
  WHERE telegram_id = p_telegram_id;
  
  -- Check if already claimed today
  IF streak_record.claimed_today AND streak_record.last_login_date = CURRENT_DATE THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Already claimed today'
    );
  END IF;
  
  -- Update or insert streak record
  INSERT INTO public.user_daily_login_streak (
    telegram_id, current_day, last_login_date, claimed_today, 
    total_space_earned, total_tickets_earned
  ) 
  VALUES (
    p_telegram_id, 
    CASE WHEN p_day = 7 THEN 1 ELSE p_day + 1 END,
    CURRENT_DATE, 
    true,
    COALESCE(streak_record.total_space_earned, 0) + space_reward,
    COALESCE(streak_record.total_tickets_earned, 0) + ticket_reward
  )
  ON CONFLICT (telegram_id) DO UPDATE SET
    current_day = CASE WHEN p_day = 7 THEN 1 ELSE p_day + 1 END,
    last_login_date = CURRENT_DATE,
    claimed_today = true,
    total_space_earned = user_daily_login_streak.total_space_earned + space_reward,
    total_tickets_earned = user_daily_login_streak.total_tickets_earned + ticket_reward,
    updated_at = now();
  
  -- Update user profile earnings
  UPDATE public.profiles 
  SET earnings = COALESCE(earnings, 0) + space_reward,
      updated_at = now()
  WHERE telegram_id = p_telegram_id;
  
  RETURN json_build_object(
    'success', true,
    'space_reward', space_reward,
    'ticket_reward', ticket_reward,
    'bonus_ton', bonus_ton,
    'message', 'Daily reward claimed successfully'
  );
END;
$$;

-- Add total_ton_earned column to track TON rewards
ALTER TABLE public.user_daily_login_streak 
ADD COLUMN IF NOT EXISTS total_ton_earned NUMERIC DEFAULT 0;

-- Update the get_daily_login_streak function to include TON earnings
CREATE OR REPLACE FUNCTION public.get_daily_login_streak(p_telegram_id BIGINT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  streak_record RECORD;
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  SELECT * INTO streak_record 
  FROM public.user_daily_login_streak 
  WHERE telegram_id = p_telegram_id;
  
  -- If no record exists, create default
  IF NOT FOUND THEN
    INSERT INTO public.user_daily_login_streak (telegram_id)
    VALUES (p_telegram_id)
    RETURNING * INTO streak_record;
  END IF;
  
  -- Check if streak should be reset
  IF streak_record.last_login_date IS NOT NULL AND 
     streak_record.last_login_date < yesterday_date THEN
    
    UPDATE public.user_daily_login_streak 
    SET current_day = 1,
        claimed_today = false,
        streak_broken = true,
        updated_at = now()
    WHERE telegram_id = p_telegram_id
    RETURNING * INTO streak_record;
  END IF;
  
  -- Reset claimed_today if it's a new day
  IF streak_record.last_login_date < today_date THEN
    UPDATE public.user_daily_login_streak 
    SET claimed_today = false,
        updated_at = now()
    WHERE telegram_id = p_telegram_id
    RETURNING * INTO streak_record;
  END IF;
  
  RETURN json_build_object(
    'currentDay', streak_record.current_day,
    'lastLoginDate', streak_record.last_login_date,
    'claimedToday', streak_record.claimed_today,
    'streakBroken', streak_record.streak_broken,
    'totalSpaceEarned', streak_record.total_space_earned,
    'totalTicketsEarned', streak_record.total_tickets_earned,
    'totalTonEarned', COALESCE(streak_record.total_ton_earned, 0)
  );
END;
$$;
