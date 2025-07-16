
import { supabase } from '@/integrations/supabase/client';

export const taskVerificationService = {
  // Verify if user added $SPACE to their Telegram username
  async verifyTelegramUsername(username: string, telegramId?: number): Promise<boolean> {
    try {
      // Check if username contains $SPACE
      if (username && username.includes('$SPACE')) {
        // Log verification in database
        await supabase.from('user_activity').insert({
          user_id: `telegram_${telegramId || username}`,
          username: username,
          activity_type: 'telegram_username_verified',
          metadata: {
            username: username,
            verification_type: 'telegram_username',
            verified_at: new Date().toISOString()
          }
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying Telegram username:', error);
      return false;
    }
  },

  // Verify story sharing (manual verification for now)
  async verifyStorySharing(username: string, telegramId?: number): Promise<boolean> {
    try {
      // For now, we'll mark it as completed when user clicks the button
      // In a real scenario, this would need Telegram API integration
      await supabase.from('user_activity').insert({
        user_id: `telegram_${telegramId || username}`,
        username: username,
        activity_type: 'story_sharing_verified',
        metadata: {
          username: username,
          verification_type: 'story_sharing',
          verified_at: new Date().toISOString()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error verifying story sharing:', error);
      return false;
    }
  },

  // Verify website sharing (manual verification)
  async verifyWebsiteSharing(username: string, telegramId?: number): Promise<boolean> {
    try {
      // Manual verification - user confirms they shared the website
      await supabase.from('user_activity').insert({
        user_id: `telegram_${telegramId || username}`,
        username: username,
        activity_type: 'website_sharing_verified',
        metadata: {
          username: username,
          verification_type: 'website_sharing',
          verified_at: new Date().toISOString()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error verifying website sharing:', error);
      return false;
    }
  },

  // Check if task was already verified
  async isTaskVerified(username: string, activityType: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('id')
        .eq('username', username)
        .eq('activity_type', activityType)
        .limit(1);

      if (error) {
        console.error('Error checking task verification:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking task verification:', error);
      return false;
    }
  }
};
