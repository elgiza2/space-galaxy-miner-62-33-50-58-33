
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, ExternalLink, Image } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskAdminTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  isLoading?: boolean;
}

const TaskAdminTable: React.FC<TaskAdminTableProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'مهمة يومية';
      case 'in_progress': return 'مهمة أساسية';
      case 'completed': return 'مهمة شراكة';
      case 'failed': return 'فاشلة';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-white">Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-300">No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-indigo-500/30">
            <TableHead className="text-white">الصورة</TableHead>
            <TableHead className="text-white">العنوان</TableHead>
            <TableHead className="text-white">النوع</TableHead>
            <TableHead className="text-white">المكافأة</TableHead>
            <TableHead className="text-white">نشط</TableHead>
            <TableHead className="text-white">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="border-indigo-500/20 hover:bg-indigo-500/10">
              <TableCell>
                {task.image_url ? (
                  <img 
                    src={task.image_url} 
                    alt={task.title || 'Task image'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <Image className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="text-white font-medium">{task.title}</div>
                {task.description && (
                  <div className="text-gray-400 text-sm truncate max-w-xs">
                    {task.description}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status || 'pending')}>
                  {getStatusLabel(task.status || 'pending')}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-pink-400 font-bold">
                  {task.reward_amount || task.reward} $SPACE
                </span>
              </TableCell>
              <TableCell>
                <Switch
                  checked={task.is_active || false}
                  onCheckedChange={(checked) => onToggleStatus(task.id, checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(task)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {(task.external_link || task.link) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(task.external_link || task.link!, '_blank')}
                      className="text-green-400 hover:text-green-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(task.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskAdminTable;
