import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';

interface MiningSession {
  characterId: string;
  startTime: number;
  miningRate: number; // Space coins per hour
  isActive: boolean;
  lastCollected: number;
}

interface CharacterUpgrade {
  level: number;
  upgrades: number;
  miningRate: number;
}

const MINING_STORAGE_KEY = 'realTimeMining';
const CHARACTER_UPGRADES_KEY = 'characterUpgrades';

export const useRealTimeMining = () => {
  const [miningSession, setMiningSession] = useState<MiningSession | null>(null);
  const [characterUpgrade, setCharacterUpgrade] = useState<CharacterUpgrade>(() => {
    const stored = localStorage.getItem(CHARACTER_UPGRADES_KEY);
    return stored ? JSON.parse(stored) : {
      level: 1,
      upgrades: 0,
      miningRate: 100 // Starting rate: 100 space coins per hour
    };
  });
  const [accumulatedCoins, setAccumulatedCoins] = useState(0);
  const { toast } = useToast();
  const { addCoins } = useSpaceCoins();

  // Load mining session from localStorage and auto-start mining
  useEffect(() => {
    const stored = localStorage.getItem(MINING_STORAGE_KEY);
    if (stored) {
      const session: MiningSession = JSON.parse(stored);
      if (session.isActive) {
        setMiningSession(session);
        calculateAccumulatedCoins(session);
      } else {
        // Auto-start mining if no active session
        startAutoMining();
      }
    } else {
      // Start mining automatically if no session exists
      startAutoMining();
    }
  }, []);

  // Auto-start mining function
  const startAutoMining = () => {
    const now = Date.now();
    const newSession: MiningSession = {
      characterId: 'main_character',
      startTime: now,
      lastCollected: now,
      miningRate: characterUpgrade.miningRate,
      isActive: true
    };

    setMiningSession(newSession);
    localStorage.setItem(MINING_STORAGE_KEY, JSON.stringify(newSession));
  };

  // Save character upgrades to localStorage
  useEffect(() => {
    localStorage.setItem(CHARACTER_UPGRADES_KEY, JSON.stringify(characterUpgrade));
  }, [characterUpgrade]);

  // Calculate accumulated coins based on time passed
  const calculateAccumulatedCoins = useCallback((session: MiningSession) => {
    if (!session.isActive) return 0;
    
    const now = Date.now();
    const timePassed = now - session.lastCollected;
    const hoursPass = timePassed / (1000 * 60 * 60); // Convert to hours
    const coinsEarned = Math.floor(hoursPass * session.miningRate);
    
    setAccumulatedCoins(coinsEarned);
    return coinsEarned;
  }, []);

  // Update accumulated coins every second
  useEffect(() => {
    if (!miningSession?.isActive) return;

    const interval = setInterval(() => {
      calculateAccumulatedCoins(miningSession);
    }, 1000);

    return () => clearInterval(interval);
  }, [miningSession, calculateAccumulatedCoins]);

  // Start mining
  const startMining = useCallback(() => {
    const now = Date.now();
    const newSession: MiningSession = {
      characterId: 'main_character',
      startTime: now,
      lastCollected: now,
      miningRate: characterUpgrade.miningRate,
      isActive: true
    };

    setMiningSession(newSession);
    localStorage.setItem(MINING_STORAGE_KEY, JSON.stringify(newSession));
    
    toast({
      title: "Mining Started! 🚀",
      description: `Mining at ${characterUpgrade.miningRate} Space coins/hour`,
    });
  }, [characterUpgrade.miningRate, toast]);

  // Collect accumulated coins
  const collectCoins = useCallback(async () => {
    if (!miningSession || accumulatedCoins <= 0) return;

    try {
      await addCoins(accumulatedCoins);
      
      const updatedSession = {
        ...miningSession,
        lastCollected: Date.now()
      };
      
      setMiningSession(updatedSession);
      localStorage.setItem(MINING_STORAGE_KEY, JSON.stringify(updatedSession));
      setAccumulatedCoins(0);
      
      toast({
        title: "Coins Collected! 💰",
        description: `+${accumulatedCoins} Space coins`,
      });
    } catch (error) {
      console.error('Error collecting coins:', error);
      toast({
        title: "Error",
        description: "Failed to collect coins",
        variant: "destructive"
      });
    }
  }, [miningSession, accumulatedCoins, addCoins, toast]);

  // Stop mining
  const stopMining = useCallback(() => {
    if (miningSession) {
      const stoppedSession = { ...miningSession, isActive: false };
      setMiningSession(stoppedSession);
      localStorage.setItem(MINING_STORAGE_KEY, JSON.stringify(stoppedSession));
    }
  }, [miningSession]);

  // Upgrade character
  const upgradeCharacter = useCallback((cost: number, coinsBalance: number) => {
    if (coinsBalance < cost) {
      toast({
        title: "Insufficient Coins!",
        description: `You need ${cost} coins to upgrade`,
        variant: "destructive"
      });
      return false;
    }

    const newUpgrade = { ...characterUpgrade };
    newUpgrade.upgrades += 1;

    // Every 12 upgrades = level up with bigger mining bonus
    if (newUpgrade.upgrades >= 12) {
      newUpgrade.level += 1;
      newUpgrade.upgrades = 0;
      newUpgrade.miningRate = Math.floor(newUpgrade.miningRate * 1.5); // 50% boost on level up
    } else {
      newUpgrade.miningRate = Math.floor(newUpgrade.miningRate * 1.1); // 10% boost per upgrade
    }

    setCharacterUpgrade(newUpgrade);

    // Update active mining session with new rate
    if (miningSession?.isActive) {
      const updatedSession = {
        ...miningSession,
        miningRate: newUpgrade.miningRate
      };
      setMiningSession(updatedSession);
      localStorage.setItem(MINING_STORAGE_KEY, JSON.stringify(updatedSession));
    }

    toast({
      title: "Character Upgraded! ⬆️",
      description: `New mining rate: ${newUpgrade.miningRate}/hour`,
    });

    return true;
  }, [characterUpgrade, miningSession, toast]);

  // Calculate upgrade cost
  const getUpgradeCost = useCallback(() => {
    const baseCost = 500;
    const levelMultiplier = characterUpgrade.level;
    const upgradeMultiplier = Math.pow(1.5, characterUpgrade.upgrades);
    return Math.floor(baseCost * levelMultiplier * upgradeMultiplier);
  }, [characterUpgrade]);

  return {
    miningSession,
    characterUpgrade,
    accumulatedCoins,
    startMining,
    collectCoins,
    stopMining,
    upgradeCharacter,
    getUpgradeCost,
    isActive: miningSession?.isActive || false
  };
};