
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Wallet } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { sendTONPayment } from '@/utils/ton';

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


type FilterType = 'active' | 'complete';

const GiveawaysPage = () => {
  const [giveaways, setGiveaways] = useState<GiveawayEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participatingEvents, setParticipatingEvents] = useState<Set<string>>(new Set());
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();

  const username = localStorage.getItem('username');
  const isWalletConnected = !!tonConnectUI.wallet;
  const walletAddress = tonConnectUI.wallet?.account?.address;

  useEffect(() => {
    loadGiveaways();
    if (username) {
      loadUserParticipations();
    }
  }, [username]);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleConnectWallet = async () => {
    if (!tonConnectUI) {
      toast({
        title: "Wallet Error",
        description: "TON Connect not available",
        variant: "destructive"
      });
      return;
    }

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
    }
  };

  const formatTimeLeft = (endTime: string) => {
    const now = currentTime;
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const loadGiveaways = async () => {
    try {
      const { data, error } = await supabase
        .from('giveaway_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading giveaways:', error);
        return;
      }

      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'active' | 'finished' | 'cancelled'
      }));

      setGiveaways(typedData);
    } catch (error) {
      console.error('Error loading giveaways:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserParticipations = async () => {
    if (!username) return;

    try {
      const { data, error } = await supabase
        .from('giveaway_participants')
        .select('giveaway_id')
        .eq('username', username);

      if (error) {
        console.error('Error loading participations:', error);
        return;
      }

      const participatedIds = new Set(data?.map(p => p.giveaway_id) || []);
      setParticipatingEvents(participatedIds);
    } catch (error) {
      console.error('Error loading participations:', error);
    }
  };

  const handlePaidGiveawayParticipation = async (giveaway: GiveawayEvent) => {
    if (!username) {
      toast({
        title: "Login Required",
        description: "Please enter your username first",
        variant: "destructive"
      });
      return;
    }

    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your TON wallet first",
        variant: "destructive"
      });
      return;
    }

    if (participatingEvents.has(giveaway.id)) {
      toast({
        title: "Already Joined",
        description: "You have already joined this event",
        variant: "destructive"
      });
      return;
    }

    setProcessingPayments(prev => new Set([...prev, giveaway.id]));

    try {
      console.log(`Sending ${giveaway.participation_fee} TON for giveaway: ${giveaway.title}`);
      
      // Send real TON payment
      await sendTONPayment(tonConnectUI, "UQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL", giveaway.participation_fee);
      
      // Record participation in database
      const { error: participationError } = await supabase
        .from('giveaway_participants')
        .insert({
          giveaway_id: giveaway.id,
          user_id: `user_${username}`,
          username: username,
          payment_status: 'completed'
        });

      if (participationError) {
        console.error('Error recording participation:', participationError);
        toast({
          title: "Payment Failed",
          description: "Failed to record participation. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update participant count
      const { error: updateError } = await supabase
        .from('giveaway_events')
        .update({ 
          current_participants: giveaway.current_participants + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', giveaway.id);

      if (updateError) {
        console.error('Error updating participant count:', updateError);
      }

      setParticipatingEvents(prev => new Set([...prev, giveaway.id]));
      setGiveaways(prev => prev.map(g => 
        g.id === giveaway.id 
          ? { ...g, current_participants: g.current_participants + 1 }
          : g
      ));

      // Reload giveaways to reflect updated participant count
      loadGiveaways();

      toast({
        title: "Payment Successful! 🎉",
        description: `Successfully joined ${giveaway.title}`,
      });

    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: "Transaction was rejected or cancelled. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(giveaway.id);
        return newSet;
      });
    }
  };

  const participateInGiveaway = async (giveaway: GiveawayEvent) => {
    if (!giveaway.is_free) {
      // Handle paid giveaway with real TON payment
      await handlePaidGiveawayParticipation(giveaway);
      return;
    }

    // Handle free giveaway
    if (!username) {
      toast({
        title: "Login Required",
        description: "Please enter your username first",
        variant: "destructive"
      });
      return;
    }

    if (participatingEvents.has(giveaway.id)) {
      toast({
        title: "Already Joined",
        description: "You have already joined this event",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: participationError } = await supabase
        .from('giveaway_participants')
        .insert({
          giveaway_id: giveaway.id,
          user_id: `user_${username}`,
          username: username,
          payment_status: 'completed'
        });

      if (participationError) {
        console.error('Error participating:', participationError);
        toast({
          title: "Error",
          description: "Failed to join the event. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('giveaway_events')
        .update({ 
          current_participants: giveaway.current_participants + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', giveaway.id);

      if (updateError) {
        console.error('Error updating participant count:', updateError);
      }

      setParticipatingEvents(prev => new Set([...prev, giveaway.id]));
      setGiveaways(prev => prev.map(g => 
        g.id === giveaway.id 
          ? { ...g, current_participants: g.current_participants + 1 }
          : g
      ));

      toast({
        title: "Success! 🎉",
        description: `Successfully joined ${giveaway.title}!`,
      });

    } catch (error) {
      console.error('Error participating in giveaway:', error);
      toast({
        title: "Error",
        description: "Failed to join the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFilteredGiveaways = () => {
    switch (activeFilter) {
      case 'active':
        return giveaways.filter(g => g.status === 'active');
      case 'complete':
        return giveaways.filter(g => g.status === 'finished');
      default:
        return giveaways;
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredGiveaways = getFilteredGiveaways();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 text-white pb-16">
      <div className="max-w-sm mx-auto px-3 pt-4">
        {/* Compact Header */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-white mb-1">Giveaways</h1>
          <p className="text-blue-200 text-xs">Win amazing prizes!</p>
        </div>

        {/* Compact Filter Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveFilter('active')}
            className={`flex-1 py-2 px-3 text-xs rounded-lg transition-colors ${
              activeFilter === 'active'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-blue-800/50 text-blue-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('complete')}
            className={`flex-1 py-2 px-3 text-xs rounded-lg transition-colors ${
              activeFilter === 'complete'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-blue-800/50 text-blue-200'
            }`}
          >
            Finished
          </button>
        </div>

        {/* Compact Giveaway Cards */}
        <div className="space-y-3">
          {filteredGiveaways.map((giveaway) => {
            const isProcessing = processingPayments.has(giveaway.id);
            
            return (
              <div key={giveaway.id} className="bg-blue-800/50 border border-blue-400/30 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  {/* Compact Image */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {giveaway.image_url ? (
                      <img 
                        src={giveaway.image_url} 
                        alt={giveaway.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Trophy className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Compact Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm mb-1 truncate">
                      {giveaway.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-blue-200 mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{giveaway.current_participants}</span>
                      </div>
                      {giveaway.end_time && (
                        <div className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded text-xs font-mono">
                          {formatTimeLeft(giveaway.end_time)}
                        </div>
                      )}
                      {!giveaway.is_free && (
                        <div className="bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded text-xs font-bold">
                          {giveaway.participation_fee} TON
                        </div>
                      )}
                    </div>

                    {/* Updated Button Logic */}
                    {!giveaway.is_free && !isWalletConnected ? (
                      <Button
                        onClick={handleConnectWallet}
                        className="w-full h-7 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-1"
                      >
                        <Wallet className="w-3 h-3" />
                        Connect Your Wallet
                      </Button>
                    ) : (
                      <Button
                        onClick={() => participateInGiveaway(giveaway)}
                        disabled={participatingEvents.has(giveaway.id) || giveaway.status !== 'active' || isProcessing}
                        className="w-full h-7 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' :
                         participatingEvents.has(giveaway.id) ? 'Joined' : 
                         giveaway.status !== 'active' ? 'Ended' : 
                         giveaway.is_free ? 'Join Free' : `Pay ${giveaway.participation_fee} TON`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredGiveaways.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-blue-200 text-sm">
                {activeFilter === 'active' ? 'No active giveaways' : 'No finished giveaways'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiveawaysPage;
