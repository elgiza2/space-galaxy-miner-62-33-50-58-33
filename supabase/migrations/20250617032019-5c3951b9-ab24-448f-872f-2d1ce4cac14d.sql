
-- Make referral_name unique to ensure no duplicate usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_name_unique 
ON public.profiles(referral_name);

-- Add constraint to ensure referral_name is unique
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_referral_name_unique UNIQUE USING INDEX idx_profiles_referral_name_unique;

-- Update existing duplicate referral names if any exist
DO $$
DECLARE
    duplicate_record RECORD;
    counter INTEGER;
BEGIN
    FOR duplicate_record IN 
        SELECT referral_name, COUNT(*) as count_duplicates
        FROM public.profiles 
        GROUP BY referral_name 
        HAVING COUNT(*) > 1
    LOOP
        counter := 1;
        UPDATE public.profiles 
        SET referral_name = duplicate_record.referral_name || '_' || counter
        WHERE ctid IN (
            SELECT ctid FROM public.profiles 
            WHERE referral_name = duplicate_record.referral_name 
            LIMIT 1 OFFSET 1
        );
        counter := counter + 1;
    END LOOP;
END $$;
