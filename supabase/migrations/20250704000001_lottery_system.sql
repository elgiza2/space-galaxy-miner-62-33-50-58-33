
-- Create lottery_events table
CREATE TABLE IF NOT EXISTS public.lottery_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'Gift Lottery',
  description text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'finished', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create lottery_prizes table
CREATE TABLE IF NOT EXISTS public.lottery_prizes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_event_id uuid REFERENCES public.lottery_events(id) ON DELETE CASCADE,
  rank_start integer NOT NULL,
  rank_end integer NOT NULL,
  prize_name text NOT NULL,
  prize_value text NOT NULL,
  prize_image text,
  prize_type text DEFAULT 'nft' CHECK (prize_type IN ('nft', 'ton', 'token')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create lottery_tickets table
CREATE TABLE IF NOT EXISTS public.lottery_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_event_id uuid REFERENCES public.lottery_events(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text,
  tickets_count integer DEFAULT 0,
  from_referrals integer DEFAULT 0,
  from_gifts integer DEFAULT 0,
  rank_position integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(lottery_event_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.lottery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read lottery data
CREATE POLICY "Everyone can view lottery events" ON public.lottery_events FOR SELECT USING (true);
CREATE POLICY "Everyone can view lottery prizes" ON public.lottery_prizes FOR SELECT USING (true);
CREATE POLICY "Everyone can view lottery tickets" ON public.lottery_tickets FOR SELECT USING (true);

-- Allow users to insert/update their own tickets
CREATE POLICY "Users can manage their tickets" ON public.lottery_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their tickets" ON public.lottery_tickets FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_event ON public.lottery_tickets(lottery_event_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user ON public.lottery_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_rank ON public.lottery_tickets(rank_position);
CREATE INDEX IF NOT EXISTS idx_lottery_prizes_lottery_event ON public.lottery_prizes(lottery_event_id);

-- Insert current lottery event
INSERT INTO public.lottery_events (title, description, start_date, end_date, status) 
VALUES ('Gift Lottery', 'From July 5 to July 25, participate in the gift lottery. Collect the most lottery tickets and win valuable prizes!', '2025-07-05 00:00:00+00', '2025-07-25 23:59:59+00', 'active')
ON CONFLICT DO NOTHING;

-- Get the lottery event ID for inserting prizes
DO $$
DECLARE
  lottery_id uuid;
BEGIN
  SELECT id INTO lottery_id FROM public.lottery_events WHERE title = 'Gift Lottery' LIMIT 1;
  
  -- Insert prizes with images
  INSERT INTO public.lottery_prizes (lottery_event_id, rank_start, rank_end, prize_name, prize_value, prize_image, prize_type) VALUES
  (lottery_id, 1, 1, 'Diamond NFT', '500 TON', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400', 'nft'),
  (lottery_id, 2, 2, 'Gold NFT', '300 TON', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400', 'nft'),
  (lottery_id, 3, 3, 'Silver NFT', '200 TON', 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=400', 'nft'),
  (lottery_id, 4, 4, 'Bronze NFT', '150 TON', 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400', 'nft'),
  (lottery_id, 5, 5, 'Special NFT', '100 TON', 'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=400', 'nft'),
  (lottery_id, 6, 10, 'Space Box', '100 TON', null, 'token'),
  (lottery_id, 11, 15, 'Durov Box', '50 TON', null, 'token'),
  (lottery_id, 16, 20, 'Pepe Box', '10 TON', null, 'token'),
  (lottery_id, 21, 25, 'All or Nothing Box', '5 TON', null, 'token')
  ON CONFLICT DO NOTHING;
END $$;
