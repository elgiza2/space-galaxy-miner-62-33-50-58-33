
import { supabase } from '@/integrations/supabase/client';
import { spaceCoinsService } from './spaceCoinsService';
import { telegramUserService } from './telegramUserService';
import type { Database } from '@/integrations/supabase/types';

type RealUserLeaderboard = Database['public']['Views']['real_user_leaderboard']['Row'];
type RealClanLeaderboard = Database['public']['Views']['real_clan_leaderboard']['Row'];

export const leaderboardService = {
  async getTopUsers(limit: number = 50): Promise<RealUserLeaderboard[]> {
    const { data, error } = await supabase
      .from('real_user_leaderboard')
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user leaderboard:', error);
      throw error;
    }
    
    return data || [];
  },

  async getTopClans(limit: number = 50): Promise<RealClanLeaderboard[]> {
    const { data, error } = await supabase
      .from('real_clan_leaderboard')
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error('Error fetching clan leaderboard:', error);
      throw error;
    }
    
    return data || [];
  },

  async getUserRank(telegramId: number): Promise<number | null> {
    try {
      // First get the user profile to get the UUID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('telegram_id', telegramId)
        .single();
      
      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      const { data, error } = await supabase
        .from('real_user_leaderboard')
        .select('rank')
        .eq('id', profile.id)
        .single();
      
      if (error) {
        console.error('Error fetching user rank:', error);
        return null;
      }
      
      return data?.rank || null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  },

  async syncUserEarnings(telegramId: number, telegramUser: any, earnings: number): Promise<boolean> {
    try {
      console.log('Syncing user earnings for:', telegramUser);
      
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError);
        return false;
      }

      if (existingProfile) {
        console.log('Updating existing user profile with photo:', telegramUser?.photo_url);
        // Update existing user earnings and profile data including photo
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            earnings: earnings,
            first_name: telegramUser?.first_name || existingProfile.first_name,
            last_name: telegramUser?.last_name || existingProfile.last_name,
            username: telegramUser?.username || existingProfile.username,
            photo_url: telegramUser?.photo_url || existingProfile.photo_url,
            updated_at: new Date().toISOString()
          })
          .eq('telegram_id', telegramId);

        if (updateError) {
          console.error('Error updating user earnings:', updateError);
          return false;
        }
      } else {
        console.log('Creating new user profile with photo:', telegramUser?.photo_url);
        // Create new user profile with Telegram data
        const referralName = `SPACE#${Math.floor(Math.random() * 900000) + 100000}`;
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            telegram_id: telegramId,
            username: telegramUser?.username,
            first_name: telegramUser?.first_name,
            last_name: telegramUser?.last_name,
            photo_url: telegramUser?.photo_url,
            referral_name: referralName,
            earnings: earnings
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return false;
        }
      }

      console.log(`Successfully synced earnings for user ${telegramUser?.first_name || telegramUser?.username}: ${earnings} coins with photo: ${telegramUser?.photo_url}`);
      return true;
    } catch (error) {
      console.error('Error syncing user earnings:', error);
      return false;
    }
  },

  async initializeCurrentUser(telegramUser: any): Promise<void> {
    if (!telegramUser?.id) return;
    
    console.log('Initializing current user with data:', telegramUser);
    const currentCoins = spaceCoinsService.getCoins();
    
    await this.syncUserEarnings(telegramUser.id, telegramUser, currentCoins);
  }
};
