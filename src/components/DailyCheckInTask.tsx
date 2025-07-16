
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { taskUserService } from '@/services/taskUserService';

interface DailyCheckInTaskProps {
  taskId: string;
  rewardAmount: number;
  username: string;
  onTaskComplete?: () => void;
}

const DailyCheckInTask: React.FC<DailyCheckInTaskProps> = ({ 
  taskId, 
  rewardAmount, 
  username,
  onTaskComplete 
}) => {
  const [tonConnectUI] = useTonConnectUI();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addCoins } = useSpaceCoins();
  const { toast } = useToast();

  useEffect(() => {
    checkTaskCompletion();
  }, [taskId, username]);

  const checkTaskCompletion = async () => {
    try {
      const completed = await taskUserService.isTaskCompleted(taskId, username);
      setIsCompleted(completed);
    } catch (error) {
      console.error('Error checking task completion:', error);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!username) {
      toast({
        title: 'Error',
        description: 'Please login first',
        variant: 'destructive'
      });
      return;
    }

    if (isCompleted || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Check if wallet is connected
      if (!tonConnectUI.wallet) {
        await tonConnectUI.connectWallet();
        setIsProcessing(false);
        return;
      }

      // Create simple TON transaction without payload to avoid format errors
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R',
            amount: (0.5 * 1e9).toString(), // 0.5 TON in nanoTON
          }
        ]
      };

      console.log('Sending simple daily check-in transaction:', transaction);

      // Send the transaction
      const result = await tonConnectUI.sendTransaction(transaction);
      
      if (result) {
        // Mark task as completed in database
        await taskUserService.completeTask(taskId, username);
        
        // Add reward coins to user
        addCoins(rewardAmount);
        
        setIsCompleted(true);
        
        toast({
          title: 'Daily Check-in Complete!',
          description: `Payment successful! You earned ${rewardAmount} $SPACE coins.`,
        });

        if (onTaskComplete) {
          onTaskComplete();
        }
      }
    } catch (error) {
      console.error('Error processing daily check-in:', error);
      toast({
        title: 'Transaction Error',
        description: 'Failed to complete daily check-in. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Use the exact same styling as Support Team task
  return (
    <div 
      className="bg-black border border-gray-800 rounded-xl p-2 cursor-pointer hover:border-gray-700 transition-all duration-300"
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <Calendar className="w-4 h-4 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-xs mb-1">
            Daily Check-in
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-blue-400 font-bold text-xs">
                0.5 TON
              </span>
            </div>
            
            <Button
              onClick={handleDailyCheckIn}
              disabled={isCompleted || isProcessing}
              variant="glass-purple"
              className="px-2 py-1 text-xs h-6 rounded-lg"
            >
              {isProcessing ? (
                <Clock className="w-3 h-3 animate-spin" />
              ) : isCompleted ? (
                'Completed'
              ) : (
                <>
                  Start
                  <ExternalLink className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckInTask;
