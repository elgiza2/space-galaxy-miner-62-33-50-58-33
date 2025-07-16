
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Btn15 from '@/components/ui/btn15';
import { Crown, Trophy, Users, Eye, UserPlus, RefreshCw } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import type { ClanMember } from '@/services/clanService';

type RealClanLeaderboard = Database['public']['Views']['real_clan_leaderboard']['Row'];

interface ClanLeaderboardCardProps {
  clan: RealClanLeaderboard;
  index: number;
  userClanMembership: ClanMember | null;
  isJoining: string | null;
  onJoinClan: (clan: RealClanLeaderboard, e: React.MouseEvent) => Promise<void>;
  onNavigate?: (page: string, clanId?: string) => void;
}

const ClanLeaderboardCard = ({ 
  clan, 
  index, 
  userClanMembership, 
  isJoining, 
  onJoinClan,
  onNavigate
}: ClanLeaderboardCardProps) => {
  const getRankIcon = (rank: number | null) => {
    if (!rank) return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">-</span>;
    
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-300" />;
      case 3: return <Trophy className="w-5 h-5 text-orange-400" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number | null) => {
    if (!rank) return 'from-gray-600/20 to-gray-700/20 border-gray-600/30';
    
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'from-orange-400/20 to-red-500/20 border-orange-400/30';
      default: return 'from-gray-600/20 to-gray-700/20 border-gray-600/30';
    }
  };

  const formatCoins = (coins: number | null) => {
    if (!coins) return '0';
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    } else if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}K`;
    }
    return coins.toLocaleString();
  };

  const isUserInClan = (clanId: string | null) => {
    return userClanMembership?.clan_id === clanId;
  };

  const handleClanCardClick = () => {
    console.log('Clan card clicked for clan:', clan.id);
    if (onNavigate && clan.id) {
      onNavigate('clan-detail', clan.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card 
        className={`bg-gradient-to-r ${getRankColor(clan.rank)} backdrop-blur-sm border rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform`}
        onClick={handleClanCardClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {getRankIcon(clan.rank)}
            </div>
            
            <Avatar className="w-10 h-10 border-2 border-white/20">
              <AvatarImage src={clan.image || undefined} alt={clan.name} />
              <AvatarFallback className="bg-purple-500/20 text-white text-lg">
                {clan.name?.charAt(0).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm truncate">
                {clan.name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {clan.member_count || 0}
                </span>
                <span>Leader: {clan.leader_name || 'Unknown'}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1">
                <img 
                  src="/lovable-uploads/304f8800-11e4-4204-a4b7-cf255c07987d.png" 
                  alt="Space Coin"
                  className="w-3 h-3 rounded-full"
                />
                <span className="text-yellow-400 font-bold text-sm">
                  {formatCoins(clan.total_coins)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-center">
            {!userClanMembership ? (
              <Btn15
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinClan(clan, e);
                }}
                disabled={isJoining === clan.id}
                label={isJoining === clan.id ? 'Joining...' : 'Join Clan FREE'}
                icon={isJoining === clan.id ? RefreshCw : UserPlus}
                variant="success"
                size="sm"
                className="w-full"
              />
            ) : isUserInClan(clan.id) ? (
              <Btn15
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigate && clan.id) {
                    onNavigate('clan', clan.id);
                  }
                }}
                label="View Your Clan ✓"
                icon={Eye}
                variant="default"
                size="sm"
                className="w-full"
              />
            ) : (
              <Btn15
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinClan(clan, e);
                }}
                disabled={isJoining === clan.id}
                label={isJoining === clan.id ? 'Switching...' : 'Switch Clan FREE'}
                icon={isJoining === clan.id ? RefreshCw : RefreshCw}
                variant="info"
                size="sm"
                className="w-full"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClanLeaderboardCard;
