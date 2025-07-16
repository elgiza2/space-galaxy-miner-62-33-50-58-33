
import { userReferralService } from '@/services/userReferralService';

export const referralTaskService = {
  // Check if user has completed a specific referral task
  async checkReferralTaskCompletion(username: string, taskTitle: string): Promise<boolean> {
    try {
      const stats = await userReferralService.getReferralStats(username);
      // Only count VERIFIED referrals for task completion
      const totalVerifiedReferrals = stats.totalReferrals;

      console.log(`Checking referral task "${taskTitle}" for user ${username}. Verified referrals: ${totalVerifiedReferrals}`);

      // Strict checking - only verified referrals count
      switch (taskTitle.toLowerCase()) {
        case 'invite your friend':
        case 'invite a friend':
        case 'refer a friend':
          return totalVerifiedReferrals >= 1;
        
        case 'invite 10 friends':
        case 'refer 10 friends':
          return totalVerifiedReferrals >= 10;
        
        case 'invite 50 friends':
        case 'refer 50 friends':
          return totalVerifiedReferrals >= 50;
        
        case 'invite 100 friends':
        case 'refer 100 friends':
          return totalVerifiedReferrals >= 100;
        
        default:
          console.log(`Unknown referral task: ${taskTitle}`);
          return false;
      }
    } catch (error) {
      console.error('Error checking referral task completion:', error);
      return false;
    }
  },

  // Get progress for a specific referral task
  async getReferralTaskProgress(username: string, taskTitle: string): Promise<{ current: number; required: number; percentage: number }> {
    try {
      const stats = await userReferralService.getReferralStats(username);
      // Only count VERIFIED referrals for progress
      const totalVerifiedReferrals = stats.totalReferrals;

      let required = 0;
      switch (taskTitle.toLowerCase()) {
        case 'invite your friend':
        case 'invite a friend':
        case 'refer a friend':
          required = 1;
          break;
        case 'invite 10 friends':
        case 'refer 10 friends':
          required = 10;
          break;
        case 'invite 50 friends':
        case 'refer 50 friends':
          required = 50;
          break;
        case 'invite 100 friends':
        case 'refer 100 friends':
          required = 100;
          break;
        default:
          required = 1;
      }

      const current = Math.min(totalVerifiedReferrals, required);
      const percentage = Math.round((current / required) * 100);

      return {
        current,
        required,
        percentage
      };
    } catch (error) {
      console.error('Error getting referral task progress:', error);
      return { current: 0, required: 1, percentage: 0 };
    }
  },

  // Claim referral task reward - only if task is actually completed
  async claimReferralTaskReward(username: string, taskTitle: string, rewardAmount: number): Promise<{ success: boolean; message: string }> {
    try {
      // First verify the task is actually completed based on verified referrals
      const isCompleted = await this.checkReferralTaskCompletion(username, taskTitle);
      
      if (!isCompleted) {
        const progress = await this.getReferralTaskProgress(username, taskTitle);
        return {
          success: false,
          message: `You need to invite ${progress.required - progress.current} more friends to complete this task`
        };
      }

      // Task is completed based on verified referrals, user can claim reward
      console.log(`User ${username} successfully completed referral task: ${taskTitle} with verified referrals`);
      
      return {
        success: true,
        message: `Congratulations! Task completed successfully and you received ${rewardAmount} reward`
      };
    } catch (error) {
      console.error('Error claiming referral task reward:', error);
      return {
        success: false,
        message: 'An error occurred while claiming the reward'
      };
    }
  }
};
