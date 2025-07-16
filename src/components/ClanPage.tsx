
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users, Trophy, Star, Zap, Crown, ExternalLink, LogOut, Target, Award, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { clanService, type Clan, type ClanMember } from '@/services/clanService';
import { useClanLevels } from '@/hooks/useClanLevels';
import { Progress } from '@/components/ui/progress';

interface ClanPageProps {
  onNavigate: (page: string) => void;
}

const ClanPage = ({ onNavigate }: ClanPageProps) => {
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [userMembership, setUserMembership] = useState<ClanMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingMembership, setIsCheckingMembership] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useTelegramUser();
  const { getLevelByNumber, getNextLevel } = useClanLevels();

  useEffect(() => {
    if (userProfile?.id) {
      checkUserMembershipAndLoadClan();
    }
  }, [userProfile?.id]);

  const checkUserMembershipAndLoadClan = async () => {
    if (!userProfile?.id) return;

    try {
      setIsCheckingMembership(true);
      console.log('Checking user clan membership for profile:', userProfile.id);
      
      const membership = await clanService.getUserClanMembership(userProfile.id);
      console.log('User membership result:', membership);
      
      if (!membership) {
        console.log('User not in any clan, redirecting to explore');
        setIsCheckingMembership(false);
        setIsLoading(false);
        onNavigate('explore');
        return;
      }

      setUserMembership(membership);
      await loadUserClan(membership.clan_id);
      
    } catch (error) {
      console.error('Error checking user clan membership:', error);
      toast({
        title: "Error",
        description: "Failed to load clan information",
        variant: "destructive"
      });
      setIsCheckingMembership(false);
      setIsLoading(false);
    }
  };

  const loadUserClan = async (clanId: string) => {
    try {
      setIsLoading(true);
      console.log('Loading clan details for ID:', clanId);
      
      const userClan = await clanService.getClanById(clanId);
      console.log('User clan details:', userClan);
      
      if (userClan) {
        setClan(userClan);
        const clanMembers = await clanService.getClanMembers(userClan.id);
        console.log('Clan members:', clanMembers);
        setMembers(clanMembers);
      }
    } catch (error) {
      console.error('Error loading user clan:', error);
      toast({
        title: "Error",
        description: "Failed to load clan information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsCheckingMembership(false);
    }
  };

  const handleLeaveClan = async () => {
    if (!userMembership || !userProfile?.id) return;

    try {
      const confirmed = window.confirm('Are you sure you want to leave your clan? You will lose your 20% mining bonus.');
      if (!confirmed) return;

      console.log('User leaving clan:', userMembership.clan_id);
      const success = await clanService.leaveClan(userMembership.clan_id, userProfile.id);

      if (success) {
        toast({
          title: "Left Clan Successfully",
          description: "You have successfully left your clan.",
          duration: 3000,
        });
        
        onNavigate('explore');
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
        description: "An error occurred while trying to leave the clan",
        variant: "destructive"
      });
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

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  if (isCheckingMembership || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-xl text-purple-200 font-medium">
            {isCheckingMembership ? 'Checking clan membership...' : 'Loading clan information...'}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <Shield className="w-16 h-16 text-purple-400 mx-auto" />
          <div className="text-xl text-purple-200">Clan not found</div>
          <Button onClick={() => onNavigate('explore')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Explore Clans
          </Button>
        </div>
      </div>
    );
  }

  const currentLevel = getLevelByNumber(clan.level || 1);
  const nextLevel = getNextLevel(clan.level || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Modern Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80 border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Button
            onClick={() => onNavigate('explore')}
            variant="ghost"
            size="sm"
            className="text-purple-200 hover:text-white hover:bg-purple-700/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
          
          <Button
            onClick={handleLeaveClan}
            variant="outline"
            size="sm"
            className="border-red-400/50 text-red-400 hover:bg-red-500/20 bg-transparent transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Clan
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-xl border border-purple-400/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative">
              {/* Enhanced Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
              
              <CardContent className="p-8 relative">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white/30 shadow-xl">
                      {clan.image ? (
                        <AvatarImage src={clan.image} alt={clan.name} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                        {clan.icon || clan.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-2">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        {clan.name}
                      </h1>
                      {(clan.telegramLink || clan.telegram_link) && (
                        <Button
                          onClick={handleTelegramClick}
                          size="sm"
                          variant="ghost"
                          className="p-2 hover:bg-blue-500/20 rounded-full"
                        >
                          <ExternalLink className="w-5 h-5 text-blue-400" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/40 px-4 py-2 rounded-full">
                        <Users className="w-4 h-4 mr-2" />
                        {clan.members || 0} Members
                      </Badge>
                      <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-400/40 px-4 py-2 rounded-full">
                        <Trophy className="w-4 h-4 mr-2" />
                        Rank #{clan.rank || '-'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 bg-black/30 rounded-2xl p-4 backdrop-blur-sm">
                      <img 
                        src="/lovable-uploads/304f8800-11e4-4204-a4b7-cf255c07987d.png" 
                        alt="Space Coin"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-yellow-400 font-bold text-xl">
                        {formatCoins(clan.totalCoins || 0)}
                      </span>
                      <span className="text-purple-200 text-sm">Total Energy</span>
                    </div>
                  </div>
                </div>

                {clan.description && (
                  <p className="text-purple-100 text-sm mt-6 leading-relaxed bg-white/10 rounded-xl p-4">
                    {clan.description}
                  </p>
                )}
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Mining Bonus Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 backdrop-blur-xl border border-green-400/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-500/30 rounded-full">
                  <Zap className="w-8 h-8 text-green-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-green-300 font-bold text-lg flex items-center gap-2">
                    Enhanced Mining Active
                    <Sparkles className="w-5 h-5" />
                  </h3>
                  <p className="text-green-200 text-sm">+20% mining bonus for all members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Level Progress Card */}
        {currentLevel && nextLevel && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-orange-600/30 to-red-600/30 backdrop-blur-xl border border-orange-400/30 rounded-2xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-yellow-500/30 rounded-full">
                    <Star className="w-6 h-6 text-yellow-300" />
                  </div>
                  {currentLevel.level_name} (Level {currentLevel.level})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-orange-200 mb-4 bg-orange-500/20 rounded-xl p-3">
                  Progress to {nextLevel.level_name} (Level {nextLevel.level})
                </div>
                
                {/* Enhanced Progress Sections */}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-purple-200 font-medium">Members</span>
                      </div>
                      <span className="text-white font-bold">{clan.members || 0}/{nextLevel.min_members}</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(clan.members || 0, nextLevel.min_members)} 
                      className="h-3 bg-gray-700 overflow-hidden rounded-full"
                    />
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-purple-200 font-medium">Energy</span>
                      </div>
                      <span className="text-white font-bold">{formatCoins(clan.totalCoins || 0)}/{formatCoins(nextLevel.min_energy)}</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(clan.totalCoins || 0, nextLevel.min_energy)} 
                      className="h-3 bg-gray-700 overflow-hidden rounded-full"
                    />
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-green-400" />
                        <span className="text-purple-200 font-medium">Missions</span>
                      </div>
                      <span className="text-white font-bold">{clan.missions_completed || 0}/{nextLevel.min_missions_completed}</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(clan.missions_completed || 0, nextLevel.min_missions_completed)} 
                      className="h-3 bg-gray-700 overflow-hidden rounded-full"
                    />
                  </div>
                </div>

                {nextLevel.energy_boost_percentage > currentLevel.energy_boost_percentage && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                    <div className="flex items-center gap-2 text-green-300">
                      <Award className="w-5 h-5" />
                      <span className="font-semibold">Next level reward: +{nextLevel.energy_boost_percentage}% Energy Boost</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Members Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-500/30 rounded-full">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                Clan Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {members.length === 0 ? (
                <div className="text-center text-purple-300 py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No members found</p>
                </div>
              ) : (
                members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-xl hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-300 border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {getRoleIcon(member.role || 'member')}
                        <Avatar className="w-12 h-12 border-2 border-white/20">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                            {(member.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {member.username || 'Unknown'}
                          {member.role === 'leader' && (
                            <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-400/40 text-xs px-2 py-1">
                              Leader
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-purple-300 capitalize">
                          {member.role === 'leader' ? 'Clan Leader' : 'Member'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-yellow-400 font-bold">
                          {formatCoins(member.coins_contributed || 0)}
                        </span>
                      </div>
                      <div className="text-xs text-purple-300">contributed</div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ClanPage;
