
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCoins, getUserLevel } from '@/utils/levelSystem';
import type { Database } from '@/integrations/supabase/types';

type RealUserLeaderboard = Database['public']['Views']['real_user_leaderboard']['Row'];

interface CompactLeaderboardListProps {
  topUsers: RealUserLeaderboard[];
  selectedLevel: number;
  isLoading: boolean;
}

const CompactLeaderboardList = ({ 
  topUsers, 
  selectedLevel, 
  isLoading 
}: CompactLeaderboardListProps) => {
  
  // Filter and sort users by selected level, then get top 50
  const filteredUsers = topUsers
    .filter(user => {
      const userLevel = getUserLevel(user.coins || 0);
      return userLevel.id === selectedLevel;
    })
    .sort((a, b) => (b.coins || 0) - (a.coins || 0))
    .slice(0, 50);

  const getDisplayName = (user: RealUserLeaderboard) => {
    if (user.first_name) return user.first_name;
    if (user.username) return user.username;
    if (user.referral_name) return user.referral_name;
    return 'Unknown User';
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { text: '🥇', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' };
    if (index === 1) return { text: '🥈', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' };
    if (index === 2) return { text: '🥉', color: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' };
    return { text: `#${index + 1}`, color: 'bg-black/70 backdrop-blur-sm border border-white/20' };
  };

  if (isLoading) {
    return (
      <div className="space-y-1.5 px-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-10 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 px-4"
      >
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white/70" />
        </div>
        
        <h3 className="text-sm font-semibold text-white/80 mb-1">
          No players at this level
        </h3>
        <p className="text-white/60 text-xs">
          Be the first to reach this level!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="px-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Top Players</h3>
        </div>
        <Badge variant="secondary" className="text-xs bg-black/50 backdrop-blur-sm text-white border border-white/20">
          <Users className="w-3 h-3 mr-1" />
          {filteredUsers.length}
        </Badge>
      </div>
      
      <div className="space-y-1">
        {filteredUsers.map((user, index) => {
          const rankBadge = getRankBadge(index);
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-black/40 backdrop-blur-md rounded-lg p-2.5 border border-white/10 hover:bg-black/60 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5">
                {/* Rank Badge */}
                <div className={`w-6 h-6 rounded-full ${rankBadge.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {rankBadge.text}
                </div>

                {/* Avatar */}
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.photo_url || undefined} alt={getDisplayName(user)} />
                  <AvatarFallback className="bg-black/60 backdrop-blur-sm text-white font-semibold text-xs border border-white/20">
                    {getDisplayName(user).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-xs">
                    {getDisplayName(user)}
                  </p>
                </div>

                {/* Coins with Space Coin Logo */}
                <div className="flex items-center gap-1">
                  <img 
                    src="/lovable-uploads/3f4a21df-fb59-4bff-b115-78221911b92c.png" 
                    alt="Space Coin" 
                    className="w-3 h-3 rounded-full" 
                  />
                  <span className="text-white font-semibold text-xs">
                    {formatCoins(user.coins || 0)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-2"
          >
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white/60 text-xs">
              <Trophy className="w-3 h-3" />
              <span>Top {filteredUsers.length} players at this level</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompactLeaderboardList;
