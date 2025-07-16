
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import UserLeaderboardCard from './UserLeaderboardCard';
import type { Database } from '@/integrations/supabase/types';
import type { ClanMember } from '@/services/clanService';

type RealUserLeaderboard = Database['public']['Views']['real_user_leaderboard']['Row'];
type RealClanLeaderboard = Database['public']['Views']['real_clan_leaderboard']['Row'];

interface LeaderboardTabsProps {
  topUsers: RealUserLeaderboard[];
  topClans: RealClanLeaderboard[];
  isLoadingUsers: boolean;
  isLoadingClans: boolean;
  userClanMembership: ClanMember | null;
  isJoining: string | null;
  onJoinClan: (clan: RealClanLeaderboard, e: React.MouseEvent) => Promise<void>;
  onNavigate?: (page: string, clanId?: string) => void;
}

const LeaderboardTabs = ({
  topUsers,
  isLoadingUsers
}: LeaderboardTabsProps) => {
  
  if (isLoadingUsers) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="h-16 rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (topUsers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Data Available</h3>
        <p className="text-gray-500 text-sm">
          Leaderboard will appear here soon
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {topUsers.map((user, index) => (
        <UserLeaderboardCard key={user.id} user={user} index={index} />
      ))}
      
      {topUsers.length >= 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>And more than {topUsers.length} players</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LeaderboardTabs;
