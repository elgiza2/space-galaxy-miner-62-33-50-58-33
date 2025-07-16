
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlotMachine } from '@/hooks/useSlotMachine';
import { useCurrency } from '@/hooks/useCurrency';
import SlotReels from '@/components/SlotMachine/SlotReels';
import SpinButton from '@/components/SlotMachine/SpinButton';
import GameControls from '@/components/SlotMachine/GameControls';
import EventIcons from '@/components/SlotMachine/EventIcons';
import moonBackground from '@/assets/moon-background.jpg';

const SlotMachine = () => {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const {
    reels,
    isSpinning,
    showMiniGame,
    selectedPositions,
    winAnimation,
    multiplier,
    lastReward,
    buttonText,
    isAutoSpin,
    autoSpinCount,
    maxAutoSpins,
    handleMultiplierChange,
    handleMiniGameChoice,
    stopAutoSpin,
    handleMouseDown,
    handleMouseUp
  } = useSlotMachine();

  const { balances } = useCurrency();

  const handleEventClick = (eventId: string) => {
    setActiveEvent(eventId);
  };

  const handleBackFromEvent = () => {
    setActiveEvent(null);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ 
            backgroundImage: `url(/lovable-uploads/78c95cd5-6b09-4ef3-82c2-6379d93393bb.png)`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 py-8">
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Be Rich</h1>
          <div className="w-16 h-0.5 bg-white/20 mx-auto" />
        </motion.div>

        {/* Event Icons */}
        <EventIcons onEventClick={handleEventClick} />

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Glass Container */}
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            
            {/* Auto Spin Status */}
            {isAutoSpin && (
              <div className="mb-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-400/30 rounded-xl p-3 text-center">
                  <p className="text-blue-300 font-medium text-base">
                    🤖 Auto Spin {autoSpinCount + 1}/{maxAutoSpins}
                  </p>
                </div>
              </div>
            )}

            {/* Reward Display */}
            <div className="mb-5">
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 text-center">
                {lastReward ? (
                  <motion.p
                    key={lastReward}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-white font-medium text-sm"
                  >
                    {lastReward}
                  </motion.p>
                ) : (
                  <p className="text-gray-400 font-medium text-sm">Press SPIN to play</p>
                )}
              </div>
            </div>

            {/* Reels Container */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-5 mb-5">
              <SlotReels
                reels={reels}
                isSpinning={isSpinning}
                winAnimation={winAnimation}
              />

              {/* Spin Button */}
              <SpinButton
                buttonText={buttonText}
                isSpinning={isSpinning}
                isAutoSpin={isAutoSpin}
                canSpin={balances.spins >= multiplier}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              />
            </div>

            {/* Controls */}
            <GameControls
              multiplier={multiplier}
              spinsCount={balances.spins}
              isAutoSpin={isAutoSpin}
              isSpinning={isSpinning}
              onMultiplierChange={handleMultiplierChange}
              onStopAutoSpin={stopAutoSpin}
            />
          </div>
        </motion.div>
      </div>

      {/* Moon Mini Game Modal */}
      <AnimatePresence>
        {showMiniGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg"
          >
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md aspect-[4/3]"
              >
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
                      Choose a spot to dig!
                    </h2>
                  </div>

                  {/* Digging Spots */}
                  {[
                    { x: 25, y: 35 },
                    { x: 50, y: 60 },
                    { x: 75, y: 40 }
                  ].map((spot, index) => (
                    <motion.button
                      key={index}
                      className={`absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 ${
                        selectedPositions.includes(index) 
                          ? 'bg-yellow-400 text-black' 
                          : 'bg-red-500 text-white hover:bg-red-400'
                      } rounded-full flex items-center justify-center text-xl font-bold transition-colors duration-200`}
                      style={{
                        left: `${spot.x}%`,
                        top: `${spot.y}%`
                      }}
                      onClick={() => handleMiniGameChoice(index)}
                      disabled={selectedPositions.length > 0}
                      whileHover={selectedPositions.length === 0 ? { scale: 1.1 } : {}}
                      whileTap={selectedPositions.length === 0 ? { scale: 0.95 } : {}}
                    >
                      ✗
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlotMachine;
