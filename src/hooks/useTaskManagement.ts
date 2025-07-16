import { useState, useEffect } from 'react';
import { taskService } from '@/services/taskService';
import { taskUserService } from '@/services/taskUserService';
import { referralTaskService } from '@/services/referralTaskService';
import { userActivityService } from '@/services/userActivityService';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type NewTask = Database['public']['Tables']['tasks']['Insert'];

export const useTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyTaskInitialized, setDailyTaskInitialized] = useState(false);
  const [referralTasksInitialized, setReferralTasksInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    // Only initialize daily check-in once per session
    if (!dailyTaskInitialized) {
      initializeDailyCheckIn();
      setDailyTaskInitialized(true);
    }
  }, [dailyTaskInitialized]);

  // تم إزالة useEffect الخاص بمهام دعوة الأصدقاء لمنع التضاعف
  // useEffect(() => {
  //   if (!referralTasksInitialized) {
  //     initializeReferralTasks();
  //     setReferralTasksInitialized(true);
  //   }
  // }, [referralTasksInitialized]);

  const initializeDailyCheckIn = async () => {
    try {
      console.log('Initializing daily check-in task...');
      await taskService.createDailyCheckInTask();
      console.log('Daily check-in task initialized successfully');
    } catch (error) {
      console.error('Error initializing daily check-in task:', error);
    }
  };

  // تم تعطيل دالة إنشاء مهام دعوة الأصدقاء
  const initializeReferralTasks = async () => {
    console.log('Referral tasks initialization skipped to prevent duplication');
    // لا تقم بإنشاء مهام دعوة الأصدقاء
  };

  const loadTasks = async () => {
    console.log('Starting to load tasks...');
    setIsLoading(true);
    try {
      const data = await taskService.getAllTasks();
      console.log('Tasks loaded successfully:', data.length);
      setTasks(data);
      
      // Track admin activity
      const username = localStorage.getItem('username') || 'admin';
      await userActivityService.trackUserActivity(username, 'view_tasks', {
        task_count: data.length
      });
    } catch (error) {
      console.error('Error loading tasks in hook:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: NewTask) => {
    setIsLoading(true);
    try {
      const newTask = await taskService.createTask(taskData);
      
      // Track admin activity
      const username = localStorage.getItem('username') || 'admin';
      await userActivityService.trackUserActivity(username, 'create_task', {
        task_id: newTask.id,
        task_title: newTask.title
      });
      
      toast({
        title: 'Success',
        description: 'Task created successfully'
      });
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setIsLoading(true);
    try {
      await taskService.updateTask(id, updates);
      
      // Track admin activity
      const username = localStorage.getItem('username') || 'admin';
      await userActivityService.trackUserActivity(username, 'update_task', {
        task_id: id,
        updates: Object.keys(updates)
      });
      
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      
      // Track admin activity
      const username = localStorage.getItem('username') || 'admin';
      await userActivityService.trackUserActivity(username, 'delete_task', {
        task_id: id
      });
      
      toast({
        title: 'Success',
        description: 'Task deleted successfully'
      });
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  const toggleTaskStatus = async (id: string, isActive: boolean) => {
    try {
      await taskService.toggleTaskStatus(id, isActive);
      
      // Track admin activity
      const username = localStorage.getItem('username') || 'admin';
      await userActivityService.trackUserActivity(username, 'toggle_task_status', {
        task_id: id,
        new_status: isActive
      });
      
      toast({
        title: 'Success',
        description: `Task ${isActive ? 'activated' : 'deactivated'} successfully`
      });
      await loadTasks();
    } catch (error) {
      console.error('Error toggling task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const checkTaskCompletion = async (taskId: string, userAddress: string) => {
    try {
      return await taskUserService.isTaskCompleted(taskId, userAddress);
    } catch (error) {
      console.error('Error checking task completion:', error);
      return false;
    }
  };

  // New function to check referral task completion
  const checkReferralTaskCompletion = async (taskTitle: string, username: string) => {
    try {
      return await referralTaskService.checkReferralTaskCompletion(username, taskTitle);
    } catch (error) {
      console.error('Error checking referral task completion:', error);
      return false;
    }
  };

  // New function to get referral task progress
  const getReferralTaskProgress = async (taskTitle: string, username: string) => {
    try {
      return await referralTaskService.getReferralTaskProgress(username, taskTitle);
    } catch (error) {
      console.error('Error getting referral task progress:', error);
      return { current: 0, required: 1, percentage: 0 };
    }
  };

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    checkTaskCompletion,
    checkReferralTaskCompletion,
    getReferralTaskProgress,
    reloadTasks: loadTasks
  };
};
