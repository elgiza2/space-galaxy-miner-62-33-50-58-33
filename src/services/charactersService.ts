import { tonService } from './tonService';

export interface Character {
  id: string;
  name: string;
  image: string;
  description: string;
  isFree: boolean;
  basePrice: number;
  currency: 'SPACE' | 'TON';
  miningSpeedBonus: number; // e.g., 1.5 = 50% boost
  miningTimeBonus: number; // additional minutes
  coinMultiplier: number; // e.g., 2 = double coins
  maxLevel: number;
}

export interface UserCharacter {
  characterId: string;
  level: number;
  isOwned: boolean;
  isActive: boolean;
}

class CharactersService {
  private static instance: CharactersService;
  private storageKey = 'userCharacters';

  private constructor() {}

  static getInstance(): CharactersService {
    if (!CharactersService.instance) {
      CharactersService.instance = new CharactersService();
    }
    return CharactersService.instance;
  }

  getAvailableCharacters(): Character[] {
    return [
      {
        id: 'woody',
        name: 'Woody',
        image: '/lovable-uploads/f75d9c7d-819f-438d-8b0c-9297447ecb4f.png',
        description: 'Galaxy Sheriff - Free character',
        isFree: true,
        basePrice: 0,
        currency: 'SPACE',
        miningSpeedBonus: 1.2,
        miningTimeBonus: 30,
        coinMultiplier: 1.1,
        maxLevel: 10
      },
      {
        id: 'vanellope',
        name: 'Vanellope',
        image: '/lovable-uploads/1146016c-c34f-4cb9-b5dd-da717203faa0.png',
        description: 'Racing Princess - Super speed',
        isFree: false,
        basePrice: 50000,
        currency: 'SPACE',
        miningSpeedBonus: 2.0,
        miningTimeBonus: 60,
        coinMultiplier: 1.5,
        maxLevel: 15
      },
      {
        id: 'rapunzel',
        name: 'Rapunzel',
        image: '/lovable-uploads/01616110-2de4-43c1-a7de-4ab8fdbf4d2a.png',
        description: 'Magic Princess - Double coins',
        isFree: false,
        basePrice: 0.8,
        currency: 'TON',
        miningSpeedBonus: 1.8,
        miningTimeBonus: 90,
        coinMultiplier: 2.0,
        maxLevel: 20
      },
      {
        id: 'stitch',
        name: 'Stitch',
        image: '/lovable-uploads/e29baf9d-c4aa-444d-9f4f-1ead9b4305b4.png',
        description: 'Space Monster - Super power',
        isFree: false,
        basePrice: 100000,
        currency: 'SPACE',
        miningSpeedBonus: 3.0,
        miningTimeBonus: 120,
        coinMultiplier: 2.5,
        maxLevel: 25
      },
      {
        id: 'mike',
        name: 'Mike',
        image: '/lovable-uploads/04c409ef-9edb-4fd3-8140-0472aa1fe836.png',
        description: 'Energy Monster - Maximum speed',
        isFree: false,
        basePrice: 1.5,
        currency: 'TON',
        miningSpeedBonus: 4.0,
        miningTimeBonus: 180,
        coinMultiplier: 3.0,
        maxLevel: 30
      },
      {
        id: 'elsa',
        name: 'Elsa',
        image: '/lovable-uploads/40b20292-0324-4fbf-bdfc-8051c54c4c84.png',
        description: 'Ice Queen - Magical power',
        isFree: false,
        basePrice: 2.8,
        currency: 'TON',
        miningSpeedBonus: 5.0,
        miningTimeBonus: 240,
        coinMultiplier: 4.0,
        maxLevel: 50
      },
      {
        id: 'boss_baby',
        name: 'Boss Baby',
        image: '/lovable-uploads/a2825bad-ce0b-4adb-83f7-be2bfcc33afc.png',
        description: 'Business Genius - Strategic mining',
        isFree: false,
        basePrice: 5.2,
        currency: 'TON',
        miningSpeedBonus: 6.0,
        miningTimeBonus: 300,
        coinMultiplier: 5.0,
        maxLevel: 60
      },
      {
        id: 'remy',
        name: 'Remy',
        image: '/lovable-uploads/aec16f8d-0efa-406c-96af-4de7ac322269.png',
        description: 'Chef Master - Cooking up coins',
        isFree: false,
        basePrice: 3.1,
        currency: 'TON',
        miningSpeedBonus: 3.5,
        miningTimeBonus: 200,
        coinMultiplier: 2.8,
        maxLevel: 35
      },
      {
        id: 'minions',
        name: 'Minions',
        image: '/lovable-uploads/3b858106-5338-42f9-9f75-00243780cc16.png',
        description: 'Yellow Workers - Team mining',
        isFree: false,
        basePrice: 4.2,
        currency: 'TON',
        miningSpeedBonus: 4.5,
        miningTimeBonus: 250,
        coinMultiplier: 3.5,
        maxLevel: 40
      },
      {
        id: 'jake',
        name: 'Jake',
        image: '/lovable-uploads/d4660572-2203-4010-b6b3-6e01ec97d179.png',
        description: 'Adventure Dog - Shape-shifting power',
        isFree: false,
        basePrice: 1.8,
        currency: 'TON',
        miningSpeedBonus: 2.5,
        miningTimeBonus: 150,
        coinMultiplier: 2.2,
        maxLevel: 25
      },
      {
        id: 'clarence',
        name: 'Clarence',
        image: '/lovable-uploads/609bb7c6-bd94-4162-9e1b-f8163791a4e2.png',
        description: 'Happy Kid - Optimistic mining',
        isFree: false,
        basePrice: 1.2,
        currency: 'TON',
        miningSpeedBonus: 2.0,
        miningTimeBonus: 120,
        coinMultiplier: 1.8,
        maxLevel: 20
      },
      {
        id: 'bart',
        name: 'Bart Simpson',
        image: '/lovable-uploads/93971844-eaa6-4b03-9c2f-ea78ced52900.png',
        description: 'Mischief Maker - Rebellious mining',
        isFree: false,
        basePrice: 2.3,
        currency: 'TON',
        miningSpeedBonus: 3.2,
        miningTimeBonus: 180,
        coinMultiplier: 2.5,
        maxLevel: 30
      },
      {
        id: 'tom',
        name: 'Tom Cat',
        image: '/lovable-uploads/7fabd3c5-1b59-4e8f-9958-5c99d6b3d880.png',
        description: 'Chase Master - Persistent mining',
        isFree: false,
        basePrice: 1.6,
        currency: 'TON',
        miningSpeedBonus: 2.8,
        miningTimeBonus: 160,
        coinMultiplier: 2.3,
        maxLevel: 28
      },
      {
        id: 'bugs',
        name: 'Bugs Bunny',
        image: '/lovable-uploads/1c66f9fb-1b9d-4196-ad4b-fc35860a4919.png',
        description: 'Wise Guy - Smart mining tactics',
        isFree: false,
        basePrice: 3.5,
        currency: 'TON',
        miningSpeedBonus: 4.2,
        miningTimeBonus: 220,
        coinMultiplier: 3.2,
        maxLevel: 38
      },
      {
        id: 'pink_panther',
        name: 'Pink Panther',
        image: '/lovable-uploads/909871de-a0e8-4c8d-a4ed-6de4e692ae8b.png',
        description: 'Cool Cat - Stylish mining',
        isFree: false,
        basePrice: 4.8,
        currency: 'TON',
        miningSpeedBonus: 4.8,
        miningTimeBonus: 280,
        coinMultiplier: 3.8,
        maxLevel: 45
      }
    ];
  }

