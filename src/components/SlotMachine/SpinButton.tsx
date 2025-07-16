
import React from 'react';
import { motion } from 'framer-motion';

interface SpinButtonProps {
  buttonText: string;
  isSpinning: boolean;
  isAutoSpin: boolean;
  canSpin: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

const SpinButton: React.FC<SpinButtonProps> = ({
  buttonText,
  isSpinning,
  isAutoSpin,
  canSpin,
  onMouseDown,
  onMouseUp
}) => {
  return (
    <div className="flex justify-center">
      <motion.button
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchEnd={onMouseUp}
        disabled={isSpinning || !canSpin}
        className={`relative w-24 h-24 rounded-full disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl ${
          isAutoSpin 
            ? 'bg-blue-600/20 backdrop-blur-md border border-blue-400/30' 
            : 'bg-white/10 backdrop-blur-md border border-white/20'
        }`}
        whileHover={{ scale: isSpinning ? 1 : 1.05 }}
        whileTap={{ scale: isSpinning ? 1 : 0.95 }}
      >
        {/* Glass overlay - more transparent */}
        <div className="absolute inset-1 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-full" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-white font-bold text-sm tracking-wider text-center"
            animate={{
              opacity: isSpinning ? [1, 0.5, 1] : 1
            }}
            transition={{
              duration: 0.8,
              repeat: isSpinning ? Infinity : 0
            }}
          >
            {buttonText}
          </motion.span>
        </div>

        {/* Spinning inner ring */}
        {isSpinning && (
          <motion.div
            className="absolute inset-2 border-2 border-white/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default SpinButton;
