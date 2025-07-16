
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { dailyLoginStreakService } from '@/services/dailyLoginStreakService';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { DailyLoginStreak, DailyLoginReward } from '@/types';
import { 
  Calendar, 
  Gift, 
  Clock, 
  CheckCircle,
  Star,
  Coins,
  Timer,
  TrendingUp
} from 'lucide-react';

const DailyLoginPage = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();
  const { telegramUser } = useTelegramUser();
  const { addCoins } = useSpaceCoins();
  const [streakData, setStreakData] = useState<DailyLoginStreak | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const dailyRewards: DailyLoginReward[] = dailyLoginStreakService.getDailyRewards();

  useEffect(() => {
    if (telegramUser?.id) {
      loadStreakData();
    }
  }, [telegramUser?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilReset(dailyLoginStreakService.getTimeUntilReset());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadStreakData = async () => {
    if (!telegramUser?.id) return;
    
    try {
      const data = await dailyLoginStreakService.getStreakData(telegramUser.id);
      setStreakData(data);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const handleClaimReward = async () => {
    if (!telegramUser?.id || !streakData) return;

    setIsLoading(true);
    try {
      const result = await dailyLoginStreakService.claimDailyReward(telegramUser.id);
      
      if (result.success) {
        // Add space coins to user balance
        addCoins(result.spaceReward);
        
        // Send TON if it's day 7
        if (result.tonReward && result.tonReward > 0) {
          try {
            const transaction = {
              validUntil: Math.floor(Date.now() / 1000) + 300,
              messages: [{
                address: telegramUser.id.toString(),
                amount: (result.tonReward * 1e9).toString()
              }]
            };
            // Note: This would require the app to have TON to send
            // In practice, you'd track this and send manually or use a different method
          } catch (tonError) {
            console.log('TON reward noted for manual processing:', result.tonReward);
          }
        }

        toast({
          title: "Reward Claimed!",
          description: `You earned ${result.spaceReward.toLocaleString()} SPACE coins${result.tonReward ? ` and ${result.tonReward} TON` : ''}`,
        });

        // Reload streak data
        await loadStreakData();
      } else {
        toast({
          title: "Claim Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim daily reward",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!streakData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 p-3 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-gradient-to-r from-purple-500/30 to-blue-600/30 rounded-2xl backdrop-blur-sm border border-purple-500/30">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Daily Login
          </h1>
          <p className="text-gray-400 text-sm">
            Login daily for 7 days to earn amazing rewards
          </p>
        </div>

        {/* Current Streak Status */}
        <Card className="bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Current Streak</h3>
                <p className="text-purple-300 text-sm">Day {streakData.currentDay} of 7</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">
                  {streakData.currentDay}/7
                </div>
              </div>
            </div>

            {!streakData.claimedToday && (
              <Button
                onClick={handleClaimReward}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Timer className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Claim Day {streakData.currentDay} Reward
                  </>
                )}
              </Button>
            )}

            {streakData.claimedToday && (
              <div className="text-center p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Today's reward claimed!</p>
                <p className="text-gray-400 text-sm mt-1">
                  Come back tomorrow for Day {streakData.currentDay === 7 ? 1 : streakData.currentDay + 1}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Rewards Grid */}
        <Card className="bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">7-Day Rewards</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {dailyRewards.map((reward, index) => {
                const isCurrentDay = reward.day === streakData.currentDay;
                const isPastDay = reward.day < streakData.currentDay;
                const isClaimed = isPastDay || (isCurrentDay && streakData.claimedToday);
                
                return (
                  <div
                    key={reward.day}
                    className={`
                      relative p-2 rounded-lg text-center border
                      ${isCurrentDay 
                        ? 'bg-purple-500/30 border-purple-400 ring-2 ring-purple-400' 
                        : isClaimed 
                          ? 'bg-green-500/20 border-green-500/30' 
                          : 'bg-gray-800/30 border-gray-600/30'
                      }
                    `}
                  >
                    <div className="text-xs text-gray-300 mb-1">Day {reward.day}</div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <img 
                          src="/lovable-uploads/a56963aa-9f88-44b8-9aff-3b5e9e4c7a60.png" 
                          alt="Space Coin" 
                          className="w-3 h-3 rounded-full" 
                        />
                        <span className="text-yellow-400 text-xs font-bold">
                          {(reward.spaceReward / 1000).toFixed(0)}K
                        </span>
                      </div>
                      
                      {reward.tonReward && (
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-400 text-xs font-bold">
                            {reward.tonReward} TON
                          </span>
                        </div>
                      )}
                    </div>

                    {isClaimed && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    )}

                    {reward.day === 7 && (
                      <div className="absolute -top-1 -left-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reset Timer */}
        <Card className="bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-purple-400 mr-2" />
              <h3 className="text-white font-semibold">Time Until Reset</h3>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {String(timeUntilReset.hours).padStart(2, '0')}:
              {String(timeUntilReset.minutes).padStart(2, '0')}:
              {String(timeUntilReset.seconds).padStart(2, '0')}
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Don't miss a day or your streak will reset!
            </p>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-3 text-center">Your Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <img 
                    src="/lovable-uploads/a56963aa-9f88-44b8-9aff-3b5e9e4c7a60.png" 
                    alt="Space Coin" 
                    className="w-4 h-4 rounded-full mr-1" 
                  />
                  <span className="text-yellow-400 font-bold">
                    {streakData.totalSpaceEarned.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">Total SPACE Earned</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Coins className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 font-bold">
                    {streakData.totalTonEarned.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">Total TON Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyLoginPage;
