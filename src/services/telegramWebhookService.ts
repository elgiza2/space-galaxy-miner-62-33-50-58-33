
import { supabase } from '@/integrations/supabase/client';

export const telegramWebhookService = {
  // Set up Telegram webhook
  async setupWebhook(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Setting up Telegram webhook...');
      
      // Call the Supabase Edge Function to setup webhook
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        method: 'GET'
      });
      
      // Also try with query parameter approach
      const setupUrl = `https://gisvsmavwxvdfwkamcxs.supabase.co/functions/v1/telegram-webhook?action=setup`;
      const setupResponse = await fetch(setupUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpc3ZzbWF2d3h2ZGZ3a2FtY3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTY0ODIsImV4cCI6MjA2NTEzMjQ4Mn0.z8lNH16fscq0P2QQbqAlUwi06MN8caNICGHONYI-5pM`,
          'Content-Type': 'application/json',
        }
      });
      
      const setupData = await setupResponse.json();
      
      if (setupData && setupData.success) {
        console.log('Telegram webhook configured successfully');
        return { success: true, message: 'Webhook configured successfully' };
      } else if (error) {
        console.error('Error calling webhook function:', error);
        return { success: false, message: error.message || 'Failed to setup webhook' };
      } else {
        console.error('Failed to configure webhook:', setupData);
        return { success: false, message: setupData?.error || 'Failed to configure webhook' };
      }
    } catch (error) {
      console.error('Error setting up webhook:', error);
      return { success: false, message: 'Error setting up webhook' };
    }
  },

  // Check webhook status
  async checkWebhookStatus(): Promise<{ configured: boolean; info?: any }> {
    try {
      console.log('Checking webhook status...');
      
      // Call the Supabase Edge Function to check status
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        method: 'GET'
      });
      
      if (error) {
        console.error('Error checking webhook status:', error);
        return { configured: false };
      }
      
      return { 
        configured: data?.configured || false, 
        info: data 
      };
    } catch (error) {
      console.error('Error checking webhook status:', error);
      return { configured: false };
    }
  },

  // Test webhook connectivity
  async testWebhook(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Testing webhook connectivity...');
      
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        method: 'GET'
      });
      
      if (error) {
        return { success: false, message: `Webhook test failed: ${error.message}` };
      }
      
      if (data?.configured) {
        return { success: true, message: 'Webhook is active and configured correctly' };
      } else {
        return { success: false, message: 'Webhook is not configured. Please run setup first.' };
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      return { success: false, message: 'Error testing webhook connectivity' };
    }
  }
};
