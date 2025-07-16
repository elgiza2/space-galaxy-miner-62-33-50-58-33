
import { useState, useEffect } from 'react';
import { analyticsService, TaskCompletionStat, TopPurchaser } from '@/services/analyticsService';

export const useAnalytics = () => {
  const [taskStats, setTaskStats] = useState<TaskCompletionStat[]>([]);
  const [currentActiveUsers, setCurrentActiveUsers] = useState(0);
  const [lastHourActiveUsers, setLastHourActiveUsers] = useState(0);
  const [topPurchasers, setTopPurchasers] = useState<TopPurchaser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [statsData, currentUsers, lastHourUsers, purchasersData] = await Promise.all([
        analyticsService.getTaskCompletionStats(),
        analyticsService.getCurrentActiveUsers(),
        analyticsService.getLastHourActiveUsers(),
        analyticsService.getTopPurchasers(5)
      ]);

      setTaskStats(statsData);
      setCurrentActiveUsers(currentUsers);
      setLastHourActiveUsers(lastHourUsers);
      setTopPurchasers(purchasersData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const reloadAnalytics = () => {
    loadAnalytics();
  };

  return {
    taskStats,
    currentActiveUsers,
    lastHourActiveUsers,
    topPurchasers,
    isLoading,
    reloadAnalytics
  };
};
