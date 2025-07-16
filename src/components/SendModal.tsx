
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  currency: string;
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, balance, currency }) => {
  const { toast } = useToast();
  const [tonConnectUI] = useTonConnectUI();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!amount || !address) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    if (!tonConnectUI.wallet) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simple transaction without any payload or comment to prevent format errors
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: address,
          amount: (parseFloat(amount) * 1e9).toString(), // Convert to nanoTON
        }]
      };

      console.log('Sending simple TON transaction:', transaction);
      await tonConnectUI.sendTransaction(transaction);
      
      toast({
        title: "Sent Successfully",
        description: `Sent ${amount} ${currency} to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
      
      setAmount('');
      setAddress('');
      onClose();
    } catch (error) {
      console.error('Transaction failed:', error);
      toast({
        title: "Send Failed",
        description: "Transaction was rejected or cancelled",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900/98 via-indigo-900/95 to-purple-900/98 backdrop-blur-xl border-2 border-indigo-500/30 text-white max-w-xs rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg">
              <Send className="w-3 h-3 text-blue-400" />
            </div>
            <DialogTitle className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Send {currency}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-3 pt-1">
          {/* Balance Display */}
          <div className="text-center p-2 bg-gradient-to-r from-white/5 to-white/10 rounded-lg border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wallet className="w-2.5 h-2.5 text-blue-400" />
              <p className="text-xs text-gray-300">Available Balance</p>
            </div>
            <p className="text-sm font-bold text-white">{balance.toFixed(4)} {currency}</p>
            <p className="text-xs text-gray-400 mt-0.5">${(balance * 5.2).toFixed(2)} USD</p>
          </div>

          {/* Input Fields */}
          <div className="space-y-2.5">
            <div>
              <Label htmlFor="amount" className="text-white mb-1 block text-xs font-medium flex items-center gap-2">
                <span>Amount</span>
                <span className="text-xs text-gray-400">({currency})</span>
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 h-8 text-sm rounded-lg pr-10"
                />
                <span className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                  {currency}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-white mb-1 block text-xs font-medium">
                Recipient Address
              </Label>
              <Input
                id="address"
                placeholder="UQA..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 h-8 rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-0.5">Double-check the address before sending</p>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isLoading || !amount || !address}
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 h-8 text-sm font-semibold rounded-lg shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1.5" />
                Send {currency}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendModal;
