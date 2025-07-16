
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users, Trophy, Star, Zap, Crown, ExternalLink, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { clanService, type Clan, type ClanMember } from '@/services/clanService';
import { useClanLevels } from '@/hooks/useClanLevels';
import { useClanMembership } from '@/hooks/useClanMembership';
import ClanLevelCard from './Clan/ClanLevelCard';
import ClanMissionsCard from './Clan/ClanMissionsCard';

interface ClanDetailPageProps {
  clanId: string;
  onNavigate: (page: string) => void;
}

const ClanDetailPage = ({ clanId, onNavigate }: ClanDetailPageProps) => {
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { getLevelByNumber, getNextLevel } = useClanLevels();
  const { userClanMembership, isJoining, handleJoinClan } = useClanMembership();

  useEffect(() => {
    loadClanDetails();
  }, [clanId]);

  const loadClanDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Loading clan details for ID:', clanId);
      
      // Get clan details using the new method
      const clanData = await clanService.getClanById(clanId);
      
      if (clanData) {
        console.log('Clan data loaded:', clanData);
        setClan(clanData);
        
        // Load clan members
        const clanMembers = await clanService.getClanMembers(clanId);
        console.log('Clan members loaded:', clanMembers);
        setMembers(clanMembers);
      } else {
        console.log('No clan found with ID:', clanId);
        toast({
          title: "Clan Not Found",
          description: "The requested clan could not be found.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading clan details:', error);
      toast({
        title: "Error",
        description: "Failed to load clan information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTelegramClick = () => {
    if (clan?.telegramLink || clan?.telegram_link) {
      const telegramUrl = clan.telegramLink || clan.telegram_link;
      window.open(telegramUrl, '_blank');
    } else {
      toast({
        title: "No Telegram Link",
        description: "This clan doesn't have a Telegram channel",
        variant: "destructive"
      });
    }
  };

  const handleJoinClick = async (e: React.MouseEvent) => {
    if (!clan) return;
    
    await handleJoinClan(clan as any, () => {
      loadClanDetails();
      toast({
        title: "Success",
        description: `You have successfully joined ${clan.name}!`,
        duration: 3000,
      });
    });
  };

  const formatCoins = (coins: number) => {
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    } else if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}K`;
    }
    return coins.toLocaleString();
  };

  const getRoleIcon = (role: string) => {
    return role === 'leader' ? <Crown className="w-4 h-4 text-yellow-400" /> : null;
  };

  const isUserInClan = () => {
    return userClanMembership?.clan_id === clanId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-400">Loading clan information...</div>
        </div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-400">Clan not found</div>
          <Button onClick={() => onNavigate('leaderboard')} className="mt-4">
            Back to Leaderboard
          </Button>
        </div>
      </div>
    );
  }

  const currentLevel = getLevelByNumber(clan.level || 1);
  const nextLevel = getNextLevel(clan.level || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button
            onClick={() => onNavigate('leaderboard')}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>
          
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Rank #{clan.rank || '-'}
          </Badge>
        </div>

        {/* Clan Info */}
        <div className="px-4 py-6">
          <div className="max-w-md mx-auto space-y-4">
            <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-white/20">
                    {clan.image ? (
                      <AvatarImage src={clan.image} alt={clan.name} />
                    ) : null}
                    <AvatarFallback className="bg-purple-500/20 text-white text-2xl">
                      {clan.icon || clan.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-xl font-bold text-white">{clan.name}</h1>
                      {(clan.telegramLink || clan.telegram_link) && (
                        <Button
                          onClick={handleTelegramClick}
                          size="sm"
                          variant="ghost"
                          className="p-1"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-400" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {clan.members || 0} members
                      </span>
                      <span>Leader: {clan.leader || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <img 
                        src="/lovable-uploads/304f8800-11e4-4204-a4b7-cf255c07987d.png" 
                        alt="Space Coin"
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-yellow-400 font-bold">
                        {formatCoins(clan.totalCoins || 0)}
                      </span>
                    </div>

                    {clan.levelName && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mt-2">
                        <Star className="w-3 h-3 mr-1" />
                        {clan.levelName}
                      </Badge>
                    )}
                  </div>
                </div>

                {clan.description && (
                  <p className="text-gray-300 text-sm mt-4">{clan.description}</p>
                )}

                {/* Join/Status Button */}
                <div className="mt-4">
                  {!userClanMembership ? (
                    <Button
                      onClick={handleJoinClick}
                      disabled={isJoining === clan.id}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isJoining === clan.id ? 'Joining...' : 'Join Clan FREE'}
                    </Button>
                  ) : isUserInClan() ? (
                    <div className="w-full p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-semibold">You are a member of this clan</span>
                      </div>
                      <p className="text-xs text-green-300 mt-1">
                        You're earning +20% more coins from mining!
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleJoinClick}
                      disabled={isJoining === clan.id}
                      variant="outline"
                      className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isJoining === clan.id ? 'Switching...' : 'Switch to This Clan FREE'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clan Level Card */}
            {currentLevel && (
              <ClanLevelCard
                currentLevel={currentLevel}
                nextLevel={nextLevel}
                clan={{
                  member_count: clan.members || 0,
                  total_coins: clan.totalCoins || 0,
                  missions_completed: clan.missions_completed || 0,
                  level: clan.level || 1
                }}
              />
            )}

            {/* Clan Missions */}
            <ClanMissionsCard clanId={clan.id} />

            {/* Members List */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    No members found
                  </div>
                ) : (
                  members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getRoleIcon(member.role || 'member')}
                        <div>
                          <div className="text-white font-medium">
                            {member.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {member.role || 'member'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <img 
                            src="/lovable-uploads/304f8800-11e4-4204-a4b7-cf255c07987d.png" 
                            alt="Space Coin"
                            className="w-3 h-3 rounded-full"
                          />
                          <span className="text-yellow-400 text-sm font-bold">
                            {formatCoins(member.coins_contributed || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">contributed</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClanDetailPage;
