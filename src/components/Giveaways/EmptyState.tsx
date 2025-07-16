
import React from 'react';
import { Hand } from 'lucide-react';

interface EmptyStateProps {
  activeFilter: 'active' | 'complete';
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeFilter }) => {
  return (
    <div className="text-center py-8 bg-black rounded-2xl border border-gray-800">
      <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
        <Hand className="w-8 h-8 text-gray-400" />
      </div>
      
      <p className="text-white font-medium mb-2">
        {activeFilter === 'active' && '🔥 No active giveaways'}
        {activeFilter === 'complete' && '✅ No completed giveaways'}
      </p>
      
      <p className="text-gray-400 text-sm">
        Check back later for exciting prizes! 🎁
      </p>
    </div>
  );
};

export default EmptyState;
