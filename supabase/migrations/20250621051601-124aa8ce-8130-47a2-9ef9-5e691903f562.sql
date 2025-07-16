
-- Create a view for real user leaderboard based on actual earnings
CREATE OR REPLACE VIEW public.real_user_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.referral_name,
  p.earnings as coins,
  p.created_at,
  ROW_NUMBER() OVER (ORDER BY p.earnings DESC, p.created_at ASC) as rank,
  cm.clan_id,
  c.name as clan_name
FROM public.profiles p
LEFT JOIN public.clan_members cm ON p.id = cm.user_id
LEFT JOIN public.clans c ON cm.clan_id = c.id
WHERE p.earnings > 0
ORDER BY p.earnings DESC, p.created_at ASC;

-- Update clan leaderboard to use real data from clan members
CREATE OR REPLACE VIEW public.real_clan_leaderboard AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.image,
  c.telegram_link,
  c.leader_id,
  p.username as leader_name,
  c.member_count,
  COALESCE(c.total_coins, 0) as total_coins,
  c.created_at,
  ROW_NUMBER() OVER (ORDER BY COALESCE(c.total_coins, 0) DESC, c.created_at ASC) as rank
FROM public.clans c
LEFT JOIN public.profiles p ON c.leader_id = p.id
WHERE c.member_count > 0
ORDER BY COALESCE(c.total_coins, 0) DESC, c.created_at ASC;

-- Function to update clan total coins when user earnings change
CREATE OR REPLACE FUNCTION update_clan_coins_from_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update clan total coins based on member earnings
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
  )
  WHERE id IN (
    SELECT cm.clan_id 
    FROM public.clan_members cm 
    WHERE cm.user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update clan coins when user earnings change
DROP TRIGGER IF EXISTS trigger_update_clan_coins ON public.profiles;
CREATE TRIGGER trigger_update_clan_coins
  AFTER UPDATE OF earnings ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_clan_coins_from_earnings();
