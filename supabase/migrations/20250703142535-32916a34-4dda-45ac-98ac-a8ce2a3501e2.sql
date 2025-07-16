-- Add language support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS language_detected_from VARCHAR(20) DEFAULT 'browser';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language code (ISO 639-1)';
COMMENT ON COLUMN public.profiles.language_detected_from IS 'Source of language detection: telegram, browser, manual';