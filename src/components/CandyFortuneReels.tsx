
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import CandyGrid from '@/components/CandySlots/CandyGrid';
import CandyControls from '@/components/CandySlots/CandyControls';
import CandyHeader from '@/components/CandySlots/CandyHeader';

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

interface FloatingCandy {
  id: number;
  type: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
}

const CandyFortuneReels = () => {
  const [grid, setGrid] = useState<(CandySymbol | null)[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [multipliers, setMultipliers] = useState<number[][]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [cascadeCount, setCascadeCount] = useState(0);
  const [floatingCandies, setFloatingCandies] = useState<FloatingCandy[]>([]);
  const [showWinExplosion, setShowWinExplosion] = useState(false);

  const { balances, subtractSpins, addCoins } = useCurrency();
  const { toast } = useToast();

  const GRID_SIZE = 6;
  const SYMBOL_TYPES = [
    { type: 'jelly', color: '#EC4899', value: 1, weight: 25, emoji: '🍓' },
    { type: 'gummy', color: '#8B5CF6', value: 2, weight: 20, emoji: '🐻' },
    { type: 'chocolate', color: '#A855F7', value: 3, weight: 15, emoji: '🍫' },
    { type: 'rainbow', color: '#3B82F6', value: 5, weight: 10, emoji: '⭐' },
    { type: 'lollipop', color: '#F59E0B', value: 8, weight: 8, emoji: '🍭' },
    { type: 'bonus', color: '#EF4444', value: 0, weight: 1, emoji: '🎁' },
    { type: 'bomb', color: '#6366F1', value: 0, weight: 1, emoji: '💥' }
  ] as const;

  // Generate floating candies
  useEffect(() => {
    const candies: FloatingCandy[] = [];
    const candyEmojis = ['🍬', '🍭', '🍫', '🧁', '🍰', '🎂', '🍩', '🍪', '🍯', '🧡'];
    
    for (let i = 0; i < 25; i++) {
      candies.push({
        id: i,
        type: `candy-${i}`,
        emoji: candyEmojis[Math.floor(Math.random() * candyEmojis.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 5
      });
    }
    setFloatingCandies(candies);
  }, []);

  const initializeGrid = useCallback(() => {
    const newGrid: (CandySymbol | null)[][] = [];
    const newMultipliers: number[][] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      newMultipliers[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const randomType = getRandomSymbol();
        newGrid[row][col] = {
          id: `${row}-${col}-${Date.now()}`,
          ...randomType,
          position: { row, col },
          isWinning: false
        };
        newMultipliers[row][col] = 1;
      }
    }
    
    setGrid(newGrid);
    setMultipliers(newMultipliers);
  }, []);

  const getRandomSymbol = () => {
    const totalWeight = SYMBOL_TYPES.reduce((sum, symbol) => sum + symbol.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of SYMBOL_TYPES) {
      random -= symbol.weight;
      if (random <= 0) {
        return { type: symbol.type, color: symbol.color, value: symbol.value };
      }
    }
    
    return SYMBOL_TYPES[0];
  };

  const findClusters = useCallback((currentGrid: (CandySymbol | null)[][]) => {
    const visited: boolean[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    const foundClusters: Cluster[] = [];

    const floodFill = (row: number, col: number, symbolType: string, cluster: CandySymbol[]) => {
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE || visited[row][col]) {
        return;
      }
      
      const symbol = currentGrid[row][col];
      if (!symbol || symbol.type !== symbolType || symbol.type === 'bonus' || symbol.type === 'bomb') {
        return;
      }
      
      visited[row][col] = true;
      cluster.push(symbol);
      
      // Check adjacent cells (horizontal and vertical only)
      floodFill(row - 1, col, symbolType, cluster);
      floodFill(row + 1, col, symbolType, cluster);
      floodFill(row, col - 1, symbolType, cluster);
      floodFill(row, col + 1, symbolType, cluster);
    };

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!visited[row][col] && currentGrid[row][col]) {
          const symbol = currentGrid[row][col]!;
          if (symbol.type !== 'bonus' && symbol.type !== 'bomb') {
            const cluster: CandySymbol[] = [];
            floodFill(row, col, symbol.type, cluster);
            
            if (cluster.length >= 5) {
              const clusterMultiplier = cluster.reduce((sum, s) => {
                return sum + multipliers[s.position.row][s.position.col];
              }, 0) / cluster.length;
              
              foundClusters.push({
                symbols: cluster,
                value: cluster.length * symbol.value,
                multiplier: Math.max(1, clusterMultiplier)
              });
            }
          }
        }
      }
    }

    return foundClusters;
  }, [multipliers]);

  const handleSpin = async () => {
    if (isSpinning || balances.spins < betAmount) {
      if (balances.spins < betAmount) {
        toast({
          title: "Insufficient Spins!",
          description: `You need ${betAmount} spins to play`,
          variant: "destructive"
        });
      }
      return;
    }

    const success = await subtractSpins(betAmount);
    if (!success) return;

    setIsSpinning(true);
    setTotalWin(0);
    setCascadeCount(0);
    setShowWinExplosion(false);
    
    // Generate new grid
    initializeGrid();
    
    setTimeout(() => {
      processCascades();
    }, 1000);
  };

  const processCascades = async () => {
    let currentGrid = [...grid];
    let currentCascade = 0;
    let totalWinAmount = 0;

    while (true) {
      const foundClusters = findClusters(currentGrid);
      
      if (foundClusters.length === 0) {
        break;
      }

      // Mark winning symbols
      foundClusters.forEach(cluster => {
        cluster.symbols.forEach(symbol => {
          if (currentGrid[symbol.position.row][symbol.position.col]) {
            currentGrid[symbol.position.row][symbol.position.col]!.isWinning = true;
          }
        });
      });

      // Calculate wins
      const cascadeWin = foundClusters.reduce((sum, cluster) => {
        return sum + (cluster.value * cluster.multiplier * betAmount);
      }, 0);

      totalWinAmount += cascadeWin;
      currentCascade++;

      // Update multipliers for winning positions
      const newMultipliers = [...multipliers];
      foundClusters.forEach(cluster => {
        cluster.symbols.forEach(symbol => {
          newMultipliers[symbol.position.row][symbol.position.col] += 1;
        });
      });
      setMultipliers(newMultipliers);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 800));

      // Remove winning symbols and drop new ones
      for (let col = 0; col < GRID_SIZE; col++) {
        let writeIndex = GRID_SIZE - 1;
        
        // Move non-winning symbols down
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          if (currentGrid[row][col] && !currentGrid[row][col]!.isWinning) {
            if (writeIndex !== row) {
              currentGrid[writeIndex][col] = { 
                ...currentGrid[row][col]!,
                position: { row: writeIndex, col }
              };
              currentGrid[row][col] = null;
            }
            writeIndex--;
          } else if (currentGrid[row][col] && currentGrid[row][col]!.isWinning) {
            currentGrid[row][col] = null;
          }
        }
        
        // Fill empty spaces with new symbols
        for (let row = writeIndex; row >= 0; row--) {
          const randomType = getRandomSymbol();
          currentGrid[row][col] = {
            id: `${row}-${col}-${Date.now()}-${currentCascade}`,
            ...randomType,
            position: { row, col },
            isWinning: false
          };
        }
      }

      setGrid([...currentGrid]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCascadeCount(currentCascade);
    setTotalWin(totalWinAmount);
    
    if (totalWinAmount > 0) {
      setShowWinExplosion(true);
      await addCoins(totalWinAmount);
      toast({
        title: "Sweet Win! 🍬",
        description: `You won ${totalWinAmount} coins with ${currentCascade} cascades!`,
      });
      setTimeout(() => setShowWinExplosion(false), 3000);
    }

    setIsSpinning(false);
  };

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sugar Rush animated gradient background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, #EC4899 0%, #8B5CF6 25%, #3B82F6 50%, #10B981 75%, #F59E0B 100%)",
            "linear-gradient(225deg, #F59E0B 0%, #EC4899 25%, #8B5CF6 50%, #3B82F6 75%, #10B981 100%)",
            "linear-gradient(315deg, #10B981 0%, #F59E0B 25%, #EC4899 50%, #8B5CF6 75%, #3B82F6 100%)",
            "linear-gradient(45deg, #3B82F6 0%, #10B981 25%, #F59E0B 50%, #EC4899 75%, #8B5CF6 100%)"
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Whipped cream clouds */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full blur-xl"
            style={{
              width: `${100 + i * 50}px`,
              height: `${60 + i * 30}px`,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 12}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Falling candies background */}
      <div className="absolute inset-0">
        {floatingCandies.map((candy) => (
          <motion.div
            key={candy.id}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${candy.x}%`,
              fontSize: `${candy.scale * 2}rem`,
            }}
            initial={{ 
              y: -100, 
              rotate: candy.rotation,
              opacity: 0.7
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: candy.rotation + 360,
              opacity: [0.7, 1, 0.7, 0]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: candy.delay,
              ease: "linear"
            }}
          >
            {candy.emoji}
          </motion.div>
        ))}
      </div>

      {/* Sparkle overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Win explosion effect */}
      <AnimatePresence>
        {showWinExplosion && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                initial={{ 
                  scale: 0,
                  x: 0,
                  y: 0,
                  rotate: 0
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: (Math.random() - 0.5) * 800,
                  y: (Math.random() - 0.5) * 800,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                }}
              >
                🎉
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        {/* Sugar Rush logo and header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md mb-6"
        >
          <div className="relative">
            {/* Sugar Rush logo */}
            <motion.div 
              className="text-center mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h1 className="text-5xl font-black bg-gradient-to-r from-white via-candy-yellow to-white bg-clip-text text-transparent drop-shadow-2xl">
                Sugar
              </h1>
              <h2 className="text-4xl font-black bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent -mt-2 drop-shadow-xl">
                RUSH
              </h2>
              {/* Decorative elements */}
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-2xl animate-bounce">🍭</span>
                <span className="text-2xl animate-bounce delay-100">🍬</span>
                <span className="text-2xl animate-bounce delay-200">🧁</span>
              </div>
            </motion.div>
            
            <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/40 shadow-2xl">
              <CandyHeader 
                totalWin={totalWin}
                freeSpins={freeSpins}
                cascadeCount={cascadeCount}
              />
            </div>
          </div>
        </motion.div>

        {/* Game grid with enhanced animations */}
        <motion.div 
          className="w-full max-w-md mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            {/* Candy border decoration */}
            <div className="absolute top-2 left-2 text-lg">🍭</div>
            <div className="absolute top-2 right-2 text-lg">🍬</div>
            <div className="absolute bottom-2 left-2 text-lg">🧁</div>
            <div className="absolute bottom-2 right-2 text-lg">🍫</div>
            <CandyGrid 
              grid={grid}
              multipliers={multipliers}
              isSpinning={isSpinning}
              clusters={clusters}
            />
          </div>
        </motion.div>

        {/* Controls with improved design */}
        <motion.div 
          className="w-full max-w-md"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <CandyControls
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            isSpinning={isSpinning}
            isAutoPlay={isAutoPlay}
            setIsAutoPlay={setIsAutoPlay}
            onSpin={handleSpin}
            balance={balances.spins}
          />
        </motion.div>
      </div>

      {/* Bottom ambient light effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default CandyFortuneReels;
