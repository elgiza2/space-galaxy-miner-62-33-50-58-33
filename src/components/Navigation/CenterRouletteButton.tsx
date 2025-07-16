
import React from 'react';
import { Zap } from 'lucide-react';

interface CenterRouletteButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const CenterRouletteButton: React.FC<CenterRouletteButtonProps> = ({
  isActive,
  onClick
}) => {
  return (
    <div className="relative group">
      {/* Larger main button */}
      <button
        onClick={onClick}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 group-hover:scale-110 ${
          isActive
            ? 'bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 shadow-lg'
            : 'bg-gradient-to-br from-gray-700 to-gray-800 shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700'
        }`}
      >
        {/* Icon */}
        <Zap 
          className={`w-6 h-6 transition-all duration-300 relative z-10 ${
            isActive 
              ? 'text-white' 
              : 'text-gray-300 group-hover:text-white'
          }`} 
        />
      </button>
      
      {/* Label */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
        <span className={`text-[8px] font-medium transition-all duration-300 ${
          isActive 
            ? 'text-white' 
            : 'text-gray-500 group-hover:text-gray-300'
        }`}>
          Spin
        </span>
      </div>
    </div>
  );
};

export default CenterRouletteButton;
