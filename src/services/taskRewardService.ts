import { simpleTicketService } from './simpleTicketService';

export const taskRewardService = {
  // Give ticket reward when a task is completed
  giveTicketReward(userId: string): void {
    try {
      simpleTicketService.createTaskRewardTicket(userId);
      console.log(`Ticket reward given to user ${userId} for completing a task`);
    } catch (error) {
      console.error('Error giving ticket reward:', error);
    }
  },

  // Check if user should get a ticket reward (could be based on task type, frequency, etc.)
  shouldGiveTicketReward(taskType?: string): boolean {
    // For now, give a ticket for every task completion
    // In the future, this could be more sophisticated
    return true;
  },
};