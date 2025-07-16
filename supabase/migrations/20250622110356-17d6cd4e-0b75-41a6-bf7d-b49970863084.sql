
-- Create clan levels table
CREATE TABLE public.clan_levels (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  min_members INTEGER NOT NULL,
  min_energy INTEGER NOT NULL,
  min_missions_completed INTEGER NOT NULL,
  level_name TEXT NOT NULL,
  energy_boost_percentage NUMERIC(4,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial clan levels
INSERT INTO public.clan_levels (level, min_members, min_energy, min_missions_completed, level_name, energy_boost_percentage) VALUES
(1, 1, 0, 0, 'Asteroid', 0),
(2, 5, 10000, 3, 'Moon Base', 5),
(3, 10, 50000, 10, 'Space Station', 10),
(4, 15, 150000, 25, 'Planet Colony', 15),
(5, 20, 300000, 50, 'Solar System', 20),
(6, 25, 500000, 100, 'Galaxy Empire', 25);

-- Create clan missions table
CREATE TABLE public.clan_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly')),
  target_type TEXT NOT NULL CHECK (target_type IN ('energy', 'members', 'individual_tasks')),
  target_value INTEGER NOT NULL,
  reward_energy INTEGER DEFAULT 0,
  reward_boost_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample missions
INSERT INTO public.clan_missions (title, description, mission_type, target_type, target_value, reward_energy, reward_boost_hours) VALUES
('Daily Energy Rush', 'Mine 5,000 energy together as a clan', 'daily', 'energy', 5000, 1000, 2),
('Weekly Recruitment', 'Recruit 10 new members this week', 'weekly', 'members', 10, 5000, 24),
('Daily Miners', 'Have 5 members complete their daily mining tasks', 'daily', 'individual_tasks', 5, 500, 1),
('Weekly Energy Surge', 'Mine 50,000 energy together this week', 'weekly', 'energy', 50000, 10000, 48);

-- Create clan mission progress table
CREATE TABLE public.clan_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.clan_missions(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  progress_date DATE DEFAULT CURRENT_DATE
);

-- Create simple unique index
CREATE UNIQUE INDEX clan_mission_progress_unique_idx 
ON public.clan_mission_progress (clan_id, mission_id, progress_date);

-- Create clan wars table
CREATE TABLE public.clan_wars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('energy', 'nft', 'boost', 'tokens')),
  reward_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create clan war participants table
CREATE TABLE public.clan_war_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id UUID REFERENCES public.clan_wars(id) ON DELETE CASCADE,
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE,
  total_energy_contributed INTEGER DEFAULT 0,
  members_participated INTEGER DEFAULT 0,
  final_rank INTEGER,
  reward_claimed BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(war_id, clan_id)
);

-- Add new columns to existing clans table
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS missions_completed INTEGER DEFAULT 0;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS weekly_energy INTEGER DEFAULT 0;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS daily_energy INTEGER DEFAULT 0;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 20;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS energy_boost_active BOOLEAN DEFAULT false;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to calculate clan level
CREATE OR REPLACE FUNCTION public.calculate_clan_level(clan_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  clan_data RECORD;
  calculated_level INTEGER := 1;
BEGIN
  -- Get clan stats
  SELECT 
    c.member_count,
    c.total_coins as total_energy,
    c.missions_completed
  INTO clan_data
  FROM public.clans c
  WHERE c.id = clan_id_param;
  
  -- Calculate level based on requirements
  SELECT MAX(level) INTO calculated_level
  FROM public.clan_levels
  WHERE min_members <= clan_data.member_count
    AND min_energy <= clan_data.total_energy
    AND min_missions_completed <= clan_data.missions_completed;
  
  RETURN COALESCE(calculated_level, 1);
END;
$$;

-- Create function to update clan level
CREATE OR REPLACE FUNCTION public.update_clan_level()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_level INTEGER;
BEGIN
  -- Calculate new level
  new_level := public.calculate_clan_level(NEW.id);
  
  -- Update clan level if changed
  IF new_level != NEW.level THEN
    UPDATE public.clans 
    SET level = new_level,
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update clan level
DROP TRIGGER IF EXISTS update_clan_level_trigger ON public.clans;
CREATE TRIGGER update_clan_level_trigger
  AFTER UPDATE OF member_count, total_coins, missions_completed
  ON public.clans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_clan_level();

-- Create function to reset daily progress
CREATE OR REPLACE FUNCTION public.reset_daily_clan_progress()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reset daily energy counter
  UPDATE public.clans SET daily_energy = 0;
  
  -- Remove expired daily mission progress
  DELETE FROM public.clan_mission_progress 
  WHERE expires_at < now() 
    AND mission_id IN (
      SELECT id FROM public.clan_missions WHERE mission_type = 'daily'
    );
END;
$$;

-- Create function to reset weekly progress  
CREATE OR REPLACE FUNCTION public.reset_weekly_clan_progress()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reset weekly energy counter
  UPDATE public.clans SET weekly_energy = 0;
  
  -- Remove expired weekly mission progress
  DELETE FROM public.clan_mission_progress 
  WHERE expires_at < now() 
    AND mission_id IN (
      SELECT id FROM public.clan_missions WHERE mission_type = 'weekly'
    );
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.clan_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_war_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view clan levels" ON public.clan_levels FOR SELECT USING (true);
CREATE POLICY "Anyone can view clan missions" ON public.clan_missions FOR SELECT USING (true);
CREATE POLICY "Anyone can view mission progress" ON public.clan_mission_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can view clan wars" ON public.clan_wars FOR SELECT USING (true);
CREATE POLICY "Anyone can view war participants" ON public.clan_war_participants FOR SELECT USING (true);

-- Insert/Update policies for mission progress
CREATE POLICY "Clan members can update mission progress" ON public.clan_mission_progress 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Clans can participate in wars" ON public.clan_war_participants 
  FOR ALL USING (true) WITH CHECK (true);
