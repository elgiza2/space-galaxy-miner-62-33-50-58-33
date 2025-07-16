import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, MoreVertical, HelpCircle } from 'lucide-react';

interface MinesHeaderProps {
  spaceCoins: number;
  onShowSettings: () => void;
}

const MinesHeader: React.FC<MinesHeaderProps> = ({
  spaceCoins,
  onShowSettings
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <ArrowLeft className="w-6 h-6 text-white" />
        <h1 className="text-xl font-bold text-white">1win Token</h1>
        <div className="flex gap-3">
          <ChevronDown className="w-6 h-6 text-white" />
          <MoreVertical className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Token Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🚀</span>
          </div>
          <div className="bg-gray-800/60 rounded-lg px-4 py-2">
            <span className="text-white font-bold">{spaceCoins.toLocaleString()} 1WT</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowSettings}
          className="text-white hover:bg-white/10 p-2"
        >
          <HelpCircle className="w-6 h-6" />
          <span className="ml-2 text-sm">HowToPlay</span>
        </Button>
      </div>
    </>
  );
};

export default MinesHeader;