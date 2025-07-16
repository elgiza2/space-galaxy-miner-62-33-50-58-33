
import { useState, useEffect } from 'react';
import { userStatsService } from '@/services/userStatsService';

export const useUserStats = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsersToday, setActiveUsersToday] = useState(0);
  const [newUsersThisWeek, setNewUsersThisWeek] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [currentActiveUsers, setCurrentActiveUsers] = useState(0);
  const [lastHourActiveUsers, setLastHourActiveUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      console.log('Loading user statistics...');
      
      const [
        total, 
        activeToday, 
        newThisWeek, 
        earnings, 
        currentActive, 
        lastHourActive
      ] = await Promise.all([
        userStatsService.getTotalUsers(),
        userStatsService.getActiveUsersToday(),
        userStatsService.getNewUsersThisWeek(),
        userStatsService.getTotalEarnings(),
        userStatsService.getCurrentActiveUsers(),
        userStatsService.getLastHourActiveUsers()
      ]);

      console.log('Statistics loaded:', {
        total,
        activeToday,
        newThisWeek,
        earnings,
        currentActive,
        lastHourActive
      });

      setTotalUsers(total);
      setActiveUsersToday(activeToday);
      setNewUsersThisWeek(newThisWeek);
      setTotalEarnings(earnings);
      setCurrentActiveUsers(currentActive);
      setLastHourActiveUsers(lastHourActive);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Set up interval for real-time updates every 30 seconds
    const interval = setInterval(() => {
      console.log('Auto-refreshing statistics...');
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const reloadStats = () => {
    console.log('Manual refresh triggered');
    loadStats();
  };

  return {
    totalUsers,
    activeUsersToday,
    newUsersThisWeek,
    totalEarnings,
    currentActiveUsers,
    lastHourActiveUsers,
    isLoading,
    reloadStats
  };
};
