// This file is deprecated - use dailyLoginStreakService.ts instead
// Keeping for backward compatibility temporarily

interface DailyStreakData {
  currentDay: number;
  lastLoginDate: string;
  streakBroken: boolean;
  claimedToday: boolean;
  totalSpaceEarned: number;
  totalTicketsEarned: number;
}

class DailyStreakService {
  private static instance: DailyStreakService;

  private constructor() {}

  static getInstance(): DailyStreakService {
    if (!DailyStreakService.instance) {
      DailyStreakService.instance = new DailyStreakService();
    }
    return DailyStreakService.instance;
  }

  private getTodayDateString(): string {
    return new Date().toDateString();
  }

  private getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
  }

  getStreakData(): DailyStreakData {
    const stored = localStorage.getItem('dailyStreak');
    const defaultData: DailyStreakData = {
      currentDay: 1,
      lastLoginDate: '',
      streakBroken: false,
      claimedToday: false,
      totalSpaceEarned: 0,
      totalTicketsEarned: 0
    };

    if (!stored) {
      return defaultData;
    }

    try {
      const data: DailyStreakData = JSON.parse(stored);
      return this.validateAndUpdateStreak(data);
    } catch {
      return defaultData;
    }
  }

  private validateAndUpdateStreak(data: DailyStreakData): DailyStreakData {
    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();

    if (data.lastLoginDate === today) {
      return data;
    }

    if (data.lastLoginDate === yesterday) {
      return {
        ...data,
        claimedToday: false,
        streakBroken: false
      };
    }

    if (data.lastLoginDate && data.lastLoginDate !== today && data.lastLoginDate !== yesterday) {
      return {
        ...data,
        currentDay: 1,
        claimedToday: false,
        streakBroken: true
      };
    }

    return data;
  }

  claimDailyReward(): { spaceReward: number; ticketReward: number; bonusTon?: number } {
    const data = this.getStreakData();
    
    if (data.claimedToday) {
      throw new Error('Already claimed today');
    }

    const spaceReward = this.getSpaceRewardForDay(data.currentDay);
    const ticketReward = 1;
    const bonusTon = data.currentDay === 7 ? 0.1 : undefined;

    const newData: DailyStreakData = {
      ...data,
      lastLoginDate: this.getTodayDateString(),
      claimedToday: true,
      currentDay: data.currentDay < 7 ? data.currentDay + 1 : 1,
      streakBroken: false,
      totalSpaceEarned: data.totalSpaceEarned + spaceReward,
      totalTicketsEarned: data.totalTicketsEarned + ticketReward
    };

    localStorage.setItem('dailyStreak', JSON.stringify(newData));
    return { spaceReward, ticketReward, bonusTon };
  }

  getSpaceRewardForDay(day: number): number {
    const rewards = [100, 250, 500, 1000, 2500, 5000, 10000];
    return rewards[day - 1] || 100;
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

  resetStreakBrokenFlag(): void {
    const data = this.getStreakData();
    const newData: DailyStreakData = {
      ...data,
      streakBroken: false
    };
    localStorage.setItem('dailyStreak', JSON.stringify(newData));
  }
}

export const dailyStreakService = DailyStreakService.getInstance();
