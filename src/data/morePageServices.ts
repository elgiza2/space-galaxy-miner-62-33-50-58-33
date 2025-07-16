
import { 
  Store, 
  Zap, 
  RotateCcw,
  Trophy,
  Smartphone
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  shadow: string;
}

export const morePageServices: ServiceItem[] = [
  {
    id: 'store',
    title: 'Store',
    description: 'Premium items and boosts',
    icon: Store,
    gradient: 'from-emerald-400 to-green-600',
    shadow: 'shadow-emerald-500/25'
  },
  {
    id: 'daily-rush',
    title: 'Daily Rush',
    description: 'Complete daily challenges',
    icon: Zap,
    gradient: 'from-orange-400 to-red-600',
    shadow: 'shadow-orange-500/25'
  },
  {
    id: 'spin-wheel',
    title: 'Spin Wheel',
    description: 'Try your luck for rewards',
    icon: RotateCcw,
    gradient: 'from-purple-400 to-pink-600',
    shadow: 'shadow-purple-500/25'
  },
  {
    id: 'leaderboard',
    title: 'Best Users & Clans',
    description: 'Top performers rankings',
    icon: Trophy,
    gradient: 'from-yellow-400 to-gold-600',
    shadow: 'shadow-yellow-500/25'
  },
  {
    id: 'space-apps',
    title: 'Space Apps',
    description: 'اكتشف تطبيقاتنا المميزة',
    icon: Smartphone,
    gradient: 'from-blue-400 to-cyan-600',
    shadow: 'shadow-blue-500/25'
  }
];
