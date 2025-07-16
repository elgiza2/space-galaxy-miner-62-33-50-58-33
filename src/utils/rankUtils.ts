
import { Crown, Trophy } from 'lucide-react';

export const getRankIcon = (rank: number | null) => {
  if (!rank) return null;
  
  switch (rank) {
    case 1: return Crown;
    case 2: return Trophy;
    case 3: return Trophy;
    default: return null;
  }
};

export const getRankColor = (rank: number | null) => {
  if (!rank) return 'from-gray-600/20 to-gray-700/20 border-gray-600/30';
  
  switch (rank) {
    case 1: return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    case 3: return 'from-orange-400/20 to-red-500/20 border-orange-400/30';
    default: return 'from-gray-600/20 to-gray-700/20 border-gray-600/30';
  }
};

export const getRankIconColor = (rank: number | null) => {
  if (!rank) return 'text-gray-400';
  
  switch (rank) {
    case 1: return 'text-yellow-400';
    case 2: return 'text-gray-300';
    case 3: return 'text-orange-400';
    default: return 'text-gray-400';
  }
};
