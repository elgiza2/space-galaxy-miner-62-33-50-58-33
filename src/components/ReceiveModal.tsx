
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, QrCode, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose, address }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({
      title: 'Copied',
      description: 'Wallet address copied to clipboard',
    });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-2 border-indigo-500/40 text-white max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Receive Coins
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 h-7 w-7 p-0 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* QR Code Placeholder */}
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-10 h-10 text-white/60 mx-auto mb-1" />
                <p className="text-xs text-gray-300">QR Code</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-white font-semibold text-sm">Wallet Address</Label>
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <code className="text-xs text-gray-200 flex-1 break-all leading-relaxed font-mono">
                {address}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-white hover:bg-white/10 h-8 w-8 p-0 rounded-lg flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-200 text-center leading-relaxed">
              Share this address to receive coins
            </p>
          </div>

          <Button
            onClick={copyToClipboard}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-10 text-sm font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <label className={`block text-sm font-medium ${className}`}>{children}</label>
);

export default ReceiveModal;
