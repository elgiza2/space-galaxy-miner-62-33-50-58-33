
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';
import { TaskCompletionStat } from '@/services/analyticsService';

interface TaskCompletionStatsProps {
  taskStats: TaskCompletionStat[];
  isLoading: boolean;
}

const TaskCompletionStats: React.FC<TaskCompletionStatsProps> = ({
  taskStats,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Task Completion Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-400 rounded w-32"></div>
                <div className="h-4 bg-gray-400 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          Task Completion Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {taskStats.map((stat) => (
            <div key={stat.task_id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white text-sm truncate max-w-xs">{stat.task_title}</span>
              <span className="text-indigo-400 font-bold">{stat.completion_count} مستخدم</span>
            </div>
          ))}
          {taskStats.length === 0 && (
            <p className="text-gray-400 text-center py-4">لا توجد إحصائيات متاحة</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCompletionStats;
