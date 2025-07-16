
import { useState, useEffect } from 'react';
import { telegramUserService } from '@/services/telegramUserService';
import { leaderboardService } from '@/services/leaderboardService';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export const useTelegramUser = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // محاولة جلب البيانات من localStorage أولاً
      const cachedTelegramUser = localStorage.getItem('telegramUser');
      const cachedUserProfile = localStorage.getItem('userProfile');

      if (cachedTelegramUser && cachedUserProfile) {
        const tgUser = JSON.parse(cachedTelegramUser);
        const profile = JSON.parse(cachedUserProfile);
        setTelegramUser(tgUser);
        setUserProfile(profile);
        console.log('Loaded cached user data with photo:', profile.photo_url);
      }

      // تهيئة جلسة المستخدم من Telegram
      const profile = await telegramUserService.initializeUserSession();
      
      if (profile) {
        setUserProfile(profile);
        const tgUser = telegramUserService.getCurrentTelegramUser();
        if (tgUser) {
          setTelegramUser(tgUser);
          // Initialize/sync user data in leaderboard
          await leaderboardService.initializeCurrentUser(tgUser);
          console.log('Initialized user with photo:', tgUser.photo_url);
        }
      } else {
        setError('Failed to initialize user session');
      }
    } catch (err) {
      console.error('Error initializing user:', err);
      setError('Error initializing user session');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (telegramUser) {
      try {
        const updatedProfile = await telegramUserService.registerTelegramUser(telegramUser);
        if (updatedProfile) {
          setUserProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          // Sync with leaderboard
          await leaderboardService.initializeCurrentUser(telegramUser);
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
        setError('Error refreshing user data');
      }
    }
  };

  const getUserDisplayName = (): string => {
    if (telegramUser) {
      return telegramUserService.getFullName(telegramUser);
    }
    return userProfile?.referral_name || 'Unknown User';
  };

  const getUserPhoto = (): string | null => {
    if (telegramUser) {
      return telegramUserService.getTelegramUserPhoto(telegramUser);
    }
    return userProfile?.photo_url || null;
  };

  return {
    userProfile,
    telegramUser,
    isLoading,
    error,
    refreshUserData,
    getUserDisplayName,
    getUserPhoto,
    initializeUser
  };
};
