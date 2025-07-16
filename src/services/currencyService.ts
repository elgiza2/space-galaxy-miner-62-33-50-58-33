import { supabase } from '@/integrations/supabase/client';

export interface CurrencyBalances {
  coins: number;
  spaceCoins: number;
  spins: number;
  
}

class CurrencyService {
  private static instance: CurrencyService;
  private listeners: ((balances: CurrencyBalances) => void)[] = [];

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  getBalances(): CurrencyBalances {
    return {
      coins: parseFloat(localStorage.getItem('coins') || '0'),
      spaceCoins: parseFloat(localStorage.getItem('spaceCoins') || '0'),
      spins: parseFloat(localStorage.getItem('spins') || '100'), // Start with 100 free spins
    };
  }

  async setCoins(amount: number, telegramId?: number): Promise<void> {
    localStorage.setItem('coins', amount.toString());
    
    if (telegramId) {
      await this.syncWithDatabase(telegramId, { coins: amount });
    }
    
    this.notifyListeners();
  }

  async setSpaceCoins(amount: number, telegramId?: number): Promise<void> {
    localStorage.setItem('spaceCoins', amount.toString());
    
    if (telegramId) {
      await this.syncWithDatabase(telegramId, { spaceCoins: amount });
    }
    
    this.notifyListeners();
  }

  async setSpins(amount: number, telegramId?: number): Promise<void> {
    localStorage.setItem('spins', amount.toString());
    
    if (telegramId) {
      await this.syncWithDatabase(telegramId, { spins: amount });
    }
    
    this.notifyListeners();
  }


  async addCoins(amount: number, telegramId?: number): Promise<void> {
    const current = this.getBalances().coins;
    await this.setCoins(current + amount, telegramId);
  }

  async addSpaceCoins(amount: number, telegramId?: number): Promise<void> {
    const current = this.getBalances().spaceCoins;
    await this.setSpaceCoins(current + amount, telegramId);
  }

  async addSpins(amount: number, telegramId?: number): Promise<void> {
    const current = this.getBalances().spins;
    await this.setSpins(current + amount, telegramId);
  }


  async subtractCoins(amount: number, telegramId?: number): Promise<boolean> {
    const current = this.getBalances().coins;
    if (current >= amount) {
      await this.setCoins(current - amount, telegramId);
      return true;
    }
    return false;
  }

  async subtractSpaceCoins(amount: number, telegramId?: number): Promise<boolean> {
    const current = this.getBalances().spaceCoins;
    if (current >= amount) {
      await this.setSpaceCoins(current - amount, telegramId);
      return true;
    }
    return false;
  }

  async subtractSpins(amount: number, telegramId?: number): Promise<boolean> {
    const current = this.getBalances().spins;
    if (current >= amount) {
      await this.setSpins(current - amount, telegramId);
      return true;
    }
    return false;
  }


  private async syncWithDatabase(telegramId: number, updates: Partial<CurrencyBalances>): Promise<void> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      // Store coins in a custom field or skip for now
      if (updates.spaceCoins !== undefined) updateData.earnings = updates.spaceCoins;
      // For now, we'll store spins and coins in localStorage only until we add the columns

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('telegram_id', telegramId);

      if (error) {
        console.error('Error syncing currency with database:', error);
      }
    } catch (error) {
      console.error('Error in syncWithDatabase:', error);
    }
  }

  async loadFromDatabase(telegramId: number): Promise<CurrencyBalances> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('earnings')
        .eq('telegram_id', telegramId)
        .single();

      if (error) {
        console.error('Error loading currency from database:', error);
        return this.getBalances();
      }

      const balances = {
        coins: parseFloat(localStorage.getItem('coins') || '0'), // Keep in localStorage for now
        spaceCoins: data?.earnings || 0,
        spins: parseFloat(localStorage.getItem('spins') || '100'), // Keep in localStorage for now
        
      };

      // Update local storage
      localStorage.setItem('coins', balances.coins.toString());
      localStorage.setItem('spaceCoins', balances.spaceCoins.toString());
      localStorage.setItem('spins', balances.spins.toString());
      
      
      this.notifyListeners();
      return balances;
    } catch (error) {
      console.error('Error in loadFromDatabase:', error);
      return this.getBalances();
    }
  }

  subscribe(listener: (balances: CurrencyBalances) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const balances = this.getBalances();
    this.listeners.forEach(listener => listener(balances));
  }
}

export const currencyService = CurrencyService.getInstance();