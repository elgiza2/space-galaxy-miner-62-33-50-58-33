
import { supabase } from '@/integrations/supabase/client';

export const leaderboardStatsService = {
  async getTotalPlayers(): Promise<number> {
    try {
      // Update daily count first
      await supabase.rpc('update_daily_player_count');
      
      // Get current player count
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('total_players')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching player count:', error);
        return 540000; // Default fallback
      }

      return data?.total_players || 540000;
    } catch (error) {
      console.error('Error in getTotalPlayers:', error);
      return 540000; // Default fallback
    }
  }
};
