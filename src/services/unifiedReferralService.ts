import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  totalTonEarnings: number;
  referrals: Array<{
    id: string;
    referrer_username: string;
    referred_username: string;
    referrer_reward: number;
    referred_reward: number;
    created_at: string;
    verified: boolean;
  }>;
}

class UnifiedReferralService {
  private static instance: UnifiedReferralService;

  private constructor() {}

  static getInstance(): UnifiedReferralService {
    if (!UnifiedReferralService.instance) {
      UnifiedReferralService.instance = new UnifiedReferralService();
    }
    return UnifiedReferralService.instance;
  }

  // Generate referral link
  generateReferralLink(username: string): string {
    console.log('🔗 Generating referral link for:', username);
    return `https://t.me/Spacelbot?startapp=${username}`;
  }

  // Capture referral code from URL or Telegram
  captureReferralCode(): string | null {
    try {
      console.log('🔍 Capturing referral code...');
      
      // Check Telegram Mini App first
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
        const telegramCode = window.Telegram.WebApp.initDataUnsafe.start_param;
        console.log('📱 Found Telegram referral code:', telegramCode);
        return telegramCode;
      }
      
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlCode = urlParams.get('startapp') || urlParams.get('start') || urlParams.get('ref');
      if (urlCode) {
        console.log('🌐 Found URL referral code:', urlCode);
        return urlCode;
      }
      
      console.log('❌ No referral code found');
      return null;
    } catch (error) {
      console.error('❌ Error capturing referral code:', error);
      return null;
    }
  }

  // Store referral code for later processing
  storeReferralCode(referrerCode: string): boolean {
    try {
      console.log('💾 Storing referral code:', referrerCode);
      
      // Clear any existing referral data to avoid conflicts
      this.clearStoredReferralData();
      
      // Store new referral data
      localStorage.setItem('pendingReferrer', referrerCode);
      localStorage.setItem('referralTimestamp', new Date().toISOString());
      
      // Mark as processed to avoid duplicates
      const processedReferrals = JSON.parse(localStorage.getItem('processedReferrals') || '[]');
      if (!processedReferrals.includes(referrerCode)) {
        processedReferrals.push(referrerCode);
        localStorage.setItem('processedReferrals', JSON.stringify(processedReferrals));
      }
      
      console.log('✅ Referral code stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error storing referral code:', error);
      return false;
    }
  }

  // Clear stored referral data
  clearStoredReferralData(): void {
    try {
      localStorage.removeItem('pendingReferrer');
      localStorage.removeItem('referralTimestamp');
      localStorage.removeItem('referralEventId');
      console.log('🧹 Cleared stored referral data');
    } catch (error) {
      console.error('❌ Error clearing referral data:', error);
    }
  }

  // Clear ALL referral data including processed referrals
  clearAllReferralData(): void {
    try {
      localStorage.removeItem('pendingReferrer');
      localStorage.removeItem('referralTimestamp');
      localStorage.removeItem('referralEventId');
      localStorage.removeItem('processedReferrals');
      console.log('🧹 Cleared ALL referral data completely');
    } catch (error) {
      console.error('❌ Error clearing all referral data:', error);
    }
  }

  // Reset user referral system
  async resetUserReferralSystem(username: string): Promise<boolean> {
    try {
      console.log('🔄 Resetting referral system for:', username);
      
      // Clear localStorage data
      this.clearAllReferralData();
      
      // Note: We don't delete database records as they are historical data
      // But we can mark them as inactive if needed in the future
      
      console.log('✅ Referral system reset completed');
      return true;
    } catch (error) {
      console.error('❌ Error resetting referral system:', error);
      return false;
    }
  }

  // Create or get user profile
  async createOrGetUserProfile(username: string): Promise<any> {
    try {
      console.log('👤 Creating or getting profile for:', username);
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_name', username)
        .maybeSingle();

      if (existingProfile) {
        console.log('✅ Profile exists:', existingProfile);
        return existingProfile;
      }

      // Create new profile
      const fakeTelegramId = Date.now() + Math.floor(Math.random() * 1000);
      
      const profileData = {
        telegram_id: fakeTelegramId,
        referral_name: username,
        username: username,
        first_name: username,
        earnings: 0
      };

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
      }

      console.log('✅ Profile created:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('❌ Error in createOrGetUserProfile:', error);
      throw error;
    }
  }

  // Create referral record in database
  async createReferralRecord(referrerUsername: string, referredUsername: string): Promise<boolean> {
    try {
      console.log('📝 Creating referral record:', { referrerUsername, referredUsername });
      
      // Validate inputs
      if (!referrerUsername || !referredUsername || referrerUsername === referredUsername) {
        console.log('❌ Invalid referral data');
        return false;
      }

      // Check if referral already exists
      const { data: existingReferral, error: checkError } = await supabase
        .from('simple_referrals')
        .select('*')
        .eq('referred_username', referredUsername)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing referral:', checkError);
        return false;
      }

      if (existingReferral) {
        console.log('⚠️ User already referred:', referredUsername);
        return false;
      }

      // Ensure referrer profile exists
      await this.createOrGetUserProfile(referrerUsername);
      
      // Ensure referred user profile exists
      await this.createOrGetUserProfile(referredUsername);

      // Create referral record with updated rewards (10,000 SPACE)
      const { data: referralRecord, error: createError } = await supabase
        .from('simple_referrals')
        .insert({
          referrer_username: referrerUsername,
          referred_username: referredUsername,
          referrer_reward: 10000, // Updated to 10,000 SPACE
          referred_reward: 10000, // Updated to 10,000 SPACE
          verified: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating referral record:', createError);
        return false;
      }

      console.log('✅ Referral record created:', referralRecord.id);
      return true;
    } catch (error) {
      console.error('❌ Error in createReferralRecord:', error);
      return false;
    }
  }

  // Process rewards for both users including TON (10,000 SPACE + 0.001 TON)
  async processRewards(referrerUsername: string, referredUsername: string): Promise<boolean> {
    try {
      console.log('💰 Processing enhanced rewards for:', { referrerUsername, referredUsername });

      // Update referrer earnings in database (10,000 SPACE)
      const { data: referrerProfile, error: referrerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_name', referrerUsername)
        .single();

      if (referrerError) {
        console.error('❌ Error getting referrer profile:', referrerError);
        return false;
      }

      if (referrerProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            earnings: (referrerProfile.earnings || 0) + 10000,
            updated_at: new Date().toISOString()
          })
          .eq('referral_name', referrerUsername);

        if (updateError) {
          console.error('❌ Error updating referrer earnings:', updateError);
          return false;
        }

        console.log('✅ Added 10,000 SPACE to referrer:', referrerUsername);

        // Add TON reward for referrer (0.001 TON) - Fix: provide both required fields
        const { error: tonError } = await supabase
          .from('user_ton_rewards')
          .insert({
            user_id: `user_${referrerUsername}`,
            username: referrerUsername,
            amount: 0.001,
            reward_type: 'referral_bonus',
            claimed: false
          });

        if (tonError) {
          console.error('❌ Error adding TON reward:', tonError);
        } else {
          console.log('✅ Added 0.001 TON reward to referrer:', referrerUsername);
        }
      }

      // Update referred user earnings in database (10,000 SPACE)
      const { data: referredProfile, error: referredError } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_name', referredUsername)
        .single();

      if (referredError) {
        console.error('❌ Error getting referred profile:', referredError);
        return false;
      }

      if (referredProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            earnings: (referredProfile.earnings || 0) + 10000,
            updated_at: new Date().toISOString()
          })
          .eq('referral_name', referredUsername);

        if (updateError) {
          console.error('❌ Error updating referred user earnings:', updateError);
          return false;
        }

        console.log('✅ Added 10,000 SPACE to referred user in database:', referredUsername);
      }

      // Update localStorage for immediate UI feedback (10,000 SPACE)
      const currentCoins = parseInt(localStorage.getItem('spaceCoins') || '0');
      const newBalance = currentCoins + 10000;
      localStorage.setItem('spaceCoins', newBalance.toString());
      
      console.log('✅ Updated localStorage balance. New balance:', newBalance);
      return true;
    } catch (error) {
      console.error('❌ Error processing enhanced rewards:', error);
      return false;
    }
  }

  // Main function to process referral after signup
  async processReferralAfterSignup(newUsername: string): Promise<boolean> {
    try {
      const pendingReferrer = localStorage.getItem('pendingReferrer');
      
      console.log('🔄 Processing referral after signup:', { newUsername, pendingReferrer });
      
      if (!pendingReferrer || pendingReferrer === newUsername) {
        console.log('ℹ️ No valid pending referrer');
        return false;
      }

      // Create referral record
      const recordCreated = await this.createReferralRecord(pendingReferrer, newUsername);
      if (!recordCreated) {
        console.log('❌ Failed to create referral record');
        return false;
      }

      // Process enhanced rewards
      const rewardsProcessed = await this.processRewards(pendingReferrer, newUsername);
      if (!rewardsProcessed) {
        console.log('❌ Failed to process enhanced rewards');
        return false;
      }

      // Clean up localStorage
      this.clearStoredReferralData();
      
      console.log('✅ Enhanced referral processed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error processing referral after signup:', error);
      return false;
    }
  }

  // Get referral statistics including TON rewards
  async getReferralStats(username: string): Promise<ReferralStats> {
    try {
      console.log('📊 Getting enhanced referral stats for:', username);
      
      const { data: referrals, error } = await supabase
        .from('simple_referrals')
        .select('*')
        .eq('referrer_username', username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting referral stats:', error);
        return { totalReferrals: 0, totalEarnings: 0, totalTonEarnings: 0, referrals: [] };
      }

      // Get TON rewards - Fix: use both user_id and username fields
      const { data: tonRewards } = await supabase
        .from('user_ton_rewards')
        .select('amount')
        .eq('user_id', `user_${username}`)
        .eq('username', username);

      const totalReferrals = referrals?.length || 0;
      const totalEarnings = (referrals || []).reduce((sum, ref) => sum + (ref.referrer_reward || 0), 0);
      const totalTonEarnings = (tonRewards || []).reduce((sum, reward) => sum + (reward.amount || 0), 0);

      console.log('📈 Enhanced Stats:', { totalReferrals, totalEarnings, totalTonEarnings });

      return {
        totalReferrals,
        totalEarnings,
        totalTonEarnings,
        referrals: referrals || []
      };
    } catch (error) {
      console.error('❌ Error in getReferralStats:', error);
      return { totalReferrals: 0, totalEarnings: 0, totalTonEarnings: 0, referrals: [] };
    }
  }

  // Check if user was referred
  async checkUserReferralStatus(username: string): Promise<{ wasReferred: boolean; referrerUsername?: string }> {
    try {
      const { data: referral, error } = await supabase
        .from('simple_referrals')
        .select('*')
        .eq('referred_username', username)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking referral status:', error);
        return { wasReferred: false };
      }

      if (referral) {
        return { wasReferred: true, referrerUsername: referral.referrer_username };
      }

      return { wasReferred: false };
    } catch (error) {
      console.error('❌ Error in checkUserReferralStatus:', error);
      return { wasReferred: false };
    }
  }

  // Get top referrers from database with enhanced rewards
  async getTopReferrers(limit: number = 5): Promise<Array<{
    referrer_username: string;
    referral_count: number;
    total_rewards: number;
  }>> {
    try {
      console.log('🏆 Getting top referrers with enhanced rewards...');
      
      const { data, error } = await supabase
        .from('simple_referrals')
        .select('referrer_username, referrer_reward')
        .eq('verified', true);

      if (error) {
        console.error('❌ Error getting top referrers:', error);
        return [];
      }

      // Group by referrer and calculate stats
      const referrerStats = data.reduce((acc, referral) => {
        const username = referral.referrer_username;
        if (!acc[username]) {
          acc[username] = {
            referrer_username: username,
            referral_count: 0,
            total_rewards: 0
          };
        }
        acc[username].referral_count += 1;
        acc[username].total_rewards += referral.referrer_reward || 0;
        return acc;
      }, {} as Record<string, any>);

      // Convert to array and sort
      const sortedReferrers = Object.values(referrerStats)
        .sort((a: any, b: any) => b.referral_count - a.referral_count)
        .slice(0, limit);

      console.log('✅ Top referrers loaded with enhanced rewards:', sortedReferrers);
      return sortedReferrers;
    } catch (error) {
      console.error('❌ Error in getTopReferrers:', error);
      return [];
    }
  }
}

export const unifiedReferralService = UnifiedReferralService.getInstance();
