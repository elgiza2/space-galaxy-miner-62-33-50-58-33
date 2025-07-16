import { useState, useEffect, useCallback } from 'react';
import { enhancedTicketService, EnhancedTicket } from '@/services/enhancedTicketService';
import { useTelegramUser } from './useTelegramUser';
import { useToast } from '@/hooks/use-toast';

export const useTickets = () => {
  const [tickets, setTickets] = useState<EnhancedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyTicketsCount, setDailyTicketsCount] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [ticketStats, setTicketStats] = useState({ total: 0, used: 0, expired: 0, available: 0, byType: {} });
  const { userProfile } = useTelegramUser();
  const { toast } = useToast();

  const fetchTickets = useCallback(async () => {
    // Use demo user if no Telegram user is available
    const userId = userProfile?.id || 'demo_user';
    
    if (!userId) {
      console.log('No user ID found for tickets');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching tickets for user:', userId);
      
      // Clean expired tickets first
      enhancedTicketService.cleanExpiredTickets();
      
      const userTickets = enhancedTicketService.getUserTickets(userId);
      const dailyCount = enhancedTicketService.getDailyTicketsCount(userId);
      const nextTicketTime = enhancedTicketService.getTimeUntilNextDailyTickets(userId);
      const stats = enhancedTicketService.getTicketStats(userId);
      
      console.log('Tickets fetched:', {
        userTickets: userTickets.length,
        dailyCount,
        nextTicketTime,
        stats
      });
      
      setTickets(userTickets);
      setDailyTicketsCount(dailyCount);
      setTimeUntilNext(nextTicketTime);
      setTicketStats(stats);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "خطأ في جلب التذاكر",
        description: "حدث خطأ أثناء جلب التذاكر",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, toast]);

  const claimDailyTickets = useCallback(async () => {
    const userId = userProfile?.id || 'demo_user';
    
    if (!userId) {
      console.log('No user ID for claiming daily tickets');
      return;
    }
    
    try {
      console.log('Attempting to claim daily tickets for user:', userId);
      
      const canClaim = enhancedTicketService.canGetDailyTickets(userId);
      console.log('Can claim daily tickets:', canClaim);
      
      if (!canClaim) {
        toast({
          title: "التذاكر اليومية مُستلمة",
          description: "لقد استلمت التذاكر اليومية بالفعل",
          variant: "destructive"
        });
        return;
      }
      
      const newTickets = enhancedTicketService.createDailyTickets(userId);
      console.log('Created daily tickets:', newTickets.length);
      
      if (newTickets.length > 0) {
        await fetchTickets();
        toast({
          title: "🎫 تذاكر جديدة!",
          description: `حصلت على ${newTickets.length} تذاكر مجانية`,
        });
      } else {
        toast({
          title: "لا توجد تذاكر متاحة",
          description: "لقد استنفدت التذاكر اليومية",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error claiming daily tickets:', error);
      toast({
        title: "خطأ",
        description: "فشل في استلام التذاكر اليومية",
        variant: "destructive"
      });
    }
  }, [userProfile?.id, fetchTickets, toast]);

  const useTicket = useCallback(async (ticketId: string) => {
    try {
      enhancedTicketService.useTicket(ticketId);
      fetchTickets();
      return true;
    } catch (error) {
      console.error('Error using ticket:', error);
      toast({
        title: "Error",
        description: "Failed to use ticket",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchTickets, toast]);

  const createTaskRewardTicket = useCallback(async () => {
    const userId = userProfile?.id || 'demo_user';
    if (!userId) return;
    
    try {
      enhancedTicketService.createTaskRewardTicket(userId);
      fetchTickets();
      toast({
        title: "🎫 Reward Ticket!",
        description: "You earned a free ticket for completing the task",
      });
    } catch (error) {
      console.error('Error creating task reward ticket:', error);
    }
  }, [userProfile?.id, fetchTickets, toast]);

  const createPremiumTicket = useCallback(async (value: number = 2000) => {
    const userId = userProfile?.id || 'demo_user';
    if (!userId) return;
    
    try {
      enhancedTicketService.createPremiumTicket(userId, value);
      fetchTickets();
      toast({
        title: "🎫 Premium Ticket!",
        description: `You received a premium ticket worth ${value} coins`,
      });
    } catch (error) {
      console.error('Error creating premium ticket:', error);
    }
  }, [userProfile?.id, fetchTickets, toast]);

  const purchaseTickets = useCallback(async (count: number, coinCost: number) => {
    const userId = userProfile?.id || 'demo_user';
    if (!userId) return [];
    
    try {
      const purchasedTickets = enhancedTicketService.purchaseTickets(userId, count, coinCost);
      fetchTickets();
      toast({
        title: "🛒 Tickets Purchased",
        description: `Successfully purchased ${count} tickets`,
      });
      return purchasedTickets;
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      return [];
    }
  }, [userProfile?.id, fetchTickets, toast]);

  const getTicketValue = useCallback((ticket: EnhancedTicket) => {
    return enhancedTicketService.getTicketValue(ticket);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    dailyTicketsCount,
    ticketStats,
    canGetDailyTickets: dailyTicketsCount < 3,
    timeUntilNextTickets: timeUntilNext,
    availableTickets: tickets.length,
    claimDailyTickets,
    useTicket,
    createTaskRewardTicket,
    createPremiumTicket,
    purchaseTickets,
    getTicketValue,
    refetch: fetchTickets,
  };
};