
import { useEffect, useState } from 'react';
import { enhancedReferralService } from '@/services/enhancedReferralService';
import { spaceCoinsService } from '@/services/spaceCoinsService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEnhancedReferralCapture = () => {
  const [isProcessingReferral, setIsProcessingReferral] = useState(false);
  const [referralEventId, setReferralEventId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const captureReferral = async () => {
      // Enhanced URL parameter capture
      const urlParams = new URLSearchParams(window.location.search);
      const referrer = urlParams.get("startapp") || urlParams.get("start") || urlParams.get("ref");
      
      console.log('Enhanced referral capture - URL params:', { referrer, fullUrl: window.location.href });
      
      if (referrer && referrer.trim() !== '') {
        // Check if this referral has already been processed
        const processedReferrals = JSON.parse(localStorage.getItem('processedReferrals') || '[]');
        
        if (!processedReferrals.includes(referrer)) {
          setIsProcessingReferral(true);
          
          try {
            console.log('Processing new referral:', referrer);
            
            // Store referral in database immediately
            const { data: eventId, error: eventError } = await supabase.rpc('process_referral_event', {
              p_event_type: 'web_link_clicked',
              p_referrer_username: referrer,
              p_referred_username: null,
              p_telegram_user_id: null,
              p_event_data: {
                source_url: window.location.href,
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                source: 'web_app'
              }
            });
            
            if (eventError) {
              console.error('Error logging referral event:', eventError);
            } else {
              console.log('Referral event logged with ID:', eventId);
              setReferralEventId(eventId);
            }
            
            // Store in localStorage for later processing
            localStorage.setItem('pendingReferrer', referrer);
            localStorage.setItem('referralEventId', eventId || '');
            
            // Add referral to processed list
            processedReferrals.push(referrer);
            localStorage.setItem('processedReferrals', JSON.stringify(processedReferrals));
            
            console.log(`Enhanced referral captured: ${referrer} with event ID: ${eventId}`);
            
            toast({
              title: "Welcome! 🎉",
              description: `You were invited by ${referrer}. Complete signup to receive 2000 SPACE coins bonus!`,
              duration: 6000,
            });
            
            // Clean URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
          } catch (error) {
            console.error('Error processing enhanced referral:', error);
            toast({
              title: "Welcome!",
              description: "Processing your referral link. Complete signup to receive bonuses!",
            });
          } finally {
            setIsProcessingReferral(false);
          }
        } else {
          console.log('Referral already processed:', referrer);
        }
      }
    };

    captureReferral();
  }, [toast]);

  // Enhanced referral processing after signup
  const processReferralAfterSignup = async (newUsername: string, telegramId?: number) => {
    const pendingReferrer = localStorage.getItem('pendingReferrer');
    const eventId = localStorage.getItem('referralEventId');
    
    if (pendingReferrer && pendingReferrer !== newUsername) {
      try {
        console.log(`Processing enhanced referral: ${pendingReferrer} referred ${newUsername}`);
        
        // Log user joined event
        await supabase.rpc('process_referral_event', {
          p_event_type: 'web_user_joined',
          p_referrer_username: pendingReferrer,
          p_referred_username: newUsername,
          p_telegram_user_id: telegramId || null,
          p_event_data: {
            original_event_id: eventId,
            signup_timestamp: new Date().toISOString(),
            source: 'web_app'
          }
        });
        
        // Find referrer profile
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id, referral_name')
          .eq('referral_name', pendingReferrer)
          .single();

        if (referrerProfile) {
          // Find or create referred user profile
          let referredProfile = null;
          
          if (telegramId) {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('telegram_id', telegramId)
              .single();
              
            referredProfile = existingProfile;
          }
          
          if (!referredProfile) {
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .insert({
                telegram_id: telegramId || null,
                username: newUsername,
                referral_name: newUsername,
                first_name: newUsername
              })
              .select()
              .single();
              
            if (profileError) {
              console.error('Error creating referred user profile:', profileError);
              return false;
            }
            
            referredProfile = newProfile;
          }

          // Create referral record
          const { data: referralRecord, error: referralError } = await supabase
            .from('user_referrals')
            .insert({
              referrer_username: pendingReferrer,
              referred_username: newUsername,
              referrer_profile_id: referrerProfile.id,
              referred_profile_id: referredProfile.id,
              verification_status: 'verified',
              verified_at: new Date().toISOString()
            })
            .select()
            .single();

          if (referralError) {
            console.error('Error creating referral record:', referralError);
            return false;
          }

          // Process comprehensive rewards
          const { data: rewardResult, error: rewardError } = await supabase.rpc(
            'process_comprehensive_referral_with_events',
            {
              referral_id: referralRecord.id,
              referred_username: newUsername,
              referrer_username: pendingReferrer
            }
          );

          if (rewardError) {
            console.error('Error processing comprehensive rewards:', rewardError);
          } else {
            console.log('Comprehensive referral processing completed:', rewardResult);
            
            // Award signup bonus immediately for UI feedback
            spaceCoinsService.addCoins(2000);
            
            toast({
              title: "🎁 Referral Bonus Received!",
              description: "You earned 2000 SPACE coins for joining through a referral!",
              duration: 5000,
            });
            
            toast({
              title: "✅ Referral Verified!",
              description: `Successfully linked to referrer ${pendingReferrer}. Both you and your referrer received rewards!`,
              duration: 5000,
            });
            
            // Show comprehensive reward details
            setTimeout(() => {
              toast({
                title: "🎯 Complete Reward Summary",
                description: "You: 2000 SPACE coins | Your referrer: 1000 SPACE + 0.005 TON + 1 Spin ticket",
                duration: 7000,
              });
            }, 2000);
          }
        }

        // Clean up localStorage
        localStorage.removeItem('pendingReferrer');
        localStorage.removeItem('referralEventId');
        
        return true;
        
      } catch (error) {
        console.error('Error processing enhanced referral after signup:', error);
        toast({
          title: "Referral Processing Error",
          description: "There was an issue processing your referral, but you received your welcome bonus!",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return false;
  };

  return {
    isProcessingReferral,
    referralEventId,
    processReferralAfterSignup
  };
};
