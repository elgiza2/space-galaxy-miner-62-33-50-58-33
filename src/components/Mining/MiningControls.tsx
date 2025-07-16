
import React from 'react';
import Btn15 from '@/components/ui/btn15';
import { Play, Gift } from 'lucide-react';

interface MiningControlsProps {
  isMining: boolean;
  timeLeft: number;
  onStartMining: () => void;
  onCollectCoins: () => void;
}

const MiningControls: React.FC<MiningControlsProps> = ({
  isMining,
  timeLeft,
  onStartMining,
  onCollectCoins
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {!isMining && timeLeft <= 0 && (
        <Btn15
          onClick={onStartMining}
          label="Start Mining (8 Hours)"
          icon={Play}
          variant="info"
          size="lg"
          className="transition-all duration-300 shadow-lg hover:shadow-2xl"
        />
      )}

      {isMining && timeLeft <= 0 && (
        <Btn15
          onClick={onCollectCoins}
          label="Collect Coins"
          icon={Gift}
          variant="success"
          size="lg"
          className="transition-all duration-300 shadow-lg hover:shadow-2xl animate-pulse"
        />
      )}
    </div>
  );
};

export default MiningControls;
