import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useCurrency } from '../hooks/useCurrency';
import { useTickets } from '@/hooks/useTickets';
import { taskUserService } from '@/services/taskUserService';
import { taskRewardService } from '@/services/taskRewardService';
import DailyCheckInTask from '@/components/DailyCheckInTask';
import { CheckCircle, ExternalLink, Calendar, UserPlus, Clock, Gift, Handshake, Star, HeartHandshake, Wallet, Ticket } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { sendTONPayment } from '@/utils/ton';
type Task = Database['public']['Tables']['tasks']['Row'];
interface TasksPageProps {
  onNavigate?: (page: string) => void;
}
const TasksPage = ({
  onNavigate
}: TasksPageProps) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isTaskInProgress, setIsTaskInProgress] = useState<Record<string, boolean>>({});
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [supportTaskCompleted, setSupportTaskCompleted] = useState(false);
  const [supportTaskProcessing, setSupportTaskProcessing] = useState(false);
  const {
    toast
  } = useToast();
  const {
    addSpins,
    addCoins,
    addSpaceCoins
  } = useCurrency();
  const [tonConnectUI] = useTonConnectUI();
  const {
    createTaskRewardTicket
  } = useTickets();

  // Get real tasks from database
  const {
    tasks,
    isLoading: tasksLoading,
    reloadTasks
  } = useTaskManagement();

  // Get username from localStorage
  const username = localStorage.getItem('username') || '';
  const isWalletConnected = !!tonConnectUI.wallet;
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
        setLastClickTime(0);
      }, 2000); // Reset after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  // Load completed tasks on component mount
  useEffect(() => {
    if (username) {
      loadCompletedTasks();
    }
  }, [username]);

  // Handle page clicks for navigation
  const handlePageClick = () => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime > 500) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 5 && onNavigate) {
        onNavigate('admin');
        setClickCount(0);
        setLastClickTime(0);
        return;
      }
    }
    setLastClickTime(currentTime);
  };
  const loadCompletedTasks = async () => {
    try {
      const userCompletedTasks = await taskUserService.getUserCompletedTasks(username);
      const completedTaskIds = new Set(userCompletedTasks.map(ct => ct.task_id));
      setCompletedTasks(completedTaskIds);
    } catch (error) {
      console.error('Error loading completed tasks:', error);
    }
  };

  // Check if a task is daily check-in
  const isDailyCheckInTask = (taskTitle: string) => {
    return taskTitle.toLowerCase().includes('daily check-in');
  };
  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Calendar;
      case 'in_progress':
        return Clock;
      case 'completed':
        return CheckCircle;
      case 'failed':
        return Gift;
      default:
        return Gift;
    }
  };
  const getCategoryColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-blue-500 to-blue-600';
      case 'in_progress':
        return 'from-blue-500 to-cyan-600';
      case 'completed':
        return 'from-blue-500 to-blue-600';
      case 'failed':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };
  const formatReward = (reward: number) => {
    return reward.toLocaleString();
  };
  const handleConnectWallet = async () => {
    if (!tonConnectUI) {
      toast({
        title: 'Wallet Error',
        description: 'TON Connect not available',
        variant: 'destructive'
      });
      return;
    }
    try {
      await tonConnectUI.openModal();
      toast({
        title: 'Opening Connection',
        description: 'Please select your wallet'
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect wallet',
        variant: 'destructive'
      });
    }
  };
  const handleSupportTeamTask = async () => {
    if (!username) {
      toast({
        title: 'Error',
        description: 'Please login first',
        variant: 'destructive'
      });
      return;
    }
    if (!isWalletConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your TON wallet first',
        variant: 'destructive'
      });
      return;
    }
    if (supportTaskCompleted || supportTaskProcessing) {
      return;
    }
    setSupportTaskProcessing(true);
    try {
      // Send 0.5 TON payment
      await sendTONPayment(tonConnectUI, "UQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL", 0.5);

      // Add 10000 SPACE coins
      addCoins(10000);
      setSupportTaskCompleted(true);

      // Give ticket reward for support task
      await createTaskRewardTicket();
      toast({
        title: 'Task Completed! 🎉',
        description: 'Support Team task completed! You earned 10,000 SPACE coins + bonus ticket!'
      });
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: 'Payment Failed',
        description: 'Transaction was rejected or cancelled. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSupportTaskProcessing(false);
    }
  };
  const handleTaskComplete = async (task: Task) => {
    if (isTaskInProgress[task.id] || completedTasks.has(task.id)) {
      return;
    }
    if (!username) {
      toast({
        title: 'Error',
        description: 'Please login first',
        variant: 'destructive'
      });
      return;
    }
    setIsTaskInProgress(prev => ({
      ...prev,
      [task.id]: true
    }));
    try {
      // Open external link if available
      if (task.external_link && task.external_link !== '#') {
        window.open(task.external_link, '_blank');
      }

      // Complete the task in database
      await taskUserService.completeTask(task.id, username);

      // Add rewards based on task type - space coins for main/daily, coins for partner
      const rewardAmount = task.reward_amount || task.reward || 0;
      if (task.status === 'completed') {
        // Partner tasks give coins
        addCoins(rewardAmount);
      } else {
        // Main and daily tasks give space coins
        addSpaceCoins(rewardAmount);
      }

      // Always give ticket reward for task completion
      await createTaskRewardTicket();

      // Update completed tasks
      setCompletedTasks(prev => new Set([...prev, task.id]));
      reloadTasks();
      toast({
        title: 'Task Completed',
        description: `Task completed successfully! You earned ${rewardAmount} ${task.status === 'completed' ? 'coins' : 'space coins'} + bonus ticket!`
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsTaskInProgress(prev => ({
        ...prev,
        [task.id]: false
      }));
    }
  };

  // Filter tasks based on their status for proper categorization
  const tasksByCategory = useMemo(() => {
    const activeTasks = tasks.filter(task => {
      return task.is_active !== false && !completedTasks.has(task.id);
    });
    return {
      // Main tasks: Tasks with status 'in_progress' (excluding daily check-in)
      main: activeTasks.filter(task => task.status === 'in_progress' && !isDailyCheckInTask(task.title || '')),
      // Partner tasks: Tasks with status 'completed' (excluding daily check-in)
      partner: activeTasks.filter(task => task.status === 'completed' && !isDailyCheckInTask(task.title || '')),
      // Daily tasks: Tasks with status 'pending' OR daily check-in tasks
      daily: activeTasks.filter(task => task.status === 'pending' || isDailyCheckInTask(task.title || ''))
    };
  }, [tasks, completedTasks]);
  const renderSupportTeamTask = () => {
    return <div className="bg-black border border-gray-800 rounded-xl p-2 cursor-pointer hover:border-gray-700 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
            {supportTaskCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <HeartHandshake className="w-4 h-4 text-white" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-xs mb-1">
              Support Team
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-blue-400 font-bold text-xs">
                  0.5 TON
                </span>
              </div>
              
              {!isWalletConnected ? <Button onClick={handleConnectWallet} variant="glass-purple" className="px-2 py-1 text-xs h-6 rounded-lg">
                  <Wallet className="w-3 h-3 mr-1" />
                  Connect
                </Button> : <Button onClick={handleSupportTeamTask} disabled={supportTaskCompleted || supportTaskProcessing} variant="glass-purple" className="px-2 py-1 text-xs h-6 rounded-lg">
                  {supportTaskProcessing ? <Clock className="w-3 h-3 animate-spin" /> : supportTaskCompleted ? 'Completed' : <>
                      Start
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </>}
                </Button>}
            </div>
          </div>
        </div>
      </div>;
  };
  const renderTaskCard = (task: Task) => {
    // Handle daily check-in task specially - use the DailyCheckInTask component directly
    if (isDailyCheckInTask(task.title || '')) {
      return <DailyCheckInTask key={task.id} taskId={task.id} rewardAmount={task.reward_amount || task.reward || 0} username={username} onTaskComplete={() => {
        setCompletedTasks(prev => new Set([...prev, task.id]));
        reloadTasks();
      }} />;
    }
    const TaskIcon = getTaskIcon(task.status || 'pending');
    const isCompleted = completedTasks.has(task.id);
    const inProgress = isTaskInProgress[task.id] === true;
    if (isCompleted) {
      return null;
    }
    return <div key={task.id} className="bg-gradient-to-r from-blue-800/40 to-blue-700/40 backdrop-blur-sm border border-blue-600/30 rounded-xl p-4 transition-all duration-300 hover:from-blue-700/50 hover:to-blue-600/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer" onClick={() => handleTaskComplete(task)}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-[2px]">
            {task.image_url ? <img src={task.image_url} alt={task.title || 'Task image'} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-full">
                <TaskIcon className="w-6 h-6 text-white" />
              </div>}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white mb-2 text-xs font-medium text-left">
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600/30 to-blue-500/30 px-2 py-1 rounded-lg">
                <Gift className="w-3 h-3 text-blue-300" />
                <span className="text-blue-300 text-xs font-semibold">
                  +{task.reward_amount || task.reward || 1000} space coins
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={e => {
            e.stopPropagation();
            handleTaskComplete(task);
          }} disabled={isCompleted || inProgress} className="px-4 py-2 text-xs flex items-center gap-2 rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 shadow-lg shadow-blue-500/30">
              {inProgress ? <Clock className="w-4 h-4 animate-spin" /> : <>
                  <span>Start</span>
                  {task.external_link && task.external_link !== '#' && <ExternalLink className="w-4 h-4" />}
                </>}
            </Button>
          </div>
        </div>
      </div>;
  };

  // Show loading state
  if (tasksLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-200">Loading tasks...</p>
        </div>
      </div>;
  }
  return <div className="h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white" onClick={handlePageClick}>
      <ScrollArea className="h-full">
        <div className="px-4 py-8 pb-24">
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 mt-4 h-12 bg-gradient-to-r from-blue-800/30 to-blue-700/30 backdrop-blur-sm border border-blue-600/30 rounded-xl">
                <TabsTrigger value="main" className="text-xs py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-blue-200 bg-transparent border-0">
                  Main Tasks
                </TabsTrigger>
                <TabsTrigger value="partner" className="text-xs py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-blue-200 bg-transparent border-0">
                  Partner Tasks
                </TabsTrigger>
                <TabsTrigger value="daily" className="text-xs py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-blue-200 bg-transparent border-0">
                  Daily Tasks
                </TabsTrigger>
              </TabsList>

              <div className="space-y-2">
                <TabsContent value="main" className="space-y-2 mt-0">
                  {tasksByCategory.main.map(task => renderTaskCard(task))}
                  {tasksByCategory.main.length === 0 && <div className="bg-gradient-to-r from-blue-800/20 to-blue-700/20 backdrop-blur-sm border border-blue-600/20 rounded-xl p-6 text-center">
                      <p className="text-blue-200 text-sm">No main tasks available</p>
                    </div>}
                </TabsContent>

                <TabsContent value="partner" className="space-y-2 mt-0">
                  {tasksByCategory.partner.map(task => renderTaskCard(task))}
                  {tasksByCategory.partner.length === 0 && <div className="bg-gradient-to-r from-blue-800/20 to-blue-700/20 backdrop-blur-sm border border-blue-600/20 rounded-xl p-6 text-center">
                      <p className="text-blue-200 text-sm">No partner tasks available</p>
                    </div>}
                </TabsContent>

                <TabsContent value="daily" className="space-y-2 mt-0">
                  {tasksByCategory.daily.map(task => renderTaskCard(task))}
                  {renderSupportTeamTask()}
                  {tasksByCategory.daily.length === 0 && <div className="bg-gradient-to-r from-blue-800/20 to-blue-700/20 backdrop-blur-sm border border-blue-600/20 rounded-xl p-6 text-center">
                      <p className="text-blue-200 text-sm">No daily tasks available</p>
                    </div>}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </div>;
};
export default TasksPage;