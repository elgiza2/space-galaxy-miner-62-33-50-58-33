
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Zap, Plus, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { newZoneService } from '@/services/newZoneService';

interface NewZoneTaskFormProps {
  onTaskCreated: () => void;
  onCancel: () => void;
}

const NewZoneTaskForm: React.FC<NewZoneTaskFormProps> = ({
  onTaskCreated,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetUrl: '',
    rewardAmount: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetUrl || !formData.rewardAmount) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create unique referral link for the task
      const referralLink = `${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;
      
      console.log('About to create New Zone task with data:', {
        title: formData.title,
        description: formData.description,
        external_link: formData.targetUrl,
        reward_amount: parseInt(formData.rewardAmount),
        zone_ref_link: referralLink
      });
      
      // Save task to database using the service
      const success = await newZoneService.createNewZoneTask({
        title: formData.title,
        description: formData.description,
        external_link: formData.targetUrl,
        reward_amount: parseInt(formData.rewardAmount),
        zone_ref_link: referralLink
      });

      console.log('Task creation result:', success);

      if (!success) {
        throw new Error('Failed to create task - service returned false');
      }
      
      toast({
        title: "تم إنشاء المهمة بنجاح",
        description: `تم إنشاء مهمة "${formData.title}" برابط الإحالة: ${referralLink}`,
      });
      
      onTaskCreated();
    } catch (error) {
      console.error('Error creating New Zone task:', error);
      toast({
        title: "خطأ في إنشاء المهمة",
        description: "حدث خطأ أثناء إنشاء المهمة. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
      <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3 text-white">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl">إنشاء مهمة New Zone جديدة</span>
          </CardTitle>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="bg-gray-500/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            رجوع
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300 font-medium">
              عنوان المهمة *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="أدخل عنوان المهمة"
              className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300 font-medium">
              وصف المهمة
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="أدخل وصف المهمة (اختياري)"
              className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>

          {/* Target URL */}
          <div className="space-y-2">
            <Label htmlFor="targetUrl" className="text-gray-300 font-medium">
              رابط المهمة *
            </Label>
            <Input
              id="targetUrl"
              type="url"
              value={formData.targetUrl}
              onChange={(e) => handleInputChange('targetUrl', e.target.value)}
              placeholder="https://example.com"
              className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Reward Amount */}
          <div className="space-y-2">
            <Label htmlFor="rewardAmount" className="text-gray-300 font-medium">
              مقدار المكافأة (عملات) *
            </Label>
            <Input
              id="rewardAmount"
              type="number"
              min="1"
              value={formData.rewardAmount}
              onChange={(e) => handleInputChange('rewardAmount', e.target.value)}
              placeholder="1000"
              className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Info about automatic clicks */}
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-200">
                <p className="font-medium mb-1">نظام النقرات التلقائي:</p>
                <p className="text-xs">كل رابط إحالة سيضيف 3 نقرات تلقائياً عند الضغط عليه</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 bg-gray-500/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30"
            >
              إلغاء
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري الإنشاء...
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء المهمة
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200 leading-relaxed">
              <p className="font-medium mb-1">ملاحظات مهمة:</p>
              <ul className="space-y-1 text-xs">
                <li>• سيتم إخفاء المهمة تلقائياً عند وصول عدد النقرات للحد الأقصى</li>
                <li>• يجب أن يكون الرابط صحيحاً ويمكن الوصول إليه</li>
                <li>• المكافأة ستُمنح للمستخدمين عند إكمال المهمة</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewZoneTaskForm;
