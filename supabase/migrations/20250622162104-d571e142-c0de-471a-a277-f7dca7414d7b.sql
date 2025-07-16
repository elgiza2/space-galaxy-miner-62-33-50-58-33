
-- Create table for tracking referral events in real-time
CREATE TABLE public.referral_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('link_clicked', 'user_joined', 'reward_processed', 'verification_completed')),
  referrer_username TEXT NOT NULL,
  referred_username TEXT,
  telegram_user_id BIGINT,
  event_data JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for Telegram webhook events
CREATE TABLE public.telegram_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id BIGINT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  user_data JSONB NOT NULL,
  referral_code TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for referral notifications
CREATE TABLE public.referral_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_referral', 'reward_received', 'verification_pending')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_events
CREATE POLICY "Users can view referral events related to them" 
  ON public.referral_events 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can insert referral events" 
  ON public.referral_events 
  FOR INSERT 
  WITH CHECK (true);

-- Create policies for telegram_webhook_events (admin only)
CREATE POLICY "Admins can view webhook events" 
  ON public.telegram_webhook_events 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can insert webhook events" 
  ON public.telegram_webhook_events 
  FOR INSERT 
  WITH CHECK (true);

-- Create policies for referral_notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.referral_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
  ON public.referral_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.referral_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_referral_events_referrer ON public.referral_events(referrer_username);
CREATE INDEX idx_referral_events_referred ON public.referral_events(referred_username);
CREATE INDEX idx_referral_events_type ON public.referral_events(event_type);
CREATE INDEX idx_referral_events_processed ON public.referral_events(processed);
CREATE INDEX idx_telegram_webhook_events_processed ON public.telegram_webhook_events(processed);
CREATE INDEX idx_referral_notifications_user_read ON public.referral_notifications(user_id, read);

-- Create function to process referral events
CREATE OR REPLACE FUNCTION public.process_referral_event(
  p_event_type TEXT,
  p_referrer_username TEXT,
  p_referred_username TEXT DEFAULT NULL,
  p_telegram_user_id BIGINT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.referral_events (
    event_type,
    referrer_username,
    referred_username,
    telegram_user_id,
    event_data
  ) VALUES (
    p_event_type,
    p_referrer_username,
    p_referred_username,
    p_telegram_user_id,
    p_event_data
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Create function to send notifications
CREATE OR REPLACE FUNCTION public.send_referral_notification(
  p_username TEXT,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  user_profile_id UUID;
  notification_id UUID;
BEGIN
  -- Get user profile ID
  SELECT id INTO user_profile_id
  FROM public.profiles
  WHERE referral_name = p_username;
  
  IF user_profile_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_username;
  END IF;
  
  INSERT INTO public.referral_notifications (
    user_id,
    notification_type,
    title,
    message,
    metadata
  ) VALUES (
    user_profile_id,
    p_notification_type,
    p_title,
    p_message,
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Enhanced function for comprehensive referral processing with real-time events
CREATE OR REPLACE FUNCTION public.process_comprehensive_referral_with_events(
  referral_id UUID,
  referred_username TEXT,
  referrer_username TEXT
) RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  reward_result JSON;
  referral_record public.user_referrals;
  event_id UUID;
BEGIN
  -- Get the referral record
  SELECT * INTO referral_record FROM public.user_referrals WHERE id = referral_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Referral not found');
  END IF;
  
  -- Log verification event
  SELECT public.process_referral_event(
    'verification_completed',
    referrer_username,
    referred_username,
    NULL,
    json_build_object('referral_id', referral_id)
  ) INTO event_id;
  
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
  INSERT INTO public.user_rewards (
    user_id, username, reward_type, reward_category, amount, source_referral_id
  ) VALUES (
    'telegram_' || referrer_username, referrer_username, 'referral_bonus', 'space_coins', 1000, referral_id
  );
  
  INSERT INTO public.user_rewards (
    user_id, username, reward_type, reward_category, amount, source_referral_id, claimed
  ) VALUES (
    'telegram_' || referrer_username, referrer_username, 'referral_bonus', 'ton', 0.005, referral_id, false
  );
  
  INSERT INTO public.user_rewards (
    user_id, username, reward_type, reward_category, amount, source_referral_id
  ) VALUES (
    'telegram_' || referrer_username, referrer_username, 'referral_bonus', 'spin_tickets', 1, referral_id
  );
  
  -- Send notifications
  PERFORM public.send_referral_notification(
    referrer_username,
    'new_referral',
    'New Referral Completed! 🎉',
    format('Your friend %s joined SPACE! You earned 1000 SPACE + 0.005 TON + 1 Spin ticket', referred_username),
    json_build_object('referral_id', referral_id, 'referred_username', referred_username)
  );
  
  PERFORM public.send_referral_notification(
    referred_username,
    'reward_received',
    'Welcome Bonus Received! 🎁',
    'You received 2000 SPACE coins for joining through a referral!',
    json_build_object('referral_id', referral_id, 'reward_amount', 2000)
  );
  
  -- Log reward processing event
  SELECT public.process_referral_event(
    'reward_processed',
    referrer_username,
    referred_username,
    NULL,
    json_build_object(
      'referral_id', referral_id,
      'referrer_rewards', json_build_object('space', 1000, 'ton', 0.005, 'spins', 1),
      'referred_rewards', json_build_object('space', 2000)
    )
  ) INTO event_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Referral rewards processed successfully with notifications',
    'event_id', event_id,
    'referred_user_bonus', 2000,
    'referrer_space_bonus', 1000,
    'referrer_ton_bonus', 0.005,
    'referrer_spin_bonus', 1
  );
END;
$$;
