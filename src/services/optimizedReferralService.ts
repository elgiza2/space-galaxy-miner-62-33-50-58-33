
import { supabase } from '@/integrations/supabase/client';

interface TopReferrerData {
  referrer_username: string;
  total_referrals: number;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  referral_name?: string;
}

class OptimizedReferralService {
  private static instance: OptimizedReferralService;

  private constructor() {}

  static getInstance(): OptimizedReferralService {
    if (!OptimizedReferralService.instance) {
      OptimizedReferralService.instance = new OptimizedReferralService();
    }
    return OptimizedReferralService.instance;
  }

  // Get accurate top referrers using manual aggregation with pagination
  async getTopReferrersOptimized(limit: number = 10): Promise<TopReferrerData[]> {
    try {
      console.log('🔄 Getting optimized top referrers...');
      
      // First, get total count to better estimate batches
      const { count: totalCount } = await supabase
        .from('simple_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);
      
      console.log(`📊 Total verified referrals in system: ${totalCount}`);
      
      // Get all referrals with pagination to avoid 1000 limit
      const allReferrals: any[] = [];
      let hasMore = true;
      let offset = 0;
      const batchSize = 1000;

      while (hasMore) {
        console.log(`📥 Fetching batch ${offset / batchSize + 1}...`);
        
        const { data: batch, error } = await supabase
          .from('simple_referrals')
          .select('referrer_username, verified')
          .eq('verified', true)
          .range(offset, offset + batchSize - 1);

        if (error) {
          console.error('❌ Error fetching batch:', error);
          break;
        }

        if (!batch || batch.length === 0) {
          hasMore = false;
          break;
        }

        allReferrals.push(...batch);
        
        if (batch.length < batchSize) {
          hasMore = false;
        } else {
          offset += batchSize;
        }
      }

      console.log(`📊 Total referrals fetched: ${allReferrals.length}`);

      // Aggregate referrals by username
      const referrerCounts = allReferrals.reduce((acc: any, referral: any) => {
        const username = referral.referrer_username;
        acc[username] = (acc[username] || 0) + 1;
        return acc;
      }, {});

      // Sort and get top referrers (fetch more than needed for better matching)
      const sortedReferrers = Object.entries(referrerCounts)
        .map(([username, count]: [string, any]) => ({
          referrer_username: username,
          total_referrals: count
        }))
        .sort((a, b) => b.total_referrals - a.total_referrals)
        .slice(0, Math.max(limit * 3, 100)); // Get 3x more for better profile matching

      console.log('🔍 Top referrers before profile matching:', sortedReferrers.slice(0, 10));

      // Get profile data with enhanced matching strategies
      const topUsernames = sortedReferrers.map(r => r.referrer_username);
      
      // Enhanced profile queries with better coverage
      const profileQueries = await Promise.all([
        // Query by referral_name
        supabase
          .from('profiles')
          .select('id, first_name, last_name, photo_url, referral_name, username')
          .in('referral_name', topUsernames),
        // Query by username
        supabase
          .from('profiles')
          .select('id, first_name, last_name, photo_url, referral_name, username')
          .in('username', topUsernames),
        // Query by first_name (in case referrer_username matches first_name)
        supabase
          .from('profiles')
          .select('id, first_name, last_name, photo_url, referral_name, username')
          .in('first_name', topUsernames),
        // Additional query with ILIKE for partial matches
        supabase
          .from('profiles')
          .select('id, first_name, last_name, photo_url, referral_name, username')
          .or(topUsernames.map(username => `referral_name.ilike.%${username}%`).join(','))
      ]);

      // Combine all profile results and remove duplicates
      const allProfiles = new Map();
      profileQueries.forEach(({ data: profiles }) => {
        if (profiles) {
          profiles.forEach(profile => {
            // Use profile ID as key to avoid duplicates
            allProfiles.set(profile.id, profile);
          });
        }
      });

      const combinedProfiles = Array.from(allProfiles.values());
      console.log('📋 Found profiles:', combinedProfiles.length);

      // Enhanced matching with fuzzy logic
      const result = sortedReferrers.map(referrer => {
        const profile = combinedProfiles.find(p => {
          // Enhanced matching strategies
          const exact = (
            p.referral_name === referrer.referrer_username ||
            p.username === referrer.referrer_username ||
            p.first_name === referrer.referrer_username
          );
          
          const caseInsensitive = p.referral_name && p.referral_name.toLowerCase() === referrer.referrer_username.toLowerCase() ||
                                  p.username && p.username.toLowerCase() === referrer.referrer_username.toLowerCase() ||
                                  p.first_name && p.first_name.toLowerCase() === referrer.referrer_username.toLowerCase();
          
          // Partial matching for better coverage
          const partial = p.referral_name && (
            p.referral_name.toLowerCase().includes(referrer.referrer_username.toLowerCase()) ||
            referrer.referrer_username.toLowerCase().includes(p.referral_name.toLowerCase())
          );
          
          return exact || caseInsensitive || partial;
        });
        
        return {
          ...referrer,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          photo_url: profile?.photo_url,
          referral_name: profile?.referral_name || referrer.referrer_username
        };
      });

      // Filter and sort to get the best matches first
      const finalResult = result
        .filter(r => r.total_referrals > 0) // Only users with referrals
        .sort((a, b) => {
          // Prioritize users with profile data and higher referral counts
          const aHasProfile = !!(a.first_name || a.last_name || a.photo_url);
          const bHasProfile = !!(b.first_name || b.last_name || b.photo_url);
          
          if (aHasProfile && !bHasProfile) return -1;
          if (!aHasProfile && bHasProfile) return 1;
          
          return b.total_referrals - a.total_referrals;
        })
        .slice(0, limit);

      // Log detailed information for debugging
      const unmatched = result.filter(r => !r.first_name && !r.last_name).slice(0, 10);
      if (unmatched.length > 0) {
        console.log('⚠️ Unmatched referrers (first 10):', unmatched.map(u => ({
          username: u.referrer_username,
          referrals: u.total_referrals
        })));
      }

      const matched = finalResult.filter(r => r.first_name || r.last_name);
      console.log(`✅ Final result: ${finalResult.length} users (${matched.length} with profiles)`);
      console.log('📊 Top 3 with referral counts:', finalResult.slice(0, 3).map(r => ({
        name: r.first_name || r.referral_name,
        referrals: r.total_referrals
      })));
      
      return finalResult;

    } catch (error) {
      console.error('❌ Error in getTopReferrersOptimized:', error);
      return [];
    }
  }

  // Get total referrals count for a specific user
  async getUserReferralCount(username: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('simple_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_username', username)
        .eq('verified', true);

      if (error) {
        console.error('❌ Error counting user referrals:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Error in getUserReferralCount:', error);
      return 0;
    }
  }

  // Debug function to check specific user
  async debugUserReferrals(username: string): Promise<any> {
    try {
      console.log(`🔍 Debugging referrals for user: ${username}`);
      
      // Check referrals
      const { data: referrals, error: refError } = await supabase
        .from('simple_referrals')
        .select('*')
        .eq('referrer_username', username)
        .eq('verified', true);

      console.log(`📊 Found ${referrals?.length || 0} referrals for ${username}`);

      // Check profile
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .or(`referral_name.eq.${username},username.eq.${username},first_name.eq.${username}`);

      console.log(`👤 Found ${profiles?.length || 0} profile matches for ${username}`);
      if (profiles && profiles.length > 0) {
        console.log('Profile data:', profiles[0]);
      }

      return {
        referrals: referrals || [],
        profiles: profiles || [],
        referralCount: referrals?.length || 0
      };
    } catch (error) {
      console.error('❌ Debug error:', error);
      return { referrals: [], profiles: [], referralCount: 0 };
    }
  }
}

export const optimizedReferralService = OptimizedReferralService.getInstance();
