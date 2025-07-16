
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ClanMission = Database['public']['Tables']['clan_missions']['Row'];
type ClanMissionProgress = Database['public']['Tables']['clan_mission_progress']['Row'];

export const clanMissionsService = {
  // Get all active missions
  async getActiveMissions(): Promise<ClanMission[]> {
    try {
      const { data, error } = await supabase
        .from('clan_missions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clan missions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveMissions:', error);
      return [];
    }
  },

  // Get clan's mission progress
  async getClanMissionProgress(clanId: string): Promise<ClanMissionProgress[]> {
    try {
      const { data, error } = await supabase
        .from('clan_mission_progress')
        .select(`
          *,
          clan_missions!inner(*)
        `)
        .eq('clan_id', clanId)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching clan mission progress:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getClanMissionProgress:', error);
      return [];
    }
  },

  // Start a mission for a clan
  async startMission(clanId: string, missionId: string): Promise<boolean> {
    try {
      const mission = await this.getMissionById(missionId);
      if (!mission) return false;

      const expiresAt = new Date();
      if (mission.mission_type === 'daily') {
        expiresAt.setDate(expiresAt.getDate() + 1);
      } else if (mission.mission_type === 'weekly') {
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      const { error } = await supabase
        .from('clan_mission_progress')
        .insert({
          clan_id: clanId,
          mission_id: missionId,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Error starting mission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in startMission:', error);
      return false;
    }
  },

  // Update mission progress
  async updateMissionProgress(clanId: string, missionId: string, progress: number): Promise<boolean> {
    try {
      const mission = await this.getMissionById(missionId);
      if (!mission) return false;

      const { error } = await supabase
        .from('clan_mission_progress')
        .update({ 
          current_progress: progress,
          is_completed: progress >= mission.target_value
        })
        .eq('clan_id', clanId)
        .eq('mission_id', missionId);

      if (error) {
        console.error('Error updating mission progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateMissionProgress:', error);
      return false;
    }
  },

  // Get mission by ID
  async getMissionById(missionId: string): Promise<ClanMission | null> {
    try {
      const { data, error } = await supabase
        .from('clan_missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (error) {
        console.error('Error fetching mission:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMissionById:', error);
      return null;
    }
  },

  // Complete mission and claim rewards
  async completeMission(clanId: string, missionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clan_mission_progress')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('clan_id', clanId)
        .eq('mission_id', missionId);

      if (error) {
        console.error('Error completing mission:', error);
        return false;
      }

      // Update clan missions completed count
      const { data: clanData, error: fetchError } = await supabase
        .from('clans')
        .select('missions_completed')
        .eq('id', clanId)
        .single();

      if (fetchError) {
        console.error('Error fetching clan data:', fetchError);
        return false;
      }

      const { error: clanError } = await supabase
        .from('clans')
        .update({ 
          missions_completed: (clanData.missions_completed || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', clanId);

      if (clanError) {
        console.error('Error updating clan missions count:', clanError);
      }

      return true;
    } catch (error) {
      console.error('Error in completeMission:', error);
      return false;
    }
  }
};
