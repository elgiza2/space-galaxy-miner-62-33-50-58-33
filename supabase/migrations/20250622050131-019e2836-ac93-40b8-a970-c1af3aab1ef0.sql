
-- إنشاء جدول لتخزين إحصائيات المتصدرين (عدد اللاعبين)
CREATE TABLE IF NOT EXISTS public.leaderboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_players INTEGER NOT NULL DEFAULT 540000,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إدخال البيانات الأولية
INSERT INTO public.leaderboard_stats (total_players, last_updated) 
VALUES (540000, CURRENT_DATE) 
ON CONFLICT DO NOTHING;

-- تمكين Row Level Security
ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بقراءة الإحصائيات
CREATE POLICY "Anyone can read leaderboard stats" 
ON public.leaderboard_stats 
FOR SELECT 
TO public 
USING (true);

-- دالة لتحديث عدد اللاعبين يومياً
CREATE OR REPLACE FUNCTION public.update_daily_player_count()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  days_diff INTEGER;
  current_count INTEGER;
  new_count INTEGER;
BEGIN
  -- حساب الفرق بالأيام منذ آخر تحديث
  SELECT 
    EXTRACT(day FROM (CURRENT_DATE - last_updated))::INTEGER,
    total_players
  INTO days_diff, current_count
  FROM public.leaderboard_stats
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- إذا مر يوم أو أكثر، قم بالتحديث
  IF days_diff > 0 THEN
    new_count := current_count + (days_diff * 20000);
    
    UPDATE public.leaderboard_stats 
    SET 
      total_players = new_count,
      last_updated = CURRENT_DATE,
      updated_at = now()
    WHERE id = (
      SELECT id FROM public.leaderboard_stats 
      ORDER BY created_at DESC 
      LIMIT 1
    );
  END IF;
END;
$$;

-- تعديل سعر إنشاء العشيرة إلى 2 TON (تحديث أي منطق متعلق)
-- لا نحتاج تعديل جدول clans حيث السعر يتم التعامل معه في الكود

-- حذف الجداول المتعلقة بـ Courses و Characters
DROP TABLE IF EXISTS public.user_purchases CASCADE;
DROP TABLE IF EXISTS public.user_characters CASCADE;
DROP TABLE IF EXISTS public.character_mining CASCADE;
