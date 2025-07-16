
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserReferral = Database['public']['Tables']['user_referrals']['Row'];
type NewUserReferral = Database['public']['Tables']['user_referrals']['Insert'];

// Type for the comprehensive referral stats response
type ComprehensiveReferralStats = {
  totalReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  totalTonRewards: number;
  totalSpinTickets: number;
  referralHistory: Array<{
    id: string;
    referred_username: string;
    verification_status: string;
    created_at: string;
    verified_at: string | null;
  }>;
};

// Type for the comprehensive referral reward response
type ComprehensiveReferralRewardResponse = {
  success: boolean;
  message: string;
  referred_user_bonus?: number;
  referrer_space_bonus?: number;
  referrer_ton_bonus?: number;
  referrer_spin_bonus?: number;
};

export const userReferralService = {
  // Create a new referral record with enhanced tracking
  async createReferral(referrerUsername: string, referredUsername: string): Promise<UserReferral | null> {
    try {
      // First check if the referred user already exists
      const { data: existingReferral } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referred_username', referredUsername)
        .single();

      if (existingReferral) {
        console.log('User already referred');
        return null;
      }

      // Get referrer profile
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_name', referrerUsername)
        .single();

      if (!referrerProfile) {
        console.log('Referrer profile not found');
        return null;
      }

      // Create referral record with enhanced reward details
      const referralData: NewUserReferral = {
        referrer_username: referrerUsername,
        referred_username: referredUsername,
        referrer_profile_id: referrerProfile.id,
        verification_status: 'pending',
        reward_amount: 1000, // SPACE coins for referrer
        space_coin_reward: 2000, // SPACE coins for new user
        ton_reward: 0.005, // TON for referrer
        spin_reward: 1000 // Space coins reward for referrer (reused field)
      };

      const { data, error } = await supabase
        .from('user_referrals')
        .insert(referralData)
        .select()
        .single();

      if (error) {
        console.error('Error creating referral:', error);
        return null;
      }

      console.log('Referral created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createReferral:', error);
      return null;
    }
  },

  // Verify a referral and process comprehensive rewards
  async verifyReferral(referredUsername: string, referredProfileId: string): Promise<boolean> {
    try {
      // Find pending referral for this user
      const { data: referral } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referred_username', referredUsername)
        .eq('verification_status', 'pending')
        .single();

      if (!referral) {
        console.log('No pending referral found');
        return false;
      }

      // Update referral with referred profile ID
      const { error: updateError } = await supabase
        .from('user_referrals')
        .update({ referred_profile_id: referredProfileId })
        .eq('id', referral.id);

      if (updateError) {
        console.error('Error updating referral:', updateError);
        return false;
      }

      // Process comprehensive referral rewards using the new function
      const { data, error } = await supabase.rpc('process_comprehensive_referral_reward', {
        referral_id: referral.id,
        referred_username: referredUsername,
        referrer_username: referral.referrer_username
      });

      if (error) {
        console.error('Error processing comprehensive referral reward:', error);
        return false;
      }

      // Type assertion to properly handle the response
      const response = data as ComprehensiveReferralRewardResponse;
      console.log('Comprehensive referral reward processed:', response);
      return response?.success || false;
    } catch (error) {
      console.error('Error in verifyReferral:', error);
      return false;
    }
  },

  // Get comprehensive referral statistics
  async getReferralStats(username: string): Promise<{ totalReferrals: number; totalEarnings: number; pendingReferrals: number; totalTonRewards: number; totalSpinTickets: number }> {
    try {
      const { data, error } = await supabase.rpc('get_comprehensive_referral_stats', {
        username_param: username
      });

      if (error) {
        console.error('Error getting comprehensive referral stats:', error);
        return { totalReferrals: 0, totalEarnings: 0, pendingReferrals: 0, totalTonRewards: 0, totalSpinTickets: 0 };
      }

      const stats = data as ComprehensiveReferralStats;
      return {
        totalReferrals: stats.totalReferrals || 0,
        totalEarnings: stats.totalEarnings || 0,
        pendingReferrals: stats.pendingReferrals || 0,
        totalTonRewards: stats.totalTonRewards || 0,
        totalSpinTickets: stats.totalSpinTickets || 0
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return { totalReferrals: 0, totalEarnings: 0, pendingReferrals: 0, totalTonRewards: 0, totalSpinTickets: 0 };
    }
  },

  // Get detailed referral history
  async getReferralHistory(username: string): Promise<UserReferral[]> {
    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_username', username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting referral history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReferralHistory:', error);
      return [];
    }
  },

  // Get user rewards for a specific user
  async getUserRewards(username: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('username', username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user rewards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserRewards:', error);
      return [];
    }
  }
};
