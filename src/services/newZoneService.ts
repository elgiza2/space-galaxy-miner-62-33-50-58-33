import { supabase } from '@/integrations/supabase/client';

export interface NewZoneTask {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  image_url: string | null;
  external_link: string | null;
  zone_ref_link: string;
  current_clicks: number;
  max_clicks: number;
  max_users_to_show: number;
  is_zone_active: boolean;
  is_active: boolean;
  created_at: string;
  current_users_shown: number;
}

export const newZoneService = {
  // Handle referral link click - adds user to visibility and tracks referral
  async handleReferralClick(refLink: string, userAddress: string): Promise<boolean> {
    try {
      console.log('Handling referral click:', refLink, userAddress);
      
      // Find task by referral link
      const { data: task, error: taskError } = await supabase
        .from('new_zone_tasks')
        .select('*')
        .eq('zone_ref_link', refLink)
        .eq('is_active', true)
        .single();

      if (taskError || !task) {
        console.log('No matching task found for ref link:', refLink);
        return false;
      }

      // Use the database function to handle referral logic
      const { data, error } = await supabase.rpc('handle_new_zone_referral', {
        p_task_id: task.id,
        p_user_address: userAddress,
        p_referral_source: refLink
      });

      if (error) {
        console.error('Error in handleReferralClick:', error);
        return false;
      }

      console.log(`Referral handled for task ${task.id}:`, data);
      return data === true;
    } catch (error) {
      console.error('Error in handleReferralClick:', error);
      return false;
    }
  },

  // Get all New Zone tasks for admin
  async getAllNewZoneTasks(): Promise<NewZoneTask[]> {
    try {
      console.log('Getting all New Zone tasks...');
      
      const { data, error } = await supabase
        .from('new_zone_tasks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting New Zone tasks:', error);
        return [];
      }

      console.log('New Zone tasks retrieved:', data?.length || 0);
      return (data || []).map(task => ({
        ...task,
        max_clicks: task.max_clicks || 50
      }));
    } catch (error) {
      console.error('Error in getAllNewZoneTasks:', error);
      return [];
    }
  },

  // Get visible New Zone tasks for a user using the database function
  async getUserNewZoneTasks(userAddress: string): Promise<NewZoneTask[]> {
    try {
      console.log('Getting New Zone tasks for user:', userAddress);
      
      const { data, error } = await supabase.rpc('get_user_new_zone_tasks', {
        p_user_address: userAddress
      });

      if (error) {
        console.error('Error getting user tasks:', error);
        return [];
      }

      console.log('Visible New Zone tasks:', data?.length || 0);
      return (data || []).map((task: any) => ({
        id: task.task_id,
        title: task.title,
        description: task.description,
        reward_amount: task.reward_amount,
        image_url: task.image_url,
        external_link: task.external_link,
        zone_ref_link: task.zone_ref_link,
        current_clicks: task.current_clicks,
        max_clicks: task.max_clicks,
        max_users_to_show: 3,
        is_zone_active: true,
        is_active: true,
        created_at: new Date().toISOString(),
        current_users_shown: 0
      }));
    } catch (error) {
      console.error('Error in getUserNewZoneTasks:', error);
      return [];
    }
  },

  // Handle task click using the database function
  async handleTaskClick(taskId: string, userAddress: string): Promise<boolean> {
    try {
      console.log('Handling task click:', taskId, userAddress);
      
      const { data, error } = await supabase.rpc('handle_new_zone_click', {
        p_task_id: taskId,
        p_user_address: userAddress
      });

      if (error) {
        console.error('Error in handleTaskClick:', error);
        return false;
      }

      console.log('Task click handled successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in handleTaskClick:', error);
      return false;
    }
  },

  // Create a new New Zone task
  async createNewZoneTask(taskData: {
    title: string;
    description?: string;
    external_link?: string;
    reward_amount: number;
    zone_ref_link: string;
  }): Promise<boolean> {
    try {
      console.log('Creating New Zone task:', taskData);
      
      // First, let's check if we have an authenticated session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      console.log('Current session:', session?.session ? 'authenticated' : 'not authenticated');
      
      const { data, error } = await supabase
        .from('new_zone_tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description || '',
          external_link: taskData.external_link,
          reward_amount: taskData.reward_amount,
          zone_ref_link: taskData.zone_ref_link,
          max_users_to_show: 3,
          max_clicks: 15,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating New Zone task:', error);
        // Provide more helpful error information
        if (error.code === '42501') {
          console.error('RLS Policy Error: User may not have permission to create tasks');
        }
        return false;
      }

      console.log('New Zone task created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createNewZoneTask:', error);
      return false;
    }
  },

  // Update task status
  async updateTaskStatus(taskId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('new_zone_tasks')
        .update({ is_active: isActive })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      return false;
    }
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('new_zone_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return false;
    }
  },

  // Get task statistics
  async getTaskStats(taskId: string): Promise<{
    totalUsers: number;
    currentClicks: number;
    requiredClicks: number;
    progress: number;
  }> {
    try {
      // Get task info
      const { data: task } = await supabase
        .from('new_zone_tasks')
        .select('current_clicks')
        .eq('id', taskId)
        .single();

      // Get unique users count
      const { count: totalUsers } = await supabase
        .from('new_zone_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId);

      const currentClicks = task?.current_clicks || 0;
      const uniqueUsers = totalUsers || 0;
      const requiredClicks = uniqueUsers * 3;
      const progress = requiredClicks > 0 ? (currentClicks / requiredClicks) * 100 : 0;

      return {
        totalUsers: uniqueUsers,
        currentClicks,
        requiredClicks,
        progress
      };
    } catch (error) {
      console.error('Error getting task stats:', error);
      return {
        totalUsers: 0,
        currentClicks: 0,
        requiredClicks: 0,
        progress: 0
      };
    }
  }
};
