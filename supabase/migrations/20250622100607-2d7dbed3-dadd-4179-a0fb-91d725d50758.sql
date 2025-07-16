
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view clans" ON public.clans;
DROP POLICY IF EXISTS "Authenticated users can create clans" ON public.clans;
DROP POLICY IF EXISTS "Clan leaders can update their clans" ON public.clans;
DROP POLICY IF EXISTS "Clan leaders can delete their clans" ON public.clans;

DROP POLICY IF EXISTS "Anyone can view clan members" ON public.clan_members;
DROP POLICY IF EXISTS "Authenticated users can join clans" ON public.clan_members;
DROP POLICY IF EXISTS "Users can update their clan membership" ON public.clan_members;
DROP POLICY IF EXISTS "Users can leave clans" ON public.clan_members;

-- Enable RLS on both tables
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

-- Create new policies for clans table
CREATE POLICY "Anyone can view clans" 
  ON public.clans 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create clans" 
  ON public.clans 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update clans" 
  ON public.clans 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete clans" 
  ON public.clans 
  FOR DELETE 
  USING (true);

-- Create new policies for clan_members table
CREATE POLICY "Anyone can view clan members" 
  ON public.clan_members 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can join clans" 
  ON public.clan_members 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update clan membership" 
  ON public.clan_members 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can leave clans" 
  ON public.clan_members 
  FOR DELETE 
  USING (true);
