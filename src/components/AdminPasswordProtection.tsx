import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminPasswordProtectionProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = "admin2024"; // في التطبيق الحقيقي يجب تشفير هذا
const SESSION_KEY = "admin_session";

const AdminPasswordProtection: React.FC<AdminPasswordProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // تحقق من وجود جلسة مفعلة
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      const now = new Date().getTime();
      
      // جلسة صالحة لمدة 24 ساعة
      if (now < sessionData.expiry) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    
    // محاكاة تأخير للتحقق
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // تنظيف كلمة المرور من المسافات الإضافية
    const trimmedPassword = password.trim();
    
    console.log("Entered password:", trimmedPassword);
    console.log("Expected password:", ADMIN_PASSWORD);
    console.log("Password match:", trimmedPassword === ADMIN_PASSWORD);
    
    if (trimmedPassword === ADMIN_PASSWORD) {
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 ساعة
      const sessionData = {
        authenticated: true,
        expiry: expiryTime
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setIsAuthenticated(true);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة التحكم الإدارية",
      });
    } else {
      console.log("Login failed - password mismatch");
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
    
    setLoading(false);
    setPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    toast({
      title: "تم تسجيل الخروج",
      description: "شكراً لاستخدام النظام",
    });
  };

  if (isAuthenticated) {
    return (
      <div className="relative">
        {/* زر تسجيل الخروج */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
          >
            <Lock className="w-4 h-4 mr-2" />
            تسجيل خروج
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Card className="w-full max-w-md mx-4 bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl mx-auto">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            لوحة التحكم الإدارية
          </CardTitle>
          <p className="text-gray-300">
            يرجى إدخال كلمة المرور للوصول إلى لوحة التحكم
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              كلمة المرور
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 pr-12"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={!password || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
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
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              للوصول إلى لوحة التحكم الإدارية الكاملة
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPasswordProtection;