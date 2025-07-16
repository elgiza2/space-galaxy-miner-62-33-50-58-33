import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Send, Download, ArrowUpDown, Eye, EyeOff, TrendingUp, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { formatCoins } from '@/utils/levelSystem';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import TransactionHistoryModal from './TransactionHistoryModal';

const WalletPage = () => {
  const { toast } = useToast();
  const { spaceCoins } = useSpaceCoins();
  const { telegramUser } = useTelegramUser();
  const [showBalance, setShowBalance] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Mock TON balance - in a real app, this would come from TON wallet integration
  const tonBalance = 0.125;
  const tonValueUSD = tonBalance * 2.45; // Assuming 1 TON = $2.45

  // Mock wallet address
  const walletAddress = "UQA7L8P8LBywQgGxGXbG8nHzPqXrP8zLmPGH8zLnHzB8zLnH";
  
  // Mock transactions
  const mockTransactions = [
    {
      hash: "transaction_1",
      timestamp: Date.now(),
      value: "0.1",
      fee: "0.001",
      from: "UQA7L8P8LBywQgGxGXbG8nHzPqXrP8zLmPGH8zLnHzB8zLnH",
      to: "UQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL",
      type: "out" as const,
      success: true,
      comment: "Test transaction"
    }
  ];

  const totalValueUSD = useMemo(() => {
    const spaceValueUSD = (spaceCoins * 0.001); // Assuming 1 SPACE = $0.001
    return spaceValueUSD + tonValueUSD;
  }, [spaceCoins, tonValueUSD]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'send':
        setShowSendModal(true);
        break;
      case 'receive':
        setShowReceiveModal(true);
        break;
      case 'history':
        setShowHistoryModal(true);
        break;
      default:
        toast({
          title: "Coming Soon! 🚧",
          description: "This feature is under development",
        });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-500/20" />
        <div className="relative z-10 p-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
            <p className="text-gray-300">Manage your digital assets</p>
          </motion.div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="px-4 -mt-4 relative z-20">
        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-300">Total Balance</h3>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-2">
              {showBalance ? `$${totalValueUSD.toFixed(2)}` : '****'}
            </p>
            <div className="flex items-center justify-center gap-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+2.5% this week</span>
            </div>
          </div>
        </motion.div>

        {/* Individual Coin Balances */}
        <div className="space-y-4 mb-6">
          {/* SPACE Coin */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/3f4a21df-fb59-4bff-b115-78221911b92c.png" 
                  alt="SPACE Coin" 
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <h4 className="font-semibold text-white">SPACE</h4>
                  <p className="text-sm text-gray-400">Space Memecoin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  {showBalance ? formatCoins(spaceCoins) : '****'}
                </p>
                <p className="text-sm text-gray-400">
                  ${showBalance ? (spaceCoins * 0.001).toFixed(2) : '****'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* TON */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png"
                  alt="TON" 
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <h4 className="font-semibold text-white">TON</h4>
                  <p className="text-sm text-gray-400">Toncoin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  {showBalance ? tonBalance.toFixed(3) : '****'}
                </p>
                <p className="text-sm text-gray-400">
                  ${showBalance ? tonValueUSD.toFixed(2) : '****'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleQuickAction('send')}
              className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-sm font-medium">Send</span>
            </button>

            <button
              onClick={() => handleQuickAction('receive')}
              className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm font-medium">Receive</span>
            </button>

            <button
              onClick={() => handleQuickAction('history')}
              className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <ArrowUpDown className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm font-medium">Transactions</span>
            </button>
          </div>
        </motion.div>

        {/* Earning Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Earning Opportunities</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Earn more coins through tasks and referrals!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-gray-400">Refer Friends</p>
              <p className="text-lg font-bold text-purple-400">+1000 SPACE</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-gray-400">Daily Tasks</p>
              <p className="text-lg font-bold text-blue-400">+500 SPACE</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <SendModal 
        isOpen={showSendModal} 
        onClose={() => setShowSendModal(false)}
        balance={tonBalance}
        currency="TON"
      />
      <ReceiveModal 
        isOpen={showReceiveModal} 
        onClose={() => setShowReceiveModal(false)}
        address={walletAddress}
      />
      <TransactionHistoryModal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)}
        transactions={mockTransactions}
        address={walletAddress}
      />
    </div>
  );
};

export default WalletPage;
