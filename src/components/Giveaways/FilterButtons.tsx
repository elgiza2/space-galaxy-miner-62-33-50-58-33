
import React from 'react';
import { Button } from '@/components/ui/button';

type FilterType = 'active' | 'complete';

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ 
  activeFilter, 
  onFilterChange 
}) => {
  return (
    <div className="flex gap-3 mb-6 px-1">
      <Button
        onClick={() => onFilterChange('active')}
        className={`glass-button flex-1 h-12 text-sm font-medium rounded-2xl transition-all duration-300 border-0 backdrop-blur-md ${
          activeFilter === 'active'
            ? 'bg-white/20 text-white'
            : 'bg-white/10 hover:bg-white/15 text-gray-300'
        }`}
      >
        <span className="flex items-center gap-2">
          🔥 Active
        </span>
      </Button>
      
      <Button
        onClick={() => onFilterChange('complete')}
        className={`glass-button flex-1 h-12 text-sm font-medium rounded-2xl transition-all duration-300 border-0 backdrop-blur-md ${
          activeFilter === 'complete'
            ? 'bg-white/20 text-white'
            : 'bg-white/10 hover:bg-white/15 text-gray-300'
        }`}
      >
        <span className="flex items-center gap-2">
          ✅ Finished
        </span>
      </Button>
    </div>
  );
};

export default FilterButtons;
