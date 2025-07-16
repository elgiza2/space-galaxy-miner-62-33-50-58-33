
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Users, Zap, Target } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ClanLevel = Database['public']['Tables']['clan_levels']['Row'];

interface ClanLevelCardProps {
  currentLevel: ClanLevel;
  nextLevel?: ClanLevel;
  clan: {
    member_count: number;
    total_coins: number;
    missions_completed: number;
    level: number;
  };
}

const ClanLevelCard = ({ currentLevel, nextLevel, clan }: ClanLevelCardProps) => {
  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  return (
    <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold text-white">{currentLevel.level_name}</span>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Level {currentLevel.level}
            </Badge>
          </div>
          {currentLevel.energy_boost_percentage > 0 && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              +{currentLevel.energy_boost_percentage}% Energy Boost
            </Badge>
          )}
        </div>

        {nextLevel && (
          <div className="space-y-3">
            <div className="text-sm text-gray-300 mb-2">
              Progress to {nextLevel.level_name} (Level {nextLevel.level})
            </div>
            
            {/* Members Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Members</span>
                </div>
                <span>{clan.member_count}/{nextLevel.min_members}</span>
              </div>
              <Progress 
                value={getProgressPercentage(clan.member_count, nextLevel.min_members)} 
                className="h-1"
              />
            </div>

            {/* Energy Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Energy</span>
                </div>
                <span>{clan.total_coins.toLocaleString()}/{nextLevel.min_energy.toLocaleString()}</span>
              </div>
              <Progress 
                value={getProgressPercentage(clan.total_coins, nextLevel.min_energy)} 
                className="h-1"
              />
            </div>

            {/* Missions Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>Missions</span>
                </div>
                <span>{clan.missions_completed}/{nextLevel.min_missions_completed}</span>
              </div>
              <Progress 
                value={getProgressPercentage(clan.missions_completed, nextLevel.min_missions_completed)} 
                className="h-1"
              />
            </div>

            {nextLevel.energy_boost_percentage > currentLevel.energy_boost_percentage && (
              <div className="text-xs text-green-400 mt-2">
                Next level reward: +{nextLevel.energy_boost_percentage}% Energy Boost
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClanLevelCard;
