
import { getTelegramUser, initTelegramWebApp } from '@/utils/telegram';
import { supabase } from '@/integrations/supabase/client';
import { spaceCoinsService } from './spaceCoinsService';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type NewUserProfile = Database['public']['Tables']['profiles']['Insert'];

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export const telegramUserService = {
  // تهيئة تطبيق Telegram Web App
  initializeTelegramApp() {
    console.log('Initializing Telegram Web App...');
    return initTelegramWebApp();
  },

  // جلب بيانات المستخدم الحالي من Telegram
  getCurrentTelegramUser(): TelegramUserData | null {
    console.log('Getting current Telegram user...');
    const user = getTelegramUser();
    if (user) {
      console.log('Telegram user found:', user);
      
      // Get photo URL if available
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url) {
        user.photo_url = window.Telegram.WebApp.initDataUnsafe.user.photo_url;
        console.log('Photo URL from Telegram:', user.photo_url);
      }
      
      return user;
    }
    console.log('No Telegram user found');
    return null;
  },

  // تسجيل أو تحديث المستخدم في قاعدة البيانات
  async registerTelegramUser(telegramUser: TelegramUserData): Promise<UserProfile | null> {
    try {
      console.log('Registering Telegram user with photo:', telegramUser);
      
      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        throw checkError;
      }

      if (existingUser) {
        console.log('User already exists, syncing local coins with database...');
        // Load user's coins from database and sync with local storage
        const dbCoins = await spaceCoinsService.loadCoinsFromDatabase(telegramUser.id);
        
        // Update user info including photo
        const { data: updatedUser, error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name || null,
            username: telegramUser.username || null,
            photo_url: telegramUser.photo_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('telegram_id', telegramUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          throw updateError;
        }

        console.log('User updated with photo and coins synced:', updatedUser.photo_url);
        return updatedUser;
      } else {
        console.log('Creating new user with photo...');
        const referralName = `SPACE#${Math.floor(Math.random() * 900000) + 100000}`;
        const localCoins = spaceCoinsService.getCoins();

        // Create new user with current local coins
        const newUserData: NewUserProfile = {
          telegram_id: telegramUser.id,
          username: telegramUser.username || null,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || null,
          photo_url: telegramUser.photo_url || null,
          referral_name: referralName,
          earnings: localCoins // Save current local coins to database
        };

        const { data: newUser, error: createError } = await supabase
          .from('profiles')
          .insert(newUserData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }

        console.log('New user created with photo and coins saved:', newUser.photo_url, newUser.earnings);
        return newUser;
      }
    } catch (error) {
      console.error('Error in registerTelegramUser:', error);
      return null;
    }
  },

  // جلب ملف المستخدم بواسطة Telegram ID
  async getUserProfile(telegramId: number): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  // تهيئة جلسة المستخدم
  async initializeUserSession(): Promise<UserProfile | null> {
    try {
      this.initializeTelegramApp();
      const telegramUser = this.getCurrentTelegramUser();
      
      if (!telegramUser) {
        console.log('No Telegram user data available');
        return null;
      }

      const userProfile = await this.registerTelegramUser(telegramUser);
      
      if (userProfile) {
        // حفظ البيانات في localStorage للاستخدام السريع
        localStorage.setItem('telegramUser', JSON.stringify(telegramUser));
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('username', userProfile.referral_name);
        
        // تهيئة نظام اللغة بناءً على لغة تليجرام
        if (telegramUser.language_code) {
          console.log('Detected Telegram language:', telegramUser.language_code);
          // سيتم تحديد اللغة تلقائياً في languageService
        }
        
        console.log('User session initialized successfully with photo:', userProfile.photo_url);
      }

      return userProfile;
    } catch (error) {
      console.error('Error initializing user session:', error);
      return null;
    }
  },

  // جلب صورة المستخدم من Telegram
  getTelegramUserPhoto(telegramUser: TelegramUserData): string | null {
    return telegramUser.photo_url || null;
  },

  // جلب الاسم الكامل للمستخدم
  getFullName(telegramUser: TelegramUserData): string {
    const firstName = telegramUser.first_name || '';
    const lastName = telegramUser.last_name || '';
    return `${firstName} ${lastName}`.trim() || telegramUser.username || `User ${telegramUser.id}`;
  },

  // جلب الاسم الأول للمستخدم
  getFirstName(telegramUser: TelegramUserData): string {
    return telegramUser.first_name || telegramUser.username || `User ${telegramUser.id}`;
  }
};
