import { useState, useEffect } from 'react';
import { currencyService, CurrencyBalances } from '@/services/currencyService';
import { useTelegramUser } from './useTelegramUser';

export const useCurrency = () => {
  const [balances, setBalances] = useState<CurrencyBalances>(currencyService.getBalances());
  const { telegramUser } = useTelegramUser();

  useEffect(() => {
    const unsubscribe = currencyService.subscribe(setBalances);
    return unsubscribe;
  }, []);

  // Load balances from database when telegram user is available
  useEffect(() => {
    if (telegramUser?.id) {
      loadFromDatabase();
    }
  }, [telegramUser?.id]);

  const loadFromDatabase = async () => {
    if (telegramUser?.id) {
      const dbBalances = await currencyService.loadFromDatabase(telegramUser.id);
      setBalances(dbBalances);
    }
  };

  const addCoins = async (amount: number) => {
    await currencyService.addCoins(amount, telegramUser?.id);
  };

  const addSpaceCoins = async (amount: number) => {
    await currencyService.addSpaceCoins(amount, telegramUser?.id);
  };

  const addSpins = async (amount: number) => {
    await currencyService.addSpins(amount, telegramUser?.id);
  };

  const subtractCoins = async (amount: number) => {
    return await currencyService.subtractCoins(amount, telegramUser?.id);
  };

  const subtractSpaceCoins = async (amount: number) => {
    return await currencyService.subtractSpaceCoins(amount, telegramUser?.id);
  };

  const subtractSpins = async (amount: number) => {
    return await currencyService.subtractSpins(amount, telegramUser?.id);
  };


  return {
    balances,
    addCoins,
    addSpaceCoins,
    addSpins,
    
    subtractCoins,
    subtractSpaceCoins,
    subtractSpins,
    
    loadFromDatabase
  };
};