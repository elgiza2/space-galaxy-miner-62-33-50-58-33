
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TryLuckPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpin: () => void;
}

const TryLuckPopup: React.FC<TryLuckPopupProps> = ({ isOpen, onClose, onOpenSpin }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSpinClick = () => {
    onOpenSpin();
    onClose();
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="glass-button bg-gradient-to-br from-blue-900/80 to-blue-800/80 backdrop-blur-xl border border-blue-400/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Image */}
          <div className="mx-auto w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 p-2 shadow-xl">
            <img 
              src="https://nft.fragment.com/collection/plushpepe.webp" 
              alt="Pepe" 
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                // Fallback to uploaded image if external URL fails
                e.currentTarget.src = "/lovable-uploads/b80f137d-b700-4ebf-b6cc-dac67230af78.png";
              }}
            />
          </div>

          {/* Action button */}
          <Button
            onClick={handleSpinClick}
            variant="glass-purple"
            className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
          >
            Spin the Wheel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TryLuckPopup;
