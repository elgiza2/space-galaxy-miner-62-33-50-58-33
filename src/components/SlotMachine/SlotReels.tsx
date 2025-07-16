
import React from 'react';
import { motion } from 'framer-motion';
import coinIcon from '@/assets/coin-icon.png';
import spaceGapIcon from '@/assets/space-gap.png';
import rocketIcon from '@/assets/space-rocket.png';
import astronautIcon from '@/assets/astronaut.png';
import spinIcon from '@/assets/spin-icon.png';

interface SlotSymbol {
  id: string;
  image: string;
  name: string;
  isImageAsset?: boolean;
}

interface SlotReelsProps {
  reels: SlotSymbol[][];
  isSpinning: boolean;
  winAnimation: string | null;
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'coin', image: coinIcon, name: 'Coin', isImageAsset: true },
  { id: 'space-gap', image: spaceGapIcon, name: 'Space Gap', isImageAsset: true },
  { id: 'rocket', image: rocketIcon, name: 'Rocket', isImageAsset: true },
  { id: 'astronaut', image: astronautIcon, name: 'Astronaut', isImageAsset: true },
  { id: 'spin', image: spinIcon, name: 'Spin', isImageAsset: true },
  
];

const SlotReels: React.FC<SlotReelsProps> = ({ reels, isSpinning, winAnimation }) => {
  return (
    <div className="flex justify-center gap-3 mb-6">
      {reels.map((reel, reelIndex) => (
        <div key={reelIndex} className="relative">
          <div className="w-20 h-20 bg-black/20 rounded-xl overflow-hidden border border-white/10 relative backdrop-blur-sm">
            {isSpinning ? (
              <div className="absolute inset-0 flex flex-col">
                <motion.div
                  className="flex flex-col"
                  animate={{
                    y: [0, -600, -720]
                  }}
                  transition={{
                    duration: 2,
                    times: [0, 0.8, 1],
                    ease: ["easeIn", "easeOut"],
                    delay: reelIndex * 0.15
                  }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const symbol = SYMBOLS[i % SYMBOLS.length];
                    return (
                      <div key={i} className="w-20 h-20 flex items-center justify-center bg-black/10">
                        {symbol.isImageAsset ? (
                          <img 
                            src={symbol.image} 
                            alt={symbol.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-3xl">
                            {symbol.image}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ 
                  opacity: 1, 
                  scale: winAnimation ? [1, 1.2, 1] : 1 
                }}
                transition={{
                  delay: reelIndex * 0.1,
                  scale: {
                    duration: 0.8,
                    repeat: winAnimation ? 4 : 0,
                    repeatType: "reverse"
                  }
                }}
              >
                {reel.length > 0 && reel[1] && (
                  reel[1].isImageAsset ? (
                    <img 
                      src={reel[1].image} 
                      alt={reel[1].name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-3xl">
                      {reel[1].image}
                    </span>
                  )
                )}
              </motion.div>
            )}

            {/* Win highlight */}
            {winAnimation && !isSpinning && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,165,0,0.1) 50%, transparent 80%)',
                  boxShadow: '0 0 15px rgba(255,215,0,0.4)'
                }}
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: 3,
                  repeatType: "reverse"
                }}
              />
            )}

            {/* Spinning overlay effect */}
            {isSpinning && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
                animate={{
                  y: [-100, 100]
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlotReels;
