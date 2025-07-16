
import { useEffect, useState } from 'react';
import { enhancedReferralService } from '@/services/enhancedReferralService';
import { useToast } from '@/hooks/use-toast';
import { getReferralCode } from '@/utils/telegram';

export const useTelegramMiniAppReferral = () => {
  const [isProcessingReferral, setIsProcessingReferral] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const captureReferralFromTelegram = async () => {
      try {
        // Get referral code from Telegram Mini App start parameter
        const telegramReferralCode = getReferralCode();
        
        console.log('Telegram Mini App referral code:', telegramReferralCode);
        
        if (telegramReferralCode && telegramReferralCode.trim() !== '') {
          setReferralCode(telegramReferralCode);
          setIsProcessingReferral(true);
          
          // Check if this referral has already been processed
          const processedReferrals = JSON.parse(localStorage.getItem('processedReferrals') || '[]');
          
          if (!processedReferrals.includes(telegramReferralCode)) {
            // Store referral for later processing
            localStorage.setItem('pendingReferrer', telegramReferralCode);
            
            // Add to processed list to avoid duplicates
            processedReferrals.push(telegramReferralCode);
            localStorage.setItem('processedReferrals', JSON.stringify(processedReferrals));
            
            console.log(`Telegram Mini App referral captured: ${telegramReferralCode}`);
            
            toast({
              title: "مرحباً! 🎉",
              description: `تمت دعوتك من قبل ${telegramReferralCode}. أكمل التسجيل للحصول على مكافأة 2000 عملة SPACE!`,
              duration: 6000,
            });
          } else {
            console.log('Referral already processed:', telegramReferralCode);
          }
          
          setIsProcessingReferral(false);
        }
      } catch (error) {
        console.error('Error processing Telegram Mini App referral:', error);
        setIsProcessingReferral(false);
      }
    };

    captureReferralFromTelegram();
  }, [toast]);

  // Process referral after user signup - Pure Mini App version
  const processReferralAfterSignup = async (newUsername: string, telegramId?: number) => {
    const pendingReferrer = localStorage.getItem('pendingReferrer');
    
    if (pendingReferrer && pendingReferrer !== newUsername) {
      try {
        console.log(`Processing Telegram Mini App referral: ${pendingReferrer} referred ${newUsername}`);
        
        const success = await enhancedReferralService.processReferralAfterSignupWithTracking(
          newUsername, 
          telegramId
        );
        
        if (success) {
          toast({
            title: "🎁 تم استلام مكافأة الإحالة!",
            description: "لقد حصلت على 2000 عملة SPACE لانضمامك عبر رابط إحالة!",
            duration: 5000,
          });
          
          toast({
            title: "✅ تم التحقق من الإحالة!",
            description: `تم ربطك بنجاح بالمُحيل ${pendingReferrer}. كلاكما حصل على مكافآت!`,
            duration: 5000,
          });
        }
        
        // Clean up localStorage
        localStorage.removeItem('pendingReferrer');
        
        return success;
        
      } catch (error) {
        console.error('Error processing Telegram Mini App referral after signup:', error);
        toast({
          title: "خطأ في معالجة الإحالة",
          description: "حدث خطأ في معالجة الإحالة، لكنك حصلت على مكافأة الترحيب!",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return false;
  };

  return {
    isProcessingReferral,
    referralCode,
    processReferralAfterSignup
  };
};
