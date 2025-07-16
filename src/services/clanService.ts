import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ClanRow = Database['public']['Tables']['clans']['Row'];
type ClanMemberRow = Database['public']['Tables']['clan_members']['Row'];

export interface Clan extends ClanRow {
  rank?: number;
  members?: number;
  totalCoins?: number;
  icon?: string;
  leader?: string;
  telegramLink?: string;
  levelName?: string;
  energyBoost?: number;
}

export interface ClanMember extends ClanMemberRow {
  username?: string;
}

export const clanService = {
  // Get all clans with their stats and levels using real view
  async getAllClans(): Promise<Clan[]> {
    try {
      console.log('Fetching all clans from real_clan_leaderboard view...');
      
      const { data, error } = await supabase
        .from('real_clan_leaderboard')
        .select('*')
        .order('rank', { ascending: true });
      
      if (error) {
        console.error('Error fetching clans:', error);
        throw error;
      }

      console.log('Raw clans data from database:', data);

      // Get clan levels for level names and boosts
      const { data: levels } = await supabase
        .from('clan_levels')
        .select('*');

      const levelMap = new Map(levels?.map(level => [level.level, level]) || []);

      const clansWithStats = (data || []).map((clan) => {
        // Get level from the clans table since it's not in the view
        const levelInfo = levelMap.get(1); // Default to level 1 if not available
        const result: Clan = {
          id: clan.id,
          name: clan.name,
          description: clan.description,
          image: clan.image,
          telegram_link: clan.telegram_link,
          leader_id: clan.leader_id,
          member_count: clan.member_count || 0,
          total_coins: clan.total_coins || 0,
          created_at: clan.created_at,
          updated_at: clan.created_at, // Use created_at as fallback
          level: 1, // Default level
          missions_completed: 0,
          weekly_energy: 0,
          daily_energy: 0,
          max_members: 20,
          energy_boost_active: false,
          boost_expires_at: null,
          logo_url: null,
          rank: clan.rank,
          members: clan.member_count || 0,
          totalCoins: clan.total_coins || 0,
          icon: clan.image ? undefined : (clan.name ? clan.name.charAt(0) : '🏛️'),
          leader: clan.leader_name || 'Unknown',
          telegramLink: clan.telegram_link || undefined,
          levelName: levelInfo?.level_name || 'Asteroid',
          energyBoost: levelInfo?.energy_boost_percentage || 0
        };
        console.log(`Processed clan ${clan.name}:`, result);
        return result;
      });

      console.log('Final processed clans:', clansWithStats);
      return clansWithStats;
    } catch (error) {
      console.error('Error in getAllClans:', error);
      return [];
    }
  },

  // Delete a clan
  async deleteClan(clanId: string): Promise<boolean> {
    try {
      console.log('Deleting clan from database:', clanId);
      
      const { error } = await supabase
        .from('clans')
        .delete()
        .eq('id', clanId);

      if (error) {
        console.error('Error deleting clan from database:', error);
        throw error;
      }

      console.log('Clan deleted from database successfully');
      return true;
    } catch (error) {
      console.error('Error deleting clan:', error);
      return false;
    }
  },

  // Create a new clan with real database storage
  async createClan(clanData: {
    name: string;
    description?: string;
    image?: string;
    telegram_link?: string;
    leader_id: string;
    leader_name: string;
  }): Promise<Clan | null> {
    try {
      console.log('Creating clan in database with data:', clanData);
      
      // Check if user is already in a clan
      const { data: existingMembership } = await supabase
        .from('clan_members')
        .select('*')
        .eq('user_id', clanData.leader_id)
        .single();

      if (existingMembership) {
        throw new Error('You are already a member of another clan. Please leave it first.');
      }

      // Create clan in database
      const { data: newClan, error: clanError } = await supabase
        .from('clans')
        .insert({
          name: clanData.name,
          description: clanData.description,
          image: clanData.image,
          telegram_link: clanData.telegram_link,
          leader_id: clanData.leader_id,
          member_count: 1,
          total_coins: 0,
          level: 1,
          missions_completed: 0,
          weekly_energy: 0,
          daily_energy: 0,
          max_members: 20,
          energy_boost_active: false
        })
        .select()
        .single();

      if (clanError) {
        console.error('Error creating clan in database:', clanError);
        throw clanError;
      }

      console.log('Clan created in database:', newClan);

      // Add leader as first member in database
      const { error: memberError } = await supabase
        .from('clan_members')
        .insert({
          clan_id: newClan.id,
          user_id: clanData.leader_id,
          role: 'leader',
          coins_contributed: 0
        });

      if (memberError) {
        console.error('Error adding leader to clan in database:', memberError);
        // Clean up the clan if member insertion failed
        await supabase.from('clans').delete().eq('id', newClan.id);
        throw memberError;
      }

      console.log('Leader added to clan database successfully');

      return {
        ...newClan,
        rank: 1,
        members: 1,
        totalCoins: 0,
        icon: newClan.image ? undefined : newClan.name.charAt(0),
        leader: clanData.leader_name,
        telegramLink: clanData.telegram_link,
        levelName: 'Asteroid',
        energyBoost: 0
      };
    } catch (error) {
      console.error('Error creating clan in database:', error);
      throw error;
    }
  },

  // Join a clan with database storage
  async joinClan(clanId: string, userId: string, username: string): Promise<boolean> {
    try {
      console.log('User joining clan in database:', { clanId, userId, username });
      
      // Check if user is already in any clan
      const { data: existingMembership } = await supabase
        .from('clan_members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingMembership) {
        if (existingMembership.clan_id === clanId) {
          console.log('User is already in this clan');
          return true;
        } else {
          throw new Error('You are already a member of another clan. Please leave it first.');
        }
      }

      // Add user to clan in database
      const { error: joinError } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanId,
          user_id: userId,
          role: 'member',
          coins_contributed: 0
        });

      if (joinError) {
        console.error('Error joining clan in database:', joinError);
        throw joinError;
      }

      // Update clan member count
      const { data: clanData } = await supabase
        .from('clans')
        .select('member_count')
        .eq('id', clanId)
        .single();

      if (clanData) {
        const { error: updateError } = await supabase
          .from('clans')
          .update({ 
            member_count: (clanData.member_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', clanId);

        if (updateError) {
          console.error('Error updating clan member count:', updateError);
        }
      }

      console.log('User joined clan in database successfully');
      return true;
    } catch (error) {
      console.error('Error joining clan in database:', error);
      throw error;
    }
  },

  // Leave a clan with database cleanup
  async leaveClan(clanId: string, userId: string): Promise<boolean> {
    try {
      console.log('User leaving clan in database:', { clanId, userId });
      
      // Check if user is the leader
      const { data: clanData } = await supabase
        .from('clans')
        .select('leader_id, member_count')
        .eq('id', clanId)
        .single();

      if (clanData?.leader_id === userId) {
        // If leader is leaving and there are other members, don't allow
        if ((clanData.member_count || 0) > 1) {
          throw new Error('As a leader, you cannot leave while there are other members. Transfer leadership or disband the clan first.');
        }
        
        // If leader is the only member, delete the clan from database
        const { error: deleteError } = await supabase
          .from('clans')
          .delete()
          .eq('id', clanId);

        if (deleteError) {
          console.error('Error deleting clan from database:', deleteError);
          throw deleteError;
        }

        console.log('Clan deleted from database as leader was the only member');
        return true;
      }

      // Regular member leaving - remove from database
      const { error: leaveError } = await supabase
        .from('clan_members')
        .delete()
        .eq('clan_id', clanId)
        .eq('user_id', userId);

      if (leaveError) {
        console.error('Error leaving clan in database:', leaveError);
        throw leaveError;
      }

      // Update clan member count
      if (clanData) {
        const { error: updateError } = await supabase
          .from('clans')
          .update({ 
            member_count: Math.max((clanData.member_count || 0) - 1, 0),
            updated_at: new Date().toISOString()
          })
          .eq('id', clanId);

        if (updateError) {
          console.error('Error updating clan member count:', updateError);
        }
      }

      console.log('User left clan in database successfully');
      return true;
    } catch (error) {
      console.error('Error leaving clan in database:', error);
      throw error;
    }
  },

  // Switch clans with database operations
  async switchClan(oldClanId: string, newClanId: string, userId: string, username: string): Promise<boolean> {
    try {
      console.log('User switching clans in database:', { oldClanId, newClanId, userId, username });
      
      // Leave old clan first
      const leftOld = await this.leaveClan(oldClanId, userId);
      if (!leftOld) {
        throw new Error('Failed to leave current clan');
      }

      // Join new clan
      const joinedNew = await this.joinClan(newClanId, userId, username);
      if (!joinedNew) {
        throw new Error('Failed to join new clan');
      }

      console.log('User switched clans in database successfully');
      return true;
    } catch (error) {
      console.error('Error switching clans in database:', error);
      throw error;
    }
  },

  // Get clan members from database
  async getClanMembers(clanId: string): Promise<ClanMember[]> {
    try {
      console.log('Fetching clan members from database for:', clanId);
      
      const { data, error } = await supabase
        .from('clan_members')
        .select(`
          *,
          profiles!clan_members_user_id_fkey(username, referral_name, earnings)
        `)
        .eq('clan_id', clanId)
        .order('coins_contributed', { ascending: false });
      
      if (error) {
        console.error('Error fetching clan members from database:', error);
        return [];
      }

      const members = (data || []).map(member => ({
        ...member,
        username: (member.profiles as any)?.referral_name || (member.profiles as any)?.username || 'Unknown'
      }));

      console.log('Clan members fetched from database:', members);
      return members;
    } catch (error) {
      console.error('Error fetching clan members from database:', error);
      return [];
    }
  },

  // Get user's clan membership from database
  async getUserClanMembership(userId: string): Promise<ClanMember | null> {
    try {
      console.log('Fetching user clan membership from database for:', userId);
      
      const { data, error } = await supabase
        .from('clan_members')
        .select(`
          *,
          clans!clan_members_clan_id_fkey(name, total_coins, member_count, image, level, missions_completed)
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user clan membership from database:', error);
        return null;
      }

      console.log('User clan membership from database:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user clan membership from database:', error);
      return null;
    }
  },

  // Get single clan by ID
  async getClanById(clanId: string): Promise<Clan | null> {
    try {
      console.log('Fetching clan by ID from database:', clanId);
      
      const { data, error } = await supabase
        .from('real_clan_leaderboard')
        .select('*')
        .eq('id', clanId)
        .single();
      
      if (error) {
        console.error('Error fetching clan by ID:', error);
        return null;
      }

      // Get clan level info
      const { data: levelData } = await supabase
        .from('clan_levels')
        .select('*')
        .eq('level', 1) // Default to level 1 since level is not in the view
        .single();

      const result: Clan = {
        id: data.id,
        name: data.name,
        description: data.description,
        image: data.image,
        telegram_link: data.telegram_link,
        leader_id: data.leader_id,
        member_count: data.member_count || 0,
        total_coins: data.total_coins || 0,
        created_at: data.created_at,
        updated_at: data.created_at, // Use created_at as fallback
        level: 1, // Default level
        missions_completed: 0,
        weekly_energy: 0,
        daily_energy: 0,
        max_members: 20,
        energy_boost_active: false,
        boost_expires_at: null,
        logo_url: null,
        rank: data.rank,
        members: data.member_count || 0,
        totalCoins: data.total_coins || 0,
        icon: data.image ? undefined : (data.name ? data.name.charAt(0) : '🏛️'),
        leader: data.leader_name || 'Unknown',
        telegramLink: data.telegram_link || undefined,
        levelName: levelData?.level_name || 'Asteroid',
        energyBoost: levelData?.energy_boost_percentage || 0
      };

      console.log('Clan fetched by ID:', result);
      return result;
    } catch (error) {
      console.error('Error fetching clan by ID:', error);
      return null;
    }
  },

  // Calculate mining bonus for clan members (base 20% + level bonus)
  getMiningBonus(isClanMember: boolean, clanLevel?: number, energyBoostActive?: boolean): number {
    if (!isClanMember) return 1.0;
    
    let bonus = 1.2; // Base 20% bonus
    
    // Add level-based energy boost if active
    if (energyBoostActive && clanLevel) {
      const levelBonus = clanLevel * 0.05; // 5% per level
      bonus += levelBonus;
    }
    
    return bonus;
  }
};
