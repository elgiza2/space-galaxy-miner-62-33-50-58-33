import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { useTonConnectUI } from '@tonconnect/ui-react';
import { 
  Star, 
  Zap, 
  Clock, 
  Coins,
  Crown,
  ArrowUp,
  Check,
  Lock,
  Gem,
  Play,
  Gift,
  Hammer
} from 'lucide-react';
import { charactersService, Character, UserCharacter } from '../services/charactersService';
import { characterMiningService } from '../services/characterMiningService';
import { useSpaceCoins } from '../hooks/useSpaceCoins';

const CharactersPage = () => {
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
  const [userCharacters, setUserCharacters] = useState<UserCharacter[]>([]);
  const [miningStatus, setMiningStatus] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { spaceCoins, addCoins } = useSpaceCoins();
  const [tonConnectUI] = useTonConnectUI();

  // Update mining status every second
  useEffect(() => {
    const updateMiningStatus = () => {
      const status = characterMiningService.getActiveMiningStatus();
      setMiningStatus(status);
    };

    updateMiningStatus();
    const interval = setInterval(updateMiningStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAvailableCharacters(charactersService.getAvailableCharacters());
    setUserCharacters(charactersService.getUserCharacters());
  }, []);

  const handlePurchase = async (characterId: string) => {
    setIsProcessing(true);
    try {
      const character = availableCharacters.find(c => c.id === characterId);
      if (!character) {
        toast({
          title: "Error",
          description: "Character not found",
          variant: "destructive"
        });
        return;
      }

      // Check wallet connection for TON characters
      if (character.currency === 'TON' && !tonConnectUI.wallet) {
        toast({
          title: "Wallet Required",
          description: "Please connect your TON wallet first",
          variant: "destructive"
        });
        return;
      }

      if (character.currency === 'TON') {
        toast({
          title: "Processing Payment",
          description: "Please confirm the transaction in your wallet"
        });
      }

      const success = await charactersService.purchaseCharacter(characterId, tonConnectUI);
      if (success) {
        setUserCharacters(charactersService.getUserCharacters());
        toast({
          title: "Character Purchased!",
          description: `${character.name} purchased successfully for ${character.basePrice} ${character.currency}`
        });
      } else {
        toast({
          title: "Purchase Failed",
          description: character.currency === 'TON' 
            ? "Payment failed or wallet not connected" 
            : "Insufficient coins or character already owned",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Transaction was cancelled or failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = async (characterId: string) => {
    setIsProcessing(true);
    try {
      const character = availableCharacters.find(c => c.id === characterId);
      if (!character) return;

      const userChar = getUserCharacter(characterId);
      if (!userChar) return;

      const upgradeCost = getUpgradeCost(characterId, userChar.level);

      // Check wallet connection for TON characters
      if (character.currency === 'TON' && !tonConnectUI.wallet) {
        toast({
          title: "Wallet Required",
          description: "Please connect your TON wallet first",
          variant: "destructive"
        });
        return;
      }

      if (character.currency === 'TON') {
        toast({
          title: "Processing Payment",
          description: `Please confirm upgrade payment of ${upgradeCost}`
        });
      }

      const success = await charactersService.upgradeCharacter(characterId, tonConnectUI);
      if (success) {
        setUserCharacters(charactersService.getUserCharacters());
        toast({
          title: "Character Upgraded!",
          description: `${character.name} upgraded to level ${userChar.level + 1}`
        });
      } else {
        toast({
          title: "Upgrade Failed",
          description: character.currency === 'TON' 
            ? "Payment failed or wallet not connected" 
            : "Insufficient coins or max level reached",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: "Transaction was cancelled or failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = (characterId: string) => {
    const userChar = getUserCharacter(characterId);
    if (!userChar || !userChar.isOwned) return;

    const success = charactersService.toggleCharacterActive(characterId);
    if (success) {
      setUserCharacters(charactersService.getUserCharacters());
      toast({
        title: userChar.isActive ? "Character Deactivated!" : "Character Activated!",
        description: userChar.isActive ? "Character deactivated successfully" : "Character activated successfully"
      });
    }
  };

  const handleStartMining = (characterId: string) => {
    const character = availableCharacters.find(c => c.id === characterId);
    const userChar = getUserCharacter(characterId);
    
    if (!character || !userChar || !userChar.isOwned) {
      toast({
        title: "Error",
        description: "Cannot start mining for this character",
        variant: "destructive"
      });
      return;
    }

    // Calculate mining rate based on character stats and level
    const baseMiningRate = 500; // base 500 coins/hour
    const levelBonus = (userChar.level - 1) * 50; // 50 coins/hour per level
    const characterBonus = character.miningSpeedBonus * 100; // character specific bonus
    const totalMiningRate = baseMiningRate + levelBonus + characterBonus;

    const success = characterMiningService.startMining(characterId, totalMiningRate);
    
    if (success) {
      toast({
        title: "Mining Started!",
        description: `Mining started at ${totalMiningRate} coins/hour`
      });
    } else {
      toast({
        title: "Error",
        description: "Character is already mining",
        variant: "destructive"
      });
    }
  };

  const handleCollectCoins = (characterId: string) => {
    const coinsCollected = characterMiningService.collectCoins(characterId);
    
    if (coinsCollected > 0) {
      addCoins(coinsCollected);
      toast({
        title: "Coins Collected!",
        description: `Collected ${coinsCollected} SPACE coins`
      });
    } else {
      toast({
        title: "No coins to collect",
        description: "Wait for mining to complete",
        variant: "destructive"
      });
    }
  };

  const getUserCharacter = (characterId: string): UserCharacter | undefined => {
    return userCharacters.find(uc => uc.characterId === characterId);
  };

  const getUpgradeCost = (characterId: string, level: number): number => {
    return charactersService.getUpgradeCost(characterId, level);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `${(price / 1000)}K`;
    }
    return price.toString();
  };

  const renderCharacterCard = (character: Character, isMyCharacters: boolean = false) => {
    const userChar = getUserCharacter(character.id);
    const isOwned = userChar?.isOwned || false;
    const isActive = userChar?.isActive || false;
    const level = userChar?.level || 1;
    const canUpgrade = isOwned && level < character.maxLevel;
    const upgradeCost = getUpgradeCost(character.id, level);
    const charMiningStatus = miningStatus[character.id];

    // Skip non-owned characters in "My Characters" tab
    if (isMyCharacters && !isOwned) {
      return null;
    }

    // Calculate mining rate
    const baseMiningRate = 500;
    const levelBonus = (level - 1) * 50;
    const characterBonus = character.miningSpeedBonus * 100;
    const totalMiningRate = baseMiningRate + levelBonus + characterBonus;

    return (
      <motion.div
        key={character.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Badges */}
        <div className="absolute -top-1 left-1 right-1 z-10 flex justify-between">
          <div className="flex gap-1">
            {character.isFree && (
              <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                Free
              </Badge>
            )}
          </div>
          {isActive && (
            <Badge className="bg-yellow-500 text-black text-xs px-1 py-0">
              <Crown className="w-2 h-2 mr-1" />
              Active
            </Badge>
          )}
        </div>

        <Card className={`bg-slate-800/50 backdrop-blur border transition-all ${
          isActive ? 'border-yellow-400/70 shadow-lg shadow-yellow-400/20' : 
          isOwned ? 'border-green-400/50' : 'border-slate-600/50'
        }`}>
          <CardHeader className="pb-1 pt-2 px-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xs">{character.name}</CardTitle>
              {isOwned && (
                <div className="flex items-center gap-1">
                  <Star className="w-2 h-2 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-xs">Lv {level}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-1 px-2 pb-2">
            {/* Character Image */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="w-10 h-10 object-contain"
                  loading="eager"
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xs text-center leading-tight">{character.description}</p>

            {/* Mining Rate */}
            {isOwned && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Hammer className="w-2 h-2 text-yellow-400" />
                  <span className="text-white font-bold text-xs">{totalMiningRate}/h</span>
                </div>
                
                {/* Mining Status */}
                {charMiningStatus && charMiningStatus.isActive && (
                  <div className="text-xs">
                    {charMiningStatus.canCollect ? (
                      <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                        <Gift className="w-2 h-2 mr-1" />
                        Ready! ({charMiningStatus.coinsReady})
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white text-xs px-1 py-0">
                        <Clock className="w-2 h-2 mr-1" />
                        {formatTime(charMiningStatus.timeRemaining)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="w-2 h-2 text-yellow-400" />
                  <span className="text-gray-300">Speed:</span>
                </div>
                <span className="text-white font-bold text-xs">
                  {((character.miningSpeedBonus + (level - 1) * 0.1) * 100 - 100).toFixed(0)}%+
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-2 h-2 text-blue-400" />
                  <span className="text-gray-300">Time:</span>
                </div>
                <span className="text-white font-bold text-xs">
                  +{character.miningTimeBonus + (level - 1) * 10}m
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Coins className="w-2 h-2 text-green-400" />
                  <span className="text-gray-300">Coins:</span>
                </div>
                <span className="text-white font-bold text-xs">
                  {(character.coinMultiplier + (level - 1) * 0.1).toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1">
              {!isOwned ? (
                <div className="space-y-1">
                  <Button
                    onClick={() => handlePurchase(character.id)}
                    disabled={isProcessing || (character.currency === 'SPACE' && spaceCoins < character.basePrice) || (character.currency === 'TON' && !tonConnectUI.wallet)}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white border border-slate-600 text-xs h-7 px-1"
                  >
                    <Lock className="w-2 h-2 mr-1" />
                    <span className="text-xs font-medium leading-none">
                      Buy ({formatPrice(character.basePrice)} {character.currency})
                    </span>
                  </Button>
                  {character.currency === 'SPACE' && spaceCoins < character.basePrice && (
                    <p className="text-red-400 text-xs text-center">
                      Need more SPACE
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Mining Buttons */}
                  {charMiningStatus && charMiningStatus.isActive ? (
                    charMiningStatus.canCollect ? (
                      <Button
                        onClick={() => handleCollectCoins(character.id)}
                        className="w-full bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-800 hover:to-emerald-900 text-white text-xs h-7"
                      >
                        <Gift className="w-2 h-2 mr-1" />
                        Collect ({charMiningStatus.coinsReady})
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-900 cursor-not-allowed text-white text-xs h-7"
                      >
                        <Clock className="w-2 h-2 mr-1" />
                        Mining... {formatTime(charMiningStatus.timeRemaining)}
                      </Button>
                    )
                  ) : (
                    <Button
                      onClick={() => handleStartMining(character.id)}
                      className="w-full bg-gradient-to-r from-blue-700 to-cyan-800 hover:from-blue-800 hover:to-cyan-900 text-white text-xs h-7"
                    >
                      <Play className="w-2 h-2 mr-1" />
                      Mine ({totalMiningRate}/h)
                    </Button>
                  )}
                  
                  {canUpgrade && (
                    <Button
                      onClick={() => handleUpgrade(character.id)}
                      disabled={isProcessing || (character.currency === 'SPACE' && spaceCoins < upgradeCost) || (character.currency === 'TON' && !tonConnectUI.wallet)}
                      className="w-full bg-gradient-to-r from-purple-700 to-pink-800 hover:from-purple-800 hover:to-pink-900 text-white text-xs h-7 px-1"
                    >
                      <ArrowUp className="w-2 h-2 mr-1" />
                      <span className="text-xs font-medium leading-none">
                        Upgrade ({formatPrice(upgradeCost)} {character.currency})
                      </span>
                    </Button>
                  )}
                  
                  {level >= character.maxLevel && (
                    <div className="text-center">
                      <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                        Max Level
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const ownedCharacters = availableCharacters.filter(char => 
    getUserCharacter(char.id)?.isOwned
  );

  // Filter available characters to exclude owned ones in "All" tab
  const unownedCharacters = availableCharacters.filter(char => 
    !getUserCharacter(char.id)?.isOwned
  );

  return (
    <div 
      className="min-h-screen p-2 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      <div className="max-w-lg mx-auto space-y-2 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Characters</h1>
          </div>
          <p className="text-gray-300 text-sm">Collect and upgrade characters to boost mining</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 h-8">
            <TabsTrigger value="all" className="text-white text-xs">
              Available ({unownedCharacters.length})
            </TabsTrigger>
            <TabsTrigger value="owned" className="text-white text-xs">
              Owned ({ownedCharacters.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {unownedCharacters.map((character) => renderCharacterCard(character))}
            </div>
          </TabsContent>
          
          <TabsContent value="owned" className="space-y-2">
            {ownedCharacters.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {ownedCharacters.map((character) => renderCharacterCard(character, true))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">No Characters Owned</h3>
                <p className="text-gray-400 mb-3 text-sm">Purchase your first character to get started!</p>
                <Button
                  onClick={() => {
                    const tabs = document.querySelector('[value="all"]') as HTMLElement;
                    if (tabs) tabs.click();
                  }}
                  className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white text-sm"
                >
                  Browse Characters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CharactersPage;
