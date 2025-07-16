
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { formatCoins } from '@/utils/levelSystem';

interface SpinSymbol {
  id: string;
  emoji: string;
  name: string;
  color: string;
}

const SYMBOLS: SpinSymbol[] = [
  { id: 'coin', emoji: '🪙', name: 'Coin', color: 'text-yellow-400' },
  { id: 'gem', emoji: '💎', name: 'Diamond', color: 'text-blue-400' },
  { id: 'star', emoji: '⭐', name: 'Star', color: 'text-yellow-300' },
  { id: 'crown', emoji: '👑', name: 'Crown', color: 'text-yellow-500' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', color: 'text-red-400' },
  { id: 'fire', emoji: '🔥', name: 'Fire', color: 'text-orange-500' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', color: 'text-blue-300' },
  { id: 'heart', emoji: '❤️', name: 'Heart', color: 'text-red-500' }
];

const SpinWheel = () => {
  const [reels, setReels] = useState<SpinSymbol[][]>([[], [], []]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [lastReward, setLastReward] = useState<string>('');
  
  const { balances, subtractSpins, addCoins, addSpaceCoins, addSpins } = useCurrency();
  const { toast } = useToast();

  const getAvailableMultipliers = () => {
    const multipliers = [1];
    if (balances.spins >= 3) multipliers.push(3);
    if (balances.spins >= 5) multipliers.push(5);
    if (balances.spins >= 10) multipliers.push(10);
    if (balances.spins >= 25) multipliers.push(25);
    if (balances.spins >= 50) multipliers.push(50);
    return multipliers;
  };

  const handleMultiplierChange = () => {
    const availableMultipliers = getAvailableMultipliers();
    const currentIndex = availableMultipliers.indexOf(multiplier);
    const nextIndex = (currentIndex + 1) % availableMultipliers.length;
    setMultiplier(availableMultipliers[nextIndex]);
  };

  const getRandomSymbol = (): SpinSymbol => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  };

  const initializeReels = () => {
    const newReels = [
      Array.from({ length: 3 }, getRandomSymbol),
      Array.from({ length: 3 }, getRandomSymbol),
      Array.from({ length: 3 }, getRandomSymbol)
    ];
    setReels(newReels);
  };

  useEffect(() => {
    initializeReels();
  }, []);

  const checkWinningCombination = (finalReels: SpinSymbol[][]) => {
    const centerLine = [finalReels[0][1], finalReels[1][1], finalReels[2][1]];
    const symbols = centerLine.map(symbol => symbol.id);

    // Count occurrences of each symbol
    const symbolCounts = symbols.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check for three matching symbols (JACKPOT)
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      if (count === 3) {
        return handleJackpot(symbol);
      }
    }

    // Check for two matching symbols
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      if (count === 2) {
        return handleDoubleMatch(symbol);
      }
    }

    // No match
    setLastReward('Try again! 🎰');
    return { type: 'none', reward: 0 };
  };

  const handleJackpot = (symbol: string) => {
    let baseReward = 0;
    let title = '';
    let description = '';

    switch (symbol) {
      case 'crown':
        baseReward = Math.floor(Math.random() * 10000) + 15000;
        const crownReward = baseReward * multiplier;
        addCoins(crownReward);
        setWinAnimation('crown');
        setLastReward(`👑 JACKPOT! ${formatCoins(crownReward)} coins`);
        title = "👑 Royal Crown - Jackpot!";
        description = `Congratulations! You earned ${formatCoins(crownReward)} coins!`;
        break;
      case 'gem':
        baseReward = Math.floor(Math.random() * 8000) + 12000;
        const gemReward = baseReward * multiplier;
        addSpaceCoins(gemReward);
        setWinAnimation('gem');
        setLastReward(`💎 ${formatCoins(gemReward)} space coins`);
        title = "💎 Rare Diamond!";
        description = `You earned ${formatCoins(gemReward)} space coins!`;
        break;
      case 'rocket':
        baseReward = Math.floor(Math.random() * 40) + 60;
        const rocketReward = baseReward * multiplier;
        addSpins(rocketReward);
        setWinAnimation('rocket');
        setLastReward(`🚀 ${rocketReward} free spins!`);
        title = "🚀 Rocket Spins!";
        description = `You earned ${rocketReward} free spins!`;
        break;
      case 'star':
        baseReward = Math.floor(Math.random() * 5000) + 8000;
        const starReward = baseReward * multiplier;
        addCoins(starReward);
        setWinAnimation('star');
        setLastReward(`⭐ ${formatCoins(starReward)} gold coins`);
        title = "⭐ Lucky Star!";
        description = `You earned ${formatCoins(starReward)} coins!`;
        break;
      default:
        baseReward = Math.floor(Math.random() * 3000) + 5000;
        const defaultReward = baseReward * multiplier;
        addCoins(defaultReward);
        setWinAnimation('jackpot');
        setLastReward(`🎰 ${formatCoins(defaultReward)} coins`);
        title = "🎰 Jackpot!";
        description = `You earned ${formatCoins(defaultReward)} coins!`;
        break;
    }

    toast({ title, description });
    return { type: symbol, reward: baseReward * multiplier };
  };

  const handleDoubleMatch = (symbol: string) => {
    const baseReward = Math.floor(Math.random() * 1500) + 1000;
    const coinReward = baseReward * multiplier;
    addCoins(coinReward);
    setWinAnimation('double');
    setLastReward(`💰 ${formatCoins(coinReward)} coins`);
    
    toast({
      title: "💰 Double Match!",
      description: `You earned ${formatCoins(coinReward)} coins!`
    });
    
    return { type: 'double', reward: coinReward };
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    
    const requiredSpins = multiplier;
    if (balances.spins < requiredSpins) {
      toast({
        title: "Insufficient spins!",
        description: `You need ${requiredSpins} spins to use x${multiplier} multiplier`,
        variant: "destructive"
      });
      return;
    }

    const success = await subtractSpins(requiredSpins);
    if (!success) return;

    setIsSpinning(true);
    setWinAnimation(null);
    setLastReward('');

    // Generate winning results with 50% chance
    const shouldWin = Math.random() < 0.5; // 50% chance
    let newReels: SpinSymbol[][];

    if (shouldWin) {
      // Create winning combination - same symbol in center line
      const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      newReels = [
        [getRandomSymbol(), winningSymbol, getRandomSymbol()],
        [getRandomSymbol(), winningSymbol, getRandomSymbol()],
        [getRandomSymbol(), winningSymbol, getRandomSymbol()]
      ];
    } else {
      // Create non-winning combination
      newReels = [
        Array.from({ length: 3 }, getRandomSymbol),
        Array.from({ length: 3 }, getRandomSymbol),
        Array.from({ length: 3 }, getRandomSymbol)
      ];
      // Ensure center line doesn't have 3 matching symbols
      const centerLine = [newReels[0][1], newReels[1][1], newReels[2][1]];
      const centerSymbols = centerLine.map(s => s.id);
      if (centerSymbols[0] === centerSymbols[1] && centerSymbols[1] === centerSymbols[2]) {
        // Change one symbol to break the match
        newReels[2][1] = SYMBOLS.find(s => s.id !== centerSymbols[0]) || SYMBOLS[0];
      }
    }

    // Fast spin animation - 1.5 seconds total
    setTimeout(() => {
      setReels(newReels);
      setTimeout(() => {
        checkWinningCombination(newReels);
        setIsSpinning(false);
      }, 200); // Quick stop animation
    }, 1300); // Fast spin duration
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden" 
         style={{
           backgroundImage: `url(/lovable-uploads/aa7cb228-cdba-4b19-95f0-746025a47667.png)`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* Dark overlay to maintain readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-10 left-10 w-8 h-8 bg-yellow-300 rounded-full opacity-60"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-20 right-20 w-6 h-6 bg-white rounded-full opacity-40"
          animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/4 w-10 h-10 bg-pink-300 rounded-full opacity-50"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -180, -360] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-4 py-8">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-bold text-yellow-300 mb-2 drop-shadow-2xl">
            🎰 Spin Wheel 🎰
          </h1>
          <p className="text-lg text-yellow-100">Win amazing prizes!</p>
        </motion.div>

        {/* Last Reward Display */}
        <div className="mb-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-sm"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-yellow-300 rounded-3xl p-4 text-center shadow-2xl min-h-[60px] flex items-center justify-center">
              {lastReward ? (
                <p className="text-yellow-900 font-bold text-lg">{lastReward}</p>
              ) : (
                <p className="text-yellow-800 font-semibold text-base">Press SPIN to play! 🎲</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Spin Wheel - Compact Design */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Compact Golden Frame Container */}
            <div className="relative bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl p-6 shadow-2xl border-4 border-yellow-300">
              {/* Inner golden glow */}
              <div className="absolute inset-2 bg-gradient-to-b from-yellow-300/30 to-transparent rounded-2xl"></div>
              
              {/* Side Control Triangles - Smaller */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-t-[15px] border-b-[15px] border-r-[20px] border-transparent border-r-orange-500 shadow-lg"></div>
              </div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-t-[15px] border-b-[15px] border-l-[20px] border-transparent border-l-orange-500 shadow-lg"></div>
              </div>

              {/* Display Screen - Compact */}
              <div className="bg-gradient-to-b from-gray-800 to-black rounded-2xl p-4 shadow-inner border-2 border-gray-600">
                {/* Reels Container - Smaller */}
                <div className="flex justify-center gap-2">
                  {reels.map((reel, reelIndex) => (
                    <div key={reelIndex} className="relative">
                      {/* Individual Reel - Smaller and fits in circle */}
                      <div className="w-16 h-16 bg-gradient-to-b from-gray-200 to-white rounded-xl border-2 border-gray-400 overflow-hidden shadow-lg relative">
                        <div className="absolute inset-0 overflow-hidden">
                          <motion.div
                            className="flex flex-col absolute w-full"
                            animate={{
                              y: isSpinning ? [0, -320, -640, -960, -1280, -1600, -960] : 0
                            }}
                            transition={{
                              duration: isSpinning ? 1.3 : 0, // Fast spin - 1.3 seconds
                              ease: isSpinning ? [0.1, 0.8, 0.9, 1] : "linear", // Quick start, fast end
                              times: isSpinning ? [0, 0.2, 0.4, 0.6, 0.8, 0.95, 1] : [0, 1]
                            }}
                          >
                            {/* Extended symbols for fast animation */}
                            {Array.from({ length: 25 }, (_, index) => {
                              const symbol = SYMBOLS[index % SYMBOLS.length];
                              return (
                                <div 
                                  key={`extended-${reelIndex}-${index}`}
                                  className="w-16 h-16 flex items-center justify-center text-2xl"
                                >
                                  <span className={symbol.color}>{symbol.emoji}</span>
                                </div>
                              );
                            })}
                            
                            {/* Final state */}
                            {!isSpinning && reel.map((symbol, symbolIndex) => (
                              <div 
                                key={`final-${reelIndex}-${symbolIndex}`}
                                className={`w-16 h-16 flex items-center justify-center text-2xl ${
                                  symbolIndex === 1 && winAnimation ? 'bg-yellow-300/50 animate-pulse' : ''
                                }`}
                                style={{
                                  position: 'absolute',
                                  top: `${symbolIndex * 64}px`,
                                  display: symbolIndex === 1 ? 'flex' : 'none'
                                }}
                              >
                                <span className={symbol.color}>{symbol.emoji}</span>
                              </div>
                            ))}
                          </motion.div>
                        </div>
                        
                        {/* Win highlight */}
                        {winAnimation && (
                          <div className="absolute inset-0 border-3 border-yellow-400 rounded-xl animate-pulse shadow-lg"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Controls */}
        <div className="pb-8 space-y-4">
          {/* BET Multiplier Button */}
          <div className="flex justify-center">
            <motion.button
              onClick={handleMultiplierChange}
              disabled={isSpinning}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 px-8 py-3 rounded-2xl font-bold text-white shadow-2xl border-2 border-pink-300 transition-all duration-300"
              whileHover={{ scale: isSpinning ? 1 : 1.05 }}
              whileTap={{ scale: isSpinning ? 1 : 0.95 }}
            >
              <span className="text-xl">BET X{multiplier}</span>
            </motion.button>
          </div>

          {/* SPIN Button */}
          <div className="flex justify-center">
            <motion.button
              onClick={handleSpin}
              disabled={isSpinning || balances.spins < multiplier}
              className="relative"
              whileHover={{ scale: isSpinning ? 1 : 1.1 }}
              whileTap={{ scale: isSpinning ? 1 : 0.9 }}
            >
              {/* Button Background - Circular */}
              <div className="w-32 h-32 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-2xl border-4 border-green-300 relative flex items-center justify-center">
                <div className="absolute inset-2 bg-gradient-to-b from-green-300/50 to-transparent rounded-full"></div>
                  <span className="relative z-10 text-white font-bold text-xl drop-shadow-lg">
                    {isSpinning ? 'Spinning...' : 'SPIN'}
                  </span>
              </div>
              
              {/* Disabled overlay */}
              {(isSpinning || balances.spins < multiplier) && (
                <div className="absolute inset-0 bg-gray-500/60 rounded-full"></div>
              )}
            </motion.button>
          </div>

          {/* Spins Counter */}
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-full px-6 py-2 shadow-xl border-2 border-blue-400">
              <span className="text-white font-bold text-lg">
                {balances.spins.toLocaleString()} spins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Win Animation Overlay */}
      <AnimatePresence>
        {winAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-8xl"
            >
              {winAnimation === 'jackpot' && '🎰🎉'}
              {winAnimation === 'crown' && '👑✨'}
              {winAnimation === 'gem' && '💎⭐'}
              {winAnimation === 'rocket' && '🚀💫'}
              {winAnimation === 'star' && '⭐🌟'}
              {winAnimation === 'double' && '💰💰'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinWheel;
