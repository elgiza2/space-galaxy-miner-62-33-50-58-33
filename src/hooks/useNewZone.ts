
import { useState, useEffect } from 'react';
import { newZoneService, type NewZoneTask } from '@/services/newZoneService';
import { useToast } from '@/hooks/use-toast';

export const useNewZone = (userAddress?: string) => {
  const [newZoneTasks, setNewZoneTasks] = useState<NewZoneTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load New Zone tasks for user
  const loadUserNewZoneTasks = async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    try {
      const tasks = await newZoneService.getUserNewZoneTasks(userAddress);
      setNewZoneTasks(tasks);
    } catch (error) {
      console.error('Error loading New Zone tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load New Zone tasks',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle referral link click
  const handleReferralClick = async (refLink: string) => {
    if (!userAddress) return false;
    
    try {
      const success = await newZoneService.handleReferralClick(refLink, userAddress);
      if (success) {
        toast({
          title: 'مرحباً! 🎉',
          description: 'تم تسجيل الدخول عبر رابط الإحالة. تحقق من New Zone!',
        });
        // Reload tasks to show newly available ones
        await loadUserNewZoneTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error handling referral click:', error);
      return false;
    }
  };

  // Handle task click
  const handleTaskClick = async (taskId: string) => {
    if (!userAddress) return false;
    
    try {
      const success = await newZoneService.handleTaskClick(taskId, userAddress);
      if (success) {
        // Reload tasks to reflect any changes
        await loadUserNewZoneTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error handling task click:', error);
      return false;
    }
  };

  // Check for referral link in URL on component mount
  useEffect(() => {
    if (!userAddress) return;
    
    // Check URL for referral parameter
    const urlParams = new URLSearchParams(window.location.search);
    const refLink = urlParams.get('ref') || urlParams.get('r');
    
    if (refLink) {
      handleReferralClick(refLink);
      // Clean URL after processing
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    // Load initial tasks
    loadUserNewZoneTasks();
  }, [userAddress]);

  return {
    newZoneTasks,
    isLoading,
    handleReferralClick,
    handleTaskClick,
    reloadTasks: loadUserNewZoneTasks
  };
};
