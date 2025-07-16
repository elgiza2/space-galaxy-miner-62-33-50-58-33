
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { unifiedReferralService } from '@/services/unifiedReferralService';

export const useUnifiedReferralSystem = () => {
  const [isProcessingReferral, setIsProcessingReferral] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const captureReferral = () => {
      try {
        console.log('🔍 Starting unified referral capture...');
        setIsProcessingReferral(true);
        
        const capturedCode = unifiedReferralService.captureReferralCode();
        
        if (capturedCode && capturedCode.trim() !== '') {
          setReferralCode(capturedCode);
          
          // Check if already processed
          const processedReferrals = JSON.parse(localStorage.getItem('processedReferrals') || '[]');
          
          if (!processedReferrals.includes(capturedCode)) {
            // Store for later processing
            const stored = unifiedReferralService.storeReferralCode(capturedCode);
            
            if (stored) {
              console.log('✅ Referral captured successfully:', capturedCode);
              
              toast({
                title: "Welcome! 🎉",
                description: `You were invited by ${capturedCode}. Complete signup to get 10,000 SPACE tokens!`,
                duration: 6000,
              });
              
              // Clean URL parameters
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            }
          } else {
            console.log('ℹ️ Referral already processed:', capturedCode);
          }
        } else {
          console.log('ℹ️ No referral code found');
        }
      } catch (error) {
        console.error('❌ Error in referral capture:', error);
      } finally {
        setIsProcessingReferral(false);
      }
    };

    captureReferral();
  }, [toast]);

  // Process referral after user signup with enhanced rewards
  const processReferralAfterSignup = async (newUsername: string, telegramId?: number) => {
    try {
      console.log('🔄 Processing enhanced referral after signup for:', newUsername);
      setIsProcessingReferral(true);
      
      const success = await unifiedReferralService.processReferralAfterSignup(newUsername);
      
      if (success) {
        // Show enhanced success messages with delay
        toast({
          title: "🎁 Enhanced Referral Bonus!",
          description: "You got 10,000 SPACE tokens for joining via referral!",
          duration: 5000,
        });
        
        setTimeout(() => {
          toast({
            title: "✅ Profile Created Successfully!",
            description: "Your account is now active and synced with database!",
            duration: 4000,
          });
        }, 1500);
        
        setTimeout(() => {
          toast({
            title: "🤝 Referrer Enhanced Bonus!",
            description: "The referrer got 10,000 SPACE + 0.001 TON as reward!",
            duration: 4000,
          });
        }, 3000);
        
        console.log('✅ Enhanced referral processed successfully');
        return true;
      } else {
        // Even if no referral, show welcome message
        toast({
          title: "Welcome to SPACE! 🚀",
          description: "Your account has been created and synced with database successfully!",
          duration: 4000,
        });
      }
      
      console.log('ℹ️ No referral to process or referral processing failed');
      return false;
    } catch (error) {
      console.error('❌ Error processing enhanced referral:', error);
      
      toast({
        title: "Account Created! 🎉",
        description: "Welcome to SPACE! Your account is being set up in the background.",
        variant: "default"
      });
      
      return false;
    } finally {
      setIsProcessingReferral(false);
    }
  };

  return {
    isProcessingReferral,
    referralCode,
    processReferralAfterSignup
  };
};
