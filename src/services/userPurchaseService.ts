
import { supabase } from '@/integrations/supabase/client';

export interface UserPurchase {
  id: string;
  user_id: string;
  username?: string;
  item_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export const userPurchaseService = {
  async createPurchase(purchase: Omit<UserPurchase, 'id' | 'created_at'>) {
    try {
      // Using any to bypass TypeScript issues until types are regenerated
      const { data, error } = await (supabase as any)
        .from('user_purchases')
        .insert(purchase)
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createPurchase:', error);
      throw error;
    }
  },

  async getUserPurchases(userId: string) {
    try {
      // Using any to bypass TypeScript issues until types are regenerated
      const { data, error } = await (supabase as any)
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user purchases:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserPurchases:', error);
      return [];
    }
  },

  async updatePurchaseStatus(purchaseId: string, status: string) {
    try {
      // Using any to bypass TypeScript issues until types are regenerated
      const { data, error } = await (supabase as any)
        .from('user_purchases')
        .update({ status })
        .eq('id', purchaseId)
        .select()
        .single();

      if (error) {
        console.error('Error updating purchase status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePurchaseStatus:', error);
      throw error;
    }
  }
};
