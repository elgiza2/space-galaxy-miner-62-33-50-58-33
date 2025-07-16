
-- Create giveaway_events table
CREATE TABLE public.giveaway_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  event_number integer NOT NULL,
  item_name text NOT NULL,
  item_id text,
  max_participants integer,
  current_participants integer DEFAULT 0,
  participation_fee numeric DEFAULT 0,
  is_free boolean DEFAULT true,
  status text DEFAULT 'active' CHECK (status IN ('active', 'finished', 'cancelled')),
  end_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create giveaway_participants table
CREATE TABLE public.giveaway_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id uuid REFERENCES public.giveaway_events(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text,
  telegram_id bigint,
  participated_at timestamp with time zone DEFAULT now(),
  payment_status text DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  UNIQUE(giveaway_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.giveaway_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_participants ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read giveaway events
CREATE POLICY "Everyone can view giveaway events" ON public.giveaway_events FOR SELECT USING (true);

-- Allow everyone to participate in giveaways
CREATE POLICY "Users can participate in giveaways" ON public.giveaway_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their participation" ON public.giveaway_participants FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_giveaway_events_status ON public.giveaway_events(status);
CREATE INDEX idx_giveaway_participants_giveaway_id ON public.giveaway_participants(giveaway_id);
CREATE INDEX idx_giveaway_participants_user_id ON public.giveaway_participants(user_id);

-- Insert sample data
INSERT INTO public.giveaway_events (title, description, event_number, item_name, item_id, max_participants, participation_fee, is_free, status, end_time) VALUES
('Giveaway #55', 'Vintage Cigar #13234', 55, 'Vintage Cigar', '13234', NULL, 1, false, 'active', now() + interval '18 hours 35 minutes'),
('Giveaway #54', 'Vintage Cigar #15382', 54, 'Vintage Cigar', '15382', 400, 5, false, 'finished', now() - interval '1 day');

-- Update current participants for sample data
UPDATE public.giveaway_events SET current_participants = 91 WHERE event_number = 55;
UPDATE public.giveaway_events SET current_participants = 14 WHERE event_number = 54;
