
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type NewUserProfile = Database['public']['Tables']['profiles']['Insert'];
type UpdateUserProfile = Database['public']['Tables']['profiles']['Update'];

export const userService = {
  // User Profile Management
  async createUserProfile(profile: NewUserProfile): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    return data;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  },

  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data;
  },

  async updateUserEarnings(userId: string, amount: number): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        earnings: amount
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user earnings:', error);
      throw error;
    }
    
    return data;
  },

  async addUserEarnings(userId: string, reward: number): Promise<UserProfile> {
    // First get current earnings
    const profile = await this.getUserProfile(userId);
    const currentEarnings = profile?.earnings || 0;
    const newEarnings = currentEarnings + reward;
    
    return this.updateUserEarnings(userId, newEarnings);
  }
};
