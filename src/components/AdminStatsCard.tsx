
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'pink';
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-600/20 via-blue-500/15 to-indigo-600/20',
      border: 'border-blue-400/40',
      text: 'text-blue-300',
      iconBg: 'bg-blue-500/25',
      shadow: 'hover:shadow-blue-400/20'
    },
    green: {
      gradient: 'from-emerald-600/20 via-green-500/15 to-teal-600/20',
      border: 'border-emerald-400/40',
      text: 'text-emerald-300',
      iconBg: 'bg-emerald-500/25',
      shadow: 'hover:shadow-emerald-400/20'
    },
    purple: {
      gradient: 'from-purple-600/20 via-violet-500/15 to-indigo-600/20',
      border: 'border-purple-400/40',
      text: 'text-purple-300',
      iconBg: 'bg-purple-500/25',
      shadow: 'hover:shadow-purple-400/20'
    },
    orange: {
      gradient: 'from-orange-600/20 via-amber-500/15 to-yellow-600/20',
      border: 'border-orange-400/40',
      text: 'text-orange-300',
      iconBg: 'bg-orange-500/25',
      shadow: 'hover:shadow-orange-400/20'
    },
    red: {
      gradient: 'from-red-600/20 via-rose-500/15 to-pink-600/20',
      border: 'border-red-400/40',
      text: 'text-red-300',
      iconBg: 'bg-red-500/25',
      shadow: 'hover:shadow-red-400/20'
    },
    cyan: {
      gradient: 'from-cyan-600/20 via-sky-500/15 to-blue-600/20',
      border: 'border-cyan-400/40',
      text: 'text-cyan-300',
      iconBg: 'bg-cyan-500/25',
      shadow: 'hover:shadow-cyan-400/20'
    },
    pink: {
      gradient: 'from-pink-600/20 via-rose-500/15 to-purple-600/20',
      border: 'border-pink-400/40',
      text: 'text-pink-300',
      iconBg: 'bg-pink-500/25',
      shadow: 'hover:shadow-pink-400/20'
    }
  };

  const styles = colorClasses[color];

  return (
    <Card className={`bg-gradient-to-br ${styles.gradient} backdrop-blur-xl border-2 ${styles.border} rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 ${styles.shadow} hover:border-opacity-60`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
            </p>
            {description && (
              <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
            )}
            {trend && (
              <p className={`text-xs font-medium mt-2 ${styles.text}`}>{trend}</p>
            )}
          </div>
          <div className={`p-4 ${styles.iconBg} rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg`}>
            <Icon className={`w-8 h-8 ${styles.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStatsCard;
