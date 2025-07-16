
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ReferralTracking = Database['public']['Tables']['referral_tracking']['Row'];
type NewReferralTracking = Database['public']['Tables']['referral_tracking']['Insert'];

export const referralService = {
  // Track a new referral
  async trackReferral(referrerProfileId: string, referredTelegramId: number): Promise<ReferralTracking | null> {
    try {
      // Check if this telegram user was already referred
      const { data: existingReferral } = await supabase
        .from('referral_tracking')
        .select('*')
        .eq('referred_telegram_id', referredTelegramId)
        .single();

      if (existingReferral) {
        console.log('User already referred');
        return existingReferral;
      }

      // Create new referral tracking record
      const { data, error } = await supabase
        .from('referral_tracking')
        .insert({
          referrer_profile_id: referrerProfileId,
          referred_telegram_id: referredTelegramId,
          reward_given: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking referral:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in trackReferral:', error);
      return null;
    }
  },

  // Process referral reward when referred user creates profile
  async processReferralReward(referredTelegramId: number, referredProfileId: string): Promise<boolean> {
    try {
      // Find the referral tracking record
      const { data: referralTracking, error: fetchError } = await supabase
        .from('referral_tracking')
        .select('*')
        .eq('referred_telegram_id', referredTelegramId)
        .eq('reward_given', false)
        .single();

      if (fetchError || !referralTracking) {
        console.log('No pending referral found for this user');
        return false;
      }

      // Update referral tracking with referred profile id
      const { error: updateError } = await supabase
        .from('referral_tracking')
        .update({
          referred_profile_id: referredProfileId,
          reward_given: true
        })
        .eq('id', referralTracking.id);

      if (updateError) {
        console.error('Error updating referral tracking:', updateError);
        return false;
      }

      // Give reward to referrer using the database function
      const { error: rewardError } = await supabase.rpc('process_referral_reward', {
        referrer_id: referralTracking.referrer_profile_id,
        reward_amount: 100
      });

      if (rewardError) {
        console.error('Error processing referral reward:', rewardError);
        return false;
      }

      console.log('Referral reward processed successfully');
      return true;
    } catch (error) {
      console.error('Error in processReferralReward:', error);
      return false;
    }
  },

  // Get referral statistics for a user
  async getReferralStats(profileId: string): Promise<{ totalReferrals: number; totalEarnings: number }> {
    try {
      // Get total referrals count
      const { count: totalReferrals } = await supabase
        .from('referral_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_profile_id', profileId)
        .eq('reward_given', true);

      // Get total earnings from referrals (each referral gives 100 coins)
      const totalEarnings = (totalReferrals || 0) * 100;

      return {
        totalReferrals: totalReferrals || 0,
        totalEarnings
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return { totalReferrals: 0, totalEarnings: 0 };
    }
  }
};
