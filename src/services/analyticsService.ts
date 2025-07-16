
import { supabase } from '@/integrations/supabase/client';

export interface TaskCompletionStat {
  task_id: string;
  task_title: string;
  completion_count: number;
}

export interface TopPurchaser {
  username: string;
  total_spent: number;
  purchase_count: number;
}

export const analyticsService = {
  async getTaskCompletionStats(): Promise<TaskCompletionStat[]> {
    try {
      const { data, error } = await supabase.rpc('get_task_completion_stats');
      
      if (error) {
        console.error('Error fetching task completion stats:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTaskCompletionStats:', error);
      return [];
    }
  },

  async getCurrentActiveUsers(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_current_active_users');
      
      if (error) {
        console.error('Error fetching current active users:', error);
        throw error;
      }
      
      return data || 0;
    } catch (error) {
      console.error('Error in getCurrentActiveUsers:', error);
      return 0;
    }
  },

  async getLastHourActiveUsers(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_last_hour_active_users');
      
      if (error) {
        console.error('Error fetching last hour active users:', error);
        throw error;
      }
      
      return data || 0;
    } catch (error) {
      console.error('Error in getLastHourActiveUsers:', error);
      return 0;
    }
  },

  async getTopPurchasers(limit: number = 5): Promise<TopPurchaser[]> {
    try {
      const { data, error } = await supabase.rpc('get_top_purchasers', { limit_count: limit });
      
      if (error) {
        console.error('Error fetching top purchasers:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTopPurchasers:', error);
      return [];
    }
  }
};
