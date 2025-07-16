
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Clock } from 'lucide-react';
import { TONTransaction } from '../services/tonService';
import TransactionItem from './TransactionItem';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TONTransaction[];
  address: string | null;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  transactions,
  address 
}) => {
  const handleViewExplorer = (hash: string) => {
    if (!hash.startsWith('fallback_')) {
      window.open(`https://tonscan.org/tx/${hash}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900/98 via-gray-900/95 to-black/98 backdrop-blur-xl border-2 border-gray-700/50 text-white max-w-xs max-h-[60vh] overflow-hidden rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-gradient-to-r from-green-500/20 to-teal-600/20 rounded-lg">
              <History className="w-3 h-3 text-green-400" />
            </div>
            <DialogTitle className="text-sm font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              Transaction History
            </DialogTitle>
          </div>
          
          {/* Wallet Address Display */}
          {address && (
            <div className="bg-white/5 rounded-lg p-1.5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <span>Address:</span>
                <span className="font-mono text-blue-400">{address.slice(0, 6)}...{address.slice(-4)}</span>
              </div>
            </div>
          )}
        </DialogHeader>
        
        <div className="space-y-1.5 pt-1 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {transactions.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Clock className="w-2.5 h-2.5" />
                <span>Last {transactions.length} transactions</span>
              </div>
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.hash}
                  transaction={transaction}
                  onViewExplorer={handleViewExplorer}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                <History className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm mb-1">No Transactions</p>
              <p className="text-gray-500 text-xs">Your transactions will appear here</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistoryModal;
