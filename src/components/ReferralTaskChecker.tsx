
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Users, Gift } from 'lucide-react';
import { referralTaskService } from '@/services/referralTaskService';
import { useToast } from '@/hooks/use-toast';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';

interface ReferralTaskCheckerProps {
  username: string;
  taskTitle: string;
  taskId: string;
  rewardAmount: number;
}

const ReferralTaskChecker: React.FC<ReferralTaskCheckerProps> = ({
  username,
  taskTitle,
  taskId,
  rewardAmount
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState({ current: 0, required: 1, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const { toast } = useToast();
  const { addCoins } = useSpaceCoins();

  useEffect(() => {
    checkTaskStatus();
    // Check if reward was already claimed from localStorage
    const claimedTasks = JSON.parse(localStorage.getItem('claimedReferralTasks') || '[]');
    setHasClaimedReward(claimedTasks.includes(taskId));
  }, [username, taskTitle, taskId]);

  const checkTaskStatus = async () => {
    if (!username) return;
    
    setIsLoading(true);
    try {
      const completed = await referralTaskService.checkReferralTaskCompletion(username, taskTitle);
      const progressData = await referralTaskService.getReferralTaskProgress(username, taskTitle);
      
      setIsCompleted(completed);
      setProgress(progressData);
      
      console.log(`Task "${taskTitle}" status for ${username}:`, {
        completed,
        progress: progressData
      });
    } catch (error) {
      console.error('Error checking task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async () => {
    if (hasClaimedReward) {
      toast({
        title: "Already Claimed",
        description: "You have already received the reward for this task",
        variant: "destructive"
      });
      return;
    }

    if (!isCompleted) {
      toast({
        title: "Task Not Completed",
        description: `You need to invite ${progress.required - progress.current} more friends to complete this task`,
        variant: "destructive"
      });
      return;
    }

    setIsClaimingReward(true);
    try {
      const result = await referralTaskService.claimReferralTaskReward(username, taskTitle, rewardAmount);
      
      if (result.success) {
        // Add coins to user's balance
        addCoins(rewardAmount);
        
        // Mark as claimed in localStorage
        const claimedTasks = JSON.parse(localStorage.getItem('claimedReferralTasks') || '[]');
        claimedTasks.push(taskId);
        localStorage.setItem('claimedReferralTasks', JSON.stringify(claimedTasks));
        setHasClaimedReward(true);
        
        toast({
          title: "Congratulations!",
          description: result.message,
        });
      } else {
        toast({
          title: "Cannot Claim Reward",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "An error occurred while claiming the reward",
        variant: "destructive"
      });
    } finally {
      setIsClaimingReward(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${
            hasClaimedReward ? 'bg-gray-500/20' : 
            isCompleted ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}>
            {hasClaimedReward ? (
              <CheckCircle className="w-6 h-6 text-gray-400" />
            ) : isCompleted ? (
              <Gift className="w-6 h-6 text-green-400" />
            ) : (
              <Users className="w-6 h-6 text-blue-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm">{taskTitle}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-xs">{rewardAmount}</span>
              </div>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-gray-400 text-xs">
                {progress.current}/{progress.required} friends
              </span>
              {hasClaimedReward && (
                <>
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-green-400 text-xs">Claimed</span>
                </>
              )}
            </div>
            
            {!isCompleted && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{progress.percentage}% complete</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasClaimedReward ? (
              <div className="flex items-center gap-1 text-gray-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Completed</span>
              </div>
            ) : isCompleted ? (
              <Button
                onClick={claimReward}
                disabled={isClaimingReward}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
              >
                {isClaimingReward ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  'Claim Reward'
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Pending</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralTaskChecker;
