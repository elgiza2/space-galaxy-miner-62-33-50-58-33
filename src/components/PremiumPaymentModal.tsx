
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface PremiumPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemDescription: string;
  rewardAmount: number;
  tonPrice: number;
  onTonPaymentSuccess: () => void;
}

const PremiumPaymentModal: React.FC<PremiumPaymentModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemDescription,
  rewardAmount,
  tonPrice,
  onTonPaymentSuccess
}) => {
  const { toast } = useToast();
  const [tonConnectUI] = useTonConnectUI();

  const handleTonPayment = async () => {
    try {
      if (!tonConnectUI.wallet) {
        await tonConnectUI.openModal();
        toast({
          title: "Connect Wallet",
          description: "Please connect your TON wallet first",
        });
        return;
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: "UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R",
          amount: (tonPrice * 1e9).toString()
        }]
      };

      await tonConnectUI.sendTransaction(transaction);
      
      toast({
        title: "Payment Successful!",
        description: `Successfully purchased ${itemName}`,
      });
      
      onTonPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('TON payment failed:', error);
      toast({
        title: "Payment Failed",
        description: "TON payment failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="glass-card max-w-sm w-full border border-blue-500/30 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg">Purchase Item</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-red-500 w-6 h-6 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-center mb-4">
            <h4 className="text-white font-bold mb-2">{itemName}</h4>
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
                <img 
                  src="/lovable-uploads/1e3f7a79-7f90-4605-90b2-fd779ee99f8f.png" 
                  alt="TON" 
                  className="w-4 h-4 mr-2" 
                />
                Pay with TON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumPaymentModal;
