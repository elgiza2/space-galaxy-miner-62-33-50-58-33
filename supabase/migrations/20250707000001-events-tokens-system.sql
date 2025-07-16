-- إنشاء نظام الأحداث والتوكنات المتقدم

-- جدول الأحداث الرئيسية
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    icon_url TEXT,
    emoji VARCHAR(10),
    event_type VARCHAR(50) NOT NULL DEFAULT 'normal',
    is_active BOOLEAN DEFAULT true,
    is_special BOOLEAN DEFAULT false,
    is_ladder_system BOOLEAN DEFAULT false,
    requires_ton_payment BOOLEAN DEFAULT false,
    ton_price DECIMAL(10,4) DEFAULT 0,
    min_tokens_required INTEGER DEFAULT 1,
    max_tokens_required INTEGER DEFAULT 100,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    refresh_interval_hours INTEGER DEFAULT 48,
    last_refresh TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التوكنات
CREATE TABLE IF NOT EXISTS public.tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    description_ar TEXT,
    icon_url TEXT,
    emoji VARCHAR(10),
    color VARCHAR(7) DEFAULT '#1e3a8a',
    rarity VARCHAR(20) DEFAULT 'common',
    is_active BOOLEAN DEFAULT true,
    total_supply BIGINT DEFAULT 0,
    circulating_supply BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول توكنات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    token_id UUID NOT NULL REFERENCES public.tokens(id) ON DELETE CASCADE,
    balance BIGINT DEFAULT 0,
    earned_from_events BIGINT DEFAULT 0,
    spent_on_events BIGINT DEFAULT 0,
    last_earned TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token_id)
);

-- جدول جوائز الأحداث
CREATE TABLE IF NOT EXISTS public.event_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,
    reward_value BIGINT NOT NULL,
    reward_currency VARCHAR(20) DEFAULT 'coins',
    token_cost INTEGER DEFAULT 1,
    probability DECIMAL(5,4) DEFAULT 0.1000,
    is_jackpot BOOLEAN DEFAULT false,
    ladder_level INTEGER DEFAULT 1,
    ton_price DECIMAL(10,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول العناصر الخاصة (كل 48 ساعة)
CREATE TABLE IF NOT EXISTS public.special_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    icon_url TEXT,
    emoji VARCHAR(10),
    token_id UUID NOT NULL REFERENCES public.tokens(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    refresh_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول جوائز العناصر الخاصة
CREATE TABLE IF NOT EXISTS public.special_item_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    special_item_id UUID NOT NULL REFERENCES public.special_items(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,
    reward_value BIGINT NOT NULL,
    reward_currency VARCHAR(20) DEFAULT 'coins',
    probability DECIMAL(5,4) DEFAULT 0.2000,
    is_guaranteed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول تاريخ المشاركة في الأحداث
CREATE TABLE IF NOT EXISTS public.user_event_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    tokens_spent INTEGER DEFAULT 0,
    rewards_earned JSONB DEFAULT '{}',
    ton_spent DECIMAL(10,4) DEFAULT 0,
    ladder_level_reached INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX(user_id, event_id)
);

-- دالة تحديث العناصر الخاصة كل 48 ساعة
CREATE OR REPLACE FUNCTION refresh_special_items()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- تحديث العناصر المنتهية الصلاحية
    UPDATE public.special_items 
    SET is_active = false 
    WHERE refresh_date <= NOW() AND is_active = true;
    
    -- إنشاء عنصر خاص جديد إذا لم يكن هناك عنصر نشط
    IF NOT EXISTS (SELECT 1 FROM public.special_items WHERE is_active = true) THEN
        INSERT INTO public.special_items (name, name_ar, emoji, token_id)
        SELECT 
            'Mystery Box',
            'صندوق الغموض',
            '🎁',
            id
        FROM public.tokens 
        WHERE is_active = true 
        ORDER BY RANDOM() 
        LIMIT 1;
    END IF;
END;
$$;

-- دالة إضافة توكن للمستخدم
CREATE OR REPLACE FUNCTION add_user_tokens(
    p_user_id UUID,
    p_token_symbol VARCHAR(10),
    p_amount BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_token_id UUID;
BEGIN
    -- الحصول على معرف التوكن
    SELECT id INTO v_token_id 
    FROM public.tokens 
    WHERE symbol = p_token_symbol AND is_active = true;
    
    IF v_token_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- إضافة أو تحديث رصيد المستخدم
    INSERT INTO public.user_tokens (user_id, token_id, balance, last_earned)
    VALUES (p_user_id, v_token_id, p_amount, NOW())
    ON CONFLICT (user_id, token_id)
    DO UPDATE SET 
        balance = user_tokens.balance + p_amount,
        earned_from_events = user_tokens.earned_from_events + p_amount,
        last_earned = NOW(),
        updated_at = NOW();
    
    RETURN true;
END;
$$;

-- بيانات أولية للتوكنات
INSERT INTO public.tokens (name, name_ar, symbol, emoji, color, rarity) VALUES
('Event Token', 'توكن الحدث', 'EVENT', '🎟️', '#1e3a8a', 'common'),
('Mystery Token', 'توكن الغموض', 'MYSTERY', '🔮', '#dc2626', 'rare'),
('Ladder Token', 'توكن السلم', 'LADDER', '🪜', '#1e3a8a', 'epic'),
('Premium Token', 'توكن مميز', 'PREMIUM', '💎', '#dc2626', 'legendary');

-- بيانات أولية للأحداث
INSERT INTO public.events (name, name_ar, emoji, event_type, is_ladder_system, min_tokens_required) VALUES
('Daily Spin', 'الدوران اليومي', '🎰', 'daily', false, 1),
('Ladder Challenge', 'تحدي السلم', '🪜', 'ladder', true, 5),
('Mystery Box', 'صندوق الغموض', '🎁', 'mystery', false, 3),
('Premium Spin', 'الدوران المميز', '💎', 'premium', false, 10);

-- إنشاء العنصر الخاص الأول
INSERT INTO public.special_items (name, name_ar, emoji, token_id)
SELECT 'Golden Mystery Box', 'صندوق الغموض الذهبي', '🏆', id
FROM public.tokens WHERE symbol = 'MYSTERY' LIMIT 1;

-- تفعيل RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_item_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_event_history ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can view tokens" ON public.tokens FOR SELECT USING (true);
CREATE POLICY "Users can view their tokens" ON public.user_tokens FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Anyone can view event rewards" ON public.event_rewards FOR SELECT USING (true);
CREATE POLICY "Anyone can view special items" ON public.special_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view special item rewards" ON public.special_item_rewards FOR SELECT USING (true);
CREATE POLICY "Users can view their event history" ON public.user_event_history FOR SELECT USING (auth.uid()::text = user_id::text);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_history_user_id ON public.user_event_history(user_id);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_tokens_active ON public.tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_special_items_active ON public.special_items(is_active);