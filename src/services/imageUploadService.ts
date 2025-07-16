
import { supabase } from '@/integrations/supabase/client';

export const imageUploadService = {
  async uploadTaskImage(file: File, taskId: string): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        throw new Error('Unsupported file format');
      }

      const fileName = `task-${taskId}-${Date.now()}.${fileExt}`;
      const filePath = `task-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('task-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('task-images')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error instanceof Error ? error : new Error('Unknown upload error');
    }
  },

  async deleteTaskImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl) {
        throw new Error('Image URL is required');
      }

      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      
      if (pathParts.length < 2) {
        throw new Error('Invalid image URL format');
      }
      
      const filePath = pathParts.slice(-2).join('/');
      
      const { error } = await supabase.storage
        .from('task-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Image deletion failed:', error);
      throw error instanceof Error ? error : new Error('Unknown deletion error');
    }
  }
};
