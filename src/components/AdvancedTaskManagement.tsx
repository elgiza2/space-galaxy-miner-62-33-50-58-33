import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Lock, Plus, Zap, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NewZoneTaskForm from './NewZoneTaskForm';

const AdvancedTaskManagement = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNewZoneForm, setShowNewZoneForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Password entered:', password);
    console.log('Password length:', password.length);
    console.log('Trimmed password:', password.trim());
    console.log('Trimmed password length:', password.trim().length);
    
    // Simulate loading delay
    setTimeout(() => {
      const trimmedPassword = password.trim();
      const correctPassword = 'sh';
      
      console.log('Comparing:', `"${trimmedPassword}"`, 'with', `"${correctPassword}"`);
      console.log('Are they equal?', trimmedPassword === correctPassword);
      
      // Check password - make sure it's exactly 'sh'
      if (trimmedPassword === correctPassword) {
        console.log('Password correct, authenticating...');
        setIsAuthenticated(true);
        setPassword(''); // Clear password after successful login
        toast({
          title: "تم التحقق بنجاح",
          description: "مرحباً بك في إدارة المهام المتقدمة",
        });
      } else {
        console.log('Password incorrect');
        toast({
          title: "كلمة مرور خاطئة", 
          description: "يرجى إدخال كلمة المرور الصحيحة: sh",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleNewZoneTaskCreated = () => {
    setShowNewZoneForm(false);
    toast({
      title: "تم إنشاء المهمة بنجاح",
      description: "تم إضافة مهمة New Zone جديدة",
    });
  };

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md mx-auto">
        <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black/20 rounded-2xl mb-4 mx-auto">
            <Lock className="w-10 h-10 text-blue-400" />
          </div>
          <CardTitle className="text-white text-2xl">إدارة المهام المتقدمة</CardTitle>
          <p className="text-gray-400 mt-2">
            يرجى إدخال كلمة المرور للوصول إلى الأدوات المتقدمة
          </p>
          <p className="text-yellow-400 text-sm mt-1">
            كلمة المرور: sh
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور (sh)"
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                required
                autoComplete="off"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري التحقق...
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  دخول
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Show New Zone form if requested
  if (showNewZoneForm) {
    return (
      <NewZoneTaskForm
        onTaskCreated={handleNewZoneTaskCreated}
        onCancel={() => setShowNewZoneForm(false)}
      />
    );
  }

  // Main advanced task management interface
  return (
    <div className="space-y-6">
      {/* Header with success indicator */}
      <Card className="bg-black/30 border border-green-500/30 backdrop-blur-xl rounded-2xl shadow-2xl">
        <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xl">إدارة المهام المتقدمة</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Lock className="w-4 h-4" />
              <span>محمي بكلمة مرور</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              مرحباً بك في النظام المتقدم
            </h3>
            <p className="text-gray-400 mb-6">
              يمكنك الآن الوصول إلى جميع أدوات إدارة المهام المتقدمة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Zone Task Creation Section */}
      <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
        <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
          <CardTitle className="flex items-center space-x-3 text-white">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl">إنشاء مهام New Zone</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-2xl mb-6">
              <Zap className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              إنشاء مهام New Zone التفاعلية
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
              أنشئ مهام تفاعلية مع نظام النقرات الديناميكي والروابط المخصصة
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
              <div className="bg-black/20 rounded-xl p-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <span className="text-green-400 font-bold">1</span>
                </div>
                <p className="text-gray-300">إنشاء المهمة مع رابط مخصص</p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <span className="text-yellow-400 font-bold">2</span>
                </div>
                <p className="text-gray-300">تتبع النقرات والمستخدمين</p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <p className="text-gray-300">إخفاء تلقائي عند اكتمال النقرات</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowNewZoneForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              إنشاء مهمة New Zone جديدة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Advanced Features (placeholder for future features) */}
      <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
        <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
          <CardTitle className="flex items-center space-x-3 text-white">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xl">المزيد من الأدوات المتقدمة</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-2xl mb-4">
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">قريباً...</h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              المزيد من الأدوات المتقدمة لإدارة المهام ستكون متاحة قريباً
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedTaskManagement;
