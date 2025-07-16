import { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
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

interface UseSlotMachineReturn {
  reels: SlotSymbol[][];
  isSpinning: boolean;
  showMiniGame: boolean;
  selectedPositions: number[];
  winAnimation: string | null;
  multiplier: number;
  lastReward: string;
  buttonText: string;
  isAutoSpin: boolean;
  autoSpinCount: number;
  maxAutoSpins: number;
  handleSpin: () => void;
  handleMultiplierChange: () => void;
  handleMiniGameChoice: (position: number) => void;
  startAutoSpin: () => void;
  stopAutoSpin: () => void;
  handleMouseDown: () => void;
  handleMouseUp: () => void;
  getAvailableMultipliers: () => number[];
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'coin', image: coinIcon, name: 'Coin', isImageAsset: true },
  { id: 'space-gap', image: spaceGapIcon, name: 'Space Gap', isImageAsset: true },
  { id: 'rocket', image: rocketIcon, name: 'Rocket', isImageAsset: true },
  { id: 'astronaut', image: astronautIcon, name: 'Astronaut', isImageAsset: true },
  { id: 'spin', image: spinIcon, name: 'Spin', isImageAsset: true },
  
];

export const useSlotMachine = (): UseSlotMachineReturn => {
  const [reels, setReels] = useState<SlotSymbol[][]>([[], [], []]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [lastReward, setLastReward] = useState<string>('');
  const [buttonText, setButtonText] = useState<string>('SPIN');
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const [maxAutoSpins, setMaxAutoSpins] = useState(10);

  const autoSpinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const spinningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    balances,
    subtractSpins,
    addCoins,
    addSpaceCoins,
    addSpins,
  } = useCurrency();
  const { toast } = useToast();

  const getRandomSymbol = useCallback((): SlotSymbol => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }, []);

  const initializeReels = useCallback(() => {
    const newReels = [
      Array.from({ length: 3 }, getRandomSymbol),
      Array.from({ length: 3 }, getRandomSymbol),
      Array.from({ length: 3 }, getRandomSymbol)
    ];
    setReels(newReels);
  }, [getRandomSymbol]);

  const getAvailableMultipliers = useCallback(() => {
    const multipliers = [1];
    if (balances.spins >= 5) multipliers.push(5);
    if (balances.spins >= 50) multipliers.push(50);
    if (balances.spins >= 100) multipliers.push(100);
    if (balances.spins >= 500) multipliers.push(500);
    if (balances.spins >= 1000) multipliers.push(1000);
    if (balances.spins >= 5000) multipliers.push(5000);
    if (balances.spins >= 10000) multipliers.push(10000);
    if (balances.spins >= 50000) multipliers.push(50000);
    if (balances.spins >= 100000) multipliers.push(100000);
    if (balances.spins >= 500000) multipliers.push(500000);
    if (balances.spins >= 1000000) multipliers.push(1000000);
    if (balances.spins >= 5000000) multipliers.push(5000000);
    return multipliers;
  }, [balances.spins]);

  const handleMultiplierChange = useCallback(() => {
    const availableMultipliers = getAvailableMultipliers();
    const currentIndex = availableMultipliers.indexOf(multiplier);
    const nextIndex = (currentIndex + 1) % availableMultipliers.length;
    setMultiplier(availableMultipliers[nextIndex]);
  }, [getAvailableMultipliers, multiplier]);

  const checkWinningCombination = useCallback((finalReels: SlotSymbol[][]) => {
    const centerLine = [finalReels[0][1], finalReels[1][1], finalReels[2][1]];
    const symbols = centerLine.map(symbol => symbol.id);

    // Count symbol occurrences
    const symbolCounts = symbols.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check for three matching symbols
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      return handleThreeMatch(symbols[0]);
    }

    // Check for two matching symbols
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      if (count === 2) {
        return handleTwoMatch(symbol);
      }
    }

    // Check for single coin with two other symbols
    if (symbolCounts['coin'] === 1) {
      const coinReward = 200 * multiplier;
      addCoins(coinReward);
      setLastReward(`🪙 ${coinReward.toLocaleString()} Coins`);
      return { type: 'single-coin', reward: coinReward };
    }

    // Give coins even if no win
    const consolationReward = 100 * multiplier;
    addCoins(consolationReward);
    setLastReward(`🎁 ${consolationReward.toLocaleString()} Gift Coins!`);
    return { type: 'consolation', reward: consolationReward };
  }, [multiplier, addCoins, toast]);

  const handleTwoMatch = useCallback((symbol: string) => {
    let reward = 0;
    let title = '';
    let description = '';

    switch (symbol) {
      case 'coin':
        reward = 500 * multiplier;
        addCoins(reward);
        setWinAnimation('coin');
        setLastReward(`🪙 ${reward.toLocaleString()} Coins`);
        title = "🪙 Two Coins!";
        description = `You got ${reward.toLocaleString()} coins!`;
        break;
      case 'space-gap':
        reward = 100 * multiplier;
        addCoins(reward); // Space gaps give coins unless triple
        setLastReward(`🪙 ${reward.toLocaleString()} Coins`);
        break;
      case 'rocket':
        reward = 700 * multiplier;
        addCoins(reward);
        setWinAnimation('rocket');
        setLastReward(`🚀 ${reward.toLocaleString()} Coins`);
        title = "🚀 Two Rockets!";
        description = `You got ${reward.toLocaleString()} coins!`;
        break;
      case 'astronaut':
        reward = 2000 * multiplier;
        addCoins(reward);
        setWinAnimation('astronaut');
        setLastReward(`👨‍🚀 ${reward.toLocaleString()} Coins`);
        title = "👨‍🚀 Two Astronauts!";
        description = `You got ${reward.toLocaleString()} coins!`;
        break;
      case 'spin':
        reward = 3 * multiplier;
        addSpins(reward);
        setWinAnimation('spin');
        setLastReward(`🎰 ${reward} Free Spins`);
        title = "🎰 Two Spins!";
        description = `You got ${reward} free spins!`;
        break;
    }

    return { type: `double-${symbol}`, reward };
  }, [multiplier, addCoins, addSpins, toast]);

  const handleThreeMatch = useCallback((symbol: string) => {
    let title = '';
    let description = '';

    switch (symbol) {
      case 'space-gap':
        const spaceReward = 1000 * multiplier;
        addSpaceCoins(spaceReward);
        setWinAnimation('space-gap');
        setLastReward(`🌌 ${spaceReward.toLocaleString()} Space Coins`);
        break;
      case 'rocket':
        setShowMiniGame(true);
        setWinAnimation('rocket');
        setLastReward('🚀 Treasure Box Game!');
        title = "🚀 Three Rockets!";
        description = "Choose a box to steal coins!";
        break;
      case 'astronaut':
        const astronautReward = 10000 * multiplier;
        addCoins(astronautReward);
        setWinAnimation('astronaut');
        setLastReward(`👨‍🚀 ${astronautReward.toLocaleString()} Coins`);
        title = "👨‍🚀 Three Astronauts!";
        description = `You got ${astronautReward.toLocaleString()} coins!`;
        break;
      case 'spin':
        const spinReward = 10 * multiplier;
        addSpins(spinReward);
        setWinAnimation('spin');
        setLastReward(`🎰 ${spinReward} Free Spins`);
        title = "🎰 Three Spins!";
        description = `You got ${spinReward} free spins!`;
        break;
      case 'coin':
        const coinReward = 2000 * multiplier;
        addCoins(coinReward);
        setWinAnimation('coin');
        setLastReward(`🪙 ${coinReward.toLocaleString()} Coins`);
        title = "🪙 Three Coins!";
        description = `You got ${coinReward.toLocaleString()} coins!`;
        break;
      default:
        const defaultReward = 100 * multiplier;
        addCoins(defaultReward);
        setLastReward(`🎁 ${defaultReward.toLocaleString()} Gift Coins!`);
        title = "🎁 Gift!";
        description = `You got ${defaultReward.toLocaleString()} coins!`;
        break;
    }

    return { type: symbol, reward: 0 };
  }, [multiplier, addSpaceCoins, addCoins, addSpins, toast]);

  const stopAutoSpin = useCallback(() => {
    setIsAutoSpin(false);
    setAutoSpinCount(0);
    if (autoSpinIntervalRef.current) {
      clearInterval(autoSpinIntervalRef.current);
      autoSpinIntervalRef.current = null;
    }
    setButtonText('SPIN');
  }, []);

  const startAutoSpin = useCallback(() => {
    if (balances.spins < multiplier) {
      toast({
        title: "Insufficient Spins!",
        description: `You need ${multiplier} spins to run auto spin`,
        variant: "destructive"
      });
      return;
    }

    setIsAutoSpin(true);
    setAutoSpinCount(0);
    
    autoSpinIntervalRef.current = setInterval(() => {
      if (balances.spins < multiplier) {
        stopAutoSpin();
        toast({
          title: "Spins Finished!",
          description: "Auto spin stopped due to insufficient spins",
        });
        return;
      }

      setAutoSpinCount(prev => {
        if (prev >= maxAutoSpins - 1) {
          stopAutoSpin();
          return 0;
        }
        return prev + 1;
      });

      handleSpin();
    }, 3000);
  }, [balances.spins, multiplier, maxAutoSpins, stopAutoSpin, toast]);

  const handleSpin = useCallback(async () => {
    if (isSpinning) return;

    const requiredSpins = multiplier;
    if (balances.spins < requiredSpins) {
      toast({
        title: "Insufficient Spins!",
        description: `You need ${requiredSpins} spins to use multiplier x${multiplier}`,
        variant: "destructive"
      });
      return;
    }

    const success = await subtractSpins(requiredSpins);
    if (!success) return;

    setIsSpinning(true);
    setButtonText(isAutoSpin ? `AUTO ${autoSpinCount + 1}/${maxAutoSpins}` : "SPINNING");
    setWinAnimation(null);
    setLastReward('');

    // تحديد نوع النتيجة
    const rand = Math.random();
    let finalReels: SlotSymbol[][];
    
    if (rand < 0.3) {
      // فوز كبير - 3 رموز متطابقة
      const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      finalReels = [
        [getRandomSymbol(), winningSymbol, getRandomSymbol()],
        [getRandomSymbol(), winningSymbol, getRandomSymbol()],
        [getRandomSymbol(), winningSymbol, getRandomSymbol()]
      ];
    } else {
      // رموز عشوائية مختلفة
      finalReels = [
        Array.from({ length: 3 }, getRandomSymbol),
        Array.from({ length: 3 }, getRandomSymbol),
        Array.from({ length: 3 }, getRandomSymbol)
      ];
    }

    if (spinningTimeoutRef.current) clearTimeout(spinningTimeoutRef.current);
    spinningTimeoutRef.current = setTimeout(() => {
      setReels(finalReels);
      setIsSpinning(false);
      setButtonText(isAutoSpin ? 'AUTO SPIN' : 'SPIN');
      
      setTimeout(() => {
        checkWinningCombination(finalReels);
      }, 100);
    }, 1500);
  }, [isSpinning, multiplier, balances.spins, isAutoSpin, autoSpinCount, maxAutoSpins, subtractSpins, getRandomSymbol, checkWinningCombination, toast]);

  const handleMouseDown = useCallback(() => {
    if (isSpinning) return;
    
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (!isAutoSpin) {
        startAutoSpin();
      } else {
        stopAutoSpin();
      }
    }, 1000);
  }, [isSpinning, isAutoSpin, startAutoSpin, stopAutoSpin]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    if (!isLongPressRef.current && !isAutoSpin) {
      handleSpin();
    }
  }, [isAutoSpin, handleSpin]);

  const handleMiniGameChoice = useCallback((position: number) => {
    if (selectedPositions.includes(position)) return;

    const newSelected = [...selectedPositions, position];
    setSelectedPositions(newSelected);

    // Random reward between 100-5000 space coins
    const randomReward = Math.floor(Math.random() * 4901) + 100;
    const finalReward = randomReward * multiplier;
    addSpaceCoins(finalReward);


    setTimeout(() => {
      setShowMiniGame(false);
      setSelectedPositions([]);
      setWinAnimation(null);
    }, 2000);
  }, [selectedPositions, addSpaceCoins, toast, multiplier]);

  // Initialize reels on mount
  useEffect(() => {
    initializeReels();
  }, [initializeReels]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSpinIntervalRef.current) {
        clearInterval(autoSpinIntervalRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (spinningTimeoutRef.current) {
        clearTimeout(spinningTimeoutRef.current);
      }
    };
  }, []);

  return {
    reels,
    isSpinning,
    showMiniGame,
    selectedPositions,
    winAnimation,
    multiplier,
    lastReward,
    buttonText,
    isAutoSpin,
    autoSpinCount,
    maxAutoSpins,
    handleSpin,
    handleMultiplierChange,
    handleMiniGameChoice,
    startAutoSpin,
    stopAutoSpin,
    handleMouseDown,
    handleMouseUp,
    getAvailableMultipliers
  };
};
