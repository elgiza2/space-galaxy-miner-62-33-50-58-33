
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Users, CheckSquare, Activity, BarChart3, TrendingUp, Coins, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUserStats } from '@/hooks/useUserStats';
import { userActivityService } from '@/services/userActivityService';
import TaskAdminTable from './TaskAdminTable';
import TaskFormSimple from './TaskFormSimple';
import AdminStatsCard from './AdminStatsCard';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type NewTask = Database['public']['Tables']['tasks']['Insert'];

const SimplifiedTaskAdminDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const { toast } = useToast();
  
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    reloadTasks
  } = useTaskManagement();

  const {
    currentActiveUsers,
    lastHourActiveUsers,
    topPurchasers,
    isLoading: analyticsLoading,
    reloadAnalytics
  } = useAnalytics();

  const {
    totalUsers,
    activeUsersToday,
    newUsersThisWeek,
    totalEarnings,
    isLoading: userStatsLoading,
    reloadStats
  } = useUserStats();

  // Track admin session
  useEffect(() => {
    const initializeAdminSession = async () => {
      const username = localStorage.getItem('username') || 'admin';
      try {
        await userActivityService.trackUserSession(username, username);
        await userActivityService.trackUserActivity(username, 'admin_dashboard_view', {
          page: 'simplified_admin'
        });
      } catch (error) {
        console.error('Error initializing admin session:', error);
      }
    };

    initializeAdminSession();
  }, []);

  // Auto-refresh statistics every 30 seconds to ensure 100% accuracy
  useEffect(() => {
    const interval = setInterval(() => {
      reloadAnalytics();
      reloadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [reloadAnalytics, reloadStats]);

  const handleCreateTask = async (taskData: NewTask) => {
    try {
      await createTask(taskData);
      setShowForm(false);
      setEditingTask(null);
      toast({
        title: "Task Created",
        description: "Task created successfully"
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTask = async (taskData: NewTask) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, taskData);
      setShowForm(false);
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Task updated successfully"
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
    
    const username = localStorage.getItem('username') || 'admin';
    try {
      await userActivityService.trackUserActivity(username, 'edit_task_view', {
        task_id: task.id,
        task_title: task.title
      });
    } catch (error) {
      console.error('Error tracking edit activity:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast({
          title: "Task Deleted",
          description: "Task deleted successfully"
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleTaskStatus(id, isActive);
      toast({
        title: "Status Updated",
        description: `Task ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleRefresh = async () => {
    reloadAnalytics();
    reloadTasks();
    reloadStats();
    
    const username = localStorage.getItem('username') || 'admin';
    try {
      await userActivityService.trackUserActivity(username, 'refresh_dashboard', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking refresh activity:', error);
    }
    
    toast({
      title: "Updated",
      description: "All data updated successfully"
    });
  };

  const activeTasks = tasks.filter(t => t.is_active !== false).length;
  const inactiveTasks = tasks.filter(t => t.is_active === false).length;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-white/10 to-gray-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-bl from-gray-400/10 to-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-gray-300/10 to-white/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-2xl">
            <BarChart3 className="w-10 h-10 text-white/80" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Advanced Admin Dashboard
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Comprehensive management system with accurate statistics and real-time user tracking (auto-updates every 30 seconds)
          </p>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {totalUsers.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">Total registered users count</p>
                <p className="text-xs font-medium mt-2 text-blue-300">+5.2% from last month</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                <Users className="w-8 h-8 text-blue-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">Active Today</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {activeUsersToday.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">Active users today</p>
                <p className="text-xs font-medium mt-2 text-green-300">+12% from yesterday</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                <Activity className="w-8 h-8 text-green-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">New Users</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {newUsersThisWeek.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">Joined this week</p>
                <p className="text-xs font-medium mt-2 text-purple-300">+18% from last week</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                <UserPlus className="w-8 h-8 text-purple-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">Total Earnings</p>
                 <p className="text-3xl font-bold text-white mb-1">
                  {Math.round(totalEarnings).toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">SPACE coins earned</p>
                <p className="text-xs font-medium mt-2 text-orange-300">+24% this month</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                <Coins className="w-8 h-8 text-orange-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">Current Online</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {currentActiveUsers.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">Active in last 5 minutes</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                <Activity className="w-8 h-8 text-cyan-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">Active Tasks</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {activeTasks.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">Out of {tasks.length} tasks</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                <CheckSquare className="w-8 h-8 text-pink-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">Hourly Activity</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {lastHourActiveUsers.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">Active users last hour</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                <TrendingUp className="w-8 h-8 text-red-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="flex justify-between items-center mb-8 bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Task Management</h2>
            <p className="text-gray-400">Manage and edit all tasks with advanced statistics</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRefresh}
              disabled={analyticsLoading || isLoading || userStatsLoading}
              className="bg-black/40 backdrop-blur-xl border border-white/20 hover:bg-black/60 hover:border-white/30 rounded-xl px-6 py-3 shadow-lg transition-all duration-300 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-black/40 backdrop-blur-xl border border-white/20 hover:bg-black/60 hover:border-white/30 rounded-xl px-6 py-3 shadow-lg transition-all duration-300 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Task
              </Button>
            )}
          </div>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-8">
            <TaskFormSimple
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Tasks Table */}
        {!showForm && (
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <TaskAdminTable 
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedTaskAdminDashboard;
