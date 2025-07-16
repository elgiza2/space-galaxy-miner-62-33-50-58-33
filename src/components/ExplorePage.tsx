import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Plus,
  Shield,
  ExternalLink,
  LogOut,
  RefreshCw,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { clanService, type Clan, type ClanMember } from '@/services/clanService';
import { useClanLevels } from '@/hooks/useClanLevels';
import ClanDetailModal from './ClanDetailModal';
import CreateClanModal from './CreateClanModal';
import ClanLevelCard from './Clan/ClanLevelCard';
import ClanMissionsCard from './Clan/ClanMissionsCard';

interface ExplorePageProps {
  onNavigate: (page: string) => void;
}

const ExplorePage = ({ onNavigate }: ExplorePageProps) => {
  const [showCreateClan, setShowCreateClan] = useState(false);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [showClanDetail, setShowClanDetail] = useState(false);
  const [clans, setClans] = useState<Clan[]>([]);
  const [userClanMembership, setUserClanMembership] = useState<ClanMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { telegramUser, userProfile } = useTelegramUser();
  const { getLevelByNumber, getNextLevel } = useClanLevels();

  useEffect(() => {
    console.log('Loading clans and user membership on component mount');
    loadClans();
    if (userProfile?.id) {
      loadUserClanMembership();
    }
  }, [userProfile?.id]);

  const loadClans = async () => {
    if (!isRefreshing) setIsLoading(true);
    try {
      console.log('Loading clans from database...');
      const clansData = await clanService.getAllClans();
      console.log('Loaded clans data from database:', clansData);
      setClans(clansData);
    } catch (error) {
      console.error('Error loading clans:', error);
      toast({
        title: "Error Loading Clans",
        description: "An error occurred while loading the clans list from database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadUserClanMembership = async () => {
    if (!userProfile?.id) {
      console.log('No user profile ID available for clan membership check');
      return;
    }
    
    try {
      console.log('Loading user clan membership from database for user:', userProfile.id);
      const membership = await clanService.getUserClanMembership(userProfile.id);
      console.log('User clan membership from database:', membership);
      setUserClanMembership(membership);
    } catch (error) {
      console.error('Error loading user clan membership:', error);
    }
  };

  const handleRefresh = async () => {
    console.log('Refreshing clans and user membership data');
    setIsRefreshing(true);
    await Promise.all([loadClans(), loadUserClanMembership()]);
  };

  const getRankIcon = (rank: number) => {
    return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'from-orange-400/20 to-red-500/20 border-orange-400/30';
      default: return 'from-gray-600/20 to-gray-700/20 border-gray-600/30';
    }
  };

  const handleClanNameClick = (clan: Clan, e: React.MouseEvent) => {
    e.stopPropagation();
    if (clan.telegramLink || clan.telegram_link) {
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

  const handleClanClick = (clan: Clan) => {
    const normalizedClan: Clan = {
      ...clan,
      members: clan.members || clan.member_count || 0,
      totalCoins: clan.totalCoins || clan.total_coins || 0,
      leader: clan.leader || 'Unknown',
      icon: clan.icon || clan.name.charAt(0),
      rank: clan.rank || 0
    };
    setSelectedClan(normalizedClan);
    setShowClanDetail(true);
  };

  const formatCoins = (coins: number) => {
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    } else if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}K`;
    }
    return coins.toLocaleString();
  };

  const handleJoinClan = async (clan: Clan, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userProfile?.id) {
      toast({
        title: "Profile Required",
        description: "Please ensure your profile is loaded",
        variant: "destructive"
      });
      return;
    }

    // If user is already in this clan, navigate to clan page
    if (isUserInClan(clan.id)) {
      onNavigate('clan');
      return;
    }

    setIsJoining(clan.id);

    try {
      console.log('Attempting to join clan:', clan.name, 'ID:', clan.id);
      let success = false;

      // If user is in another clan, switch clans
      if (userClanMembership) {
        console.log('User is in another clan, switching...');
        success = await clanService.switchClan(
          userClanMembership.clan_id,
          clan.id,
          userProfile.id,
          userProfile.username || telegramUser?.username || 'Unknown'
        );
        
        if (success) {
          toast({
            title: "Switched Clans Successfully!",
            description: `You have left your previous clan and joined "${clan.name}". You still get a 20% mining bonus!`,
            duration: 5000,
          });
        }
      } else {
        // Join the clan directly
        console.log('User not in any clan, joining directly...');
        success = await clanService.joinClan(
          clan.id,
          userProfile.id,
          userProfile.username || telegramUser?.username || 'Unknown'
        );

        if (success) {
          toast({
            title: "Joined Clan Successfully!",
            description: `Welcome to "${clan.name}". You now get a 20% mining bonus!`,
            duration: 5000,
          });
        }
      }

      if (success) {
        console.log('Clan join/switch successful, navigating to clan page...');
        // Navigate to clan page instead of refreshing data
        onNavigate('clan');
      } else {
        toast({
          title: "Join Failed",
          description: "Failed to join clan. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error joining clan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while trying to join the clan",
        variant: "destructive"
      });
    } finally {
      setIsJoining(null);
    }
  };

  const handleLeaveClan = async () => {
    if (!userClanMembership || !userProfile?.id) return;

    try {
      const confirmed = window.confirm('Are you sure you want to leave your current clan? You will lose your 20% mining bonus.');
      if (!confirmed) return;

      console.log('User leaving clan:', userClanMembership.clan_id);
      const success = await clanService.leaveClan(userClanMembership.clan_id, userProfile.id);

      if (success) {
        toast({
          title: "Left Clan Successfully",
          description: "You have successfully left your clan. You can now join another clan.",
          duration: 5000,
        });
        
        console.log('Clan leave successful, refreshing data...');
        // Refresh data to show updates
        await Promise.all([loadClans(), loadUserClanMembership()]);
      } else {
        toast({
          title: "Leave Failed",
          description: "Failed to leave clan. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error leaving clan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while trying to leave the clan",
        variant: "destructive"
      });
    }
  };

  const isUserInClan = (clanId: string) => {
    return userClanMembership?.clan_id === clanId;
  };

  const getUserClanData = () => {
    if (!userClanMembership) return null;
    const clanData = (userClanMembership as any)?.clans;
    return clanData ? {
      member_count: clanData.member_count || 0,
      total_coins: clanData.total_coins || 0,
      missions_completed: clanData.missions_completed || 0,
      level: clanData.level || 1
    } : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Explore Clans
            </h1>
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="ghost"
              className="p-2"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-gray-400 text-sm">
            Discover and join powerful clans to get enhanced mining bonuses - FREE!
          </p>
        </div>

        {/* User's Current Clan with Level Info */}
        {userClanMembership && (
          <div className="px-4 mb-4">
            <div className="max-w-md mx-auto space-y-3">
              <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-400 font-semibold">Your Clan</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onNavigate('clan')}
                        size="sm"
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs"
                      >
                        View Clan
                      </Button>
                      <Button
                        onClick={handleLeaveClan}
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs"
                      >
                        <LogOut className="w-3 h-3 mr-1" />
                        Leave
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Member of: {(userClanMembership as any)?.clans?.name || 'Unknown Clan'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      ✨ Enhanced Mining Bonus Active
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clan Level Card */}
              {(() => {
                const clanData = getUserClanData();
                if (!clanData) return null;
                
                const currentLevel = getLevelByNumber(clanData.level);
                const nextLevel = getNextLevel(clanData.level);
                
                return currentLevel ? (
                  <ClanLevelCard
                    currentLevel={currentLevel}
                    nextLevel={nextLevel}
                    clan={clanData}
                  />
                ) : null;
              })()}

              {/* Clan Missions */}
              {userClanMembership && (
                <ClanMissionsCard clanId={userClanMembership.clan_id} />
              )}
            </div>
          </div>
        )}

        {/* Create Clan Button */}
        <div className="px-4 mb-4">
          <div className="max-w-md mx-auto">
            <Button
              onClick={() => setShowCreateClan(true)}
              className="w-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-600 hover:from-green-500 hover:via-emerald-500 hover:to-green-700 text-white font-medium py-2 text-sm rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Clan (FREE)
            </Button>
          </div>
        </div>

        {/* Clans Section */}
        <div className="flex-1 px-4 pb-4">
          <div className="max-w-md mx-auto space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading clans from database...</div>
              </div>
            ) : clans.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-400">No clans available yet</div>
                <p className="text-gray-500 text-sm mt-2">Be the first to create a clan!</p>
              </div>
            ) : (
              clans.map((clan, index) => (
                <motion.div
                  key={clan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    className={`bg-gradient-to-r ${getRankColor(clan.rank || 0)} backdrop-blur-sm border rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer`}
                    onClick={() => handleClanClick(clan)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getRankIcon(clan.rank || 0)}
                        </div>
                        
                        <Avatar className="w-10 h-10 border-2 border-white/20">
                          {clan.image ? (
                            <AvatarImage 
                              src={clan.image} 
                              alt={clan.name}
                              className="object-cover"
                              onError={(e) => {
                                console.log('Image failed to load for clan:', clan.name);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <AvatarFallback className="bg-purple-500/20 text-white text-lg">
                            {clan.icon || clan.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div 
                            className="flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={(e) => handleClanNameClick(clan, e)}
                          >
                            <h3 className="text-white font-medium text-sm truncate">
                              {clan.name}
                            </h3>
                            {(clan.telegramLink || clan.telegram_link) && (
                              <ExternalLink className="w-3 h-3 text-blue-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {clan.members || clan.member_count || 0}
                            </span>
                            <span>Leader: {clan.leader || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            {clan.levelName && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                <Star className="w-2 h-2 mr-1" />
                                {clan.levelName}
                              </Badge>
                            )}
                            {clan.energyBoost && clan.energyBoost > 0 && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                +{clan.energyBoost}% Boost
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-green-400 font-semibold mt-1">
                            Join FREE • Enhanced Mining Bonus
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <img 
                              src="/lovable-uploads/304f8800-11e4-4204-a4b7-cf255c07987d.png" 
                              alt="Space Coin"
                              className="w-3 h-3 rounded-full"
                            />
                            <span className="text-yellow-400 font-bold text-sm">
                              {formatCoins(clan.totalCoins || clan.total_coins || 0)}
                            </span>
                          </div>
                          
                          {!userClanMembership ? (
                            <Button
                              onClick={(e) => handleJoinClan(clan, e)}
                              size="sm"
                              disabled={isJoining === clan.id}
                              className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              {isJoining === clan.id ? 'Joining...' : 'Join FREE'}
                            </Button>
                          ) : isUserInClan(clan.id) ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('clan');
                              }}
                              size="sm"
                              className="text-xs bg-purple-600 hover:bg-purple-700"
                            >
                              View Clan
                            </Button>
                          ) : (
                            <Button
                              onClick={(e) => handleJoinClan(clan, e)}
                              size="sm"
                              variant="outline"
                              disabled={isJoining === clan.id}
                              className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                            >
                              {isJoining === clan.id ? 'Switching...' : 'Switch FREE'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2">
                        {!userClanMembership ? (
                          <Button
                            onClick={(e) => handleJoinClan(clan, e)}
                            size="sm"
                            disabled={isJoining === clan.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-xs py-1"
                          >
                            {isJoining === clan.id ? 'Joining...' : 'Join Clan FREE'}
                          </Button>
                        ) : isUserInClan(clan.id) ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('clan');
                            }}
                            size="sm"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs py-1"
                          >
                            View Your Clan
                          </Button>
                        ) : (
                          <Button
                            onClick={(e) => handleJoinClan(clan, e)}
                            size="sm"
                            variant="outline"
                            disabled={isJoining === clan.id}
                            className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50 text-xs py-1"
                          >
                            {isJoining === clan.id ? 'Switching...' : 'Switch Clan FREE'}
                          </Button>
                        )}
                        
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('spin-wheel');
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 text-xs py-1"
                        >
                          🎰
                        </Button>
                        
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('mines');
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 text-xs py-1"
                        >
                          💎
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateClanModal
        isOpen={showCreateClan}
        onClose={() => setShowCreateClan(false)}
        onClanCreated={() => {
          console.log('Clan created, navigating to clan page...');
          onNavigate('clan');
        }}
      />
      
      <ClanDetailModal
        isOpen={showClanDetail}
        onClose={() => setShowClanDetail(false)}
        clan={selectedClan}
      />
    </div>
  );
};

export default ExplorePage;
