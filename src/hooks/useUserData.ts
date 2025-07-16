
import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { taskUserService } from '@/services/taskUserService';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type TaskCompletion = Database['public']['Tables']['user_task_completions']['Row'];

export const useUserData = (profileId?: string) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completedTasks, setCompletedTasks] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profileId) {
      loadUserData();
    }
  }, [profileId]);

  const loadUserData = async () => {
    if (!profileId) return;
    
    setIsLoading(true);
    try {
      // Get user profile
      const profile = await userService.getUserProfile(profileId);
      setUserProfile(profile);
      
      if (profile) {
        // Get completed tasks
        const tasks = await taskUserService.getUserCompletedTasks(profile.id);
        setCompletedTasks(tasks);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    try {
      const updatedProfile = await userService.updateUserProfile(userProfile.id, updates);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!userProfile) return;
    
    try {
      const completion = await taskUserService.completeTask(taskId, userProfile.id);
      setCompletedTasks(prev => [...prev, completion]);
      return completion;
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return {
    userProfile,
    completedTasks,
    isLoading,
    updateProfile,
    completeTask,
    reloadData: loadUserData
  };
};
