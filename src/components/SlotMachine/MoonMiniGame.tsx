import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moonBackground from '@/assets/moon-background.jpg';

interface MoonMiniGameProps {
  onReward: (spaceCoins: number) => void;
  onClose: () => void;
}

const MoonMiniGame: React.FC<MoonMiniGameProps> = ({ onReward, onClose }) => {
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reward, setReward] = useState(0);

  const handleSpotClick = (spotIndex: number) => {
    if (selectedSpot !== null || revealed) return;

    setSelectedSpot(spotIndex);
    setRevealed(true);

    // Random reward between 100-5000 space coins
    const randomReward = Math.floor(Math.random() * 4901) + 100;
    setReward(randomReward);

    setTimeout(() => {
      onReward(randomReward);
      onClose();
    }, 2000);
  };

  const spots = [
    { x: 25, y: 35 },
    { x: 50, y: 60 },
    { x: 75, y: 40 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md aspect-[4/3] mx-4">
        {/* Moon Background */}
        <div 
          className="w-full h-full rounded-2xl overflow-hidden relative"
          style={{
            backgroundImage: `url(${moonBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Title */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <h2 className="text-white text-xl font-bold text-center bg-black/50 px-4 py-2 rounded-lg">
              اختر نقطة للحفر!
            </h2>
          </div>

          {/* Digging Spots */}
          {spots.map((spot, index) => (
            <motion.button
              key={index}
              className={`absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 ${
                selectedSpot === index 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-red-500 text-white hover:bg-red-400'
              } rounded-full flex items-center justify-center text-xl font-bold transition-colors duration-200`}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`
              }}
              onClick={() => handleSpotClick(index)}
              disabled={revealed}
              whileHover={!revealed ? { scale: 1.1 } : {}}
              whileTap={!revealed ? { scale: 0.95 } : {}}
            >
              <X size={24} />
            </motion.button>
          ))}

          {/* Reward Display */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg"
            >
              🌌 +{reward} Space Coins!
            </motion.div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-black/50 border-white/20 text-white hover:bg-black/70"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MoonMiniGame;