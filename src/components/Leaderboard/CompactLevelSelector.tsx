
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserLevel, LEVELS } from '@/utils/levelSystem';

interface CompactLevelSelectorProps {
  selectedLevel: number;
  onLevelChange: (level: number) => void;
  userCoins: number;
}

const CompactLevelSelector = ({ selectedLevel, onLevelChange, userCoins }: CompactLevelSelectorProps) => {
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
    <div className="flex items-center justify-center gap-3 py-3 px-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-200 ${
          currentIndex === 0 
            ? 'bg-black/20 border-white/10 text-white/30 cursor-not-allowed' 
            : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>

      <motion.div
        key={selectedLevel}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center min-w-[100px]"
      >
        <h2 className="text-lg font-bold text-white mb-0.5">
          {selectedLevelData.name}
        </h2>
        <p className="text-xs text-white/60">
          {selectedLevelData.minCoins.toLocaleString()} - {selectedLevelData.maxCoins === Infinity ? '∞' : selectedLevelData.maxCoins.toLocaleString()}
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        disabled={currentIndex === availableLevels.length - 1}
        className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-200 ${
          currentIndex === availableLevels.length - 1
            ? 'bg-black/20 border-white/10 text-white/30 cursor-not-allowed'
            : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default CompactLevelSelector;
