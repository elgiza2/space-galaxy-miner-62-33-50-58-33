
import { useState, useEffect } from 'react';
import { clanLevelsService } from '@/services/clanLevelsService';
import type { Database } from '@/integrations/supabase/types';

type ClanLevel = Database['public']['Tables']['clan_levels']['Row'];

export const useClanLevels = () => {
  const [levels, setLevels] = useState<ClanLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    setIsLoading(true);
    try {
      const levelsData = await clanLevelsService.getAllLevels();
      setLevels(levelsData);
    } catch (error) {
      console.error('Error loading clan levels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelByNumber = (levelNumber: number): ClanLevel | undefined => {
    return levels.find(level => level.level === levelNumber);
  };

  const getNextLevel = (currentLevel: number): ClanLevel | undefined => {
    return levels.find(level => level.level === currentLevel + 1);
  };

  return {
    levels,
    isLoading,
    getLevelByNumber,
    getNextLevel,
    reloadLevels: loadLevels
  };
};
