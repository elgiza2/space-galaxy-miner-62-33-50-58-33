
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const LeaderboardHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-6 px-4"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
      </div>
    </motion.div>
  );
};

export default LeaderboardHeader;
