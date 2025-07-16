
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Hand } from 'lucide-react';

interface GiveawayEvent {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_number: number;
  item_name: string;
  item_id?: string;
  max_participants?: number;
  current_participants: number;
  participation_fee: number;
  is_free: boolean;
  status: 'active' | 'finished' | 'cancelled';
  end_time?: string;
  created_at: string;
}

interface GiveawayCardProps {
  giveaway: GiveawayEvent;
  isParticipating: boolean;
  onParticipate: (giveaway: GiveawayEvent) => void;
}

const GiveawayCard: React.FC<GiveawayCardProps> = ({ 
  giveaway, 
  isParticipating, 
  onParticipate 
}) => {
  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}:19`;
  };

  const isDisabled = giveaway.status !== 'active' || 
                     isParticipating || 
                     (giveaway.max_participants && giveaway.current_participants >= giveaway.max_participants);

  const isFull = giveaway.max_participants && giveaway.current_participants >= giveaway.max_participants;

  const getButtonText = () => {
    if (isParticipating) return 'Joined';
    if (isFull) return 'Full';
    return giveaway.is_free || giveaway.participation_fee === 0 ? 'Free' : 'On TON';
  };

  return (
    <Card className={`border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] glass-card backdrop-blur-md ${
      giveaway.status === 'active' 
        ? 'hover:bg-white/10' 
        : 'opacity-70'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                giveaway.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
              }`}></div>
              <h3 className="text-sm font-bold text-white">
                Giveaway #{giveaway.event_number}
              </h3>
            </div>
            
            <p className={`text-xs mb-3 ${
              giveaway.status === 'active' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              🎁 {giveaway.item_name} {giveaway.item_id && `#${giveaway.item_id}`}
            </p>
            
            <Button
              onClick={() => onParticipate(giveaway)}
              disabled={isDisabled}
              className={`glass-button font-medium text-xs px-4 py-2 rounded-xl mb-3 flex items-center gap-2 h-9 transition-all duration-300 border-0 backdrop-blur-md ${
                giveaway.status === 'active'
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-black/20 text-gray-500'
              }`}
            >
              <Hand className="w-3 h-3" />
              <span>{getButtonText()}</span>
              {!isParticipating && !isFull && !giveaway.is_free && giveaway.participation_fee > 0 && (
                <span className="ml-1">{giveaway.participation_fee}</span>
              )}
            </Button>

            <div className="flex items-center justify-between text-xs">
              <div className={`glass-card flex items-center gap-1.5 px-2 py-1 rounded-lg border-0 backdrop-blur-sm ${
                giveaway.status === 'active' 
                  ? 'bg-white/10 text-gray-300' 
                  : 'bg-black/20 text-gray-500'
              }`}>
                <Users className="w-3 h-3" />
                <span className="font-medium">{giveaway.current_participants} / {giveaway.max_participants || '∞'}</span>
              </div>
              
              {giveaway.end_time && giveaway.status === 'active' ? (
                <div className="glass-card bg-white/10 text-gray-300 px-3 py-1 rounded-lg flex items-center gap-1.5 border-0 backdrop-blur-sm">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-xs font-medium">{formatTimeLeft(giveaway.end_time)}</span>
                </div>
              ) : (
                <div className={`glass-card px-3 py-1 rounded-lg border-0 backdrop-blur-sm ${
                  giveaway.status === 'active' 
                    ? 'bg-white/10 text-gray-300' 
                    : 'bg-black/20 text-gray-500'
                }`}>
                  <span className="font-mono text-xs font-medium">∞</span>
                </div>
              )}
            </div>
          </div>

          <div className="ml-4">
            <div className={`glass-card aspect-square w-16 rounded-2xl flex items-center justify-center border-0 backdrop-blur-sm overflow-hidden ${
              giveaway.status === 'active'
                ? 'bg-white/10'
                : 'bg-black/20'
            }`}>
              {giveaway.image_url ? (
                <img 
                  src={giveaway.image_url} 
                  alt={giveaway.item_name}
                  className={`w-full h-full object-cover rounded-2xl ${
                    giveaway.status === 'active' ? '' : 'opacity-60'
                  }`}
                />
              ) : (
                <img 
                  src="/lovable-uploads/69e7a419-97be-4ca3-89bf-ab1090aeaeb2.png" 
                  alt="Cigar"
                  className={`w-10 h-10 object-contain ${
                    giveaway.status === 'active' ? '' : 'opacity-60'
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GiveawayCard;
