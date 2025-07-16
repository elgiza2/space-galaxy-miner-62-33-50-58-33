import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Gift, Coins, Crown, Map, ShoppingCart, Star, Timer, Target, TrendingUp } from 'lucide-react';
import { useSpaceCoins } from '../../hooks/useSpaceCoins';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { toast } from 'sonner';

interface TreasureDiggerProps {
  onNavigate?: (page: string) => void;
}

interface DigResult {
  type: 'space' | 'ton' | 'empty' | 'rare' | 'jackpot';
  amount: number;
  message: string;
  icon: string;
}

interface HexCell {
  id: string;
  q: number;
  r: number;
  isDug: boolean;
  reward?: DigResult;
  isGlowing?: boolean;
}

const TreasureDigger: React.FC<TreasureDiggerProps> = ({ onNavigate }) => {
  const { addCoins, spaceCoins } = useSpaceCoins();
  const [tonConnectUI] = useTonConnectUI();

  // Enhanced game state
  const [energy, setEnergy] = useState(5);
  const [maxEnergy] = useState(5);
  const [isDigging, setIsDigging] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<DigResult | null>(null);
  const [hexCells, setHexCells] = useState<HexCell[]>([]);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [totalDigs, setTotalDigs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [experience, setExperience] = useState(0);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  useEffect(() => {
    loadGameState();
    generateEnhancedHexMap();
    const interval = setInterval(checkEnergyRefresh, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadGameState = () => {
    const savedEnergy = localStorage.getItem('treasureDigger_energy');
    const savedLevel = localStorage.getItem('treasureDigger_level');
    const savedTotalDigs = localStorage.getItem('treasureDigger_totalDigs');
    const savedStreak = localStorage.getItem('treasureDigger_streak');
    const savedExp = localStorage.getItem('treasureDigger_experience');
    
    if (savedEnergy) setEnergy(parseInt(savedEnergy));
    if (savedLevel) setPlayerLevel(parseInt(savedLevel));
    if (savedTotalDigs) setTotalDigs(parseInt(savedTotalDigs));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedExp) setExperience(parseInt(savedExp));
    
    const today = new Date().toDateString();
    const lastClaimedDay = localStorage.getItem('treasureDigger_lastClaimedDay');
    setDailyRewardClaimed(lastClaimedDay === today);
  };

  const generateEnhancedHexMap = () => {
    const cells: HexCell[] = [];
    const radius = 5;
    
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        const isGlowing = Math.random() < 0.1; // 10% chance for glowing cells
        cells.push({
          id: `${q}-${r}`,
          q,
          r,
          isDug: false,
          isGlowing
        });
      }
    }
    
    setHexCells(cells);
  };

  const checkEnergyRefresh = () => {
    const now = Date.now();
    const lastRefresh = parseInt(localStorage.getItem('treasureDigger_lastRefresh') || '0');
    const hoursPassed = Math.floor((now - lastRefresh) / (1000 * 60 * 60));
    
    if (hoursPassed > 0 && energy < maxEnergy) {
      const newEnergy = Math.min(maxEnergy, energy + hoursPassed);
      setEnergy(newEnergy);
      localStorage.setItem('treasureDigger_energy', newEnergy.toString());
      localStorage.setItem('treasureDigger_lastRefresh', now.toString());
    }
  };

  const generateEnhancedDigResult = (isGlowing: boolean = false): DigResult => {
    const rand = Math.random();
    const levelBonus = playerLevel * 0.03;
    const glowingBonus = isGlowing ? 0.2 : 0;
    const streakBonus = Math.min(streak * 0.02, 0.1);
    
    const totalBonus = levelBonus + glowingBonus + streakBonus;
    
    // Jackpot (very rare)
    if (rand < 0.02 + totalBonus) {
      const amount = Math.floor(Math.random() * 10000) + 5000;
      return {
        type: 'jackpot',
        amount,
        message: `🎰 JACKPOT! You got ${amount.toLocaleString()} $SPACE coins!`,
        icon: '🎰'
      };
    }
    
    // Rare treasure
    if (rand < 0.08 + totalBonus) {
      const amount = Math.floor(Math.random() * 3000) + 2000;
      return {
        type: 'rare',
        amount,
        message: `⭐ Rare treasure! You got ${amount.toLocaleString()} $SPACE coins!`,
        icon: '⭐'
      };
    }
    
    // TON reward
    if (rand < 0.25 + totalBonus) {
      const amount = parseFloat((Math.random() * 0.08 + 0.02).toFixed(3));
      return {
        type: 'ton',
        amount,
        message: `💎 Excellent! You got ${amount} TON!`,
        icon: '💎'
      };
    }
    
    // Space coins
    if (rand < 0.65) {
      const amount = Math.floor(Math.random() * 1000) + 300;
      return {
        type: 'space',
        amount,
        message: `💰 Found ${amount.toLocaleString()} $SPACE coins!`,
        icon: '💰'
      };
    }
    
    return {
      type: 'empty',
      amount: 0,
      message: '🕳️ Empty chest! Next try will be better.',
      icon: '🕳️'
    };
  };

  const handleDig = async (cellId: string) => {
    if (energy <= 0 || isDigging) return;

    const cell = hexCells.find(c => c.id === cellId);
    if (!cell || cell.isDug) return;

    setIsDigging(true);
    setSelectedCell(cellId);
    setEnergy(prev => prev - 1);

    // Update cell state
    const updatedCells = hexCells.map(c => 
      c.id === cellId ? { ...c, isDug: true } : c
    );
    setHexCells(updatedCells);

    // Enhanced digging animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = generateEnhancedDigResult(cell.isGlowing);
    setLastResult(result);

    // Apply rewards and update stats
    if (result.type === 'space' || result.type === 'rare' || result.type === 'jackpot') {
      addCoins(result.amount);
      setStreak(prev => prev + 1);
    } else if (result.type === 'ton') {
      const currentTonRewards = parseFloat(localStorage.getItem('pendingTonRewards') || '0');
      localStorage.setItem('pendingTonRewards', (currentTonRewards + result.amount).toString());
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Update experience and level
    const expGain = result.type === 'empty' ? 5 : 
                   result.type === 'space' ? 10 :
                   result.type === 'ton' ? 20 :
                   result.type === 'rare' ? 50 : 100;
    
    const newExp = experience + expGain;
    const newTotalDigs = totalDigs + 1;
    const newLevel = Math.floor(newExp / 100) + 1;
    
    setExperience(newExp);
    setTotalDigs(newTotalDigs);
    
    if (newLevel > playerLevel) {
      setPlayerLevel(newLevel);
      toast(`🎉 Congratulations! You reached level ${newLevel}!`, { duration: 4000 });
    }

    // Save progress
    localStorage.setItem('treasureDigger_totalDigs', newTotalDigs.toString());
    localStorage.setItem('treasureDigger_level', newLevel.toString());
    localStorage.setItem('treasureDigger_energy', energy.toString());
    localStorage.setItem('treasureDigger_streak', streak.toString());
    localStorage.setItem('treasureDigger_experience', newExp.toString());

    setIsDigging(false);
    setSelectedCell(null);
    setShowResult(true);
    toast(result.message, { duration: 4000 });
  };

  const claimDailyReward = () => {
    const reward = 1500 + (playerLevel * 150);
    addCoins(reward);
    setDailyRewardClaimed(true);
    
    const today = new Date().toDateString();
    localStorage.setItem('treasureDigger_lastClaimedDay', today);
    
    toast(`🎁 Daily reward: ${reward.toLocaleString()} $SPACE coins!`, { duration: 4000 });
  };

  const resetMap = () => {
    generateEnhancedHexMap();
    toast('🗺️ Map has been reset!', { duration: 3000 });
  };

  const buyWithTON = async (item: string, price: number) => {
    try {
      if (!tonConnectUI.wallet) {
        await tonConnectUI.connectWallet();
        return;
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R',
            amount: (price * 1e9).toString(),
            payload: btoa(`Treasure Digger: ${item}`)
          }
        ]
      };

      await tonConnectUI.sendTransaction(transaction);
      
      if (item === 'energy_boost') {
        setEnergy(prev => Math.min(prev + 10, maxEnergy + 10));
      } else if (item === 'map_reset') {
        resetMap();
      } else if (item === 'lucky_boost') {
        // Add temporary luck boost
        localStorage.setItem('treasureDigger_luckyBoost', (Date.now() + 3600000).toString());
      }
      
      toast(`✅ Transaction successful!`, { duration: 3000 });
      setShowStore(false);
    } catch (error) {
      toast('❌ Transaction failed', { duration: 3000 });
    }
  };

  const hexToPixel = (q: number, r: number) => {
    const size = 22;
    const x = size * (3/2 * q);
    const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  };

  const experienceToNextLevel = 100 - (experience % 100);
  const energyPercentage = (energy / maxEnergy) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-orange-500/20 rounded-full blur-lg animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl">
              <Map className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Treasure Digger
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Star className="w-4 h-4 mr-1" />
              Level {playerLevel}
            </Badge>
          </div>
          <p className="text-yellow-200 text-lg">Dig in the hexagonal map and find hidden treasures!</p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {/* Energy Card */}
          <Card className="bg-black/60 border-blue-400/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white font-medium">Energy</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-400">{energy}</span>
                  <span className="text-xs text-gray-400">/{maxEnergy}</span>
                </div>
                <Progress value={energyPercentage} className="h-1" />
              </div>
            </CardContent>
          </Card>

          {/* Space Coins */}
          <Card className="bg-black/60 border-yellow-400/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-white font-medium">$SPACE</span>
              </div>
              <p className="text-lg font-bold text-yellow-400">{spaceCoins.toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Level Progress */}
          <Card className="bg-black/60 border-purple-400/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-white font-medium">Experience</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-purple-400">{experienceToNextLevel} to next level</p>
                <Progress value={(experience % 100)} className="h-1" />
              </div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="bg-black/60 border-green-400/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white font-medium">Streak</span>
              </div>
              <p className="text-lg font-bold text-green-400">{streak}</p>
            </CardContent>
          </Card>

          {/* Daily Reward */}
          <Card className="bg-black/60 border-pink-400/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-white font-medium">Daily</span>
              </div>
              <Button
                onClick={claimDailyReward}
                disabled={dailyRewardClaimed}
                size="sm"
                className="w-full text-xs bg-pink-600 hover:bg-pink-700"
              >
                {dailyRewardClaimed ? 'Claimed ✓' : 'Claim'}
              </Button>
            </CardContent>
          </Card>

          {/* Store */}
          <Card className="bg-black/60 border-orange-400/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-white font-medium">Store</span>
              </div>
              <Button
                onClick={() => setShowStore(true)}
                size="sm"
                className="w-full text-xs bg-orange-600 hover:bg-orange-700"
              >
                Shop
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Hexagonal Map */}
        <Card className="bg-black/60 border-yellow-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-3">
              <span className="text-2xl">🗺️</span>
              Hexagonal Treasure Map
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                {hexCells.filter(c => c.isDug).length}/{hexCells.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-yellow-900/40 to-orange-900/40 p-8 rounded-xl overflow-hidden">
              {/* Map controls */}
              <div className="flex justify-center mb-4">
                <Button
                  onClick={resetMap}
                  variant="outline"
                  className="bg-black/50 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                >
                  🗺️ New Map
                </Button>
              </div>

              {/* SVG hex map */}
              <svg
                viewBox="-130 -130 260 260"
                className="w-full h-96 mx-auto"
              >
                {hexCells.map(cell => {
                  const { x, y } = hexToPixel(cell.q, cell.r);
                  const isClickable = !cell.isDug && energy > 0 && !isDigging;
                  const isSelected = selectedCell === cell.id;
                  
                  return (
                    <g key={cell.id}>
                      {/* Glow effect for special cells */}
                      {cell.isGlowing && !cell.isDug && (
                        <circle
                          cx={x}
                          cy={y}
                          r="30"
                          fill="rgba(255, 215, 0, 0.3)"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Hex cell */}
                      <polygon
                        points={Array.from({ length: 6 }, (_, i) => {
                          const angle = (Math.PI / 3) * i;
                          const hexX = x + 18 * Math.cos(angle);
                          const hexY = y + 18 * Math.sin(angle);
                          return `${hexX},${hexY}`;
                        }).join(' ')}
                        fill={
                          cell.isDug 
                            ? '#8B4513' 
                            : isSelected
                              ? '#FFA500'
                              : cell.isGlowing
                                ? '#FFD700'
                                : isClickable 
                                  ? '#10B981' 
                                  : '#6B7280'
                        }
                        stroke={
                          cell.isDug 
                            ? '#A0522D' 
                            : cell.isGlowing
                              ? '#FFD700'
                              : isClickable 
                                ? '#059669' 
                                : '#4B5563'
                        }
                        strokeWidth="2"
                        className={`${isClickable ? 'cursor-pointer hover:fill-emerald-400 transition-all duration-300' : ''} ${isSelected ? 'animate-pulse' : ''}`}
                        onClick={() => isClickable && handleDig(cell.id)}
                      />
                      
                      {/* Cell content */}
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        className="text-sm font-bold pointer-events-none"
                        fill="white"
                      >
                        {cell.isDug 
                          ? '🕳️' 
                          : cell.isGlowing 
                            ? '✨' 
                            : isClickable 
                              ? '🏝️' 
                              : '🔒'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Status messages */}
            {energy <= 0 && (
              <div className="text-center mt-4 p-4 bg-red-900/50 rounded-lg border border-red-500/30">
                <Timer className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-200 font-medium">⚡ Out of energy!</p>
                <p className="text-red-300 text-sm mt-1">Your energy will regenerate automatically every hour, or you can buy more from the store</p>
              </div>
            )}

            {isDigging && (
              <div className="text-center mt-4 p-6 bg-blue-900/50 rounded-lg border border-blue-500/30">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-400 mx-auto mb-3"></div>
                <p className="text-blue-200 text-lg font-medium">Digging... 🔨</p>
                <p className="text-blue-300 text-sm">Searching for hidden treasures...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card className="bg-black/60 border-yellow-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center text-xl">📋 Game Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-white space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-center gap-2"><span className="text-yellow-400">🎯</span> Click on any green cell to dig</p>
                <p className="flex items-center gap-2"><span className="text-blue-400">⚡</span> You have limited energy that regenerates every hour</p>
                <p className="flex items-center gap-2"><span className="text-purple-400">🌟</span> Higher level increases your treasure chances!</p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2"><span className="text-yellow-400">✨</span> Glowing cells contain better treasures</p>
                <p className="flex items-center gap-2"><span className="text-green-400">🎯</span> Maintain your success streak for extra rewards</p>
                <p className="flex items-center gap-2"><span className="text-orange-400">🛒</span> Use the store to buy improvements with TON</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Store Modal */}
      <Dialog open={showStore} onOpenChange={setShowStore}>
        <DialogContent className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/30 text-white max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🛒 Advanced Treasure Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="bg-black/40 border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">⚡ Super Energy</h3>
                    <p className="text-sm text-gray-300">+10 instant extra attempts</p>
                  </div>
                  <Zap className="w-10 h-10 text-blue-400" />
                </div>
                <Button 
                  onClick={() => buyWithTON('energy_boost', 0.08)}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-medium"
                >
                  Buy for 0.08 TON
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-orange-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">🗺️ New Map</h3>
                    <p className="text-sm text-gray-300">Reset all cells</p>
                  </div>
                  <Map className="w-10 h-10 text-orange-400" />
                </div>
                <Button 
                  onClick={() => buyWithTON('map_reset', 0.12)}
                  className="w-full bg-orange-600 hover:bg-orange-700 font-medium"
                >
                  Buy for 0.12 TON
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-green-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">🍀 Luck Boost</h3>
                    <p className="text-sm text-gray-300">Increase treasure chances for one hour</p>
                  </div>
                  <Star className="w-10 h-10 text-green-400" />
                </div>
                <Button 
                  onClick={() => buyWithTON('lucky_boost', 0.15)}
                  className="w-full bg-green-600 hover:bg-green-700 font-medium"
                >
                  Buy for 0.15 TON
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Result Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-gradient-to-br from-yellow-900 to-orange-900 border border-yellow-500/30 text-white max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {lastResult?.type === 'jackpot' ? '🎰 JACKPOT!' : 
               lastResult?.type === 'rare' ? '⭐ Rare Treasure!' : 
               lastResult?.type === 'ton' ? '💎 TON!' :
               lastResult?.type === 'space' ? '💰 $SPACE Coins!' : '🕳️ Empty Chest'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6">
            <div className="text-8xl animate-bounce">
              {lastResult?.icon}
            </div>
            <div className="space-y-2">
              <p className="text-lg leading-relaxed">{lastResult?.message}</p>
              {streak > 0 && (
                <Badge className="bg-green-600 text-white">
                  🔥 Streak: {streak}
                </Badge>
              )}
            </div>
            <Button 
              onClick={() => setShowResult(false)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 font-bold text-lg py-3"
            >
              Continue Digging 🔨
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreasureDigger;
