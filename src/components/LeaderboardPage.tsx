
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { leaderboardService } from '@/services/leaderboardService';
import LeaderboardHeader from './Leaderboard/LeaderboardHeader';
import UserProfileCard from './Leaderboard/UserProfileCard';
import LevelFilteredLeaderboard from './Leaderboard/LevelFilteredLeaderboard';
import CompactLevelSelector from './Leaderboard/CompactLevelSelector';
import { getUserLevel } from '@/utils/levelSystem';

const LeaderboardPage = () => {
  const { telegramUser } = useTelegramUser();
  const { spaceCoins } = useSpaceCoins();
  
  const {
    topUsers,
    isLoadingUsers
  } = useLeaderboardData();

  const userLevel = getUserLevel(spaceCoins);
  const [selectedLevel, setSelectedLevel] = useState(userLevel.id);

  // Initialize user data when component mounts
  useEffect(() => {
    const initializeUser = async () => {
      if (telegramUser?.id && spaceCoins > 0) {
        try {
          await leaderboardService.initializeCurrentUser(telegramUser);
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      }
    };
    initializeUser();
  }, [telegramUser, spaceCoins]);

  const currentUserRank = topUsers.findIndex(user => {
    if (telegramUser?.username && user.username) {
      return user.username === telegramUser.username;
    }
    if (telegramUser?.first_name && user.first_name) {
      return user.first_name === telegramUser.first_name;
    }
    return false;
  }) + 1;

  return (
    <div className="min-h-screen bg-black text-white">
      <LeaderboardHeader />
      
      <div className="space-y-4">
        <UserProfileCard 
          telegramUser={telegramUser}
          spaceCoins={spaceCoins}
          userLevel={userLevel}
          currentUserRank={currentUserRank}
        />

        <CompactLevelSelector 
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          userCoins={spaceCoins}
        />

        <div className="px-4">
          <LevelFilteredLeaderboard 
            topUsers={topUsers}
            selectedLevel={selectedLevel}
            isLoading={isLoadingUsers}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
