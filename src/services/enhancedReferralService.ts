import { supabase } from '@/integrations/supabase/client';
import { userReferralService } from './userReferralService';
import type { Database } from '@/integrations/supabase/types';

type ReferralEvent = Database['public']['Tables']['referral_events']['Row'];
type ReferralNotification = Database['public']['Tables']['referral_notifications']['Row'];

export const enhancedReferralService = {
  // Enhanced referral capture with real-time tracking (Mini App only)
  async captureReferralWithTracking(referrerCode: string, currentUrl: string): Promise<{ success: boolean; eventId?: string }> {
    try {
      console.log('Capturing Mini App referral with tracking:', { referrerCode, currentUrl });

      // Log the referral link click event
      const { data: eventId, error: eventError } = await supabase.rpc('process_referral_event', {
        p_event_type: 'miniapp_link_clicked',
        p_referrer_username: referrerCode,
        p_referred_username: null,
        p_telegram_user_id: null,
        p_event_data: {
          source_url: currentUrl,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          source: 'telegram_miniapp'
        }
      });

      if (eventError) {
        console.error('Error logging referral event:', eventError);
        return { success: false };
      }

      // Store in localStorage for later processing
      localStorage.setItem('pendingReferrer', referrerCode);
      localStorage.setItem('referralEventId', eventId);

      return { success: true, eventId };
    } catch (error) {
      console.error('Error capturing referral with tracking:', error);
      return { success: false };
    }
  },

  // Enhanced referral processing after signup (Mini App only)
  async processReferralAfterSignupWithTracking(newUsername: string, telegramId?: number): Promise<boolean> {
    try {
      const pendingReferrer = localStorage.getItem('pendingReferrer');
      const referralEventId = localStorage.getItem('referralEventId');
      
      if (!pendingReferrer) {
        return false;
      }

      console.log('Processing Mini App referral after signup with tracking:', { newUsername, pendingReferrer, telegramId });

      // Create the referral record
      const referralResult = await userReferralService.createReferral(pendingReferrer, newUsername);
      
      if (referralResult) {
        // Log user joined event
        await supabase.rpc('process_referral_event', {
          p_event_type: 'miniapp_user_joined',
          p_referrer_username: pendingReferrer,
          p_referred_username: newUsername,
          p_telegram_user_id: telegramId || null,
          p_event_data: {
            referral_id: referralResult.id,
            original_event_id: referralEventId,
            signup_timestamp: new Date().toISOString(),
            source: 'telegram_miniapp'
          }
        });

        // Process comprehensive rewards using the enhanced function
        const { data: rewardResult, error: rewardError } = await supabase.rpc(
          'process_comprehensive_referral_with_events',
          {
            referral_id: referralResult.id,
            referred_username: newUsername,
            referrer_username: pendingReferrer
          }
        );

        if (rewardError) {
          console.error('Error processing comprehensive rewards:', rewardError);
          return false;
        }

        console.log('Comprehensive referral processing completed:', rewardResult);

        // Clean up localStorage
        localStorage.removeItem('pendingReferrer');
        localStorage.removeItem('referralEventId');

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error processing referral after signup with tracking:', error);
      return false;
    }
  },

  // Get referral events for a user
  async getReferralEvents(username: string, limit: number = 50): Promise<ReferralEvent[]> {
    try {
      const { data, error } = await supabase
        .from('referral_events')
        .select('*')
        .or(`referrer_username.eq.${username},referred_username.eq.${username}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching referral events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReferralEvents:', error);
      return [];
    }
  },

  // Get notifications for a user
  async getUserNotifications(userId: string): Promise<ReferralNotification[]> {
    try {
      const { data, error } = await supabase
        .from('referral_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('referral_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return false;
    }
  },

  // Get unread notifications count
  async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('referral_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread notifications count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadNotificationsCount:', error);
      return 0;
    }
  },

  // Real-time subscription to referral events
  subscribeToReferralEvents(username: string, callback: (event: ReferralEvent) => void) {
    const channel = supabase
      .channel('referral-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'referral_events',
          filter: `referrer_username=eq.${username}`
        },
        (payload) => {
          console.log('New referral event:', payload);
          callback(payload.new as ReferralEvent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Real-time subscription to notifications
  subscribeToNotifications(userId: string, callback: (notification: ReferralNotification) => void) {
    const channel = supabase
      .channel('referral-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'referral_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification:', payload);
          callback(payload.new as ReferralNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
