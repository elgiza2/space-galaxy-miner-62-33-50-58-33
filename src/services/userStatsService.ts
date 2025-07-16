
import { supabase } from '@/integrations/supabase/client';

export const userStatsService = {
  async getTotalUsers(): Promise<number> {
    try {
      // Use the most accurate count with exact count
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total users:', error);
        // Fallback to alternative counting method
        const { data, error: fallbackError } = await supabase
          .from('profiles')
          .select('id');
        
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          return 0;
        }
        
        return data?.length || 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTotalUsers:', error);
      return 0;
    }
  },

  async getActiveUsersToday(): Promise<number> {
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      // Get unique users who had activity today
      const { data, error } = await supabase
        .from('user_activity')
        .select('user_id')
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd);

      if (error) {
        console.error('Error fetching active users today:', error);
        return 0;
      }

      // Count unique user_ids
      const uniqueUsers = new Set(data?.map(item => item.user_id) || []);
      return uniqueUsers.size;
    } catch (error) {
      console.error('Error in getActiveUsersToday:', error);
      return 0;
    }
  },

  async getNewUsersThisWeek(): Promise<number> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      if (error) {
        console.error('Error fetching new users this week:', error);
        // Fallback method
        const { data, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, created_at')
          .gte('created_at', weekAgo.toISOString());
        
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          return 0;
        }
        
        return data?.length || 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getNewUsersThisWeek:', error);
      return 0;
    }
  },

  async getTotalEarnings(): Promise<number> {
    try {
      // Get sum of all earnings directly from database
      const { data, error } = await supabase
        .from('profiles')
        .select('earnings');

      if (error) {
        console.error('Error fetching total earnings:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Calculate total earnings more accurately
      const totalEarnings = data.reduce((sum, profile) => {
        const earnings = Number(profile.earnings) || 0;
        return sum + earnings;
      }, 0);

      return Math.round(totalEarnings * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error in getTotalEarnings:', error);
      return 0;
    }
  },

  // New method to get real-time current active users (last 5 minutes)
  async getCurrentActiveUsers(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('is_active', true)
        .gte('last_activity', fiveMinutesAgo.toISOString());

      if (error) {
        console.error('Error fetching current active users:', error);
        return 0;
      }

      // Count unique active users
      const uniqueUsers = new Set(data?.map(item => item.user_id) || []);
      return uniqueUsers.size;
    } catch (error) {
      console.error('Error in getCurrentActiveUsers:', error);
      return 0;
    }
  },

  // Enhanced method for last hour active users
  async getLastHourActiveUsers(): Promise<number> {
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const { data, error } = await supabase
        .from('user_activity')
        .select('user_id')
        .gte('created_at', oneHourAgo.toISOString());

      if (error) {
        console.error('Error fetching last hour active users:', error);
        return 0;
      }

      // Count unique users
      const uniqueUsers = new Set(data?.map(item => item.user_id) || []);
      return uniqueUsers.size;
    } catch (error) {
      console.error('Error in getLastHourActiveUsers:', error);
      return 0;
    }
  }
};
