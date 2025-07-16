
import { useState, useEffect } from 'react';
import { clanService, type ClanMember } from '@/services/clanService';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import type { Database } from '@/integrations/supabase/types';

type RealClanLeaderboard = Database['public']['Views']['real_clan_leaderboard']['Row'];

export const useClanMembership = () => {
  const [userClanMembership, setUserClanMembership] = useState<ClanMember | null>(null);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const { toast } = useToast();
  const { telegramUser, userProfile } = useTelegramUser();

  const loadUserClanMembership = async () => {
    if (!userProfile?.id) {
      console.log('No user profile ID available for clan membership check');
      return;
    }
    
    try {
      console.log('Loading user clan membership from database for user:', userProfile.id);
      const membership = await clanService.getUserClanMembership(userProfile.id);
      console.log('User clan membership from database:', membership);
      setUserClanMembership(membership);
    } catch (error) {
      console.error('Error loading user clan membership:', error);
    }
  };

  const handleJoinClan = async (clan: RealClanLeaderboard, onSuccess?: () => void) => {
    if (!userProfile?.id) {
      toast({
        title: "Profile Required",
        description: "Please ensure your profile is loaded",
        variant: "destructive"
      });
      return;
    }

    if (isUserInClan(clan.id)) {
      toast({
        title: "Already Joined",
        description: "You are already a member of this clan",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(clan.id);

    try {
      console.log('Attempting to join clan:', clan.name, 'ID:', clan.id);
      let success = false;

      if (userClanMembership) {
        console.log('User is in another clan, switching...');
        success = await clanService.switchClan(
          userClanMembership.clan_id,
          clan.id,
          userProfile.id,
          userProfile.username || telegramUser?.username || 'Unknown'
        );
        
        if (success) {
          toast({
            title: "Switched Clans Successfully!",
            description: `You have left your previous clan and joined "${clan.name}". You still get a 20% mining bonus!`,
            duration: 5000,
          });
        }
      } else {
        console.log('User not in any clan, joining directly...');
        success = await clanService.joinClan(
          clan.id,
          userProfile.id,
          userProfile.username || telegramUser?.username || 'Unknown'
        );

        if (success) {
          toast({
            title: "Joined Clan Successfully!",
            description: `Welcome to "${clan.name}". You now get a 20% mining bonus!`,
            duration: 5000,
          });
        }
      }

      if (success) {
        console.log('Clan join/switch successful, refreshing data...');
        await loadUserClanMembership();
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Join Failed",
          description: "Failed to join clan. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error joining clan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while trying to join the clan",
        variant: "destructive"
      });
    } finally {
      setIsJoining(null);
    }
  };

  const isUserInClan = (clanId: string | null) => {
    return userClanMembership?.clan_id === clanId;
  };

  useEffect(() => {
    if (userProfile?.id) {
      loadUserClanMembership();
    }
  }, [userProfile?.id]);

  return {
    userClanMembership,
    isJoining,
    handleJoinClan,
    isUserInClan,
    loadUserClanMembership
  };
};
