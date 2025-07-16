
import { useState, useEffect } from 'react';
import { spaceCoinsService } from '../services/spaceCoinsService';
import { useTelegramUser } from './useTelegramUser';

export const useSpaceCoins = () => {
  const [spaceCoins, setSpaceCoins] = useState(spaceCoinsService.getCoins());
  const { telegramUser } = useTelegramUser();

  useEffect(() => {
    const unsubscribe = spaceCoinsService.subscribe(setSpaceCoins);
    return unsubscribe;
  }, []);

  // Load coins from database when telegram user is available
  useEffect(() => {
    if (telegramUser?.id) {
      loadCoinsFromDatabase();
    }
  }, [telegramUser?.id]);

  const loadCoinsFromDatabase = async () => {
    if (telegramUser?.id) {
      const dbCoins = await spaceCoinsService.loadCoinsFromDatabase(telegramUser.id);
      setSpaceCoins(dbCoins);
    }
  };

  const addCoins = async (amount: number) => {
    await spaceCoinsService.addCoins(amount, telegramUser?.id);
  };

  const subtractCoins = async (amount: number) => {
    return await spaceCoinsService.subtractCoins(amount, telegramUser?.id);
  };

  const setCoins = async (amount: number) => {
    await spaceCoinsService.setCoins(amount, telegramUser?.id);
  };

  return {
    spaceCoins,
    addCoins,
    subtractCoins,
    setCoins,
    loadCoinsFromDatabase
  };
};