  getUserCharacters(): UserCharacter[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      // Initialize with free character
      const defaultCharacters: UserCharacter[] = [
        {
          characterId: 'woody',
          level: 1,
          isOwned: true,
          isActive: true
        }
      ];
      this.saveUserCharacters(defaultCharacters);
      return defaultCharacters;
    }
    return JSON.parse(stored);
  }

  saveUserCharacters(characters: UserCharacter[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(characters));
  }

  async purchaseCharacter(characterId: string, tonConnectUI?: any): Promise<boolean> {
    const character = this.getAvailableCharacters().find(c => c.id === characterId);
    if (!character) return false;

    const userCharacters = this.getUserCharacters();
    const existingChar = userCharacters.find(c => c.characterId === characterId);
    
    if (existingChar && existingChar.isOwned) return false;

    // Handle TON payments
    if (character.currency === 'TON') {
      try {
        // Check if TonConnect UI is available and wallet is connected
        if (!tonConnectUI || !tonConnectUI.wallet) {
          console.error('TonConnect UI not available or wallet not connected');
          throw new Error('Wallet not connected');
        }

        // Simple transaction without any payload or comment to prevent format errors
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
          messages: [
            {
              address: 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R', // Your TON address
              amount: (character.basePrice * 1e9).toString(), // Convert to nanoTON
            },
          ],
        };

        console.log('إرسال معاملة TON بسيطة لشراء الشخصية:', transaction);
        
        // Send the actual transaction using TonConnect UI
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('نتيجة معاملة TON:', result);
        
        // If we get here, the transaction was successful
        console.log('معاملة TON نجحت لشراء الشخصية');
        
      } catch (error) {
        console.error('فشل دفع TON:', error);
        throw error;
      }
    } else if (character.currency === 'SPACE') {
      // Check if user has enough SPACE coins
      const spaceCoins = parseFloat(localStorage.getItem('spaceCoins') || '0');
      if (spaceCoins < character.basePrice) return false;
      
      // Deduct coins
      const newBalance = spaceCoins - character.basePrice;
      localStorage.setItem('spaceCoins', newBalance.toString());
    }

    // Add or update character
    if (existingChar) {
      existingChar.isOwned = true;
    } else {
      userCharacters.push({
        characterId,
        level: 1,
        isOwned: true,
        isActive: false
      });
    }

    this.saveUserCharacters(userCharacters);
    return true;
  }

  async upgradeCharacter(characterId: string, tonConnectUI?: any): Promise<boolean> {
    const character = this.getAvailableCharacters().find(c => c.id === characterId);
    const userCharacters = this.getUserCharacters();
    const userChar = userCharacters.find(c => c.characterId === characterId);

    if (!character || !userChar || !userChar.isOwned || userChar.level >= character.maxLevel) {
      return false;
    }

    const upgradeCost = this.getUpgradeCost(characterId, userChar.level);
    
    // Handle TON payments for upgrades
    if (character.currency === 'TON') {
      try {
        if (!tonConnectUI || !tonConnectUI.wallet) {
          console.error('TonConnect UI not available or wallet not connected');
          throw new Error('Wallet not connected');
        }

        // Simple transaction without any payload or comment
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R',
              amount: (upgradeCost * 1e9).toString(),
            },
          ],
        };

        console.log('إرسال معاملة TON بسيطة لترقية الشخصية:', transaction);
        
        // Send the actual transaction using TonConnect UI
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('نتيجة معاملة الترقية TON:', result);
        
        console.log('معاملة ترقية TON نجحت');
        
      } catch (error) {
        console.error('فشل دفع ترقية TON:', error);
        throw error;
      }
    } else if (character.currency === 'SPACE') {
      const spaceCoins = parseFloat(localStorage.getItem('spaceCoins') || '0');
      if (spaceCoins < upgradeCost) return false;
      
      const newBalance = spaceCoins - upgradeCost;
      localStorage.setItem('spaceCoins', newBalance.toString());
    }

    userChar.level += 1;
    this.saveUserCharacters(userCharacters);
    return true;
  }

  getUpgradeCost(characterId: string, currentLevel: number): number {
    const character = this.getAvailableCharacters().find(c => c.id === characterId);
    if (!character) return 0;
    
    if (character.currency === 'SPACE') {
      return character.basePrice * (currentLevel + 1) * 0.5;
    } else {
      return character.basePrice * (currentLevel + 1) * 0.2;
    }
  }

  toggleCharacterActive(characterId: string): boolean {
    const userCharacters = this.getUserCharacters();
    const targetChar = userCharacters.find(c => c.characterId === characterId);
    
    if (!targetChar || !targetChar.isOwned) return false;

    // Toggle the character's active state
    targetChar.isActive = !targetChar.isActive;
    
    this.saveUserCharacters(userCharacters);
    this.updateMiningBonus();
    return true;
  }

  getActiveCharacters(): { character: Character; userChar: UserCharacter }[] {
    const userCharacters = this.getUserCharacters();
    const activeUserChars = userCharacters.filter(c => c.isActive);
    
    const activeCharacters: { character: Character; userChar: UserCharacter }[] = [];
    
    activeUserChars.forEach(userChar => {
      const character = this.getAvailableCharacters().find(c => c.id === userChar.characterId);
      if (character) {
        activeCharacters.push({ character, userChar });
      }
    });
    
    return activeCharacters;
  }

  private updateMiningBonus(): void {
    const activeCharacters = this.getActiveCharacters();
    if (activeCharacters.length === 0) return;
    
    // Combine bonuses from all active characters
    let totalSpeedBonus = 1;
    let totalCoinMultiplier = 1;
    
    activeCharacters.forEach(({ character, userChar }) => {
      const levelBonus = userChar.level * 0.1;
      totalSpeedBonus += character.miningSpeedBonus + levelBonus - 1;
      totalCoinMultiplier += character.coinMultiplier + levelBonus - 1;
    });
    
    localStorage.setItem('miningSpeed', totalSpeedBonus.toString());
    localStorage.setItem('coinMultiplier', totalCoinMultiplier.toString());
  }

  getMiningBonuses(): { speedBonus: number; timeBonus: number; coinMultiplier: number } {
    const activeCharacters = this.getActiveCharacters();
    if (activeCharacters.length === 0) return { speedBonus: 1, timeBonus: 0, coinMultiplier: 1 };
    
    let totalSpeedBonus = 1;
    let totalTimeBonus = 0;
    let totalCoinMultiplier = 1;
    
    activeCharacters.forEach(({ character, userChar }) => {
      const levelBonus = userChar.level * 0.1;
      totalSpeedBonus += character.miningSpeedBonus + levelBonus - 1;
      totalTimeBonus += character.miningTimeBonus + (userChar.level * 10);
      totalCoinMultiplier += character.coinMultiplier + levelBonus - 1;
    });
    
    return {
      speedBonus: totalSpeedBonus,
      timeBonus: totalTimeBonus,
      coinMultiplier: totalCoinMultiplier
    };
  }
}

export const charactersService = CharactersService.getInstance();
