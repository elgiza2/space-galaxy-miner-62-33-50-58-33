
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, Calendar } from 'lucide-react';
import { unifiedReferralService } from '@/services/unifiedReferralService';

interface InvitedFriend {
  referred_username: string;
  created_at: string;
  referrer_reward: number;
  verified: boolean;
}

interface InvitedFriendsProps {
  username: string;
}

const InvitedFriends = ({ username }: InvitedFriendsProps) => {
  const [invitedFriends, setInvitedFriends] = useState<InvitedFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (username) {
      loadInvitedFriends();
    }
  }, [username]);

  const loadInvitedFriends = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('🔄 Loading invited friends for:', username);
      
      const stats = await unifiedReferralService.getReferralStats(username);
      setInvitedFriends(stats.referrals);
      
      console.log('✅ Invited friends loaded:', stats.referrals.length);
      
    } catch (error) {
      console.error('❌ Error loading invited friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadInvitedFriends(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-blue-900/50 border border-blue-400/30 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-300" />
          <h3 className="text-sm font-semibold text-white">Invited Friends</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-700 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-blue-700 rounded w-20"></div>
                <div className="h-1 bg-blue-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-900/50 border border-blue-400/30 rounded-xl p-3 mb-3"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-300" />
          <h3 className="text-sm font-semibold text-white">Invited Friends ({invitedFriends.length})</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 hover:bg-blue-800/50 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {invitedFriends.map((friend, index) => (
          <motion.div
            key={`${friend.referred_username}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 p-2 bg-blue-800/50 rounded-lg border border-blue-600/30"
          >
            {/* Friend Avatar */}
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {friend.referred_username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Friend Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-xs truncate">
                {friend.referred_username}
              </h4>
              <div className="flex items-center gap-1">
                <Calendar className="w-2 h-2 text-blue-300" />
                <span className="text-blue-300 text-xs">
                  {formatDate(friend.created_at)}
                </span>
              </div>
            </div>

            {/* Reward Display */}
            <div className="flex items-center gap-1 text-right">
              <span className="text-green-400 font-semibold text-xs">
                +{friend.referrer_reward}
              </span>
              {friend.verified && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {invitedFriends.length === 0 && (
        <div className="text-center py-4">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-blue-300 text-xs">No friends invited yet</p>
          <p className="text-blue-400 text-xs mt-1">Start sharing your referral link!</p>
        </div>
      )}
    </motion.div>
  );
};

export default InvitedFriends;
