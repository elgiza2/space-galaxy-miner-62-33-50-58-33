import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Eye, EyeOff, Trash2, Users, MousePointer, Zap, ExternalLink, Copy, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NewZoneTaskForm from './NewZoneTaskForm';
import { newZoneService, type NewZoneTask } from '@/services/newZoneService';
import { useNavigation } from '@/hooks/useNavigation';

const NewZoneManagement = () => {
  const [tasks, setTasks] = useState<NewZoneTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskStats, setTaskStats] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { handleQuickNavigation } = useNavigation();

  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await newZoneService.getAllNewZoneTasks();
      setTasks(tasksData);
      
      // Load stats for each task
      const stats: Record<string, any> = {};
      for (const task of tasksData) {
        stats[task.id] = await newZoneService.getTaskStats(task.id);
      }
      setTaskStats(stats);
    } catch (error) {
      console.error('Error loading New Zone tasks:', error);
      toast({
        title: "خطأ في تحميل المهام",
        description: "حدث خطأ أثناء تحميل مهام New Zone",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskCreated = () => {
    setShowForm(false);
    loadTasks();
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const success = await newZoneService.updateTaskStatus(taskId, !task.is_active);
      if (success) {
        await loadTasks();
        toast({
          title: task.is_active ? "تم إلغاء تفعيل المهمة" : "تم تفعيل المهمة",
          description: `المهمة "${task.title}" ${task.is_active ? 'معطلة' : 'مفعلة'} الآن`,
        });
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "خطأ في تحديث المهمة",
        description: "حدث خطأ أثناء تحديث حالة المهمة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const success = await newZoneService.deleteTask(taskId);
      if (success) {
        await loadTasks();
        toast({
          title: "تم حذف المهمة",
          description: `تم حذف المهمة "${task.title}" بنجاح`,
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "خطأ في حذف المهمة",
        description: "حدث خطأ أثناء حذف المهمة",
        variant: "destructive",
      });
    }
  };

  const copyReferralLink = async (refLink: string) => {
    const fullLink = `${window.location.origin}?ref=${refLink}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الإحالة إلى الحافظة",
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "حدث خطأ أثناء نسخ الرابط",
        variant: "destructive",
      });
    }
  };

  const getTaskStatsForTask = (taskId: string) => {
    return taskStats[taskId] || {
      totalUsers: 0,
      currentClicks: 0,
      requiredClicks: 0,
      progress: 0
    };
  };

  if (showForm) {
    return (
      <NewZoneTaskForm
        onTaskCreated={handleTaskCreated}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <ScrollArea className="h-screen">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">إدارة مهام New Zone</h2>
              <p className="text-gray-400">
                إنشاء وإدارة المهام التفاعلية مع نظام النقرات الديناميكي
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleQuickNavigation('tasks')}
                variant="outline"
                className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
              >
                <Link className="w-4 h-4 mr-2" />
                عرض صفحة المهام
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة مهمة جديدة
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/30 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي المهام</p>
                    <p className="text-2xl font-bold text-white">{tasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Eye className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">المهام المفعلة</p>
                    <p className="text-2xl font-bold text-white">
                      {tasks.filter(t => t.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي المشاركين</p>
                    <p className="text-2xl font-bold text-white">
                      {Object.values(taskStats).reduce((total: number, stats: any) => 
                        total + (stats?.totalUsers || 0), 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List with Enhanced Scrolling */}
          <Card className="bg-black/30 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">المهام المنشأة</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px] px-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">جاري تحميل المهام...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">لا توجد مهام</h3>
                    <p className="text-gray-400 mb-6">
                      لم يتم إنشاء أي مهام New Zone بعد
                    </p>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إنشاء أول مهمة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pb-6">
                    {tasks.map(task => {
                      const stats = getTaskStatsForTask(task.id);
                      return (
                        <div
                          key={task.id}
                          className="bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-white truncate">
                                  {task.title}
                                </h3>
                                <Badge
                                  variant={task.is_active ? "default" : "secondary"}
                                  className={task.is_active 
                                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                  }
                                >
                                  {task.is_active ? 'مفعلة' : 'معطلة'}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                {task.description}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-400" />
                                  <span className="text-gray-300">
                                    {stats.totalUsers} مستخدم
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MousePointer className="w-4 h-4 text-green-400" />
                                  <span className="text-gray-300">
                                    {stats.currentClicks}/{stats.requiredClicks} نقرة
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">مكافأة:</span>
                                  <span className="text-yellow-400 font-medium">
                                    {task.reward_amount}
                                  </span>
                                </div>
                                
                                <div className="col-span-2 md:col-span-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-gray-400">رابط الإحالة:</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-lg p-3">
                                    <code className="text-xs text-green-400 flex-1 break-all">
                                      {`${window.location.origin}?ref=${task.zone_ref_link}`}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                                      onClick={() => copyReferralLink(task.zone_ref_link)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              {stats.requiredClicks > 0 && (
                                <div className="mt-4">
                                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>تقدم النقرات</span>
                                    <span>{Math.round(stats.progress)}%</span>
                                  </div>
                                  <div className="w-full bg-black/30 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(stats.progress, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              {task.external_link && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                  onClick={() => window.open(task.external_link, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className={task.is_active 
                                  ? "bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                                  : "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                                }
                                onClick={() => handleToggleTask(task.id)}
                              >
                                {task.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default NewZoneManagement;
