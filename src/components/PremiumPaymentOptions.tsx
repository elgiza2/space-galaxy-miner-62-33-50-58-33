
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PremiumPaymentOptionsProps {
  itemName: string;
  itemDescription: string;
  rewardAmount: number;
  tonPrice: number;
  onSuccess: () => void;
  className?: string;
}

const PremiumPaymentOptions: React.FC<PremiumPaymentOptionsProps> = ({
  itemName,
  itemDescription,
  rewardAmount,
  tonPrice,
  onSuccess,
  className = ""
}) => {
  const [isPurchased, setIsPurchased] = useState(false);
  const { toast } = useToast();

  const handleTonPayment = () => {
    toast({
      title: 'TON Payment',
      description: 'TON payment integration coming soon',
      variant: 'destructive'
    });
  };

  if (isPurchased) {
    return null;
  }

  return (
    <Card className={`glass-card hover:bg-white/15 transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-lg mb-2 flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            {itemName}
          </h3>
          <p className="text-gray-300 text-sm mb-3">{itemDescription}</p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/lovable-uploads/304f8800-11e4-4204-a4b7-cf255c07987d.png" 
              alt="Space Coin"
              className="w-6 h-6 rounded-full"
            />
            <span className="text-yellow-400 font-bold text-xl">
              +{rewardAmount.toLocaleString()} SPACE
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {/* TON Payment */}
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">TON Coin</span>
              </div>
              <span className="text-blue-400 font-bold">{tonPrice.toFixed(4)} TON</span>
            </div>
            <Button
              onClick={handleTonPayment}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium"
              size="sm"
            >
              Pay {tonPrice.toFixed(4)} TON
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumPaymentOptions;
