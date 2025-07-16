
export interface Ticket {
  id: string;
  purchasedAt: number;
  used: boolean;
}

export interface DailyLoginReward {
  day: number;
  spaceReward: number;
  tonReward?: number;
  claimed: boolean;
}

export interface DailyLoginStreak {
  currentDay: number;
  lastLoginDate: string;
  claimedToday: boolean;
  streakBroken: boolean;
  totalSpaceEarned: number;
  totalTonEarned: number;
}
