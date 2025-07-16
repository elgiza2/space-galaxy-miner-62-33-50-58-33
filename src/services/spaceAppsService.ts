
import { supabase } from '@/integrations/supabase/client';

export interface SpaceApp {
  id: string;
  name: string;
  description: string;
  image_url: string;
  app_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateSpaceApp {
  name: string;
  description: string;
  image_url: string;
  app_url: string;
  category: string;
  is_active?: boolean;
}

export const spaceAppsService = {
  // Get all active apps for public display
  async getActiveApps(): Promise<SpaceApp[]> {
    try {
      const { data, error } = await supabase
        .from('space_apps')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active apps:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveApps:', error);
      return [];
    }
  },

  // Get all apps for admin panel
  async getAllApps(): Promise<SpaceApp[]> {
    try {
      const { data, error } = await supabase
        .from('space_apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all apps:', error);
        throw new Error(`فشل في تحميل التطبيقات: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getAllApps:', error);
      throw new Error(error.message || 'فشل في تحميل التطبيقات');
    }
  },

  // Create new app
  async createApp(appData: CreateSpaceApp): Promise<SpaceApp> {
    try {
      console.log('Creating app with data:', appData);
      
      const { data, error } = await supabase
        .from('space_apps')
        .insert([{
          ...appData,
          is_active: appData.is_active ?? true
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating app:', error);
        throw new Error(`فشل في إنشاء التطبيق: ${error.message}`);
      }

      if (!data) {
        throw new Error('فشل في إنشاء التطبيق: لم يتم إرجاع البيانات');
      }

      console.log('App created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error in createApp:', error);
      throw new Error(error.message || 'فشل في إنشاء التطبيق');
    }
  },

  // Update app
  async updateApp(id: string, updates: Partial<CreateSpaceApp>): Promise<SpaceApp> {
    try {
      if (!id) {
        throw new Error('معرف التطبيق مطلوب');
      }

      console.log('Updating app:', id, 'with data:', updates);

      const { data, error } = await supabase
        .from('space_apps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating app:', error);
        throw new Error(`فشل في تحديث التطبيق: ${error.message}`);
      }

      if (!data) {
        throw new Error('فشل في تحديث التطبيق: التطبيق غير موجود');
      }

      console.log('App updated successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error in updateApp:', error);
      throw new Error(error.message || 'فشل في تحديث التطبيق');
    }
  },

  // Delete app - Enhanced with better error handling and verification
  async deleteApp(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('معرف التطبيق مطلوب');
      }

      console.log('Attempting to delete app with ID:', id);

      // First verify the app exists and get its details
      const { data: existingApp, error: selectError } = await supabase
        .from('space_apps')
        .select('id, name')
        .eq('id', id)
        .single();

      if (selectError) {
        console.error('Error checking app existence:', selectError);
        if (selectError.code === 'PGRST116') {
          throw new Error('التطبيق غير موجود أو تم حذفه مسبقاً');
        }
        throw new Error(`خطأ في التحقق من وجود التطبيق: ${selectError.message}`);
      }

      if (!existingApp) {
        throw new Error('التطبيق غير موجود');
      }

      console.log('App found, proceeding with deletion:', existingApp);

      // Perform the deletion
      const { error: deleteError, count } = await supabase
        .from('space_apps')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        throw new Error(`فشل في حذف التطبيق: ${deleteError.message}`);
      }

      // Verify deletion was successful
      if (count === 0) {
        console.warn('Delete operation returned 0 affected rows');
        throw new Error('لم يتم حذف أي تطبيق - قد يكون التطبيق محذوف مسبقاً');
      }

      console.log(`Successfully deleted app. Affected rows: ${count}`);

      // Double-check that the app was actually deleted
      const { data: verifyData, error: verifyError } = await supabase
        .from('space_apps')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (verifyError) {
        console.error('Error verifying deletion:', verifyError);
        // Don't throw here, deletion might have succeeded
      }

      if (verifyData) {
        console.error('App still exists after deletion attempt:', verifyData);
        throw new Error('فشل في حذف التطبيق - التطبيق ما زال موجود');
      }

      console.log('Deletion verified successfully - app no longer exists');
    } catch (error: any) {
      console.error('Error in deleteApp:', error);
      throw new Error(error.message || 'فشل في حذف التطبيق');
    }
  },

  // Toggle app status
  async toggleAppStatus(id: string, isActive: boolean): Promise<SpaceApp> {
    try {
      if (!id) {
        throw new Error('معرف التطبيق مطلوب');
      }

      console.log('Toggling app status:', id, 'to:', isActive);

      const { data, error } = await supabase
        .from('space_apps')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error toggling app status:', error);
        throw new Error(`فشل في تحديث حالة التطبيق: ${error.message}`);
      }

      if (!data) {
        throw new Error('فشل في تحديث حالة التطبيق: التطبيق غير موجود');
      }

      console.log('App status toggled successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error in toggleAppStatus:', error);
      throw new Error(error.message || 'فشل في تحديث حالة التطبيق');
    }
  }
};
