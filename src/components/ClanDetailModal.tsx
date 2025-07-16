
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Crown, Coins, ExternalLink, Calendar } from 'lucide-react';

interface ClanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clan: {
    id: string;
    name: string;
    members?: number; // Made optional to match Clan type
    totalCoins?: number; // Made optional to match Clan type
    icon?: string; // Made optional to match Clan type
    rank?: number; // Made optional to match Clan type
    leader?: string; // Made optional to match Clan type
    description?: string;
    telegramLink?: string;
    createdAt?: string;
    image?: string;
  } | null;
}

const ClanDetailModal = ({ isOpen, onClose, clan }: ClanDetailModalProps) => {
  if (!clan) return null;

  const handleJoinTelegram = () => {
    if (clan.telegramLink) {
      window.open(clan.telegramLink, '_blank');
    }
  };

  const formatCoins = (coins: number) => {
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    } else if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}K`;
    }
    return coins.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-purple-500/20 text-white max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Clan Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Clan Image/Icon */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {clan.image ? (
                <Avatar className="w-20 h-20 border-2 border-purple-500/50">
                  <AvatarImage src={clan.image} alt={clan.name} />
                  <AvatarFallback className="bg-purple-500/20 text-white text-2xl">
                    {clan.icon || clan.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center text-3xl border-2 border-purple-500/50">
                  {clan.icon || clan.name.charAt(0)}
                </div>
              )}
              <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black font-bold">
                #{clan.rank || 0}
              </Badge>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">{clan.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Leader: {clan.leader || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Members</div>
              <div className="text-lg font-bold text-white">{clan.members || 0}</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Total Coins</div>
              <div className="text-lg font-bold text-white">{formatCoins(clan.totalCoins || 0)}</div>
            </div>
          </div>

          {/* Description */}
          {clan.description && (
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
              <p className="text-sm text-gray-400">{clan.description}</p>
            </div>
          )}

          {/* Created Date */}
          {clan.createdAt && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(clan.createdAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Telegram Link Button */}
          {clan.telegramLink && (
            <Button
              onClick={handleJoinTelegram}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Telegram Channel
            </Button>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClanDetailModal;
