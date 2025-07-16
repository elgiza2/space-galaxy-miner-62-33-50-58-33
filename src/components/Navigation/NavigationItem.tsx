import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
interface NavigationItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  currentPage: string;
  onClick: () => void;
}
const NavigationItem = ({
  id,
  label,
  icon: Icon,
  currentPage,
  onClick
}: NavigationItemProps) => {
  const isActive = currentPage === id;
  const isTasks = id === 'tasks';
  return <Button variant="ghost" onClick={onClick} className="flex flex-col items-center gap-1 h-auto py-1 px-1 text-xs bg-transparent hover:bg-transparent border-none group min-w-0">
      {/* Icon container with blue glow effect for tasks */}
      <div className="relative flex items-center justify-center w-6 h-6 transition-all duration-300 group-hover:scale-110">
        
        {/* Blue glow effect for tasks when active */}
        {isTasks && isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg blur-md opacity-60 animate-pulse scale-150"></div>}
        
        {/* Tasks notification badge */}
        {isTasks && isActive}
        
        {/* Icon with special styling for tasks */}
        <Icon className={`w-4 h-4 transition-all duration-300 relative z-10 ${isActive ? isTasks ? 'text-white drop-shadow-lg shadow-blue-400' : 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`} />
      </div>
      
      {/* Smaller label */}
      <span className={`text-[8px] font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
        {label}
      </span>
    </Button>;
};
export default NavigationItem;