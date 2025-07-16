
import { useUnifiedReferralSystem } from './useUnifiedReferralSystem';

// Wrapper hook for backward compatibility
export const useUnifiedReferralCapture = () => {
  return useUnifiedReferralSystem();
};
