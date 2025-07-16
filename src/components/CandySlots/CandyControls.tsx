
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CandyControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  isSpinning: boolean;
  isAutoPlay: boolean;
  setIsAutoPlay: (auto: boolean) => void;
  onSpin: () => void;
  balance: number;
}

const CandyControls: React.FC<CandyControlsProps> = ({
  betAmount,
  setBetAmount,
  isSpinning,
  isAutoPlay,
  setIsAutoPlay,
  onSpin,
  balance
}) => {
  const increaseBet = () => {
    if (betAmount < 1000) {
      setBetAmount(betAmount + 10);
    }
  };

  const decreaseBet = () => {
    if (betAmount > 10) {
      setBetAmount(betAmount - 10);
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Balance Display with Sugar Rush styling */}
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-candy-blue/20 to-candy-purple/20 rounded-2xl p-5 border-2 border-white/40">
          <div className="text-white/80 text-sm font-bold tracking-wide mb-2">💎 CREDIT 💎</div>
          <div className="text-3xl font-black text-white drop-shadow-lg">
            {balance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Bet Controls with candy theme */}
      <div className="mb-6">
        <div className="text-white/80 text-sm font-bold mb-3 text-center tracking-wide">🎯 BET 🎯</div>
        
        {/* Bet Amount Display */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            onClick={decreaseBet}
            disabled={betAmount <= 10}
            variant="outline"
            size="sm"
            className="bg-candy-red/20 border-candy-red/40 text-white hover:bg-candy-red/30 font-bold w-12 h-12 rounded-full"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="bg-gradient-to-r from-candy-yellow/30 to-candy-orange/30 backdrop-blur-md rounded-xl px-8 py-4 min-w-[120px] text-center border-2 border-candy-yellow/40">
            <div className="text-2xl font-black text-white drop-shadow-md">{betAmount.toFixed(2)}</div>
          </div>
          
          <Button
            onClick={increaseBet}
            disabled={betAmount >= 1000}
            variant="outline"
            size="sm"
            className="bg-candy-green/20 border-candy-green/40 text-white hover:bg-candy-green/30 font-bold w-12 h-12 rounded-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons with Sugar Rush style */}
      <div className="space-y-4">
        {/* Main Spin Button */}
        <motion.button
          onClick={onSpin}
          disabled={isSpinning || balance < betAmount}
          className={`
            w-full py-6 rounded-3xl font-black text-xl transition-all duration-300 relative overflow-hidden border-3
            ${isSpinning || balance < betAmount
              ? 'bg-gray-500/30 text-gray-300 cursor-not-allowed border-gray-400/40'
              : 'bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue hover:from-candy-red hover:via-candy-orange hover:to-candy-yellow text-white shadow-2xl border-white/40'
            }
          `}
          whileHover={!isSpinning && balance >= betAmount ? { 
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(236, 72, 153, 0.5)"
          } : {}}
          whileTap={!isSpinning && balance >= betAmount ? { scale: 0.98 } : {}}
        >
          {/* Button sparkle effect */}
          {!isSpinning && balance >= betAmount && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
          
          <div className="relative z-10">
            {isSpinning ? (
              <motion.div
                className="flex items-center justify-center gap-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <span className="text-3xl">🍭</span>
                <span>SPINNING...</span>
              </motion.div>
            ) : (
              <span>🍬 SPIN 🍬</span>
            )}
          </div>
        </motion.button>

        {/* Auto Play Toggle */}
        <motion.button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          disabled={isSpinning}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 border-2
            ${isAutoPlay
              ? 'bg-candy-red border-candy-red text-white shadow-lg'
              : 'bg-white/15 border-white/30 text-white hover:bg-white/25'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAutoPlay ? (
            <div className="flex items-center justify-center gap-2">
              <Pause className="w-5 h-5" />
              🤖 AUTO PLAY ON
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              🎯 MANUAL MODE
            </div>
          )}
        </motion.button>
      </div>

      {/* Game Info Panel */}
      <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-2xl">
        <div className="text-center space-y-3">
          <motion.div 
            className="text-sm text-white/90 font-medium"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🍬</span>
              <span>Cluster Pays • 5+ symbols win</span>
              <span className="text-2xl">🍬</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🌟</span>
              <span>Tumbling Reels • Multipliers stick</span>
              <span className="text-2xl">🌟</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🎰</span>
              <span>Uses spin tokens to play</span>
              <span className="text-2xl">🎰</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CandyControls;
