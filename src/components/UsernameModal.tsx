
import React, { useEffect } from 'react';
import { useUnifiedReferralCapture } from '@/hooks/useUnifiedReferralCapture';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UsernameModalProps {
  isOpen: boolean;
  onComplete: (username: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onComplete }) => {
  const { toast } = useToast();
  const { processReferralAfterSignup } = useUnifiedReferralCapture();

  const generateDefaultUsername = () => {
    const randomNumber = Math.floor(Math.random() * 999999) + 100000;
    return `SPACE#${randomNumber}`;
  };

  const createUserProfile = async (username: string) => {
    try {
      console.log('🔄 Creating user profile for:', username);
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_name', username)
        .maybeSingle();
      
      if (existingProfile) {
        console.log('✅ Profile already exists:', existingProfile);
        return existingProfile;
      }

      // Create new profile
      const fakeTelegramId = Date.now() + Math.floor(Math.random() * 1000);
      
      const profileData = {
        telegram_id: fakeTelegramId,
        referral_name: username,
        username: username,
        first_name: username,
        earnings: parseInt(localStorage.getItem('spaceCoins') || '0')
      };

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
      }

      console.log('✅ Profile created successfully:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('❌ Error in createUserProfile:', error);
      throw error;
    }
  };

  const createUsername = async () => {
    if (!isOpen) return;

    let username = generateDefaultUsername();
    
    try {
      console.log('🆕 Creating new user with username:', username);
      
      // Check if this is a new user
      const existingCoins = localStorage.getItem('spaceCoins');
      const isNewUser = !existingCoins;
      
      // Save username to localStorage
      localStorage.setItem('username', username);
      
      // New users start with 0 coins (unless they have a referral)
      if (isNewUser) {
        localStorage.setItem('spaceCoins', '0');
        console.log('💰 New user starts with 0 coins');
      }

      // Create user profile in database
      await createUserProfile(username);
      
      // Process any pending referral
      const referralProcessed = await processReferralAfterSignup(username);
      
      if (!referralProcessed) {
        toast({
          title: "Welcome to SPACE! 🚀",
          description: "Your account has been created successfully",
          duration: 3000,
        });
      }
      
      // Complete the process
      onComplete(username);
    } catch (error) {
      console.error('❌ Error during username creation:', error);
      
      toast({
        title: "Account Created! 🎉",
        description: "Welcome to SPACE! Your profile is being set up.",
        duration: 3000,
      });
      
      // Still complete with the username even if profile creation fails
      onComplete(username);
    }
  };

  useEffect(() => {
    if (isOpen) {
      createUsername();
    }
  }, [isOpen]);

  // This component is now invisible and works automatically
  return null;
};

export default UsernameModal;
