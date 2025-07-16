
import { useState, useEffect } from 'react';
import { characterMiningService } from '../services/characterMiningService';
import { leaderboardService } from '../services/leaderboardService';
import { clanService } from '../services/clanService';
import { useTelegramUser } from './useTelegramUser';
import { useToast } from '@/hooks/use-toast';

export const useMiningState = () => {
  const [isMining, setIsMining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalMined, setTotalMined] = useState(0);
  const [miningStartTime, setMiningStartTime] = useState<number | null>(null);
  const [userClanMembership, setUserClanMembership] = useState<any>(null);
  const [miningBonus, setMiningBonus] = useState(1.0);
  const { telegramUser, userProfile } = useTelegramUser();
  const { toast } = useToast();

  const maxDuration = 28800; // 8 hours

  useEffect(() => {
    initializeUserData();
    // Clean up expired sessions on load
    characterMiningService.cleanupExpiredSessions();
    checkMiningStatus();
    
    const handleMiningCompleted = (event: CustomEvent) => {
      const { characterId, coinsEarned } = event.detail;
      console.log('Mining completed for character:', characterId, 'Coins:', coinsEarned);
      toast({
        title: "التعدين مكتمل!",
        description: `تم كسب ${formatCoins(coinsEarned)} عملة أثناء غيابك!`,
      });
      checkMiningStatus();
    };

    window.addEventListener('miningCompleted', handleMiningCompleted as EventListener);

    const statusInterval = setInterval(() => {
      checkMiningStatus();
    }, 1000);

    return () => {
      window.removeEventListener('miningCompleted', handleMiningCompleted as EventListener);
      clearInterval(statusInterval);
    };
  }, []);

  const initializeUserData = async () => {
    try {
      if (telegramUser) {
        await leaderboardService.initializeCurrentUser(telegramUser);
        
        if (userProfile?.id) {
          const clanMembership = await clanService.getUserClanMembership(userProfile.id);
          setUserClanMembership(clanMembership);
          const bonus = clanService.getMiningBonus(!!clanMembership);
          setMiningBonus(bonus);
          console.log(`Mining bonus: ${bonus}x ${clanMembership ? '(Clan Member)' : '(No Clan)'}`);
        }
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };

  const checkMiningStatus = () => {
    const miningStatus = characterMiningService.getActiveMiningStatus();
    const mainCharacterId = 'main';
    
    if (miningStatus[mainCharacterId]) {
      const status = miningStatus[mainCharacterId];
      setIsMining(status.isActive);
      setTimeLeft(Math.round(status.timeRemaining));
      setTotalMined(status.currentCoinsEarned || 0);
      
      if (status.isActive && status.timeRemaining > 0) {
        const calculatedStartTime = Date.now() - ((maxDuration - status.timeRemaining) * 1000);
        setMiningStartTime(calculatedStartTime);
      }
    } else {
      setIsMining(false);
      setTimeLeft(0);
      setTotalMined(0);
      setMiningStartTime(null);
    }
  };

  const formatCoins = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    } else {
      return Math.round(amount * 100) / 100;
    }
  };

  return {
    isMining,
    timeLeft,
    totalMined,
    miningStartTime,
    userClanMembership,
    miningBonus,
    maxDuration,
    setIsMining,
    setTimeLeft,
    setTotalMined,
    setMiningStartTime,
    checkMiningStatus,
    formatCoins
  };
};
