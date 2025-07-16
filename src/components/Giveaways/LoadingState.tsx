
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95"></div>

      <div className="text-center relative z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          {/* Animated loading spinner */}
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-700/50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-gray-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          
          <p className="text-white font-medium mb-2">Loading giveaways...</p>
          <p className="text-gray-400 text-sm">🎁 Preparing amazing prizes</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
