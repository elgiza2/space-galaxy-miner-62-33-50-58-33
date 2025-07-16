
import React from 'react';
import { motion } from 'framer-motion';

interface CandyHeaderProps {
  totalWin: number;
  freeSpins: number;
  cascadeCount: number;
}

const CandyHeader: React.FC<CandyHeaderProps> = ({ totalWin, freeSpins, cascadeCount }) => {
  return (
    <div className="text-center space-y-4">
      {/* Win Display with Sugar Rush styling */}
      <motion.div 
        className="bg-gradient-to-r from-candy-yellow/30 via-candy-orange/30 to-candy-red/30 backdrop-blur-md rounded-2xl p-5 border-2 border-candy-yellow/50 relative overflow-hidden"
        initial={{ scale: 0.9 }}
        animate={{ 
          scale: totalWin > 0 ? [1, 1.08, 1] : 1,
          boxShadow: totalWin > 0 ? [
            "0 0 20px rgba(251, 191, 36, 0.4)",
            "0 0 30px rgba(251, 191, 36, 0.7)",
            "0 0 20px rgba(251, 191, 36, 0.4)"
          ] : "0 0 10px rgba(251, 191, 36, 0.2)"
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Winning sparkles */}
        {totalWin > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${15 + (i * 12)}%`,
                  top: `${20 + (i % 2) * 60}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
        
        <div className="text-white/90 text-sm font-bold mb-2 tracking-wide">💰 WIN 💰</div>
        <div className="text-4xl font-black text-white drop-shadow-lg relative z-10">
          {totalWin > 0 ? `${totalWin.toFixed(2)}` : '0.00'}
        </div>
        
        {totalWin > 0 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-candy-yellow/20 to-candy-orange/20 rounded-2xl"
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}
      </motion.div>
      
      {/* Stats Row with Sugar Rush styling */}
      <div className="flex justify-between gap-3">
        {/* Cascades */}
        <motion.div
          className="bg-gradient-to-br from-candy-purple/20 to-candy-pink/20 backdrop-blur-md rounded-xl p-4 flex-1 border-2 border-white/30 relative"
          animate={{
            boxShadow: cascadeCount > 0 ? [
              "0 0 15px rgba(147, 51, 234, 0.4)",
              "0 0 25px rgba(147, 51, 234, 0.6)",
              "0 0 15px rgba(147, 51, 234, 0.4)"
            ] : "0 0 8px rgba(147, 51, 234, 0.2)"
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute top-1 right-1 text-xs">⚡</div>
          <div className="text-white/80 text-xs font-bold tracking-wide">CASCADES</div>
          <motion.div
            className="text-xl font-black text-candy-purple drop-shadow-md"
            animate={{ scale: cascadeCount > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {cascadeCount > 0 ? cascadeCount : '0'}
          </motion.div>
        </motion.div>

        {/* Free Spins */}
        <motion.div
          className="bg-gradient-to-br from-candy-green/20 to-candy-blue/20 backdrop-blur-md rounded-xl p-4 flex-1 border-2 border-white/30 relative"
          animate={{
            boxShadow: freeSpins > 0 ? [
              "0 0 15px rgba(34, 197, 94, 0.4)",
              "0 0 25px rgba(34, 197, 94, 0.6)",
              "0 0 15px rgba(34, 197, 94, 0.4)"
            ] : "0 0 8px rgba(34, 197, 94, 0.2)"
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute top-1 right-1 text-xs">🎁</div>
          <div className="text-white/80 text-xs font-bold tracking-wide">FREE SPINS</div>
          <motion.div
            className="text-xl font-black text-candy-green drop-shadow-md"
            animate={{ scale: freeSpins > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {freeSpins > 0 ? freeSpins : '0'}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Buy Free Spins button like in Sugar Rush */}
      <motion.div 
        className="bg-gradient-to-r from-candy-orange/25 to-candy-red/25 backdrop-blur-md rounded-2xl p-4 border-2 border-candy-orange/40 relative overflow-hidden"
        animate={{
          boxShadow: [
            "0 0 15px rgba(251, 146, 60, 0.3)",
            "0 0 25px rgba(251, 146, 60, 0.5)",
            "0 0 15px rgba(251, 146, 60, 0.3)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-candy-orange text-lg font-black tracking-wide">🍭 BUY FREE SPINS 🍭</span>
        </div>
        <div className="text-white/90 text-sm font-bold mt-1">400</div>
      </motion.div>
    </div>
  );
};

export default CandyHeader;
