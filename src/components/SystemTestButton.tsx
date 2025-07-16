
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Zap } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';

const SystemTestButton = () => {
  const { handleQuickNavigation } = useNavigation();

  const navigateToSystemTest = () => {
    window.location.href = '/system-test';
  };

  return (
    <Button
      onClick={navigateToSystemTest}
      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg"
    >
      <Bot className="w-4 h-4 mr-2" />
      Test System
      <Zap className="w-4 h-4 ml-2" />
    </Button>
  );
};

export default SystemTestButton;
