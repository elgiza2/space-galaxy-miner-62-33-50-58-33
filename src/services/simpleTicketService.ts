// Simple ticket service using localStorage for demo
export interface SimpleTicket {
  id: string;
  user_id: string;
  type: 'daily' | 'task_reward' | 'premium';
  created_at: string;
  used_at?: string;
  is_used: boolean;
  expires_at?: string;
}

const TICKETS_KEY = 'user_tickets';

export const simpleTicketService = {
  // Get user tickets from localStorage
  getUserTickets(userId: string): SimpleTicket[] {
    try {
      const tickets = localStorage.getItem(TICKETS_KEY);
      if (!tickets) return [];
      
      const allTickets: SimpleTicket[] = JSON.parse(tickets);
      return allTickets.filter(ticket => 
        ticket.user_id === userId && !ticket.is_used
      );
    } catch (error) {
      console.error('Error getting tickets:', error);
      return [];
    }
  },

  // Get daily tickets count for today (24 hours)
  getDailyTicketsCount(userId: string): number {
    try {
      const tickets = localStorage.getItem(TICKETS_KEY);
      if (!tickets) return 0;
      
      const allTickets: SimpleTicket[] = JSON.parse(tickets);
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      return allTickets.filter(ticket => 
        ticket.user_id === userId && 
        ticket.type === 'daily' &&
        new Date(ticket.created_at) > twentyFourHoursAgo
      ).length;
    } catch (error) {
      console.error('Error getting daily tickets count:', error);
      return 0;
    }
  },

  // Create daily tickets (3 per day)
  createDailyTickets(userId: string): SimpleTicket[] {
    try {
      const dailyCount = this.getDailyTicketsCount(userId);
      const remainingTickets = Math.max(0, 3 - dailyCount);
      
      if (remainingTickets === 0) {
        return [];
      }
      
      const existingTickets = localStorage.getItem(TICKETS_KEY);
      const allTickets: SimpleTicket[] = existingTickets ? JSON.parse(existingTickets) : [];
      
      const newTickets: SimpleTicket[] = Array.from({ length: remainingTickets }, () => ({
        id: `ticket_${Date.now()}_${Math.random()}`,
        user_id: userId,
        type: 'daily' as const,
        created_at: new Date().toISOString(),
        is_used: false,
      }));
      
      allTickets.push(...newTickets);
      localStorage.setItem(TICKETS_KEY, JSON.stringify(allTickets));
      
      return newTickets;
    } catch (error) {
      console.error('Error creating daily tickets:', error);
      return [];
    }
  },

  // Create task reward ticket
  createTaskRewardTicket(userId: string): SimpleTicket {
    try {
      const existingTickets = localStorage.getItem(TICKETS_KEY);
      const allTickets: SimpleTicket[] = existingTickets ? JSON.parse(existingTickets) : [];
      
      const newTicket: SimpleTicket = {
        id: `task_ticket_${Date.now()}_${Math.random()}`,
        user_id: userId,
        type: 'task_reward',
        created_at: new Date().toISOString(),
        is_used: false,
      };
      
      allTickets.push(newTicket);
      localStorage.setItem(TICKETS_KEY, JSON.stringify(allTickets));
      
      return newTicket;
    } catch (error) {
      console.error('Error creating task reward ticket:', error);
      throw error;
    }
  },

  // Use a ticket
  useTicket(ticketId: string): void {
    try {
      const existingTickets = localStorage.getItem(TICKETS_KEY);
      if (!existingTickets) throw new Error('No tickets found');
      
      const allTickets: SimpleTicket[] = JSON.parse(existingTickets);
      const ticketIndex = allTickets.findIndex(ticket => ticket.id === ticketId);
      
      if (ticketIndex === -1) throw new Error('Ticket not found');
      
      allTickets[ticketIndex].is_used = true;
      allTickets[ticketIndex].used_at = new Date().toISOString();
      
      localStorage.setItem(TICKETS_KEY, JSON.stringify(allTickets));
    } catch (error) {
      console.error('Error using ticket:', error);
      throw error;
    }
  },

  // Check if user can get daily tickets (24-hour cooldown)
  canGetDailyTickets(userId: string): boolean {
    const dailyCount = this.getDailyTicketsCount(userId);
    return dailyCount < 3;
  },

  // Get time until next daily tickets (in milliseconds)
  getTimeUntilNextDailyTickets(userId: string): number {
    try {
      const tickets = localStorage.getItem(TICKETS_KEY);
      if (!tickets) return 0;
      
      const allTickets: SimpleTicket[] = JSON.parse(tickets);
      const userDailyTickets = allTickets.filter(ticket => 
        ticket.user_id === userId && ticket.type === 'daily'
      );
      
      if (userDailyTickets.length === 0) return 0;
      
      // Get the oldest ticket from the last 3
      const sortedTickets = userDailyTickets
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      
      if (sortedTickets.length < 3) return 0;
      
      const oldestTicket = sortedTickets[sortedTickets.length - 1];
      const oldestTime = new Date(oldestTicket.created_at).getTime();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      const timeUntilNext = (oldestTime + twentyFourHours) - now;
      return Math.max(0, timeUntilNext);
    } catch (error) {
      console.error('Error calculating time until next daily tickets:', error);
      return 0;
    }
  },
};