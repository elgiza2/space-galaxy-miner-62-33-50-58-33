import { simpleTicketService, SimpleTicket } from './simpleTicketService';

export interface EnhancedTicket extends SimpleTicket {
  value?: number;
  game_type?: string;
  description?: string;
}

export const enhancedTicketService = {
  // استخدام الخدمة البسيطة مع تحسينات
  getUserTickets(userId: string): EnhancedTicket[] {
    return simpleTicketService.getUserTickets(userId);
  },

  getDailyTicketsCount(userId: string): number {
    return simpleTicketService.getDailyTicketsCount(userId);
  },

  createDailyTickets(userId: string): EnhancedTicket[] {
    return simpleTicketService.createDailyTickets(userId);
  },

  useTicket(ticketId: string): void {
    return simpleTicketService.useTicket(ticketId);
  },

  canGetDailyTickets(userId: string): boolean {
    return simpleTicketService.canGetDailyTickets(userId);
  },

  // Get time until next daily tickets
  getTimeUntilNextDailyTickets(userId: string): number {
    return simpleTicketService.getTimeUntilNextDailyTickets(userId);
  },

  // Create task reward ticket
  createTaskRewardTicket(userId: string): EnhancedTicket {
    const existingTickets = localStorage.getItem('user_tickets');
    const allTickets: EnhancedTicket[] = existingTickets ? JSON.parse(existingTickets) : [];
    
    const newTicket: EnhancedTicket = {
      id: `task_ticket_${Date.now()}_${Math.random()}`,
      user_id: userId,
      type: 'task_reward',
      created_at: new Date().toISOString(),
      is_used: false,
      value: 1000,
      description: 'Task completion reward ticket'
    };
    
    allTickets.push(newTicket);
    localStorage.setItem('user_tickets', JSON.stringify(allTickets));
    
    return newTicket;
  },

  // Create premium ticket
  createPremiumTicket(userId: string, value: number = 2000): EnhancedTicket {
    const existingTickets = localStorage.getItem('user_tickets');
    const allTickets: EnhancedTicket[] = existingTickets ? JSON.parse(existingTickets) : [];
    
    const newTicket: EnhancedTicket = {
      id: `premium_ticket_${Date.now()}_${Math.random()}`,
      user_id: userId,
      type: 'premium',
      created_at: new Date().toISOString(),
      is_used: false,
      value: value,
      description: `Premium ticket worth ${value} coins`
    };
    
    allTickets.push(newTicket);
    localStorage.setItem('user_tickets', JSON.stringify(allTickets));
    
    return newTicket;
  },

  // Create special event ticket
  createEventTicket(userId: string, gameType: string, expiresHours: number = 24): EnhancedTicket {
    const existingTickets = localStorage.getItem('user_tickets');
    const allTickets: EnhancedTicket[] = existingTickets ? JSON.parse(existingTickets) : [];
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresHours);
    
    const newTicket: EnhancedTicket = {
      id: `event_ticket_${Date.now()}_${Math.random()}`,
      user_id: userId,
      type: 'premium',
      created_at: new Date().toISOString(),
      is_used: false,
      expires_at: expiresAt.toISOString(),
      game_type: gameType,
      value: 1500,
      description: `Special event ticket for ${gameType} game`
    };
    
    allTickets.push(newTicket);
    localStorage.setItem('user_tickets', JSON.stringify(allTickets));
    
    return newTicket;
  },

  // Get tickets by type
  getTicketsByType(userId: string, type: SimpleTicket['type']): EnhancedTicket[] {
    const tickets = this.getUserTickets(userId);
    return tickets.filter(ticket => ticket.type === type);
  },

  // Clean expired tickets
  cleanExpiredTickets(): void {
    try {
      const existingTickets = localStorage.getItem('user_tickets');
      if (!existingTickets) return;
      
      const allTickets: EnhancedTicket[] = JSON.parse(existingTickets);
      const now = new Date();
      
      // Filter out expired tickets
      const validTickets = allTickets.filter(ticket => {
        if (!ticket.expires_at) return true;
        return new Date(ticket.expires_at) > now;
      });
      
      // Only update if there's a change
      if (validTickets.length !== allTickets.length) {
        localStorage.setItem('user_tickets', JSON.stringify(validTickets));
        console.log(`Cleaned ${allTickets.length - validTickets.length} expired tickets`);
      }
    } catch (error) {
      console.error('Error cleaning expired tickets:', error);
    }
  },

  // Ticket statistics
  getTicketStats(userId: string): {
    total: number;
    used: number;
    expired: number;
    available: number;
    byType: Record<string, number>;
  } {
    try {
      const existingTickets = localStorage.getItem('user_tickets');
      if (!existingTickets) {
        return { total: 0, used: 0, expired: 0, available: 0, byType: {} };
      }
      
      const allTickets: EnhancedTicket[] = JSON.parse(existingTickets);
      const userTickets = allTickets.filter(ticket => ticket.user_id === userId);
      const now = new Date();
      
      const stats = {
        total: userTickets.length,
        used: 0,
        expired: 0,
        available: 0,
        byType: {} as Record<string, number>,
      };
      
      userTickets.forEach(ticket => {
        stats.byType[ticket.type] = (stats.byType[ticket.type] || 0) + 1;
        
        if (ticket.is_used) {
          stats.used++;
        } else if (ticket.expires_at && new Date(ticket.expires_at) < now) {
          stats.expired++;
        } else {
          stats.available++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting ticket stats:', error);
      return { total: 0, used: 0, expired: 0, available: 0, byType: {} };
    }
  },

  // Grant welcome tickets for new users
  grantWelcomeTickets(userId: string): EnhancedTicket[] {
    const welcomeTickets: EnhancedTicket[] = [];
    
    // 5 welcome tickets
    for (let i = 0; i < 5; i++) {
      const ticket = this.createPremiumTicket(userId, 1000);
      ticket.description = 'Welcome ticket';
      welcomeTickets.push(ticket);
    }
    
    return welcomeTickets;
  },

  // Purchase tickets with coins
  purchaseTickets(userId: string, count: number, coinCost: number): EnhancedTicket[] {
    const existingTickets = localStorage.getItem('user_tickets');
    const allTickets: EnhancedTicket[] = existingTickets ? JSON.parse(existingTickets) : [];
    
    const purchasedTickets: EnhancedTicket[] = [];
    
    for (let i = 0; i < count; i++) {
      const newTicket: EnhancedTicket = {
        id: `purchased_ticket_${Date.now()}_${Math.random()}_${i}`,
        user_id: userId,
        type: 'premium',
        created_at: new Date().toISOString(),
        is_used: false,
        value: coinCost / count,
        description: `Purchased ticket for ${coinCost / count} coins`
      };
      
      purchasedTickets.push(newTicket);
      allTickets.push(newTicket);
    }
    
    localStorage.setItem('user_tickets', JSON.stringify(allTickets));
    return purchasedTickets;
  },

  // Get ticket value
  getTicketValue(ticket: EnhancedTicket): number {
    switch (ticket.type) {
      case 'daily':
        return 500;
      case 'task_reward':
        return ticket.value || 1000;
      case 'premium':
        return ticket.value || 2000;
      default:
        return ticket.value || 500;
    }
  },
};