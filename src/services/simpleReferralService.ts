
import { supabase } from '@/integrations/supabase/client';

interface SimpleReferral {
  id: string;
  referrer_username: string;
  referred_username: string;
  referrer_reward: number;
  referred_reward: number;
  created_at: string;
  verified: boolean;
}

class SimpleReferralService {
  private static instance: SimpleReferralService;

  private constructor() {}

  static getInstance(): SimpleReferralService {
    if (!SimpleReferralService.instance) {
      SimpleReferralService.instance = new SimpleReferralService();
    }
    return SimpleReferralService.instance;
  }

  // Get referral code from multiple sources
  getReferralCodeFromTelegram(): string | null {
    // Check Telegram Mini App first
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
      return window.Telegram.WebApp.initDataUnsafe.start_param;
    }
    
    // Fallback: check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('startapp') || urlParams.get('start') || urlParams.get('ref');
  }

  // Generate referral link for user
  generateReferralLink(username: string): string {
    return `https://t.me/Spacelbot?startapp=${username}`;
  }

  // Create referral record with proper reward distribution
  async createReferral(referrerUsername: string, referredUsername: string): Promise<boolean> {
    try {
      console.log('🔄 Creating referral record:', { referrerUsername, referredUsername });
      
      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from('simple_referrals')
        .select('*')
        .eq('referred_username', referredUsername)
        .maybeSingle();

      if (existingReferral) {
        console.log('⚠️ User already referred');
        return false;
      }

      // Check if referrer exists in profiles
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_name', referrerUsername)
        .maybeSingle();

      if (!referrerProfile) {
        console.log('❌ Referrer not found:', referrerUsername);
        return false;
      }

      // Create referral record
      const { data: referralRecord, error } = await supabase
        .from('simple_referrals')
        .insert({
          referrer_username: referrerUsername,
          referred_username: referredUsername,
          referrer_reward: 1000, // 1000 SPACE for referrer
          referred_reward: 2000,  // 2000 SPACE for new user
          verified: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating referral:', error);
        return false;
      }

      console.log('✅ Referral record created:', referralRecord.id);

      // Add rewards to both users
      await this.addRewardsToUsers(referrerUsername, referredUsername);
      
      return true;
    } catch (error) {
      console.error('❌ Error in createReferral:', error);
      return false;
    }
  }

  // Add rewards to both users
  private async addRewardsToUsers(referrerUsername: string, referredUsername: string): Promise<void> {
    try {
      console.log('💰 Adding rewards to users:', { referrerUsername, referredUsername });
      
      // Add reward to referrer in database
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_name', referrerUsername)
        .single();

      if (referrerProfile) {
        await supabase
          .from('profiles')
          .update({
            earnings: (referrerProfile.earnings || 0) + 1000
          })
          .eq('referral_name', referrerUsername);
        
        console.log('✅ Added 1000 SPACE to referrer:', referrerUsername);
      }

      // Add reward to referred user via localStorage (since they just joined)
      const currentCoins = parseInt(localStorage.getItem('spaceCoins') || '0');
      const newBalance = currentCoins + 2000;
      localStorage.setItem('spaceCoins', newBalance.toString());
      
      console.log('✅ Added 2000 SPACE to new user. New balance:', newBalance);

    } catch (error) {
      console.error('❌ Error adding rewards:', error);
    }
  }

  // Get user's referral statistics
  async getReferralStats(username: string): Promise<{
    totalReferrals: number;
    totalEarnings: number;
    referrals: SimpleReferral[];
  }> {
    try {
      const { data: referrals, error } = await supabase
        .from('simple_referrals')
        .select('*')
        .eq('referrer_username', username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting referral stats:', error);
        return { totalReferrals: 0, totalEarnings: 0, referrals: [] };
      }

      const totalReferrals = referrals?.length || 0;
      const totalEarnings = (referrals || []).reduce((sum, ref) => sum + (ref.referrer_reward || 0), 0);

      console.log('📊 Referral stats for', username, ':', { totalReferrals, totalEarnings });

      return {
        totalReferrals,
        totalEarnings,
        referrals: referrals || []
      };
    } catch (error) {
      console.error('❌ Error in getReferralStats:', error);
      return { totalReferrals: 0, totalEarnings: 0, referrals: [] };
    }
  }

  // Process referral when new user signs up
  async processReferralOnSignup(newUsername: string): Promise<boolean> {
    const pendingReferrer = localStorage.getItem('pendingReferrer');
    
    console.log('🔄 Processing referral on signup:', { newUsername, pendingReferrer });
    
    if (!pendingReferrer || pendingReferrer === newUsername) {
      console.log('ℹ️ No pending referrer or self-referral');
      return false;
    }

    const success = await this.createReferral(pendingReferrer, newUsername);
    
    if (success) {
      // Clean up localStorage
      localStorage.removeItem('pendingReferrer');
      localStorage.removeItem('processedReferrals');
      console.log('🧹 Cleaned up referral localStorage');
    }
    
    return success;
  }

  // Store referral code for later processing
  storeReferralCode(referrerCode: string): void {
    console.log('💾 Storing referral code:', referrerCode);
    
    localStorage.setItem('pendingReferrer', referrerCode);
    
    // Add to processed list to avoid duplicates
    const processedReferrals = JSON.parse(localStorage.getItem('processedReferrals') || '[]');
    if (!processedReferrals.includes(referrerCode)) {
      processedReferrals.push(referrerCode);
      localStorage.setItem('processedReferrals', JSON.stringify(processedReferrals));
      console.log('✅ Referral code stored and marked as processed');
    }
  }
}

export const simpleReferralService = SimpleReferralService.getInstance();
