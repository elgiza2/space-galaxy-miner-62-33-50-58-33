import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Upload, ExternalLink } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type NewTask = Database['public']['Tables']['tasks']['Insert'];

interface TaskFormSimpleProps {
  task?: Task | null;
  onSubmit: (taskData: NewTask) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

const TaskFormSimple: React.FC<TaskFormSimpleProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    arabic_title: string;
    arabic_description: string;
    reward_amount: number;
    external_link: string;
    image_url: string;
    is_active: boolean;
    status: TaskStatus;
    max_completions: number | null;
  }>({
    title: '',
    description: '',
    arabic_title: '',
    arabic_description: '',
    reward_amount: 0,
    external_link: '',
    image_url: '',
    is_active: true,
    status: 'pending',
    max_completions: null
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        arabic_title: task.arabic_title || '',
        arabic_description: task.arabic_description || '',
        reward_amount: task.reward_amount || task.reward || 0,
        external_link: task.external_link || task.link || '',
        image_url: task.image_url || '',
        is_active: task.is_active ?? true,
        status: (task.status as TaskStatus) || 'pending',
        max_completions: task.max_completions || null
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: NewTask = {
      title: formData.title,
      description: formData.description,
      arabic_title: formData.arabic_title,
      arabic_description: formData.arabic_description,
      reward_amount: formData.reward_amount,
      reward: formData.reward_amount, // Keep both for compatibility
      external_link: formData.external_link || null,
      link: formData.external_link || null, // Keep both for compatibility
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      status: formData.status,
      max_completions: formData.max_completions
    };

    onSubmit(taskData);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'مهمة يومية';
      case 'in_progress': return 'مهمة أساسية';
      case 'completed': return 'مهمة شراكة';
      case 'failed': return 'فاشلة';
      default: return status;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-white text-center">
          {task ? 'تحديث المهمة' : 'إنشاء مهمة جديدة'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-white mb-2 block">
              عنوان المهمة *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="أدخل عنوان المهمة"
              required
            />
          </div>

          {/* Arabic Title */}
          <div>
            <Label htmlFor="arabic_title" className="text-white mb-2 block">
              العنوان بالعربية *
            </Label>
            <Input
              id="arabic_title"
              type="text"
              value={formData.arabic_title}
              onChange={(e) => setFormData(prev => ({ ...prev, arabic_title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="أدخل العنوان بالعربية"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-white mb-2 block">
              وصف المهمة
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[80px]"
              placeholder="أدخل وصف المهمة"
            />
          </div>

          {/* Arabic Description */}
          <div>
            <Label htmlFor="arabic_description" className="text-white mb-2 block">
              الوصف بالعربية
            </Label>
            <Textarea
              id="arabic_description"
              value={formData.arabic_description}
              onChange={(e) => setFormData(prev => ({ ...prev, arabic_description: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[80px]"
              placeholder="أدخل الوصف بالعربية"
            />
          </div>

          {/* Task Category (Status) */}
          <div>
            <Label htmlFor="status" className="text-white mb-2 block">
              نوع المهمة *
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: TaskStatus) => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر نوع المهمة" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="pending" className="text-white hover:bg-gray-700">
                  مهمة يومية
                </SelectItem>
                <SelectItem value="in_progress" className="text-white hover:bg-gray-700">
                  مهمة أساسية
                </SelectItem>
                <SelectItem value="completed" className="text-white hover:bg-gray-700">
                  مهمة شراكة
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reward Amount */}
          <div>
            <Label htmlFor="reward_amount" className="text-white mb-2 block">
              مبلغ المكافأة ($SPACE) *
            </Label>
            <Input
              id="reward_amount"
              type="number"
              min="0"
              value={formData.reward_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, reward_amount: parseInt(e.target.value) || 0 }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="0"
              required
            />
          </div>

          {/* External Link */}
          <div>
            <Label htmlFor="external_link" className="text-white mb-2 block flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              رابط المهمة
            </Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="https://example.com"
            />
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="image_url" className="text-white mb-2 block flex items-center gap-2">
              <Upload className="w-4 h-4" />
              رابط الصورة
            </Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Max Completions */}
          <div>
            <Label htmlFor="max_completions" className="text-white mb-2 block">
              الحد الأقصى للإنجاز (اختياري)
            </Label>
            <Input
              id="max_completions"
              type="number"
              min="1"
              value={formData.max_completions || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                max_completions: e.target.value ? parseInt(e.target.value) : null 
              }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="غير محدود"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="text-white">
              المهمة نشطة
            </Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {task ? 'تحديث المهمة' : 'إنشاء المهمة'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskFormSimple;
