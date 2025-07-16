
-- إنشاء جدول لحفظ صور المستخدمين المميزين
CREATE TABLE IF NOT EXISTS public.user_profile_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_image_url text NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- إضافة Row Level Security
ALTER TABLE public.user_profile_images ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بعرض الصور
CREATE POLICY "Anyone can view profile images" ON public.user_profile_images
  FOR SELECT USING (true);

-- سياسة للسماح للمستخدمين بإدارة صورهم الخاصة
CREATE POLICY "Users can manage their own profile images" ON public.user_profile_images
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE id = user_id));

-- إضافة trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_user_profile_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profile_images_updated_at
    BEFORE UPDATE ON public.user_profile_images
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_images_updated_at();
