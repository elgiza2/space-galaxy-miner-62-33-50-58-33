
import React from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useMiningState } from '@/hooks/useMiningState';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Play } from 'lucide-react';
import { characterMiningService } from '@/services/characterMiningService';

interface MiningPageProps {
  onNavigate?: (page: string) => void;
}

const MiningPage: React.FC<MiningPageProps> = ({ onNavigate }) => {
  const { balances, addCoins } = useCurrency();
  const { spaceCoins } = useSpaceCoins();
  const { telegramUser } = useTelegramUser();
  const {
    isMining,
    timeLeft,
    totalMined,
    miningStartTime,
    setIsMining,
    setTimeLeft,
    setTotalMined,
    setMiningStartTime
  } = useMiningState();

  const formatCoins = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getUserPhoto = () => {
    if (telegramUser?.photo_url) {
      return telegramUser.photo_url;
    }
    return null;
  };

  const getUserDisplayName = () => {
    if (telegramUser?.first_name) {
      return telegramUser.first_name;
    }
    if (telegramUser?.username) {
      return telegramUser.username;
    }
    return localStorage.getItem('username') || 'Guest';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleStartMining = () => {
    if (!isMining) {
      characterMiningService.startMining('main', 100);
      setIsMining(true);
      setMiningStartTime(Date.now());
    }
  };

  const handleCollectCoins = () => {
    if (isMining && totalMined > 0) {
      const collectedCoins = characterMiningService.collectCoins('main');
      addCoins(collectedCoins);
      setIsMining(false);
      setTimeLeft(0);
      setTotalMined(0);
      setMiningStartTime(null);
    }
  };

  const userPhoto = getUserPhoto();
  const displayName = getUserDisplayName();

  // Calculate total balance: currency coins + space coins
  const totalBalance = balances.coins + spaceCoins;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white relative overflow-hidden flex flex-col px-4 pt-8 pb-20">
      {/* Floating orbs - smaller */}
      <div className="absolute top-16 left-8 w-2 h-2 bg-blue-400 rounded-full opacity-70"></div>
      <div className="absolute top-24 right-12 w-2 h-2 bg-purple-400 rounded-full opacity-50"></div>
      <div className="absolute top-32 right-6 w-3 h-3 bg-blue-300 rounded-full opacity-60"></div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        
        {/* User Avatar - smaller */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-1">
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={userPhoto || "/lovable-uploads/aa7cb228-cdba-4b19-95f0-746025a47667.png"} 
                alt="User Avatar" 
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl">
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
          </div>
        </motion.div>

        {/* User Name - smaller */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="text-lg font-bold text-white"
        >
          {displayName}
        </motion.h1>

        {/* Coin Balance - Display total balance from both systems */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2"
        >
          <img src="/lovable-uploads/7f326d5b-5d27-4dde-ab97-5bec498ced75.png" alt="Space Coin" className="w-6 h-6" />
          <span className="text-3xl font-bold text-white">
            {formatCoins(totalBalance)}
          </span>
        </motion.div>

        {/* Mining Section - positioned lower at the bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs p-4 space-y-3 mt-auto mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Mining</span>
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {isMining && totalMined > 0 ? formatCoins(totalMined) : '0.00'}
              </div>
              <div className="text-xs text-white/60">
                {isMining ? formatTime(timeLeft) : '00h 00m 00s'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {isMining && timeLeft > 0 && (
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${((28800 - timeLeft) / 28800) * 100}%` }}
              />
            </div>
          )}

          {/* Start Mining Button */}
          {(!isMining || timeLeft <= 0) && (
            <Button
              onClick={handleStartMining}
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all duration-300"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Mining
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MiningPage;
