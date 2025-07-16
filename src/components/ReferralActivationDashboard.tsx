
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Bot, Database, Zap, Users, Gift, ExternalLink, Copy, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { telegramWebhookService } from '@/services/telegramWebhookService';
import ReferralSystemMonitor from './ReferralSystemMonitor';

const ReferralActivationDashboard = () => {
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testReferralLink, setTestReferralLink] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkWebhookStatus();
    generateTestReferralLink();
  }, []);

  const checkWebhookStatus = async () => {
    try {
      const status = await telegramWebhookService.checkWebhookStatus();
      setWebhookStatus(status);
    } catch (error) {
      console.error('Error checking webhook status:', error);
    }
  };

  const setupWebhook = async () => {
    setIsLoading(true);
    try {
      const result = await telegramWebhookService.setupWebhook();
      if (result.success) {
        toast({
          title: "✅ Webhook Activated",
          description: "Telegram webhook has been successfully configured",
          duration: 5000,
        });
        await checkWebhookStatus();
      } else {
        toast({
          title: "❌ Setup Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup webhook",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestReferralLink = () => {
    const testUsername = `test_user_${Date.now()}`;
    const link = `https://t.me/Spacelbot?startapp=${testUsername}`;
    setTestReferralLink(link);
  };

  const copyTestLink = () => {
    navigator.clipboard.writeText(testReferralLink);
    toast({
      title: "📋 Copied!",
      description: "Test referral link copied to clipboard",
      duration: 3000,
    });
  };

  const openTelegramBot = () => {
    window.open('https://t.me/Spacelbot', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Referral System Management
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300">
            Complete referral system activation, testing, and monitoring dashboard
          </p>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="activation" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger value="activation" className="data-[state=active]:bg-blue-500/30">
            Activation
          </TabsTrigger>
          <TabsTrigger value="testing" className="data-[state=active]:bg-green-500/30">
            Testing
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-500/30">
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Activation Tab */}
        <TabsContent value="activation" className="space-y-4">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 text-center">
                <Bot className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-1">Telegram Bot</h3>
                <Badge variant="default" className="bg-green-500">
                  {webhookStatus?.configured ? 'Active' : 'Inactive'}
                </Badge>
                <p className="text-xs text-gray-400 mt-2">
                  Bot API integration status
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 text-center">
                <Database className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-1">Database</h3>
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
                <p className="text-xs text-gray-400 mt-2">
                  Supabase connection active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-1">Webhook</h3>
                <Badge variant={webhookStatus?.configured ? "default" : "destructive"}>
                  {webhookStatus?.configured ? 'Configured' : 'Not Set'}
                </Badge>
                <p className="text-xs text-gray-400 mt-2">
                  Real-time event processing
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Webhook Setup */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!webhookStatus?.configured ? (
                <div className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-lg">
                  <p className="text-yellow-100 mb-3">
                    🚨 Webhook not configured yet. Click below to activate the system.
                  </p>
                  <Button
                    onClick={setupWebhook}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 mr-2" />
                        Activate Webhook
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg">
                  <p className="text-green-100 mb-2">
                    ✅ Webhook successfully configured and active!
                  </p>
                  <p className="text-green-200 text-sm">
                    The system is now ready to receive real-time referral events from Telegram.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Test Referral System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Test Referral Link:</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/10 p-2 rounded border border-white/20">
                    <p className="text-sm text-white font-mono break-all">{testReferralLink}</p>
                  </div>
                  <Button
                    onClick={copyTestLink}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={openTelegramBot}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Telegram Bot
                </Button>
                <Button
                  onClick={generateTestReferralLink}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Generate New Test Link
                </Button>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-2">Testing Instructions:</h4>
                <ol className="text-sm text-blue-100 space-y-1">
                  <li>1. Copy the test referral link above</li>
                  <li>2. Open it in a new browser tab or share it</li>
                  <li>3. Start the Telegram bot using the /start command</li>
                  <li>4. Check the monitoring tab for real-time events</li>
                  <li>5. Verify rewards are processed correctly</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <ReferralSystemMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralActivationDashboard;
