
import React from 'react';
import Btn15 from '@/components/ui/btn15';
import { RefreshCw } from 'lucide-react';

interface TopActionButtonsProps {
  isMining: boolean;
  timeLeft: number;
  onResetMining: () => void;
}

const TopActionButtons: React.FC<TopActionButtonsProps> = ({
  isMining,
  timeLeft,
  onResetMining
}) => {
  return (
    <div className="pt-4 px-4">
      <div className="flex justify-center items-center gap-3">
        {(isMining && timeLeft <= 0) && (
          <Btn15
            onClick={onResetMining}
            label="Reset"
            icon={RefreshCw}
            variant="danger"
            size="sm"
            className="shadow-lg transition-all duration-300 hover:shadow-xl"
          />
        )}
      </div>
    </div>
  );
};

export default TopActionButtons;
