
-- إنشاء جدول المستخدمين
CREATE TABLE public.space_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT UNIQUE NOT NULL,
  username TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_code TEXT,
  ip_address TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الإحالات  
CREATE TABLE public.space_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_code TEXT NOT NULL,
  referred_id UUID NOT NULL REFERENCES public.space_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول جلسات التعدين
CREATE TABLE public.space_mining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.space_users(id),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  earned NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX idx_space_users_telegram_id ON public.space_users(telegram_id);
CREATE INDEX idx_space_users_referral_code ON public.space_users(referral_code);
CREATE INDEX idx_space_mining_sessions_user_id ON public.space_mining_sessions(user_id);
CREATE INDEX idx_space_mining_sessions_active ON public.space_mining_sessions(user_id, is_active) WHERE is_active = true;

-- دالة لتوليد كود إحالة فريد
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  counter INTEGER := 1;
BEGIN
  LOOP
    -- توليد رقم عشوائي بين 100000 و 999999
    new_code := 'SPACE#' || FLOOR(RANDOM() * 900000 + 100000)::TEXT;
    
    -- التحقق من وجود الكود
    SELECT EXISTS(SELECT 1 FROM public.space_users WHERE referral_code = new_code) INTO code_exists;
    
    -- إذا لم يكن موجود، اخرج من الحلقة
    IF NOT code_exists THEN
      EXIT;
    END IF;
    
    -- حماية من الحلقة اللانهائية
    counter := counter + 1;
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Unable to generate unique referral code after 1000 attempts';
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- دالة لمعالجة الإحالة الجديدة
CREATE OR REPLACE FUNCTION process_referral(referrer_code_param TEXT, new_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  referrer_exists BOOLEAN;
  referral_reward NUMERIC := 1000; -- مكافأة الإحالة
BEGIN
  -- التحقق من وجود كود الإحالة
  SELECT EXISTS(
    SELECT 1 FROM public.space_users 
    WHERE referral_code = referrer_code_param
  ) INTO referrer_exists;
  
  IF referrer_exists THEN
    -- إضافة سجل الإحالة
    INSERT INTO public.space_referrals (referrer_code, referred_id)
    VALUES (referrer_code_param, new_user_id);
    
    -- إضافة مكافأة لصاحب الإحالة
    UPDATE public.space_users 
    SET balance = balance + referral_reward
    WHERE referral_code = referrer_code_param;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- دالة لحساب أرباح التعدين
CREATE OR REPLACE FUNCTION calculate_mining_earnings(session_duration_minutes INTEGER)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  base_rate NUMERIC := 0.1; -- معدل التعدين الأساسي لكل دقيقة
  earnings NUMERIC;
BEGIN
  -- حساب الأرباح بناءً على مدة الجلسة
  earnings := session_duration_minutes * base_rate;
  
  -- حد أقصى للأرباح في الجلسة الواحدة (مثلاً 100 عملة)
  IF earnings > 100 THEN
    earnings := 100;
  END IF;
  
  RETURN earnings;
END;
$$;

-- دالة للتحقق من حد الـ IP (اختيارية للأمان)
CREATE OR REPLACE FUNCTION check_ip_registration_limit(ip_addr TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  ip_count INTEGER;
  max_registrations INTEGER := 5; -- حد أقصى 5 حسابات لكل IP
BEGIN
  SELECT COUNT(*) INTO ip_count
  FROM public.space_users
  WHERE ip_address = ip_addr;
  
  RETURN ip_count < max_registrations;
END;
$$;
