import React from 'react';
import { motion } from 'framer-motion';
interface GameControlsProps {
  multiplier: number;
  spinsCount: number;
  isAutoSpin: boolean;
  isSpinning: boolean;
  onMultiplierChange: () => void;
  onStopAutoSpin: () => void;
}
const GameControls: React.FC<GameControlsProps> = ({
  multiplier,
  spinsCount,
  isAutoSpin,
  isSpinning,
  onMultiplierChange,
  onStopAutoSpin
}) => {
  return <div className="space-y-5">
      {/* Auto Spin Controls */}
      {isAutoSpin && <div className="flex justify-center">
          <motion.button onClick={onStopAutoSpin} className="bg-red-500/20 backdrop-blur-md border border-red-400/30 hover:border-red-400/50 px-8 py-4 rounded-lg font-medium text-red-300 text-lg transition-all duration-200">
            Stop Auto Spin
          </motion.button>
        </div>}

      {/* Multiplier Button - Made transparent */}
      <div className="flex justify-center">
        <motion.button onClick={onMultiplierChange} disabled={isSpinning || isAutoSpin} whileHover={{
        scale: isSpinning || isAutoSpin ? 1 : 1.02
      }} whileTap={{
        scale: isSpinning || isAutoSpin ? 1 : 0.98
      }} className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 disabled:opacity-50 px-8 rounded-lg font-medium text-white text-lg transition-all duration-200 py-0">
          <div className="flex items-center gap-4">
            <span>BET</span>
            <span className="text-xl font-bold">×{multiplier}</span>
          </div>
        </motion.button>
      </div>

      {/* Spins Counter - Made transparent */}
      <div className="flex justify-center py-0 my-[6px]">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-6 py-0">
          <span className="text-white font-medium text-base">
            {spinsCount.toLocaleString()} spins
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Press: Single spin | Hold: Auto spin
        </p>
      </div>
    </div>;
};
export default GameControls;