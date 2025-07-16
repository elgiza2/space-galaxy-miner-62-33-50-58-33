import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/hooks/useTickets';
import { Bomb, DollarSign, TrendingUp, Ticket, Settings, X, Minus, Plus } from 'lucide-react';
import TicketManagement from './TicketManagement';
import { EnhancedTicket } from '@/services/enhancedTicketService';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { tonService } from '@/services/tonService';
import { sendTONPayment, formatTON } from '@/utils/ton';

interface Cell {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  isGem: boolean;
}

interface MinesGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MinesGameModal: React.FC<MinesGameModalProps> = ({ isOpen, onClose }) => {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [tonBetAmount, setTonBetAmount] = useState(0.1);
  const [minesCount, setMinesCount] = useState(3);
  const [revealedGems, setRevealedGems] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [potentialWin, setPotentialWin] = useState(0);
  const [betType, setBetType] = useState<'coins' | 'ton' | 'ticket'>('coins');
  const [usedTicketId, setUsedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<EnhancedTicket | null>(null);
  const [showTicketManagement, setShowTicketManagement] = useState(false);
  
  const { spaceCoins, addCoins, subtractCoins } = useSpaceCoins();
  const { toast } = useToast();
  const { tickets, availableTickets, useTicket, claimDailyTickets, canGetDailyTickets, getTicketValue } = useTickets();
  const [tonConnectUI] = useTonConnectUI();

  const createGrid = useCallback(() => {
    const newGrid: Cell[] = [];
    
    // Create 25 cells (5x5 grid)
    for (let i = 0; i < 25; i++) {
      newGrid.push({
        id: i,
        isMine: false,
        isRevealed: false,
        isGem: false
      });
    }

    // Place mines randomly
    const minePositions = new Set<number>();
    while (minePositions.size < minesCount) {
      const randomPos = Math.floor(Math.random() * 25);
      minePositions.add(randomPos);
    }

    minePositions.forEach(pos => {
      newGrid[pos].isMine = true;
    });

    return newGrid;
  }, [minesCount]);

  const calculateMultiplier = useCallback((gemsRevealed: number) => {
    const safeSpots = 25 - minesCount;
    const remaining = safeSpots - gemsRevealed;
    if (remaining <= 0) return 1;
    
    // Calculate multiplier based on risk
    const base = 1.1;
    return Math.pow(base, gemsRevealed) * (1 + (minesCount * 0.1));
  }, [minesCount]);

  const startGame = async () => {
    if (betType === 'coins') {
      if (betAmount > spaceCoins) {
        toast({
          title: "رصيد غير كافي",
          description: "ليس لديك عملات كافية لهذا الرهان",
          variant: "destructive"
        });
        return;
      }
      if (betAmount <= 0) {
        toast({
          title: "مبلغ الرهان غير صحيح",
          description: "يجب أن يكون مبلغ الرهان أكبر من صفر",
          variant: "destructive"
        });
        return;
      }
      await subtractCoins(betAmount);
      setPotentialWin(betAmount);
    } else if (betType === 'ton') {
      if (!tonConnectUI.connected) {
        toast({
          title: "اربط محفظة TON",
          description: "يجب ربط محفظة TON أولاً",
          variant: "destructive"
        });
        return;
      }
      if (tonBetAmount <= 0) {
        toast({
          title: "مبلغ الرهان غير صحيح",
          description: "يجب أن يكون مبلغ الرهان أكبر من صفر",
          variant: "destructive"
        });
        return;
      }
      
      // Send real TON transaction
      try {
        const walletAddress = tonService.getConnectedWallet();
        if (!walletAddress) {
          toast({
            title: "خطأ في المحفظة",
            description: "لم يتم العثور على عنوان المحفظة",
            variant: "destructive"
          });
          return;
        }
        
        // Define game house wallet
        const gameWalletAddress = "UQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL";
        
        await sendTONPayment(
          tonConnectUI,
          gameWalletAddress,
          tonBetAmount,
          "Mines game bet"
        );
        
        toast({
          title: "تم الدفع",
          description: `تم دفع ${formatTON(tonBetAmount)} بنجاح`,
        });
        
      } catch (error) {
        console.error('TON payment failed:', error);
        toast({
          title: "فشل الدفع",
          description: "حدث خطأ أثناء المعاملة",
          variant: "destructive"
        });
        return;
      }
      
      setPotentialWin(tonBetAmount);
    } else if (betType === 'ticket') {
      if (availableTickets === 0) {
        toast({
          title: "لا توجد تذاكر",
          description: "ليس لديك تذاكر متاحة للعب",
          variant: "destructive"
        });
        return;
      }
      
      let ticketToUse = selectedTicket;
      if (!ticketToUse) {
        ticketToUse = tickets[0];
      }
      
      if (!ticketToUse) {
        toast({
          title: "خطأ في التذكرة",
          description: "لا يمكن العثور على تذكرة صالحة",
          variant: "destructive"
        });
        return;
      }
      
      const success = await useTicket(ticketToUse.id);
      if (!success) return;
      setUsedTicketId(ticketToUse.id);
      
      // استخدم قيمة التذكرة كمكافأة أساسية
      const ticketValue = getTicketValue(ticketToUse);
      setPotentialWin(ticketValue);
    }

    setGrid(createGrid());
    setGameStarted(true);
    setGameOver(false);
    setRevealedGems(0);
    setCurrentMultiplier(1);
  };

  const revealCell = (cellId: number) => {
    if (!gameStarted || gameOver) return;

    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      const cell = newGrid[cellId];
      
      if (cell.isRevealed) return prevGrid;
      
      cell.isRevealed = true;

      if (cell.isMine) {
        // Game over - hit a mine
        setGameOver(true);
        setGameStarted(false);
        toast({
          title: "💥 انفجار!",
          description: "أصبت لغماً! خسرت الرهان",
          variant: "destructive"
        });
        
        // Reveal all mines
        newGrid.forEach(c => {
          if (c.isMine) c.isRevealed = true;
        });
      } else {
        // Found a gem
        cell.isGem = true;
        const newGemsCount = revealedGems + 1;
        setRevealedGems(newGemsCount);
        
        const newMultiplier = calculateMultiplier(newGemsCount);
        setCurrentMultiplier(newMultiplier);
        
        if (betType === 'coins') {
          setPotentialWin(Math.floor(betAmount * newMultiplier));
        } else if (betType === 'ton') {
          setPotentialWin(tonBetAmount * newMultiplier);
        } else {
          // للتذاكر، استخدم القيمة الأساسية مضروبة في المضاعف
          const baseValue = selectedTicket ? getTicketValue(selectedTicket) : 1000;
          setPotentialWin(Math.floor(baseValue * newMultiplier));
        }

        toast({
          title: "💎 جوهرة!",
          description: `وجدت جوهرة! المضاعف: ${newMultiplier.toFixed(2)}x`,
        });
      }

      return newGrid;
    });
  };

  const cashOut = async () => {
    if (!gameStarted || gameOver || revealedGems === 0) return;

    let winAmount: number;
    let winDescription: string;

    if (betType === 'coins') {
      winAmount = Math.floor(betAmount * currentMultiplier);
      await addCoins(winAmount);
      winDescription = `حصلت على ${winAmount.toLocaleString()} عملة!`;
    } else if (betType === 'ton') {
      winAmount = tonBetAmount * currentMultiplier;
      
      try {
        // Send winnings back to player's wallet
        const walletAddress = tonService.getConnectedWallet();
        if (walletAddress) {
          // In real game, this would be sent from game's wallet to player
          console.log(`Sending ${formatTON(winAmount)} to ${walletAddress}`);
        }
      } catch (error) {
        console.error('Failed to send TON winnings:', error);
      }
      
      winDescription = `حصلت على ${formatTON(winAmount)}!`;
    } else {
      // للتذاكر، احسب المكافأة بناء على قيمة التذكرة المستخدمة
      const baseValue = selectedTicket ? getTicketValue(selectedTicket) : 1000;
      winAmount = Math.floor(baseValue * currentMultiplier);
      await addCoins(winAmount);
      winDescription = `حصلت على ${winAmount.toLocaleString()} عملة من التذكرة!`;
    }
    
    setGameStarted(false);
    setGameOver(true);

    toast({
      title: "🎉 فوز!",
      description: winDescription,
    });
  };

  const resetGame = () => {
    setGrid([]);
    setGameStarted(false);
    setGameOver(false);
    setRevealedGems(0);
    setCurrentMultiplier(1);
    setPotentialWin(0);
    setUsedTicketId(null);
    setSelectedTicket(null);
  };

  const handleTicketSelect = (ticket: EnhancedTicket) => {
    setSelectedTicket(ticket);
    setBetType('ticket');
    setShowTicketManagement(false);
    toast({
      title: "تذكرة محددة",
      description: `تم تحديد تذكرة بقيمة ${getTicketValue(ticket).toLocaleString()} عملة`,
    });
  };

  const handleClose = () => {
    resetGame();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-slate-700/50 overflow-y-auto p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white p-2"
          >
            ←
          </Button>
          <h1 className="text-white text-lg font-bold">1win Token</h1>
          <div className="w-8"></div>
        </div>

        {/* Balance Display */}
        <div className="flex items-center justify-center gap-4 p-4 bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">🎯</span>
            </div>
            <span className="text-white font-medium">{spaceCoins.toLocaleString()} 1WT</span>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-400">
            HowToPlay
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Game Grid */}
          <div className="bg-slate-800/50 rounded-2xl p-6">
            <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
              {grid.length > 0 ? grid.map((cell) => (
                <button
                  key={cell.id}
                  onClick={() => revealCell(cell.id)}
                  disabled={!gameStarted || gameOver || cell.isRevealed}
                  className={`
                    aspect-square w-full h-14 rounded-xl transition-all duration-300
                    flex items-center justify-center text-xl font-bold
                    shadow-lg transform hover:scale-105 active:scale-95
                    ${!cell.isRevealed 
                      ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/25 border border-cyan-300/30' 
                      : cell.isMine 
                      ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/25' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25'
                    }
                    ${!gameStarted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    ${cell.isRevealed ? 'cursor-default' : ''}
                  `}
                >
                  {cell.isRevealed && (
                    <>
                      {cell.isMine ? (
                        <Bomb className="w-5 h-5 text-white" />
                      ) : cell.isGem ? (
                        <img 
                          src="/lovable-uploads/7b18f746-cbbe-473e-b4a7-bf1dc9ef198a.png" 
                          alt="جوهرة" 
                          className="w-6 h-6"
                        />
                      ) : null}
                    </>
                  )}
                </button>
              )) : (
                // Empty grid placeholder
                Array.from({ length: 25 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square w-full h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/25 border border-cyan-300/30"
                  />
                ))
              )}
            </div>
          </div>

          {/* Game Stats */}
          <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">⭐</span>
              <div>
                <div className="text-green-400 font-bold">MaxWinnings</div>
                <div className="text-white font-medium">
                  {potentialWin.toLocaleString()} {betType === 'ton' ? 'TON' : '1WT'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-white/70">
                ←
              </Button>
              <div className="text-center">
                <div className="text-white text-2xl font-bold">{minesCount}</div>
                <div className="text-gray-400 text-sm">Traps</div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/70">
                →
              </Button>
            </div>
          </div>

          {/* Bet Amount Control */}
          <div className="bg-slate-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white w-10 h-10 rounded-lg"
                onClick={() => setBetAmount(prev => Math.max(10, prev - 10))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-white text-3xl font-bold">{betAmount}</div>
                <div className="text-gray-400 text-sm">1WT</div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white w-10 h-10 rounded-lg"
                onClick={() => setBetAmount(prev => prev + 10)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Play Button */}
          <div className="space-y-3">
            {!gameStarted && !gameOver && (
              <Button 
                onClick={startGame} 
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-lg"
              >
                Play
              </Button>
            )}
            
            {gameStarted && !gameOver && revealedGems > 0 && (
              <Button 
                onClick={cashOut} 
                className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-bold rounded-xl shadow-lg"
              >
                Cash Out ({betType === 'ton' ? formatTON(potentialWin) : potentialWin.toLocaleString()})
              </Button>
            )}
            
            {(gameOver || gameStarted) && (
              <Button 
                onClick={resetGame} 
                variant="outline" 
                className="w-full h-12 bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/60 text-white rounded-xl"
              >
                لعبة جديدة
              </Button>
            )}
          </div>
        </div>

        {showTicketManagement && (
          <div className="absolute inset-0 bg-slate-900/95 z-50 p-4">
            <TicketManagement 
              onTicketSelect={handleTicketSelect}
              gameContext="mines"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MinesGameModal;
