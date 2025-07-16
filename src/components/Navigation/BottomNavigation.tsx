
import React from 'react';
import { Home, CheckSquare, User, Settings, Smartphone } from 'lucide-react';
import { Page } from '@/hooks/useNavigation';
import NavigationItem from './NavigationItem';

interface BottomNavigationProps {
  currentPage: Page;
  showAdminAccess: boolean;
  onPageChange: (page: Page) => void;
  onTaskButtonClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPage,
  showAdminAccess,
  onPageChange,
  onTaskButtonClick
}) => {
  const navigationItems = [{
    id: 'mining',
    label: 'Mining',
    icon: Home
  }, {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare
  }, {
    id: 'space-apps',
    label: 'Apps',
    icon: Smartphone
  }, {
    id: 'referral',
    label: 'Invite Friends',
    icon: User
  }];

  if (showAdminAccess) {
    navigationItems.push({
      id: 'admin',
      label: 'Settings',
      icon: Settings
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/70 to-transparent backdrop-blur-xl border-t border-white/10"></div>
      
      {/* Content */}
      <div className="relative max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {navigationItems.map(item => (
            <NavigationItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              currentPage={currentPage}
              onClick={() => {
                if (item.id === 'tasks') {
                  onTaskButtonClick();
                } else {
                  onPageChange(item.id as Page);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
