
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCoins, getUserLevel } from '@/utils/levelSystem';
import { getDisplayName, getAvatarFallback } from '@/utils/formatters';
import type { Database } from '@/integrations/supabase/types';

type RealUserLeaderboard = Database['public']['Views']['real_user_leaderboard']['Row'];

interface UserLeaderboardCardProps {
  user: RealUserLeaderboard;
  index: number;
}

const UserLeaderboardCard = ({ user, index }: UserLeaderboardCardProps) => {
  const rank = index + 1;
  const displayName = getDisplayName(user);
  const userLevel = getUserLevel(user.coins || 0);

  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-yellow-400" />;
      case 2: return <Medal className="w-4 h-4 text-gray-300" />;
      case 3: return <Medal className="w-4 h-4 text-orange-400" />;
      default: return <span className="text-white/60 font-bold text-sm">{rank}</span>;
    }
  };

  const getRankBg = () => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 2: return 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30';
      case 3: return 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border-orange-400/30';
      default: return 'bg-black/40 border-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`${getRankBg()} backdrop-blur-sm rounded-xl p-3 border hover:bg-black/60 transition-all duration-200`}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
          {getRankIcon()}
        </div>

        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photo_url || undefined} />
          <AvatarFallback className="bg-white/10 text-white font-semibold text-sm">
            {getAvatarFallback(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate text-sm">
            {displayName}
          </p>
          <p className="text-white/60 text-xs">
            {userLevel.name}
          </p>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-600" />
          <span className="text-white font-bold text-sm">
            {formatCoins(user.coins || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default UserLeaderboardCard;
