
import { supabase } from '@/integrations/supabase/client';
import { DailyLoginStreak, DailyLoginReward } from '@/types';

class DailyLoginStreakService {
  private static instance: DailyLoginStreakService;

  private constructor() {}

  static getInstance(): DailyLoginStreakService {
    if (!DailyLoginStreakService.instance) {
      DailyLoginStreakService.instance = new DailyLoginStreakService();
    }
    return DailyLoginStreakService.instance;
  }

  private getTodayDateString(): string {
    return new Date().toDateString();
  }

  private getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
  }

  async getStreakData(telegramId: number): Promise<DailyLoginStreak> {
    try {
      const { data, error } = await supabase
        .rpc('get_daily_login_streak', { p_telegram_id: telegramId });

      if (error) {
        console.error('Error getting streak data:', error);
        return this.getDefaultStreakData();
      }

      // Type the response data properly
      const responseData = data as any;
      
      return {
        currentDay: responseData?.currentDay || 1,
        lastLoginDate: responseData?.lastLoginDate || '',
        claimedToday: responseData?.claimedToday || false,
        streakBroken: responseData?.streakBroken || false,
        totalSpaceEarned: responseData?.totalSpaceEarned || 0,
        totalTonEarned: responseData?.totalTonEarned || 0
      };
    } catch (error) {
      console.error('Error in getStreakData:', error);
      return this.getDefaultStreakData();
    }
  }

  private getDefaultStreakData(): DailyLoginStreak {
    return {
      currentDay: 1,
      lastLoginDate: '',
      claimedToday: false,
      streakBroken: false,
      totalSpaceEarned: 0,
      totalTonEarned: 0
    };
  }

  async claimDailyReward(telegramId: number): Promise<{ 
    spaceReward: number; 
    tonReward?: number; 
    success: boolean; 
    message: string; 
  }> {
    try {
      const streakData = await this.getStreakData(telegramId);
      
      if (streakData.claimedToday) {
        return {
          spaceReward: 0,
          success: false,
          message: 'Already claimed today'
        };
      }

      const { data, error } = await supabase
        .rpc('claim_daily_login_reward', { 
          p_telegram_id: telegramId,
          p_day: streakData.currentDay 
        });

      if (error) {
        console.error('Error claiming daily reward:', error);
        return {
          spaceReward: 0,
          success: false,
          message: 'Failed to claim reward'
        };
      }

      // Type the response data properly
      const responseData = data as any;

      return {
        spaceReward: responseData?.space_reward || 0,
        tonReward: responseData?.bonus_ton || undefined,
        success: responseData?.success || false,
        message: responseData?.message || 'Reward claimed successfully'
      };
    } catch (error) {
      console.error('Error in claimDailyReward:', error);
      return {
        spaceReward: 0,
        success: false,
        message: 'An error occurred'
      };
    }
  }

  getSpaceRewardForDay(day: number): number {
    const rewards = [1000, 2000, 3000, 5000, 7000, 10000, 15000];
    return rewards[day - 1] || 1000;
  }

  getTonRewardForDay(day: number): number {
    return day === 7 ? 0.2 : 0;
  }

  getDailyRewards(): DailyLoginReward[] {
    return Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;
      return {
        day,
        spaceReward: this.getSpaceRewardForDay(day),
        tonReward: day === 7 ? 0.2 : undefined,
        claimed: false
      };
    });
  }

  getTimeUntilReset(): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeDiff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }
}

export const dailyLoginStreakService = DailyLoginStreakService.getInstance();
