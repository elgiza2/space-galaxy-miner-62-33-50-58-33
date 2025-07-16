
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, Gift, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { telegramWebhookService } from '@/services/telegramWebhookService';

const ReferralSystemMonitor = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentRewards, setRecentRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSystemStatus();
    loadRecentActivity();
  }, []);

  const checkSystemStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check webhook status
      const webhookStatus = await telegramWebhookService.checkWebhookStatus();
      
      // Check database connectivity
      const { data: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Check recent referral events
      const { data: recentEventsData } = await supabase
        .from('referral_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setSystemStatus({
        webhook: webhookStatus.configured,
        database: profilesCount !== null,
        recentEvents: recentEventsData?.length || 0
      });
      
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Load recent referral events
      const { data: events } = await supabase
        .from('referral_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setRecentEvents(events || []);
      
      // Load recent rewards
      const { data: rewards } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('reward_type', 'referral_bonus')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setRecentRewards(rewards || []);
      
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const testWebhook = async () => {
    const result = await telegramWebhookService.testWebhook();
    toast({
      title: result.success ? "✅ Test Passed" : "❌ Test Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  const refreshData = () => {
    checkSystemStatus();
    loadRecentActivity();
    toast({
      title: "🔄 Refreshed",
      description: "System data updated successfully",
      duration: 2000
    });
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus?.webhook)}
                <span className="font-medium">Telegram Webhook</span>
              </div>
              <Badge variant={systemStatus?.webhook ? "default" : "destructive"}>
                {systemStatus?.webhook ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus?.database)}
                <span className="font-medium">Database</span>
              </div>
              <Badge variant={systemStatus?.database ? "default" : "destructive"}>
                {systemStatus?.database ? 'Connected' : 'Error'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="font-medium">Recent Events</span>
              </div>
              <Badge variant="outline">
                {systemStatus?.recentEvents || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={refreshData}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          onClick={testWebhook}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Zap className="w-4 h-4 mr-2" />
          Test Webhook
        </Button>
      </div>

      {/* Recent Events */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Recent Referral Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {formatEventType(event.event_type)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {event.referrer_username} → {event.referred_username || 'Pending'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              No recent referral events
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" />
            Recent Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRewards.length > 0 ? (
            <div className="space-y-2">
              {recentRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {reward.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      {reward.reward_category}: {reward.amount}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {reward.claimed ? 'Claimed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              No recent rewards
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ReferralSystemMonitor;
