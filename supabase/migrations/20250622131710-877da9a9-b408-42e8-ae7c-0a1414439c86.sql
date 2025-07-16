
-- Fix database issues completely

-- 1. First, let's ensure the real_clan_leaderboard view exists and works properly
DROP VIEW IF EXISTS public.real_clan_leaderboard;
CREATE VIEW public.real_clan_leaderboard AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.image,
    c.telegram_link,
    c.leader_id,
    c.member_count,
    c.total_coins,
    c.created_at,
    p.referral_name as leader_name,
    ROW_NUMBER() OVER (ORDER BY c.total_coins DESC, c.member_count DESC) as rank
FROM public.clans c
LEFT JOIN public.profiles p ON c.leader_id = p.id
ORDER BY c.total_coins DESC, c.member_count DESC;

-- 2. Fix the real_user_leaderboard view
DROP VIEW IF EXISTS public.real_user_leaderboard;
CREATE VIEW public.real_user_leaderboard AS
SELECT 
    p.id,
    p.referral_name,
    p.username,
    p.first_name,
    p.last_name,
    p.photo_url,
    p.earnings as coins,
    p.created_at,
    cm.clan_id,
    c.name as clan_name,
    ROW_NUMBER() OVER (ORDER BY p.earnings DESC) as rank
FROM public.profiles p
LEFT JOIN public.clan_members cm ON p.id = cm.user_id
LEFT JOIN public.clans c ON cm.clan_id = c.id
WHERE p.earnings > 0
ORDER BY p.earnings DESC;

-- 3. Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_earnings ON public.profiles(earnings DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_clans_total_coins ON public.clans(total_coins DESC);
CREATE INDEX IF NOT EXISTS idx_clan_members_user_id ON public.clan_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON public.clan_members(clan_id);

-- 4. Fix the clan member count trigger
DROP TRIGGER IF EXISTS update_clan_member_count_trigger ON public.clan_members;
CREATE OR REPLACE FUNCTION public.update_clan_member_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clans 
        SET member_count = (
            SELECT COUNT(*) FROM public.clan_members WHERE clan_id = NEW.clan_id
        ),
        updated_at = now()
        WHERE id = NEW.clan_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clans 
        SET member_count = (
            SELECT COUNT(*) FROM public.clan_members WHERE clan_id = OLD.clan_id
        ),
        updated_at = now()
        WHERE id = OLD.clan_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clan_member_count_trigger
    AFTER INSERT OR DELETE ON public.clan_members
    FOR EACH ROW EXECUTE FUNCTION public.update_clan_member_count_trigger();

-- 5. Fix the clan total coins trigger
DROP TRIGGER IF EXISTS update_clan_total_coins_trigger ON public.profiles;
CREATE OR REPLACE FUNCTION public.update_clan_total_coins_from_profiles()
RETURNS TRIGGER AS $$
BEGIN
    -- Update clan total coins when a member's earnings change
    UPDATE public.clans 
    SET total_coins = (
        SELECT COALESCE(SUM(p.earnings), 0)
        FROM public.profiles p
        JOIN public.clan_members cm ON p.id = cm.user_id
        WHERE cm.clan_id IN (
            SELECT cm2.clan_id 
            FROM public.clan_members cm2 
            WHERE cm2.user_id = NEW.id
        )
    ),
    updated_at = now()
    WHERE id IN (
        SELECT cm.clan_id 
        FROM public.clan_members cm 
        WHERE cm.user_id = NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clan_total_coins_trigger
    AFTER UPDATE OF earnings ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_clan_total_coins_from_profiles();

-- 6. Ensure leaderboard_stats table has proper data
INSERT INTO public.leaderboard_stats (total_players, last_updated)
VALUES (540000, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- 7. Fix any missing foreign key constraints
ALTER TABLE public.clan_members 
    DROP CONSTRAINT IF EXISTS clan_members_clan_id_fkey,
    ADD CONSTRAINT clan_members_clan_id_fkey 
    FOREIGN KEY (clan_id) REFERENCES public.clans(id) ON DELETE CASCADE;

ALTER TABLE public.clan_members 
    DROP CONSTRAINT IF EXISTS clan_members_user_id_fkey,
    ADD CONSTRAINT clan_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 8. Update existing clans to have correct member counts and total coins
UPDATE public.clans 
SET member_count = (
    SELECT COUNT(*) 
    FROM public.clan_members 
    WHERE clan_id = clans.id
),
total_coins = (
    SELECT COALESCE(SUM(p.earnings), 0)
    FROM public.profiles p
    JOIN public.clan_members cm ON p.id = cm.user_id
    WHERE cm.clan_id = clans.id
),
updated_at = now();

-- 9. Ensure profiles table has proper constraints
ALTER TABLE public.profiles 
    ALTER COLUMN telegram_id SET NOT NULL,
    ALTER COLUMN referral_name SET NOT NULL;

-- Add unique constraint on telegram_id if it doesn't exist
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_telegram_id_key,
    ADD CONSTRAINT profiles_telegram_id_key UNIQUE (telegram_id);

-- Add unique constraint on referral_name if it doesn't exist  
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_referral_name_key,
    ADD CONSTRAINT profiles_referral_name_key UNIQUE (referral_name);
