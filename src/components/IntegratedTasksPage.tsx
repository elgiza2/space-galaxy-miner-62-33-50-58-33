
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, ExternalLink, Gift, ArrowDown } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { taskUserService } from '@/services/taskUserService';
import { taskVerificationService } from '@/services/taskVerificationService';
import ReferralTaskChecker from '@/components/ReferralTaskChecker';
import TaskVerificationModal from '@/components/TaskVerificationModal';
import { useToast } from '@/hooks/use-toast';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useTelegramUser } from '@/hooks/useTelegramUser';

const IntegratedTasksPage = () => {
  const { tasks, isLoading, reloadTasks } = useTaskManagement();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isTaskInProgress, setIsTaskInProgress] = useState<Record<string, boolean>>({});
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    taskTitle: string;
    taskId: string;
  }>({ isOpen: false, taskTitle: '', taskId: '' });
  
  const { toast } = useToast();
  const { addCoins, spaceCoins } = useSpaceCoins();
  const { telegramUser } = useTelegramUser();
  
  // Get username from localStorage or Telegram
  const username = telegramUser?.username || telegramUser?.first_name || localStorage.getItem('username') || '';
  const telegramId = telegramUser?.id;

  useEffect(() => {
    if (username) {
      loadCompletedTasks();
    }
  }, [username]);

  const loadCompletedTasks = async () => {
    try {
      const userCompletedTasks = await taskUserService.getUserCompletedTasks(username);
      const completedTaskIds = new Set(userCompletedTasks.map(ct => ct.task_id));
      setCompletedTasks(completedTaskIds);
    } catch (error) {
      console.error('Error loading completed tasks:', error);
    }
  };

  const needsVerification = (taskTitle: string) => {
    const verificationTasks = ['telegram username', 'story', 'website', 'share'];
    return verificationTasks.some(keyword => 
      taskTitle.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleTaskClick = async (task: any) => {
    if (isTaskInProgress[task.id] || completedTasks.has(task.id)) {
      return;
    }

    if (!username) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    // Check if task needs verification
    if (needsVerification(task.title)) {
      // Check if already verified
      const activityType = getActivityType(task.title);
      const isVerified = await taskVerificationService.isTaskVerified(username, activityType);
      
      if (isVerified) {
        // Complete the task if already verified
        await completeTask(task);
      } else {
        // Open verification modal
        setVerificationModal({
          isOpen: true,
          taskTitle: task.title,
          taskId: task.id
        });
      }
      return;
    }

    // Handle regular tasks
    setIsTaskInProgress(prev => ({ ...prev, [task.id]: true }));

    try {
      // Open external link if available
      if (task.external_link && task.external_link !== '#') {
        window.open(task.external_link, '_blank');
      }

      await completeTask(task);
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsTaskInProgress(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const completeTask = async (task: any) => {
    try {
      // Complete the task in database
      await taskUserService.completeTask(task.id, username);
      
      // Add coins to user
      const rewardAmount = task.reward_amount || task.reward || 0;
      addCoins(rewardAmount);
      
      // Update completed tasks
      setCompletedTasks(prev => new Set([...prev, task.id]));
      
      toast({
        title: "Congratulations!",
        description: `Task completed and you earned ${rewardAmount} reward`,
        duration: 3000,
      });
    } catch (error) {
      throw error;
    }
  };

  const getActivityType = (taskTitle: string) => {
    if (taskTitle.toLowerCase().includes('telegram username')) {
      return 'telegram_username_verified';
    } else if (taskTitle.toLowerCase().includes('story')) {
      return 'story_sharing_verified';
    } else if (taskTitle.toLowerCase().includes('website') || taskTitle.toLowerCase().includes('share')) {
      return 'website_sharing_verified';
    }
    return 'task_completed';
  };

  const handleVerificationComplete = async () => {
    // Find the task and complete it
    const task = tasks.find(t => t.id === verificationModal.taskId);
    if (task) {
      await completeTask(task);
    }
  };

  const isReferralTask = (taskTitle: string) => {
    const referralKeywords = ['invite', 'friend', 'refer'];
    return referralKeywords.some(keyword => 
      taskTitle.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const activeTasks = tasks.filter(task => task.is_active !== false);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center"
        style={{
          backgroundImage: 'url(/lovable-uploads/1c20bfb0-8100-4238-a6e3-a631e16cae93.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        <div className="relative z-10 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen relative bg-black"
      style={{
        backgroundImage: 'url(/lovable-uploads/1c20bfb0-8100-4238-a6e3-a631e16cae93.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      
      <ScrollArea className="h-full">
        <div className="relative z-10 px-4 py-8">
          {/* Balance Display */}
          <div className="text-center mb-8 mt-16">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/a56963aa-9f88-44b8-9aff-3b5e9e4c7a60.png" 
                alt="Space Coin" 
                className="w-6 h-6 rounded-full" 
              />
              <h2 className="text-white text-xl font-bold">$SPACE</h2>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-2">
              {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(spaceCoins)}
            </div>
            <p className="text-gray-400 text-sm">Current Balance</p>
          </div>

          {/* Tasks Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <Gift className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-2">
              Tasks
            </h1>
            <p className="text-gray-400 text-sm">
              Complete tasks and earn amazing rewards
            </p>
          </div>

          {/* Tasks Section */}
          <div className="max-w-md mx-auto space-y-3 pb-8">
            {activeTasks.map((task) => (
              <div key={task.id}>
                {isReferralTask(task.title) ? (
                  <ReferralTaskChecker
                    username={username}
                    taskTitle={task.title}
                    taskId={task.id}
                    rewardAmount={task.reward_amount || task.reward || 0}
                  />
                ) : (
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          completedTasks.has(task.id) ? 'bg-green-500/20' : 'bg-blue-500/20'
                        }`}>
                          {completedTasks.has(task.id) ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <Clock className="w-6 h-6 text-blue-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-sm">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <img 
                                src="/lovable-uploads/a56963aa-9f88-44b8-9aff-3b5e9e4c7a60.png" 
                                alt="Space Coin" 
                                className="w-3 h-3 rounded-full" 
                              />
                              <span className="text-yellow-400 text-xs font-bold">+{task.reward_amount || task.reward}</span>
                            </div>
                            {completedTasks.has(task.id) && (
                              <>
                                <span className="text-gray-400 text-xs">•</span>
                                <span className="text-green-400 text-xs">Completed</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {completedTasks.has(task.id) ? (
                            <span className="text-gray-400 text-xs">Completed</span>
                          ) : (
                            <Button
                              onClick={() => handleTaskClick(task)}
                              disabled={isTaskInProgress[task.id]}
                              className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-700 text-white px-4 py-2 text-sm flex items-center gap-1 rounded-lg transition-all duration-300"
                            >
                              {isTaskInProgress[task.id] ? (
                                <Clock className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  {needsVerification(task.title) ? 'Verify' : 'Start'}
                                  {task.external_link && task.external_link !== '#' && !needsVerification(task.title) && (
                                    <ExternalLink className="w-3 h-3" />
                                  )}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}

            {activeTasks.length === 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">No tasks available at the moment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Task Verification Modal */}
      <TaskVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, taskTitle: '', taskId: '' })}
        taskTitle={verificationModal.taskTitle}
        taskId={verificationModal.taskId}
        username={username}
        telegramId={telegramId}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
};

export default IntegratedTasksPage;
