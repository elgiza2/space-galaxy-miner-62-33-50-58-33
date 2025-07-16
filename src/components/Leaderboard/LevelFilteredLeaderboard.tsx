
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import UserLeaderboardCard from './UserLeaderboardCard';
import { getUserLevel } from '@/utils/levelSystem';
import type { Database } from '@/integrations/supabase/types';

type RealUserLeaderboard = Database['public']['Views']['real_user_leaderboard']['Row'];

interface LevelFilteredLeaderboardProps {
  topUsers: RealUserLeaderboard[];
  selectedLevel: number;
  isLoading: boolean;
}

const LevelFilteredLeaderboard = ({ 
  topUsers, 
  selectedLevel, 
  isLoading 
}: LevelFilteredLeaderboardProps) => {
  
  // Filter users by selected level
  const filteredUsers = topUsers
    .filter(user => {
      const userLevel = getUserLevel(user.coins || 0);
      return userLevel.id === selectedLevel;
    })
    .slice(0, 20); // Show top 20 only

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="h-20 rounded-xl bg-white/5 animate-pulse"
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
        className="text-center py-12"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white/30" />
        </div>
        
        <h3 className="text-xl font-semibold text-white/70 mb-2">
          No players at this level
        </h3>
        <p className="text-white/50">
          Be the first to reach Level {selectedLevel}!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      {filteredUsers.map((user, index) => (
        <UserLeaderboardCard 
          key={user.id} 
          user={user} 
          index={index} 
        />
      ))}
      
      {filteredUsers.length >= 20 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-white/50 text-sm">
            Showing top 20 players for Level {selectedLevel}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default LevelFilteredLeaderboard;
