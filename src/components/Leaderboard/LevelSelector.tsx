
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserLevel, LEVELS } from '@/utils/levelSystem';

interface LevelSelectorProps {
  selectedLevel: number;
  onLevelChange: (level: number) => void;
  userCoins: number;
}

const LevelSelector = ({ selectedLevel, onLevelChange, userCoins }: LevelSelectorProps) => {
  const currentLevel = getUserLevel(userCoins);
  const availableLevels = LEVELS.filter(level => level.id <= currentLevel.id);
  
  const handleNext = () => {
    const currentIndex = availableLevels.findIndex(level => level.id === selectedLevel);
    if (currentIndex < availableLevels.length - 1) {
      onLevelChange(availableLevels[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = availableLevels.findIndex(level => level.id === selectedLevel);
    if (currentIndex > 0) {
      onLevelChange(availableLevels[currentIndex - 1].id);
    }
  };

  const selectedLevelData = availableLevels.find(level => level.id === selectedLevel) || availableLevels[0];
  const currentIndex = availableLevels.findIndex(level => level.id === selectedLevel);

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className={`p-3 rounded-full ${
          currentIndex === 0 
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
            : 'bg-white/10 text-white hover:bg-white/20'
        } transition-all duration-200`}
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>

      <motion.div
        key={selectedLevel}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center min-w-[120px]"
      >
        <h2 className="text-2xl font-bold text-white mb-1">
          {selectedLevelData.name}
        </h2>
        <p className="text-sm text-gray-300">
          {selectedLevelData.minCoins.toLocaleString()} - {selectedLevelData.maxCoins.toLocaleString()} coins
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNext}
        disabled={currentIndex === availableLevels.length - 1}
        className={`p-3 rounded-full ${
          currentIndex === availableLevels.length - 1
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            : 'bg-white/10 text-white hover:bg-white/20'
        } transition-all duration-200`}
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default LevelSelector;
