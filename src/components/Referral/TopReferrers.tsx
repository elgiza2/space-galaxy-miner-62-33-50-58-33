
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, RefreshCw } from 'lucide-react';
import { optimizedReferralService } from '@/services/optimizedReferralService';

interface TopReferrer {
  referrer_username: string;
  total_referrals: number;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  referral_name?: string;
}

const TopReferrers = () => {
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTopReferrers();
    
    // Auto-refresh every 20 seconds
    const interval = setInterval(() => {
      loadTopReferrers(true);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const loadTopReferrers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('🔄 Loading optimized top referrers...');
      
      // Use the optimized service to get accurate referral counts - increased to 50
      const referrersData = await optimizedReferralService.getTopReferrersOptimized(50);
      
      console.log('✅ Optimized referrers loaded:', referrersData.length);
      
      setTopReferrers(referrersData);
    } catch (error) {
      console.error('❌ Error loading optimized top referrers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDisplayName = (referrer: TopReferrer) => {
    if (referrer.first_name) {
      return referrer.first_name + (referrer.last_name ? ` ${referrer.last_name}` : '');
    }
    return referrer.referral_name || referrer.referrer_username;
  };

  const getAvatarFallback = (referrer: TopReferrer) => {
    const name = getDisplayName(referrer);
    return name.charAt(0).toUpperCase();
  };

  const handleRefresh = () => {
    loadTopReferrers(true);
  };

  if (loading) {
    return (
      <div className="bg-blue-900/50 border border-blue-400/30 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-blue-300" />
          <h3 className="text-sm font-semibold text-white">Top Players</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-700 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-blue-700 rounded w-16"></div>
                <div className="h-1 bg-blue-700 rounded w-10"></div>
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
          <Trophy className="w-4 h-4 text-blue-300" />
          <h3 className="text-sm font-semibold text-white">Top Players</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 hover:bg-blue-800/50 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {topReferrers.slice(0, 50).map((referrer, index) => (
          <motion.div
            key={referrer.referrer_username}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className="flex items-center gap-2 p-2 bg-blue-800/50 rounded-lg border border-blue-600/30"
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-blue-400 text-blue-900' :
                index === 1 ? 'bg-blue-300 text-blue-900' :
                index === 2 ? 'bg-blue-500 text-white' :
                'bg-blue-600 text-white'
              }`}>
                {index + 1}
              </div>
            </div>

            {/* User Avatar */}
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-blue-600/50">
                {referrer.photo_url ? (
                  <img 
                    src={referrer.photo_url} 
                    alt={getDisplayName(referrer)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs ${referrer.photo_url ? 'hidden' : ''}`}>
                  {getAvatarFallback(referrer)}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-xs truncate">
                {getDisplayName(referrer)}
              </h4>
              <div className="flex items-center gap-1">
                <Users className="w-2 h-2 text-blue-300" />
                <span className="text-blue-300 text-xs">
                  {referrer.total_referrals}
                </span>
              </div>
            </div>

            {/* TON Reward Display */}
            <div className="flex items-center gap-1 text-right">
              <img 
                src="https://assets.pepecase.app/assets/ton1.png"
                alt="TON" 
                className="w-3 h-3 rounded-full" 
              />
              <span className="text-blue-300 font-semibold text-xs">
                +{(referrer.total_referrals * 0.005).toFixed(3)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {topReferrers.length === 0 && (
        <div className="text-center py-3">
          <Trophy className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-blue-300 text-xs">No referrals yet</p>
        </div>
      )}
    </motion.div>
  );
};

export default TopReferrers;
