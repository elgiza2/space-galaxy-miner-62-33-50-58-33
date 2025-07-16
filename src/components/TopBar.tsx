import React from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useTickets } from '@/hooks/useTickets';
import { formatCoins } from '@/utils/levelSystem';
import coinIcon from '@/assets/coin-icon.png';
import rocketIcon from '@/assets/space-rocket.png';
import { Zap, Ticket } from 'lucide-react';
const TopBar = () => {
  const {
    balances
  } = useCurrency();
  const {
    spaceCoins
  } = useSpaceCoins();
  const {
    availableTickets
  } = useTickets();
  return <div className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-sm">
      
    </div>;
};
export default TopBar;