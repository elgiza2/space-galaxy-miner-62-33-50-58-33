import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Users, ChevronDown, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useUnifiedReferralCapture } from '@/hooks/useUnifiedReferralCapture';
import { unifiedReferralService } from '@/services/unifiedReferralService';
import TopReferrers from './Referral/TopReferrers';
import InvitedFriends from './Referral/InvitedFriends';

const ReferralPage = () => {
  const { toast } = useToast();
  const { telegramUser, getUserDisplayName, userProfile } = useTelegramUser();
  const { isProcessingReferral } = useUnifiedReferralCapture();
  
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    totalTonEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  // Load real referral statistics
  useEffect(() => {
    const loadReferralStats = async () => {
      if (!telegramUser?.username && !telegramUser?.first_name) return;
      
      setLoading(true);
      try {
        const username = telegramUser.username || telegramUser.first_name || 'user';
        const stats = await unifiedReferralService.getReferralStats(username);
        setReferralStats(stats);
      } catch (error) {
        console.error('Error loading referral stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReferralStats();
  }, [telegramUser]);


  // Generate referral link
  const generateReferralLink = () => {
    const username = telegramUser?.username || telegramUser?.first_name || 'user';
    return `https://t.me/Spacelbot?startapp=${username}`;
  };

  const shareReferralLink = async () => {
    const referralLink = generateReferralLink();
    const shareText = `🚀 Join SPACE and get free coins!\n\n` +
                     `🎁 Welcome bonus: 10,000 SPACE tokens\n` +
                     `💰 For each friend: 10,000 SPACE + TON tokens\n\n` +
                     `${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SPACE',
          text: shareText,
        });
        toast({
          title: "Shared! 🎉",
          description: "Thanks for inviting your friends!",
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied! 📋",
        description: "Referral text copied. Share it with your friends!",
      });
    }
  };

  const copyReferralLink = () => {
    const referralLink = generateReferralLink();
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied! 📋",
      description: "Referral link copied successfully",
    });
  };

  const openTelegramShare = () => {
    const username = telegramUser?.username || telegramUser?.first_name || 'user';
    const shareText = `🚀 Join SPACE and earn free tokens!\n\n` +
                     `🎁 Welcome bonus: 10,000 SPACE tokens\n` +
                     `💰 For each friend: 10,000 SPACE + TON tokens\n\n` +
                     `https://t.me/Spacelbot?startapp=${username}`;
    
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/Spacelbot?startapp=${username}`)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    
    toast({
      title: "Telegram opened! 💬",
      description: "Share the link with your friends now",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-purple-900/30" />
      
      {/* Decorative stars */}
      <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 left-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>

      {/* Header */}
      <div className="relative z-10 overflow-hidden">
        <div className="relative z-10 p-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-gray-300 text-sm">Invite your friends and earn amazing rewards!</p>
          </motion.div>
        </div>
      </div>


          {/* Referral Stats Card */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4"
        >
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white mb-1">Your Stats</h3>
            <p className="text-gray-300 text-xs">Earn 1000-5000 space coins per friend based on their progress</p>
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="h-8 bg-purple-700/50 rounded mb-2"></div>
                  <div className="h-4 bg-purple-700/50 rounded"></div>
                </div>
                <div className="text-center">
                  <div className="h-8 bg-purple-700/50 rounded mb-2"></div>
                  <div className="h-4 bg-purple-700/50 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
                <div className="text-gray-300 text-sm">Friends</div>
              </div>
              <div className="text-center">
                 <div className="text-2xl font-bold text-yellow-400">
                   {referralStats.totalTonEarnings > 0 
                     ? `${referralStats.totalTonEarnings.toFixed(3)} TON` 
                     : `${referralStats.totalEarnings} space coins`
                   }
                 </div>
                <div className="text-gray-300 text-sm">Earnings</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Invited Friends Section - NEW */}
      <div className="px-4 mb-4">
        <InvitedFriends username={telegramUser?.username || telegramUser?.first_name || 'user'} />
      </div>

      {/* Share Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pt-4">
        <div className="flex gap-3 mb-3">
          {/* Main Share Link Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openTelegramShare}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-base transition-all shadow-lg"
          >
            Invite Friends
          </motion.button>

          {/* Copy Link Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyReferralLink}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-4 rounded-xl transition-all hover:bg-white/20"
          >
            <Copy className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
