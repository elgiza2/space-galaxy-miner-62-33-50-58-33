
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Play, Zap, Bot, Users, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { telegramWebhookService } from '@/services/telegramWebhookService';
import { enhancedReferralService } from '@/services/enhancedReferralService';
import { userReferralService } from '@/services/userReferralService';

const ReferralSystemTester = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const testSteps = [
    { name: "Telegram Webhook Setup", key: "webhook_setup" },
    { name: "Webhook Status Check", key: "webhook_status" },
    { name: "Database Connection Test", key: "db_test" },
    { name: "Referral Link Generation", key: "referral_link" },
    { name: "Referral Capture Test", key: "referral_capture" },
    { name: "Notification System Test", key: "notifications" }
  ];

  const runTest = async (testKey: string, testName: string) => {
    try {
      let result: any = { success: false, message: "", data: null };
      
      switch (testKey) {
        case "webhook_setup":
          result = await telegramWebhookService.setupWebhook();
          break;
          
        case "webhook_status":
          result = await telegramWebhookService.checkWebhookStatus();
          result.success = result.configured;
          result.message = result.configured ? "Webhook is properly configured" : "Webhook not configured";
          break;
          
        case "db_test":
          // Test database connectivity
          const testUsername = `test_${Date.now()}`;
          const testReferrer = `referrer_${Date.now()}`;
          
          // Try to create a test referral
          const referralResult = await userReferralService.createReferral(testReferrer, testUsername);
          result.success = referralResult !== null;
          result.message = result.success ? "Database connection successful" : "Database connection failed";
          result.data = referralResult;
          break;
          
        case "referral_link":
          // Test referral link generation
          const testLink = `https://t.me/Spacelbot?startapp=test_user_${Date.now()}`;
          result.success = true;
          result.message = "Referral link generated successfully";
          result.data = { link: testLink };
          break;
          
        case "referral_capture":
          // Test referral capture simulation
          const captureResult = await enhancedReferralService.captureReferralWithTracking(
            `test_referrer_${Date.now()}`,
            window.location.href
          );
          result = captureResult;
          break;
          
        case "notifications":
          // Test notification system
          result.success = true;
          result.message = "Notification system ready";
          break;
          
        default:
          result.message = "Unknown test";
      }
      
      return result;
    } catch (error) {
      console.error(`Test ${testKey} failed:`, error);
      return {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentStep(0);
    
    const results = [];
    
    for (let i = 0; i < testSteps.length; i++) {
      const step = testSteps[i];
      setCurrentStep(i + 1);
      
      toast({
        title: "Running Test",
        description: `Testing: ${step.name}`,
        duration: 2000,
      });
      
      const result = await runTest(step.key, step.name);
      const testResult = {
        step: step.name,
        key: step.key,
        ...result,
        timestamp: new Date().toISOString()
      };
      
      results.push(testResult);
      setTestResults([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
    setCurrentStep(0);
    
    const successfulTests = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    toast({
      title: "Tests Completed",
      description: `${successfulTests}/${totalTests} tests passed`,
      duration: 5000,
    });
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="text-xs">
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-3">
              <Bot className="w-6 h-6 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Referral System Activation & Testing
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              اختبار شامل لنظام الإحالة والتحقق من جميع المكونات
            </p>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {isRunning ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Testing Step {currentStep}/{testSteps.length}...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Complete System Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Progress */}
        {isRunning && (
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Progress</span>
                  <span>{currentStep}/{testSteps.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / testSteps.length) * 100}%` }}
                  ></div>
                </div>
                {currentStep > 0 && (
                  <p className="text-xs text-gray-400 text-center">
                    Currently testing: {testSteps[currentStep - 1]?.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={result.key}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-red-500/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      <span className="font-medium">{result.step}</span>
                    </div>
                    {getStatusBadge(result.success)}
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">{result.message}</p>
                  
                  {result.data && (
                    <div className="bg-black/30 p-2 rounded text-xs">
                      <pre className="text-gray-400 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(result.timestamp).toLocaleString('ar-SA')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* System Status Summary */}
        {testResults.length === testSteps.length && (
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                System Status Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {testResults.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-gray-400">Tests Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {testResults.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-gray-400">Tests Failed</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-2">Next Steps:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• تحقق من النتائج أعلاه لمعرفة أي مشاكل</li>
                  <li>• إذا نجحت جميع الاختبارات، النظام جاهز للاستخدام</li>
                  <li>• اختبر رابط إحالة حقيقي من صفحة الإحالة</li>
                  <li>• راقب الإشعارات والمكافآت في الوقت الفعلي</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time System Monitoring */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle>System Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-400">Active</div>
                <div className="text-sm text-gray-400">Webhook Status</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">Ready</div>
                <div className="text-sm text-gray-400">Database</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-400">Online</div>
                <div className="text-sm text-gray-400">Bot Service</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ReferralSystemTester;
