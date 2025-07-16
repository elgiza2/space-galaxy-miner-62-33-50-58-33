
export interface Level {
  id: number;
  name: string;
  minCoins: number;
  maxCoins: number;
  color: string;
  bgColor: string;
}

export const LEVELS: Level[] = [
  { id: 1, name: 'Silver', minCoins: 0, maxCoins: 50000, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { id: 2, name: 'Gold', minCoins: 50001, maxCoins: 100000, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 3, name: 'Platinum', minCoins: 100001, maxCoins: 150000, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 4, name: 'Diamond', minCoins: 150001, maxCoins: 200000, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 5, name: 'Epic', minCoins: 200001, maxCoins: 250000, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { id: 6, name: 'Legendary', minCoins: 250001, maxCoins: 300000, color: 'text-red-600', bgColor: 'bg-red-100' },
  { id: 7, name: 'Master', minCoins: 300001, maxCoins: 350000, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { id: 8, name: 'Grandmaster', minCoins: 350001, maxCoins: 400000, color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 9, name: 'Lord', minCoins: 400001, maxCoins: Infinity, color: 'text-black', bgColor: 'bg-gradient-to-r from-yellow-400 to-red-600' }
];

export const getUserLevel = (coins: number): Level => {
  const level = LEVELS.find(level => coins >= level.minCoins && coins <= level.maxCoins);
  return level || LEVELS[0];
};

export const getMiningRate = (level: number): number => {
  return level * 50000; // Each level increases mining rate by 50,000
};

export const formatCoins = (amount: number): string | number => {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + 'B';
  } else if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  } else {
    return amount;
  }
};
