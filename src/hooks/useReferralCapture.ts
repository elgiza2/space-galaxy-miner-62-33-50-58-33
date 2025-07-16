
import { useUnifiedReferralSystem } from './useUnifiedReferralSystem';

// Hook for referral capture functionality
export const useReferralCapture = () => {
  const unifiedHook = useUnifiedReferralSystem();
  
  return {
    isProcessingReferral: unifiedHook.isProcessingReferral,
    processReferralAfterSignup: unifiedHook.processReferralAfterSignup
  };
};
