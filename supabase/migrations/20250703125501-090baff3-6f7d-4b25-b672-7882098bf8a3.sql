
-- Add new tasks for main category
INSERT INTO public.tasks (
  title,
  arabic_title,
  description,
  arabic_description,
  reward_amount,
  reward,
  status,
  is_active,
  external_link,
  image_url
) VALUES 
(
  'Add $SPACE to your Telegram username',
  'أضف $SPACE لاسم المستخدم في تيليجرام',
  'Add $SPACE to your Telegram username to show your support',
  'أضف $SPACE لاسم المستخدم في تيليجرام لإظهار دعمك',
  5000,
  5000,
  'in_progress',
  true,
  'https://t.me/settings',
  null
),
(
  'Share on Telegram Story',
  'شارك في قصة تيليجرام',
  'Share SPACE project on your Telegram story',
  'شارك مشروع SPACE في قصتك على تيليجرام',
  3000,
  3000,
  'in_progress',
  true,
  'https://t.me/share/story',
  null
),
(
  'Share website with a friend',
  'شارك الموقع مع صديق',
  'Share our website link with a friend on any platform',
  'شارك رابط موقعنا مع صديق على أي منصة',
  2000,
  2000,
  'in_progress',
  true,
  null,
  null
);
