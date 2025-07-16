
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, CheckSquare, Users, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useAnalytics } from '@/hooks/useAnalytics';
import { userActivityService } from '@/services/userActivityService';
import TaskAdminTable from './TaskAdminTable';
import TaskFormSimple from './TaskFormSimple';
import AnalyticsCards from './AnalyticsCards';
import TaskCompletionStats from './TaskCompletionStats';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type NewTask = Database['public']['Tables']['tasks']['Insert'];

const TaskAdminDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const { toast } = useToast();
  
  // Use the task management hook
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    reloadTasks
  } = useTaskManagement();

  // Use the analytics hook
  const {
    taskStats,
    currentActiveUsers,
    lastHourActiveUsers,
    topPurchasers,
    isLoading: analyticsLoading,
    reloadAnalytics
  } = useAnalytics();

  // Track admin session on component mount
  useEffect(() => {
    const initializeAdminSession = async () => {
      const username = localStorage.getItem('username') || 'admin';
      try {
        await userActivityService.trackUserSession(username, username);
        await userActivityService.trackUserActivity(username, 'admin_dashboard_view', {
          page: 'task_management'
        });
      } catch (error) {
        console.error('Error initializing admin session:', error);
      }
    };

    initializeAdminSession();

    // Update last activity every 30 seconds
    const interval = setInterval(async () => {
      const username = localStorage.getItem('username') || 'admin';
      try {
        await userActivityService.updateLastActivity(username);
      } catch (error) {
        console.error('Error updating last activity:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = async (taskData: NewTask) => {
    console.log('Creating new task:', taskData);
    
    try {
      await createTask(taskData);
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: NewTask) => {
    if (!editingTask) return;
    
    console.log('Updating task:', editingTask.id, taskData);
    
    try {
      await updateTask(editingTask.id, taskData);
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEdit = async (task: Task) => {
    console.log('Editing task:', task);
    setEditingTask(task);
    setShowForm(true);
    
    // Track admin activity
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
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleTaskStatus(id, isActive);
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleRefreshAnalytics = async () => {
    reloadAnalytics();
    
    // Track admin activity
    const username = localStorage.getItem('username') || 'admin';
    try {
      await userActivityService.trackUserActivity(username, 'refresh_analytics', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking refresh activity:', error);
    }
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث الإحصائيات بنجاح"
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Enhanced background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/lovable-uploads/a657c04d-35d5-4114-ad66-514b60fcdc0f.png)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80"></div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl backdrop-blur-xl border border-white/20 mb-6 shadow-2xl">
            <Settings className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            لوحة إدارة المهام المتقدمة
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            إدارة شاملة للمهام والمكافآت مع تحليلات متقدمة ومراقبة في الوقت الفعلي
          </p>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="mb-8">
          <AnalyticsCards
            currentActiveUsers={currentActiveUsers}
            lastHourActiveUsers={lastHourActiveUsers}
            topPurchasers={topPurchasers}
            isLoading={analyticsLoading}
          />
        </div>

        {/* Task Completion Statistics */}
        <div className="mb-8">
          <TaskCompletionStats
            taskStats={taskStats}
            isLoading={analyticsLoading}
          />
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Total Tasks</p>
                  <p className="text-white text-3xl font-bold">{tasks.length}</p>
                  <p className="text-blue-300 text-xs mt-1">+12% من الشهر الماضي</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <CheckSquare className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium mb-1">المهام النشطة</p>
                  <p className="text-white text-3xl font-bold">{tasks.filter(t => t.is_active !== false).length}</p>
                  <p className="text-green-300 text-xs mt-1">+8% هذا الأسبوع</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium mb-1">Inactive Tasks</p>
                  <p className="text-white text-3xl font-bold">{tasks.filter(t => t.is_active === false).length}</p>
                  <p className="text-purple-300 text-xs mt-1">-5% من الأمس</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-red-500/10 backdrop-blur-xl border border-orange-500/30 rounded-2xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-medium mb-1">معدل الإنجاز</p>
                  <p className="text-white text-3xl font-bold">89%</p>
                  <p className="text-orange-300 text-xs mt-1">+3% هذا الشهر</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Task Management</h2>
            <p className="text-gray-400">Control all tasks and rewards from here</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRefreshAnalytics}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl px-6 py-3 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث الإحصائيات
            </Button>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-6 py-3 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة مهمة جديدة
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
          <TaskAdminTable 
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default TaskAdminDashboard;
