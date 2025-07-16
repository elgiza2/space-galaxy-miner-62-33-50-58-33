
import { supabase } from '@/integrations/supabase/client';

class SpaceCoinsService {
  private static instance: SpaceCoinsService;
  private storageKey = 'spaceCoins';
  private listeners: ((coins: number) => void)[] = [];

  private constructor() {}

  static getInstance(): SpaceCoinsService {
    if (!SpaceCoinsService.instance) {
      SpaceCoinsService.instance = new SpaceCoinsService();
    }
    return SpaceCoinsService.instance;
  }

  getCoins(): number {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? parseFloat(stored) : 0;
  }

  async setCoins(amount: number, telegramId?: number): Promise<void> {
    localStorage.setItem(this.storageKey, amount.toString());
    
    // Sync with database if telegram ID is available
    if (telegramId) {
      await this.syncWithDatabase(telegramId, amount);
    }
    
    this.notifyListeners(amount);
  }

  async addCoins(amount: number, telegramId?: number): Promise<void> {
    const currentCoins = this.getCoins();
    const newAmount = currentCoins + amount;
    await this.setCoins(newAmount, telegramId);
  }

  async subtractCoins(amount: number, telegramId?: number): Promise<boolean> {
    const currentCoins = this.getCoins();
    if (currentCoins >= amount) {
      const newAmount = currentCoins - amount;
      await this.setCoins(newAmount, telegramId);
      return true;
    }
    return false;
  }

  private async syncWithDatabase(telegramId: number, coins: number): Promise<void> {
    try {
      // Update the user's coins in the database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          earnings: coins,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', telegramId);

      if (error) {
        console.error('Error syncing coins with database:', error);
      } else {
        console.log(`Successfully synced ${coins} coins for user ${telegramId}`);
      }
    } catch (error) {
      console.error('Error in syncWithDatabase:', error);
    }
  }

  async loadCoinsFromDatabase(telegramId: number): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('earnings')
        .eq('telegram_id', telegramId)
        .single();

      if (error) {
        console.error('Error loading coins from database:', error);
        return this.getCoins(); // Return local storage value if database fails
      }

      const dbCoins = data?.earnings || 0;
      // Update local storage with database value
      localStorage.setItem(this.storageKey, dbCoins.toString());
      this.notifyListeners(dbCoins);
      
      return dbCoins;
    } catch (error) {
      console.error('Error in loadCoinsFromDatabase:', error);
      return this.getCoins();
    }
  }

  subscribe(listener: (coins: number) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(coins: number): void {
    this.listeners.forEach(listener => listener(coins));
  }
}

export const spaceCoinsService = SpaceCoinsService.getInstance();
