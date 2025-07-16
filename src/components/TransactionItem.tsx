
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { TONTransaction } from '../services/tonService';
import { tonService } from '../services/tonService';

interface TransactionItemProps {
  transaction: TONTransaction;
  onViewExplorer: (hash: string) => void;
  language?: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onViewExplorer,
  language = 'en'
}) => {
  const getTransactionIcon = (tx: TONTransaction) => {
    if (tx.type === 'in') {
      return <ArrowDownLeft className="w-3 h-3 text-green-400" />;
    }
    return <ArrowUpRight className="w-3 h-3 text-red-400" />;
  };
  
  const getTransactionDescription = (tx: TONTransaction) => {
    // Handle the case where comment might be encoded or corrupted
    if (tx.comment && typeof tx.comment === 'string') {
      // Check if comment contains the weird encoded string and replace it
      if (tx.comment.includes('c2lnbn') || tx.comment.includes('xFoR271') || tx.comment.length > 50) {
        // Return a generic description based on transaction type
        if (tx.type === 'in') return 'Received TON';
        return 'Sent TON';
      }
      
      // Handle normal comments
      if (tx.comment.includes('upgrade') || tx.comment.includes('ترقية')) return 'Mining Speed Upgrade';
      if (tx.comment.includes('referral') || tx.comment.includes('إحالة')) return 'Referral Bonus';
      
      // Return the comment if it's normal and short
      return tx.comment.length > 30 ? (tx.type === 'in' ? 'Received TON' : 'Sent TON') : tx.comment;
    }
    
    // Default descriptions
    if (tx.type === 'in') return 'Received TON';
    return 'Sent TON';
  };
  
  const getTransactionColor = (type: string) => {
    return type === 'in' ? 'text-green-400' : 'text-red-400';
  };
  
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div 
      className="group flex items-center justify-between p-2 bg-gradient-to-r from-white/5 to-white/10 rounded-lg border border-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300 cursor-pointer" 
      onClick={() => onViewExplorer(transaction.hash)}
    >
      <div className="flex items-center gap-2 flex-1">
        {/* Transaction Icon */}
        <div className={`p-1.5 rounded-lg ${transaction.type === 'in' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {getTransactionIcon(transaction)}
        </div>
        
        {/* Transaction Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-white text-xs font-semibold">
              {getTransactionDescription(transaction)}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-2.5 h-2.5" />
              <span>{formatTimeAgo(transaction.timestamp)}</span>
            </div>
          </div>
          
          <p className="text-gray-400 text-xs">
            {transaction.type === 'in' ? 'From' : 'To'}: {tonService.formatAddress(transaction.type === 'in' ? transaction.from : transaction.to)}
          </p>
        </div>
      </div>
      
      {/* Amount and Actions */}
      <div className="text-right ml-2 flex items-center gap-1.5">
        <div>
          <p className={`font-bold text-xs ${getTransactionColor(transaction.type)}`}>
            {transaction.type === 'in' ? '+' : '-'}{transaction.value} TON
          </p>
          <p className="text-gray-400 text-xs">Fee: {transaction.fee} TON</p>
          {!transaction.hash.startsWith('fallback_') && (
            <p className="text-blue-400 text-xs mt-0.5">Click to view</p>
          )}
        </div>
        
        {!transaction.hash.startsWith('fallback_') && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onViewExplorer(transaction.hash);
            }} 
            className="text-gray-400 hover:text-white hover:bg-white/10 h-5 w-5 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ExternalLink className="w-2.5 h-2.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
