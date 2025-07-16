
import { supabase } from '@/integrations/supabase/client';

export const userActivityService = {
  async trackUserActivity(userId: string, activityType: string, metadata: any = {}) {
    try {
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          activity_type: activityType,
          metadata
        });

      if (error) {
        console.error('Error tracking user activity:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in trackUserActivity:', error);
      throw error;
    }
  },

  async trackUserSession(userId: string, username?: string) {
    try {
      // First, mark any existing sessions as inactive
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Create new active session
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          username: username || '',
          is_active: true,
          session_start: new Date().toISOString(),
          last_activity: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking user session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in trackUserSession:', error);
      throw error;
    }
  },

  async updateLastActivity(userId: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error updating last activity:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateLastActivity:', error);
      throw error;
    }
  }
};
