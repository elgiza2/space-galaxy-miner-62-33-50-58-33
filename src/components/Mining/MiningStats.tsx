
import React from 'react';

interface MiningStatsProps {
  spaceCoins: number;
  miningBonus: number;
  totalMined: number;
  timeLeft: number;
  maxDuration: number;
  formatCoins: (amount: number) => string | number;
  formatTime: (seconds: number) => string;
}

const MiningStats: React.FC<MiningStatsProps> = ({
  spaceCoins,
  miningBonus,
  totalMined,
  timeLeft,
  maxDuration,
  formatCoins,
  formatTime
}) => {
  const progress = timeLeft > 0 ? ((maxDuration - timeLeft) / maxDuration) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-4">
      {/* Balance Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img 
            src="/lovable-uploads/3f4a21df-fb59-4bff-b115-78221911b92c.png" 
            alt="Space Coin" 
            className="w-6 h-6 rounded-full" 
          />
          <h2 className="text-white text-xl font-bold">$SPACE</h2>
        </div>
        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-2">
          {formatCoins(spaceCoins)}
        </div>
        <p className="text-gray-400 text-sm">Current Balance</p>
        
        {miningBonus > 1 && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-purple-400 text-sm font-semibold">
              🏛️ Clan Bonus: +{Math.round((miningBonus - 1) * 100)}%
            </span>
          </div>
        )}
        
        {totalMined > 0 && (
          <div className="mt-2 text-green-400 text-sm font-semibold">
            +{formatCoins(totalMined)} earned so far
            {miningBonus > 1 && (
              <span className="text-purple-400 ml-1">
                (with clan bonus)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-2">
          {formatTime(timeLeft)}
        </div>
        <p className="text-gray-400 text-sm">
          {timeLeft > 0 ? 'Time Remaining' : 'Ready to Mine'}
        </p>

        {timeLeft > 0 && (
          <div className="w-64 bg-gray-700/50 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MiningStats;
