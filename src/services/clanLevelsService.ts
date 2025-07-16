
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ClanLevel = Database['public']['Tables']['clan_levels']['Row'];

export const clanLevelsService = {
  // Get all clan levels
  async getAllLevels(): Promise<ClanLevel[]> {
    try {
      const { data, error } = await supabase
        .from('clan_levels')
        .select('*')
        .order('level', { ascending: true });

      if (error) {
        console.error('Error fetching clan levels:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllLevels:', error);
      return [];
    }
  },

  // Get level by number
  async getLevelByNumber(level: number): Promise<ClanLevel | null> {
    try {
      const { data, error } = await supabase
        .from('clan_levels')
        .select('*')
        .eq('level', level)
        .single();

      if (error) {
        console.error('Error fetching clan level:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLevelByNumber:', error);
      return null;
    }
  },

  // Calculate clan level based on stats
  async calculateClanLevel(clanId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_clan_level', { clan_id_param: clanId });

      if (error) {
        console.error('Error calculating clan level:', error);
        return 1;
      }

      return data || 1;
    } catch (error) {
      console.error('Error in calculateClanLevel:', error);
      return 1;
    }
  }
};
