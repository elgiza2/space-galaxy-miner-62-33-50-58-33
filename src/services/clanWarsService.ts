
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ClanWar = Database['public']['Tables']['clan_wars']['Row'];
type ClanWarParticipant = Database['public']['Tables']['clan_war_participants']['Row'];

export const clanWarsService = {
  // Get all active wars
  async getActiveWars(): Promise<ClanWar[]> {
    try {
      const { data, error } = await supabase
        .from('clan_wars')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching active wars:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveWars:', error);
      return [];
    }
  },

  // Get upcoming wars
  async getUpcomingWars(): Promise<ClanWar[]> {
    try {
      const { data, error } = await supabase
        .from('clan_wars')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming wars:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUpcomingWars:', error);
      return [];
    }
  },

  // Join a war
  async joinWar(warId: string, clanId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clan_war_participants')
        .insert({
          war_id: warId,
          clan_id: clanId
        });

      if (error) {
        console.error('Error joining war:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in joinWar:', error);
      return false;
    }
  },

  // Get war participants
  async getWarParticipants(warId: string): Promise<ClanWarParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('clan_war_participants')
        .select(`
          *,
          clans!inner(name, total_coins, member_count)
        `)
        .eq('war_id', warId)
        .order('total_energy_contributed', { ascending: false });

      if (error) {
        console.error('Error fetching war participants:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWarParticipants:', error);
      return [];
    }
  },

  // Update war contribution
  async updateWarContribution(warId: string, clanId: string, energyContributed: number, membersParticipated: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clan_war_participants')
        .update({
          total_energy_contributed: energyContributed,
          members_participated: membersParticipated
        })
        .eq('war_id', warId)
        .eq('clan_id', clanId);

      if (error) {
        console.error('Error updating war contribution:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateWarContribution:', error);
      return false;
    }
  }
};
