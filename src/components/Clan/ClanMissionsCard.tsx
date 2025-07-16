
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Trophy, Zap, Users, Target } from 'lucide-react';
import { clanMissionsService } from '@/services/clanMissionsService';
import type { Database } from '@/integrations/supabase/types';

type ClanMission = Database['public']['Tables']['clan_missions']['Row'];
type ClanMissionProgress = Database['public']['Tables']['clan_mission_progress']['Row'] & {
  clan_missions?: ClanMission;
};

interface ClanMissionsCardProps {
  clanId: string;
}

const ClanMissionsCard = ({ clanId }: ClanMissionsCardProps) => {
  const [missions, setMissions] = useState<ClanMission[]>([]);
  const [progress, setProgress] = useState<ClanMissionProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMissionsData();
  }, [clanId]);

  const loadMissionsData = async () => {
    setIsLoading(true);
    try {
      const [missionsData, progressData] = await Promise.all([
        clanMissionsService.getActiveMissions(),
        clanMissionsService.getClanMissionProgress(clanId)
      ]);
      setMissions(missionsData);
      setProgress(progressData as ClanMissionProgress[]);
    } catch (error) {
      console.error('Error loading missions data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startMission = async (missionId: string) => {
    const success = await clanMissionsService.startMission(clanId, missionId);
    if (success) {
      loadMissionsData();
    }
  };

  const getMissionIcon = (targetType: string) => {
    switch (targetType) {
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'members': return <Users className="w-4 h-4" />;
      case 'individual_tasks': return <Target className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getMissionTypeColor = (type: string) => {
    return type === 'daily' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
        <CardContent className="p-4">
          <div className="text-center text-gray-400">Loading missions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Clan Missions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No active missions available
          </div>
        ) : (
          missions.map((mission) => {
            const missionProgress = progress.find(p => p.mission_id === mission.id);
            const isActive = !!missionProgress;
            const progressPercentage = missionProgress 
              ? getProgressPercentage(missionProgress.current_progress, mission.target_value)
              : 0;

            return (
              <div key={mission.id} className="border border-gray-600 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getMissionIcon(mission.target_type)}
                      <span className="font-medium text-white">{mission.title}</span>
                      <Badge className={getMissionTypeColor(mission.mission_type)}>
                        {mission.mission_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{mission.description}</p>
                  </div>
                  {!isActive && (
                    <Button
                      onClick={() => startMission(mission.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Start
                    </Button>
                  )}
                </div>

                {isActive && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white">
                        {missionProgress?.current_progress || 0} / {mission.target_value}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    
                    {missionProgress?.is_completed ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        ✅ Completed
                      </Badge>
                    ) : missionProgress?.expires_at && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Timer className="w-3 h-3" />
                        <span>Expires: {new Date(missionProgress.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span>Reward: {mission.reward_energy} Energy</span>
                  {mission.reward_boost_hours > 0 && (
                    <span>+{mission.reward_boost_hours}h Boost</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ClanMissionsCard;
