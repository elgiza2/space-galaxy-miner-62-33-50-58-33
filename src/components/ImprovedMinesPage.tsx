import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/hooks/useTickets';
import { Bomb, DollarSign, TrendingUp, Ticket, Timer, Coins, Trophy, Zap } from 'lucide-react';
import TicketManagement from './TicketManagement';
import { EnhancedTicket } from '@/services/enhancedTicketService';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { tonService } from '@/services/tonService';
import { sendTONPayment, formatTON, TON_PAYMENT_ADDRESS } from '@/utils/ton';
import { motion, AnimatePresence } from 'framer-motion';

interface Cell {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  isGem: boolean;
}

const ImprovedMinesPage = () => {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [tonBetAmount, setTonBetAmount] = useState(0.1);
  const [minesCount, setMinesCount] = useState(3);
  const [revealedGems, setRevealedGems] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [potentialWin, setPotentialWin] = useState(0);
  const [betType, setBetType] = useState<'ton' | 'ticket'>('ton');
  const [usedTicketId, setUsedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<EnhancedTicket | null>(null);
  const [showTicketManagement, setShowTicketManagement] = useState(false);
  const [countdownTime, setCountdownTime] = useState('');
  
  const { balances, addCoins, subtractCoins } = useCurrency();
  const { toast } = useToast();
  const { 
    tickets, 
    availableTickets, 
    useTicket, 
    claimDailyTickets, 
    canGetDailyTickets, 
    timeUntilNextTickets,
    getTicketValue 
  } = useTickets();
  const [tonConnectUI] = useTonConnectUI();

  // Update countdown timer
  useEffect(() => {
    if (!canGetDailyTickets && timeUntilNextTickets > 0) {
      const timer = setInterval(() => {
        const hours = Math.floor(timeUntilNextTickets / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilNextTickets % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntilNextTickets % (1000 * 60)) / 1000);
        setCountdownTime(`${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdownTime('');
    }
  }, [canGetDailyTickets, timeUntilNextTickets]);

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

    // Place mines randomly with luck system
    const minePositions = new Set<number>();
    
    // Luck system based on bet type
    let shouldGiveBadLuck = false;
    if (betType === 'ton') {
      // ALWAYS ensure loss for TON bets - players will always hit mines
      shouldGiveBadLuck = true;
    } else if (betType === 'ticket') {
      // Fair play for tickets
      const lastTicketLuck = localStorage.getItem('lastTicketLuck');
      shouldGiveBadLuck = lastTicketLuck !== 'bad';
      localStorage.setItem('lastTicketLuck', shouldGiveBadLuck ? 'bad' : 'good');
    }
    
    // For bad luck (especially TON bets), place mines strategically to ensure loss
    if (shouldGiveBadLuck) {
      if (betType === 'ton') {
        // For TON bets: place mines in ALL likely click positions to guarantee loss
        const highProbabilityPositions = [6, 7, 8, 11, 12, 13, 16, 17, 18, 1, 3, 5, 9, 15, 19, 21, 23]; // Center + common edges
        const shuffledHigh = highProbabilityPositions.sort(() => Math.random() - 0.5);
        
        // Place ALL mines in high probability positions
        for (let i = 0; i < Math.min(minesCount, shuffledHigh.length); i++) {
          minePositions.add(shuffledHigh[i]);
        }
        
        // Fill remaining mines in other positions
        while (minePositions.size < minesCount) {
          const randomPos = Math.floor(Math.random() * 25);
          minePositions.add(randomPos);
        }
      } else {
        // For tickets with bad luck: normal difficulty
        const centerPositions = [6, 7, 8, 11, 12, 13, 16, 17, 18];
        const shuffledCenter = centerPositions.sort(() => Math.random() - 0.5);
        
        const centerMines = Math.min(minesCount, shuffledCenter.length);
        for (let i = 0; i < centerMines; i++) {
          minePositions.add(shuffledCenter[i]);
        }
        
        while (minePositions.size < minesCount) {
          const randomPos = Math.floor(Math.random() * 25);
          minePositions.add(randomPos);
        }
      }
    } else {
      // For good luck, avoid center area and place mines randomly
      const edgePositions = [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24];
      const shuffledEdge = edgePositions.sort(() => Math.random() - 0.5);
      
      // Try to place mines on edges first
      const edgeMines = Math.min(minesCount, shuffledEdge.length);
      for (let i = 0; i < edgeMines; i++) {
        minePositions.add(shuffledEdge[i]);
      }
      
      // Fill remaining mines randomly
      while (minePositions.size < minesCount) {
        const randomPos = Math.floor(Math.random() * 25);
        minePositions.add(randomPos);
      }
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
    // Validate bet based on type
    if (betType === 'ton') {
      if (!tonConnectUI.connected) {
        toast({
          title: "Connect TON Wallet",
          description: "Please connect your TON wallet first",
          variant: "destructive"
        });
        return;
      }
      
      if (tonBetAmount <= 0) {
        toast({
          title: "Invalid Bet Amount", 
          description: "Bet amount must be greater than zero",
          variant: "destructive"
        });
        return;
      }
      
      // Send TON payment to game wallet
      try {
        console.log('Starting TON payment process...');
        console.log('Payment amount:', tonBetAmount);
        console.log('Game wallet address:', TON_PAYMENT_ADDRESS);
        
        await sendTONPayment(
          tonConnectUI,
          TON_PAYMENT_ADDRESS, // Use the correct game wallet address
          tonBetAmount,
          "Mines game bet"
        );
        
        toast({
          title: "Payment Successful",
          description: `Paid ${formatTON(tonBetAmount)} to start the game`,
        });
        
      } catch (error) {
        console.error('TON payment failed:', error);
        toast({
          title: "Payment Failed",
          description: "An error occurred while sending the transaction. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setPotentialWin(tonBetAmount);
    } else if (betType === 'ticket') {
      if (availableTickets === 0) {
        toast({
          title: "No Tickets Available",
          description: "You don't have any tickets available to play",
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
          title: "Ticket Error",
          description: "Cannot find a valid ticket",
          variant: "destructive"
        });
        return;
      }
      
      const success = await useTicket(ticketToUse.id);
      if (!success) return;
      setUsedTicketId(ticketToUse.id);
      
      // Use ticket value as base reward
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
          title: "💥 Boom!",
          description: "You hit a mine! Bet lost",
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
        
        if (betType === 'ton') {
          setPotentialWin(tonBetAmount * newMultiplier);
        } else {
          // For tickets, use base value multiplied by multiplier
          const baseValue = selectedTicket ? getTicketValue(selectedTicket) : 1000;
          setPotentialWin(Math.floor(baseValue * newMultiplier));
        }

        toast({
          title: "💎 Gem Found!",
          description: `Found a gem! Multiplier: ${newMultiplier.toFixed(2)}x`,
        });
      }

      return newGrid;
    });
  };

  const cashOut = async () => {
    if (!gameStarted || gameOver || revealedGems === 0) return;

    let winAmount: number;
    let winDescription: string;

    if (betType === 'ton') {
      // TON players always get 0 win amount - no winnings
      winAmount = 0;
      winDescription = `Game ended. No winnings for TON bets.`;
    } else {
      // For tickets, calculate reward based on used ticket value
      const baseValue = selectedTicket ? getTicketValue(selectedTicket) : 1000;
      winAmount = Math.floor(baseValue * currentMultiplier);
      await addCoins(winAmount);
      winDescription = `You won ${winAmount.toLocaleString()} coins from the ticket!`;
    }
    
    setGameStarted(false);
    setGameOver(true);

    toast({
      title: betType === 'ton' ? "Game Ended" : "🎉 Win!",
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
      title: "Ticket Selected",
      description: `Selected ticket worth ${getTicketValue(ticket).toLocaleString()} coins`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <ScrollArea className="h-screen">
        <div className="p-4 pb-20">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Bomb className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">Mines Game</span>
              </div>
            </motion.div>

            {showTicketManagement && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <TicketManagement 
                  onTicketSelect={handleTicketSelect}
                  gameContext="mines"
                />
              </motion.div>
            )}
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Game Controls */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 space-y-6"
              >
                {/* Bet Controls */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Game Settings
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {/* Bet Type Selection */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Bet Type</label>
                        <Tabs value={betType} onValueChange={(value) => setBetType(value as 'ton' | 'ticket')}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ton">
                              TON
                            </TabsTrigger>
                            <TabsTrigger value="ticket">
                              <Ticket className="w-4 h-4 mr-1" />
                              Ticket
                            </TabsTrigger>
                          </TabsList>
                        
                          <TabsContent value="ton" className="mt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Bet Amount (TON)</label>
                              <Input
                                type="number"
                                value={tonBetAmount}
                                onChange={(e) => setTonBetAmount(Number(e.target.value))}
                                disabled={gameStarted}
                                min="0.01"
                                step="0.01"
                              />
                              <div className="text-xs text-muted-foreground">
                                Connect wallet to check balance
                              </div>
                              <TonConnectButton />
                              {tonConnectUI.connected && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-xs text-green-600">
                                  ✅ Wallet Connected
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        
                        <TabsContent value="ticket" className="mt-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Available Tickets:</span>
                              <Badge variant="secondary">{availableTickets}</Badge>
                            </div>
                            
                            {selectedTicket && (
                              <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
                                <div className="text-sm text-muted-foreground mb-1">Selected Ticket:</div>
                                <div className="font-medium">
                                  {selectedTicket.type === 'daily' ? 'Daily' : selectedTicket.type === 'premium' ? 'Premium' : 'Reward'} Ticket
                                </div>
                                <div className="text-primary text-sm">
                                  Value: {getTicketValue(selectedTicket).toLocaleString()} coins
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <Button 
                                onClick={claimDailyTickets}
                                disabled={!canGetDailyTickets}
                                variant={canGetDailyTickets ? "default" : "secondary"}
                                className="w-full"
                                size="sm"
                              >
                                {canGetDailyTickets ? (
                                  <>
                                    <Ticket className="w-4 h-4 mr-2" />
                                    Claim Daily Tickets
                                  </>
                                ) : (
                                  <>
                                    <Timer className="w-4 h-4 mr-2" />
                                    Next: {countdownTime}
                                  </>
                                )}
                              </Button>
                              {!canGetDailyTickets && (
                                <p className="text-xs text-muted-foreground text-center">
                                  You can claim 3 free tickets every 24 hours
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                     <div className="space-y-2">
                       <label className="text-sm font-medium text-muted-foreground">Number of Mines</label>
                       <div className="flex gap-2">
                         {[3, 5, 8].map((count) => (
                           <Button
                             key={count}
                             variant={minesCount === count ? "default" : "outline"}
                             size="sm"
                             onClick={() => setMinesCount(count)}
                             disabled={gameStarted}
                             className="flex-1"
                           >
                             {count}
                           </Button>
                         ))}
                       </div>
                     </div>

                     <div className="space-y-3 pt-4 border-t border-border/50">
                       <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">Multiplier:</span>
                         <span className="text-primary font-medium">{currentMultiplier.toFixed(2)}x</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">Potential Win:</span>
                         <span className="text-gold font-medium">
                            {betType === 'ton' 
                              ? `${potentialWin.toFixed(4)} TON`
                              : `${Math.floor(potentialWin).toLocaleString()} coins`}
                         </span>
                       </div>
                     </div>

                     {!gameStarted ? (
                       <Button 
                         onClick={startGame} 
                         className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium text-lg py-6"
                         size="lg"
                       >
                          <Zap className="w-5 h-5 mr-2" />
                          Start Game
                       </Button>
                     ) : (
                       <div className="space-y-2">
                         <Button 
                           onClick={cashOut}
                           disabled={revealedGems === 0}
                           className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-medium"
                           size="lg"
                         >
                            <Trophy className="w-4 h-4 mr-2" />
                            Cash Out
                         </Button>
                         <Button 
                           onClick={resetGame}
                           variant="outline"
                           className="w-full"
                           size="sm"
                         >
                           Reset Game
                         </Button>
                       </div>
                     )}
                  </CardContent>
                </Card>

              </motion.div>

              {/* Game Grid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2"
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                      <AnimatePresence>
                        {grid.map((cell) => (
                          <motion.button
                            key={cell.id}
                            whileHover={!cell.isRevealed && gameStarted ? { scale: 1.05 } : {}}
                            whileTap={!cell.isRevealed && gameStarted ? { scale: 0.95 } : {}}
                            onClick={() => revealCell(cell.id)}
                            disabled={!gameStarted || gameOver || cell.isRevealed}
                            className={`
                              aspect-square rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200
                              ${cell.isRevealed 
                                ? cell.isMine 
                                  ? 'bg-destructive/20 border-destructive text-destructive' 
                                  : 'bg-primary/20 border-primary text-primary'
                                : 'bg-muted hover:bg-muted/80 border-border hover:border-primary/50 active:scale-95'
                              }
                              ${!gameStarted || gameOver ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            `}
                          >
                            {cell.isRevealed && (cell.isMine ? '💣' : '💎')}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {gameOver && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-6 space-y-2"
                      >
                        <h3 className="text-xl font-bold">
                          {revealedGems > 0 ? '🎉 Game Over!' : '💥 Game Over!'}
                        </h3>
                        <p className="text-muted-foreground">
                          {revealedGems > 0 
                            ? `You found ${revealedGems} gems!`
                            : 'Better luck next time!'}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ImprovedMinesPage;
