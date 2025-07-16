
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import { formatCoins, getUserLevel } from '@/utils/levelSystem';

interface CompactUserCardProps {
  userDisplayName: string;
  userAvatarFallback: string;
  userCoins: number;
  userRank: number;
  userPhoto: string | null;
}

const CompactUserCard = ({ 
  userDisplayName, 
  userAvatarFallback, 
  userCoins, 
  userRank,
  userPhoto 
}: CompactUserCardProps) => {
  const userLevel = getUserLevel(userCoins);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-3 mx-4 mb-4"
    >
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="relative">
          <div className="w-12 h-12 aspect-square rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center overflow-hidden">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={userDisplayName} 
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {userAvatarFallback}
              </span>
            )}
          </div>
          {/* Level Badge */}
          <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-1.5 py-0.5 text-xs font-bold text-white">
            L{userLevel.id}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate mb-1">
            {userDisplayName}
          </h3>
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-medium text-xs">
              {userLevel.name}
            </span>
          </div>
        </div>

        {/* Coins and Rank */}
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
            <span className="text-white font-semibold text-xs">
              {formatCoins(userCoins)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-xs">
              #{userRank || '---'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompactUserCard;
