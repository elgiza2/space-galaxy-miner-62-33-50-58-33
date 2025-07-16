import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface MinesBetControlsProps {
  betAmount: number;
  minesCount: number;
  onBetAmountChange: (amount: number) => void;
  onMinesCountChange: (count: number) => void;
}

const MinesBetControls: React.FC<MinesBetControlsProps> = ({
  betAmount,
  minesCount,
  onBetAmountChange,
  onMinesCountChange
}) => {
  return (
    <>
      {/* Max Winnings */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">⭐</span>
          </div>
          <div>
            <p className="text-green-400 font-bold text-sm">MaxWinnings</p>
            <p className="text-white text-lg font-bold">{(betAmount * (minesCount * 2 + 5)).toLocaleString()} 1WT</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/10 p-2"
            onClick={() => onMinesCountChange(Math.max(1, minesCount - 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{minesCount}</p>
            <p className="text-gray-400 text-sm">Traps</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/10 p-2"
            onClick={() => onMinesCountChange(Math.min(10, minesCount + 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Bet Amount */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onBetAmountChange(Math.max(10, betAmount - 10))}
          className="text-white text-3xl hover:bg-white/10 w-12 h-12 rounded-full"
        >
          <Minus className="w-6 h-6" />
        </Button>
        
        <div className="text-center">
          <p className="text-white text-4xl font-bold">{betAmount}</p>
          <p className="text-gray-400 text-lg">1WT</p>
        </div>
        
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onBetAmountChange(betAmount + 10)}
          className="text-white text-3xl hover:bg-white/10 w-12 h-12 rounded-full"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
};

export default MinesBetControls;