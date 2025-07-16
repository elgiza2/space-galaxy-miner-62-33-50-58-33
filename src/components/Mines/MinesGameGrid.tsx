import React from 'react';
import { Gem, Bomb } from 'lucide-react';

interface MinesGameGridProps {
  gameGrid: string[];
  gameStarted: boolean;
  onCellClick: (index: number) => void;
}

const MinesGameGrid: React.FC<MinesGameGridProps> = ({
  gameGrid,
  gameStarted,
  onCellClick
}) => {
  return (
    <div className="bg-gray-900/80 rounded-3xl p-6 mb-6 border border-gray-700/30">
      <div className="grid grid-cols-5 gap-3">
        {gameGrid.map((cell, index) => (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            className={`
              aspect-square rounded-xl transition-all duration-200 flex items-center justify-center
              ${cell === 'hidden' 
                ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 shadow-lg border border-cyan-300/50' 
                : cell === 'gem'
                ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg border border-green-300/50 animate-scale-in'
                : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg border border-red-300/50 animate-scale-in'
              }
              ${!gameStarted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
            `}
            disabled={!gameStarted || cell !== 'hidden'}
          >
            {cell === 'gem' && <Gem className="w-6 h-6 text-white drop-shadow-lg" />}
            {cell === 'mine' && <Bomb className="w-6 h-6 text-white drop-shadow-lg" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MinesGameGrid;