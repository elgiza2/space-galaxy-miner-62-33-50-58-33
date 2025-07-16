
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TaskCompletion = Database['public']['Tables']['user_task_completions']['Row'];
type NewTaskCompletion = Database['public']['Tables']['user_task_completions']['Insert'];

export const taskUserService = {
  async completeTask(taskId: string, userId: string): Promise<TaskCompletion> {
    console.log('Completing task:', taskId, 'for user:', userId);
    
    // Check if task is already completed
    const { data: existingCompletion } = await supabase
      .from('user_task_completions')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingCompletion) {
      console.log('Task already completed');
      return existingCompletion;
    }

    const { data, error } = await supabase
      .from('user_task_completions')
      .insert({
        task_id: taskId,
        user_id: userId,
        completed_at: new Date().toISOString(),
        reward_claimed: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error completing task:', error);
      throw error;
    }
    
    return data;
  },

  async getUserCompletedTasks(userId: string): Promise<TaskCompletion[]> {
    const { data, error } = await supabase
      .from('user_task_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching completed tasks:', error);
      throw error;
    }
    
    return data || [];
  },

  async claimTaskReward(completionId: string): Promise<TaskCompletion> {
    const { data, error } = await supabase
      .from('user_task_completions')
      .update({ 
        reward_claimed: true,
        claimed_at: new Date().toISOString()
      })
      .eq('id', completionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error claiming task reward:', error);
      throw error;
    }
    
    return data;
  },

  async isTaskCompleted(taskId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_task_completions')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking task completion:', error);
      return false;
    }
    
    return !!data;
  }
};
