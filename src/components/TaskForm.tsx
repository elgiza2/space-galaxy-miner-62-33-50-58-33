
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { imageUploadService } from '@/services/imageUploadService';
import { Upload, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type NewTask = Database['public']['Tables']['tasks']['Insert'];

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: NewTask) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    arabic_title: task?.arabic_title || '',
    description: task?.description || '',
    arabic_description: task?.arabic_description || '',
    reward_amount: task?.reward_amount || 0,
    external_link: task?.external_link || '',
    status: task?.status || 'pending',
    is_active: task?.is_active ?? true,
    image_url: task?.image_url || '',
    is_new_zone: (task as any)?.is_new_zone || false,
    zone_ref_link: (task as any)?.zone_ref_link || '',
    max_users_to_show: (task as any)?.max_users_to_show || 3,
    max_clicks: (task as any)?.max_clicks || 15
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(task?.image_url || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      let imageUrl = formData.image_url;

      // Upload image if a new one was selected
      if (imageFile) {
        setIsUploadingImage(true);
        const tempTaskId = task?.id || `temp-${Date.now()}`;
        imageUrl = await imageUploadService.uploadTaskImage(imageFile, tempTaskId);
      }

      const taskData: NewTask = {
        title: formData.title.trim(),
        arabic_title: formData.arabic_title.trim() || formData.title.trim(),
        description: formData.description.trim(),
        arabic_description: formData.arabic_description.trim() || formData.description.trim(),
        reward_amount: Number(formData.reward_amount),
        external_link: formData.external_link.trim() || null,
        status: formData.status,
        is_active: formData.is_active,
        image_url: imageUrl || null,
        ...(formData.is_new_zone && {
          is_new_zone: true,
          zone_ref_link: formData.zone_ref_link.trim(),
          max_users_to_show: Number(formData.max_users_to_show),
          max_clicks: Number(formData.max_clicks),
          current_users_shown: 0,
          current_clicks: 0,
          is_zone_active: false
        })
      };

      await onSubmit(taskData);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save task',
        variant: 'destructive'
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="image">Task Image</Label>
            <div className="flex flex-col gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Task preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No image</p>
                  </div>
                </div>
              )}
              
              <div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Title Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title (English) *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title in English"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arabic_title">Task Title (Arabic)</Label>
              <Input
                id="arabic_title"
                value={formData.arabic_title}
                onChange={(e) => handleInputChange('arabic_title', e.target.value)}
                placeholder="Enter task title in Arabic"
                dir="rtl"
              />
            </div>
          </div>

          {/* Description Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description (English)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter task description in English"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arabic_description">Description (Arabic)</Label>
              <Textarea
                id="arabic_description"
                value={formData.arabic_description}
                onChange={(e) => handleInputChange('arabic_description', e.target.value)}
                placeholder="Enter task description in Arabic"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          {/* Reward and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward_amount">Reward Amount</Label>
              <Input
                id="reward_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.reward_amount}
                onChange={(e) => handleInputChange('reward_amount', parseFloat(e.target.value) || 0)}
                placeholder="Enter reward amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="external_link">External Link</Label>
              <Input
                id="external_link"
                type="url"
                value={formData.external_link}
                onChange={(e) => handleInputChange('external_link', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Status and Active Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="new_zone">🚀 New Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Active Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active" className="text-sm font-normal">
                  {formData.is_active ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          </div>

          {/* New Zone Settings */}
          <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_new_zone"
                checked={formData.is_new_zone}
                onCheckedChange={(checked) => {
                  handleInputChange('is_new_zone', checked);
                  if (checked) {
                    // Auto-set status to new_zone
                    handleInputChange('status', 'new_zone');
                    if (!formData.zone_ref_link) {
                      // Auto-generate ref link from title
                      const refLink = formData.title.toLowerCase()
                        .replace(/[^a-z0-9]/g, '')
                        .replace(/\s+/g, '');
                      handleInputChange('zone_ref_link', refLink);
                    }
                  }
                }}
              />
              <Label htmlFor="is_new_zone" className="text-sm font-semibold text-purple-700">
                🚀 New Zone Task
              </Label>
            </div>
            
            {formData.is_new_zone && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="zone_ref_link" className="text-sm font-medium">Zone Reference Link *</Label>
                  <Input
                    id="zone_ref_link"
                    value={formData.zone_ref_link}
                    onChange={(e) => handleInputChange('zone_ref_link', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    placeholder="playzone"
                    className="font-mono"
                    required={formData.is_new_zone}
                  />
                  <p className="text-xs text-gray-600">
                    Referral link will be: <span className="font-mono bg-gray-100 px-1 rounded">your-app.com/r/{formData.zone_ref_link}</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_users_to_show" className="text-sm font-medium">Max Users to Show</Label>
                    <Input
                      id="max_users_to_show"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.max_users_to_show}
                      onChange={(e) => handleInputChange('max_users_to_show', parseInt(e.target.value) || 3)}
                    />
                    <p className="text-xs text-gray-600">How many users can see this task at once</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_clicks" className="text-sm font-medium">Max Clicks to Hide</Label>
                    <Input
                      id="max_clicks"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.max_clicks}
                      onChange={(e) => handleInputChange('max_clicks', parseInt(e.target.value) || 15)}
                    />
                    <p className="text-xs text-gray-600">Task hides after this many clicks</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 How New Zone Works:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• When users join via referral link, task shows to max {formData.max_users_to_show} users</li>
                    <li>• Task disappears after {formData.max_clicks} total clicks</li>
                    <li>• Task reappears when new users join via the referral link</li>
                    <li>• Cycle repeats automatically</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isUploadingImage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploadingImage}
            >
              {isLoading || isUploadingImage ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
