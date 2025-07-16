
-- Add trigger to update current_participants count automatically
CREATE OR REPLACE FUNCTION update_giveaway_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.giveaway_events 
    SET current_participants = current_participants + 1,
        updated_at = now()
    WHERE id = NEW.giveaway_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.giveaway_events 
    SET current_participants = GREATEST(0, current_participants - 1),
        updated_at = now()
    WHERE id = OLD.giveaway_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on giveaway_participants table
DROP TRIGGER IF EXISTS trigger_update_participants_count ON public.giveaway_participants;
CREATE TRIGGER trigger_update_participants_count
  AFTER INSERT OR DELETE ON public.giveaway_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_giveaway_participants_count();

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Admin can manage giveaway events" ON public.giveaway_events;
CREATE POLICY "Admin can manage giveaway events" 
ON public.giveaway_events 
FOR ALL 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Everyone can view giveaway participants" ON public.giveaway_participants;
CREATE POLICY "Everyone can view giveaway participants" 
ON public.giveaway_participants 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can participate in giveaways" ON public.giveaway_participants;
CREATE POLICY "Users can participate in giveaways" 
ON public.giveaway_participants 
FOR INSERT 
WITH CHECK (true);

-- Enable RLS on both tables (this is safe to run multiple times)
ALTER TABLE public.giveaway_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_participants ENABLE ROW LEVEL SECURITY;
