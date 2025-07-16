
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCoins } from '@/utils/levelSystem';

interface UserProfileCardProps {
  telegramUser: any;
  spaceCoins: number;
  userLevel: any;
  currentUserRank: number;
}

const UserProfileCard = ({ 
  telegramUser, 
  spaceCoins, 
  userLevel, 
  currentUserRank 
}: UserProfileCardProps) => {
  const getCurrentUserDisplayName = () => {
    if (telegramUser?.first_name) return telegramUser.first_name;
    if (telegramUser?.username) return telegramUser.username;
    return 'Player';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10 mx-4"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={telegramUser?.photo_url || undefined} />
          <AvatarFallback className="bg-white/10 text-white font-bold text-sm">
            {getCurrentUserDisplayName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            {getCurrentUserDisplayName()}
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 font-medium text-sm">{userLevel.name}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <span className="text-white font-bold text-sm">
                {formatCoins(spaceCoins)}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">
                #{currentUserRank || '---'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;
