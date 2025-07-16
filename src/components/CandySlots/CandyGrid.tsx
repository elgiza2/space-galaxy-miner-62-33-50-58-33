
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CandySymbol {
  id: string;
  type: 'jelly' | 'gummy' | 'chocolate' | 'rainbow' | 'lollipop' | 'bonus' | 'bomb';
  color: string;
  value: number;
  position: { row: number; col: number };
  isWinning: boolean;
  multiplier?: number;
}

interface Cluster {
  symbols: CandySymbol[];
  value: number;
  multiplier: number;
}

interface CandyGridProps {
  grid: (CandySymbol | null)[][];
  multipliers: number[][];
  isSpinning: boolean;
  clusters: Cluster[];
}

const CandyGrid: React.FC<CandyGridProps> = ({ grid, multipliers, isSpinning, clusters }) => {
  const getSymbolEmoji = (type: string) => {
    switch (type) {
      case 'jelly': return '🍓';
      case 'gummy': return '🐻';
      case 'chocolate': return '🍫';
      case 'rainbow': return '⭐';
      case 'lollipop': return '🍭';
      case 'bonus': return '🎁';
      case 'bomb': return '💥';
      default: return '🍬';
    }
  };

  return (
    <div className="bg-gradient-to-br from-candy-blue/20 via-candy-purple/15 to-candy-pink/20 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30 shadow-2xl relative overflow-hidden">
      {/* Sugar Rush title decoration */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white/80 text-xs font-bold tracking-wider">
        SUGAR RUSH
      </div>
      
      {/* Candy sparkles background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${15 + (i * 12)}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-6 gap-2 aspect-square relative z-10 mt-4">
        {grid.map((row, rowIndex) =>
          row.map((symbol, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className="relative aspect-square"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.5,
                delay: (rowIndex + colIndex) * 0.05
              }}
            >
              <div
                className={`
                  w-full h-full rounded-xl flex items-center justify-center text-lg font-bold
                  border-3 transition-all duration-300 relative overflow-hidden
                  ${symbol?.isWinning 
                    ? 'border-candy-yellow bg-gradient-to-br from-candy-yellow/40 to-candy-orange/40 animate-pulse shadow-lg' 
                    : 'border-white/30 bg-gradient-to-br from-white/15 to-white/5'
                  }
                `}
                style={{
                  background: symbol?.isWinning 
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.4))' 
                    : symbol 
                      ? `linear-gradient(135deg, ${symbol.color}30, ${symbol.color}15)` 
                      : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  borderColor: symbol?.isWinning ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                  boxShadow: symbol?.isWinning 
                    ? '0 0 20px rgba(251, 191, 36, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 0 8px rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Symbol */}
                <AnimatePresence mode="wait">
                  {symbol && (
                    <motion.div
                      key={symbol.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, y: -20, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="text-3xl drop-shadow-lg"
                    >
                      {getSymbolEmoji(symbol.type)}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Multiplier indicator */}
                {multipliers[rowIndex][colIndex] > 1 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-candy-yellow to-candy-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-white shadow-lg z-10"
                    style={{
                      boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)'
                    }}
                  >
                    {multipliers[rowIndex][colIndex]}×
                  </motion.div>
                )}

                {/* Winning glow effect */}
                {symbol?.isWinning && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{
                        background: [
                          'linear-gradient(45deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.4))',
                          'linear-gradient(45deg, rgba(255, 165, 0, 0.6), rgba(255, 215, 0, 0.6))',
                          'linear-gradient(45deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.4))'
                        ],
                        boxShadow: [
                          '0 0 15px rgba(251, 191, 36, 0.4)',
                          '0 0 25px rgba(251, 191, 36, 0.8)',
                          '0 0 15px rgba(251, 191, 36, 0.4)'
                        ]
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                      }}
                    />
                    {/* Sparkle particles */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + (i % 2) * 60}%`,
                          top: `${20 + Math.floor(i / 2) * 60}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 0.4,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Spinning effect */}
                {isSpinning && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      background: [
                        'linear-gradient(0deg, rgba(255,255,255,0.2), transparent)',
                        'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)',
                        'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)',
                        'linear-gradient(270deg, rgba(255,255,255,0.2), transparent)',
                        'linear-gradient(360deg, rgba(255,255,255,0.2), transparent)'
                      ],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CandyGrid;
