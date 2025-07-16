
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';
import MinesGameGrid from './Mines/MinesGameGrid';
import MinesSettings from './Mines/MinesSettings';
import MinesBetControls from './Mines/MinesBetControls';
import MinesHeader from './Mines/MinesHeader';

const MinesPage = () => {
  const [betAmount, setBetAmount] = useState(100);
  const [minesCount, setMinesCount] = useState(3);
  const [gameGrid, setGameGrid] = useState(Array(25).fill('hidden'));
  const [gameStarted, setGameStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentWinnings, setCurrentWinnings] = useState(0);
  const [gemsFound, setGemsFound] = useState(0);
  
  const { spaceCoins } = useSpaceCoins();
  const { availableTickets } = useTickets();
  const { toast } = useToast();

  const handleCellClick = (index: number) => {
    if (!gameStarted || gameGrid[index] !== 'hidden') return;
    
    const newGrid = [...gameGrid];
    // Generate mines positions based on minesCount
    const totalCells = 25;
    const safeSpots = totalCells - minesCount;
    const isMine = Math.random() < (minesCount / (totalCells - gemsFound));
    
    newGrid[index] = isMine ? 'mine' : 'gem';
    setGameGrid(newGrid);
    
    if (isMine) {
      // Game over
      setGameStarted(false);
      setCurrentWinnings(0);
      toast({
        title: "💥 انفجار!",
        description: "لقد أصبت لغماً! حاول مرة أخرى",
        variant: "destructive"
      });
    } else {
      // Found gem
      const newGemsFound = gemsFound + 1;
      setGemsFound(newGemsFound);
      const multiplier = 1 + (newGemsFound * 0.3) + (minesCount * 0.1);
      const winnings = Math.floor(betAmount * multiplier);
      setCurrentWinnings(winnings);
      
      toast({
        title: "💎 جوهرة!",
        description: `وجدت جوهرة! أرباحك الحالية: ${winnings.toLocaleString()} عملة`,
      });
    }
  };

  const startGame = () => {
    if (spaceCoins < betAmount) {
      toast({
        title: "رصيد غير كافي",
        description: "ليس لديك رصيد كافي لبدء اللعبة",
        variant: "destructive"
      });
      return;
    }
    
    setGameGrid(Array(25).fill('hidden'));
    setGameStarted(true);
    setCurrentWinnings(0);
    setGemsFound(0);
    toast({
      title: "🎮 بدء اللعبة",
      description: "حظاً موفقاً! اختر المربعات بحذر",
    });
  };

  const resetGame = () => {
    setGameGrid(Array(25).fill('hidden'));
    setGameStarted(false);
    setCurrentWinnings(0);
    setGemsFound(0);
  };

  const cashOut = () => {
    if (currentWinnings > 0) {
      setGameStarted(false);
      toast({
        title: "💰 تم سحب الأرباح",
        description: `تم إضافة ${currentWinnings.toLocaleString()} عملة إلى رصيدك`,
      });
      setCurrentWinnings(0);
      setGemsFound(0);
    }
  };

  if (showSettings) {
    return (
      <MinesSettings
        spaceCoins={spaceCoins}
        availableTickets={availableTickets}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-lg mx-auto animate-fade-in">
        <MinesHeader
          spaceCoins={spaceCoins}
          onShowSettings={() => setShowSettings(true)}
        />

        <MinesGameGrid
          gameGrid={gameGrid}
          gameStarted={gameStarted}
          onCellClick={handleCellClick}
        />

        {/* Current Winnings */}
        {gameStarted && currentWinnings > 0 && (
          <div className="text-center mb-4 animate-scale-in">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-400 font-bold">أرباحك الحالية</p>
              <p className="text-white text-2xl font-bold">{currentWinnings.toLocaleString()} عملة</p>
              <Button
                onClick={cashOut}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white"
              >
                سحب الأرباح 💰
              </Button>
            </div>
          </div>
        )}

        <MinesBetControls
          betAmount={betAmount}
          minesCount={minesCount}
          onBetAmountChange={setBetAmount}
          onMinesCountChange={setMinesCount}
        />

        {/* Play Button */}
        <Button 
          onClick={gameStarted ? resetGame : startGame}
          className={`w-full py-4 text-xl font-bold rounded-2xl transition-all duration-300 ${
            gameStarted 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
          } text-white shadow-lg`}
          disabled={!gameStarted && spaceCoins < betAmount}
        >
          {gameStarted ? 'Reset' : 'Play'}
        </Button>
      </div>
    </div>
  );
};

export default MinesPage;