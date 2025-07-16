
-- First drop the existing view
DROP VIEW IF EXISTS public.real_user_leaderboard;

-- Add photo_url column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Recreate the view with the correct structure including photo_url
CREATE VIEW public.real_user_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.referral_name,
  p.first_name,
  p.last_name,
  p.photo_url,
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
