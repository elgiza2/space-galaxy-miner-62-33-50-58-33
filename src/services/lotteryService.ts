import { supabase } from '@/integrations/supabase/client';

export interface LotteryEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface LotteryPrize {
  id: string;
  rank_start: number;
  rank_end: number;
  prize_name: string;
  prize_value: string;
  prize_image?: string;
  prize_type: string;
}

export interface LotteryTicket {
  id: string;
  user_id: string;
  username: string;
  tickets_count: number;
  from_referrals: number;
  from_gifts: number;
  rank_position?: number;
  user_photo?: string;
}

export const lotteryService = {
  async getCurrentLotteryEvent(): Promise<LotteryEvent | null> {
    try {
      const { data, error } = await supabase
        .from('lottery_events' as any)
        .select('*')
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching lottery event:', error);
        return null;
      }

      return data as unknown as LotteryEvent;
    } catch (error) {
      console.error('Error in getCurrentLotteryEvent:', error);
      return null;
    }
  },

  async getLotteryPrizes(lotteryEventId: string): Promise<LotteryPrize[]> {
    try {
      const { data, error } = await supabase
        .from('lottery_prizes' as any)
        .select('*')
        .eq('lottery_event_id', lotteryEventId)
        .order('rank_start', { ascending: true });

      if (error) {
        console.error('Error fetching lottery prizes:', error);
        return [];
      }

      return (data || []) as unknown as LotteryPrize[];
    } catch (error) {
      console.error('Error in getLotteryPrizes:', error);
      return [];
    }
  },

  async getUserTickets(lotteryEventId: string, userId: string): Promise<LotteryTicket | null> {
    try {
      const { data, error } = await supabase
        .from('lottery_tickets' as any)
        .select('*')
        .eq('lottery_event_id', lotteryEventId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user tickets:', error);
        return null;
      }

      return data as unknown as LotteryTicket;
    } catch (error) {
      console.error('Error in getUserTickets:', error);
      return null;
    }
  },

  async getTopPlayers(lotteryEventId: string): Promise<LotteryTicket[]> {
    try {
      const { data, error } = await supabase
        .from('lottery_tickets' as any)
        .select('*')
        .eq('lottery_event_id', lotteryEventId)
        .order('tickets_count', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching top players:', error);
        return [];
      }

      // Remove duplicates based on user_id and username, keeping the one with more tickets
      const uniquePlayers = new Map();
      
      (data || []).forEach((player: any) => {
        const key = player.user_id;
        if (!uniquePlayers.has(key) || uniquePlayers.get(key).tickets_count < player.tickets_count) {
          uniquePlayers.set(key, player);
        }
      });

      // Convert back to array and sort by tickets_count
      const uniquePlayersArray = Array.from(uniquePlayers.values())
        .sort((a, b) => b.tickets_count - a.tickets_count)
        .slice(0, 30); // Ensure we only return top 30

      // Update rank positions
      const rankedData = uniquePlayersArray.map((player: any, index: number) => ({
        ...player,
        rank_position: index + 1
      }));

      return rankedData as unknown as LotteryTicket[];
    } catch (error) {
      console.error('Error in getTopPlayers:', error);
      return [];
    }
  },

  async updateUserTickets(lotteryEventId: string, userId: string, username: string, referralTickets: number, giftTickets: number): Promise<boolean> {
    try {
      const totalTickets = referralTickets + giftTickets;
      
      const { error } = await supabase
        .from('lottery_tickets' as any)
        .upsert({
          lottery_event_id: lotteryEventId,
          user_id: userId,
          username: username,
          tickets_count: totalTickets,
          from_referrals: referralTickets,
          from_gifts: giftTickets,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'lottery_event_id,user_id'
        });

      if (error) {
        console.error('Error updating user tickets:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserTickets:', error);
      return false;
    }
  }
};
