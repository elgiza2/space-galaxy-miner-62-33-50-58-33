
import { clanService } from './clanService';

interface MiningSession {
  characterId: string;
  startTime: number;
  endTime: number;
  miningRate: number;
  isActive: boolean;
  currentCoinsEarned: number;
  totalDuration: number;
}

const MINING_STATE_KEY = 'miningState';

class CharacterMiningService {
  private activeMining: { [characterId: string]: MiningSession } = {};
  private timers: { [characterId: string]: NodeJS.Timeout } = {};

  constructor() {
    this.loadMiningState();
  }

  private loadMiningState() {
    try {
      const storedState = localStorage.getItem(MINING_STATE_KEY);
      if (storedState) {
        this.activeMining = JSON.parse(storedState);
        
        // Check if mining sessions are still valid and restart timers
        Object.keys(this.activeMining).forEach(characterId => {
          const session = this.activeMining[characterId];
          if (session.isActive) {
            const now = Date.now();
            
            // Check if mining time has expired
            if (now >= session.endTime) {
              console.log(`Mining session for ${characterId} has expired, completing it`);
              this.stopMining(characterId, true);
            } else {
              // Restart timer for active sessions
              this.startMiningTimer(characterId);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to load mining state from localStorage:', error);
      // Clear corrupted state
      localStorage.removeItem(MINING_STATE_KEY);
      this.activeMining = {};
    }
  }

  private saveMiningState() {
    try {
      localStorage.setItem(MINING_STATE_KEY, JSON.stringify(this.activeMining));
    } catch (error) {
      console.error('Failed to save mining state to localStorage:', error);
    }
  }

  getActiveMiningStatus(): { [characterId: string]: { isActive: boolean; timeRemaining: number; currentCoinsEarned: number } } {
    const status: { [characterId: string]: { isActive: boolean; timeRemaining: number; currentCoinsEarned: number } } = {};
    const now = Date.now();
    
    for (const characterId in this.activeMining) {
      const session = this.activeMining[characterId];
      
      // Double check if session is actually still active
      if (session.isActive && now < session.endTime) {
        const timeRemaining = Math.max(0, (session.endTime - now) / 1000);
        const timeElapsed = (now - session.startTime) / 1000;
        const currentCoinsEarned = (timeElapsed / 3600) * session.miningRate;
        
        status[characterId] = {
          isActive: true,
          timeRemaining: timeRemaining,
          currentCoinsEarned: currentCoinsEarned
        };
      } else if (session.isActive) {
        // Session has expired, clean it up
        console.log(`Cleaning up expired mining session for ${characterId}`);
        this.stopMining(characterId, true);
      }
    }
    return status;
  }

  private startMiningTimer(characterId: string) {
    // Clear any existing timer
    if (this.timers[characterId]) {
      clearTimeout(this.timers[characterId]);
    }

    const session = this.activeMining[characterId];
    if (!session || !session.isActive) return;

    const updateSession = () => {
      const now = Date.now();
      
      // Check if session is still valid
      if (!session.isActive || now >= session.endTime) {
        this.stopMining(characterId, true);
        return;
      }

      const timeElapsed = (now - session.startTime) / 1000;
      session.currentCoinsEarned = (timeElapsed / 3600) * session.miningRate;
      
      this.saveMiningState();
      
      // Schedule next update
      this.timers[characterId] = setTimeout(updateSession, 1000);
    };

    // Start the timer
    updateSession();
  }

  private stopMining(characterId: string, completed: boolean = false) {
    const session = this.activeMining[characterId];
    if (!session) return;

    // Clear timer
    if (this.timers[characterId]) {
      clearTimeout(this.timers[characterId]);
      delete this.timers[characterId];
    }

    session.isActive = false;
    const now = Date.now();
    const timeElapsed = Math.min((now - session.startTime) / 1000, session.totalDuration);
    const coinsEarned = (timeElapsed / 3600) * session.miningRate;
    session.currentCoinsEarned = coinsEarned;

    this.saveMiningState();

    if (completed) {
      const event = new CustomEvent('miningCompleted', {
        detail: {
          characterId: session.characterId,
          coinsEarned: session.currentCoinsEarned
        }
      });
      window.dispatchEvent(event);
    }

    console.log(`Mining stopped for character ${characterId}. Total coins earned: ${session.currentCoinsEarned}`);
  }

  async startMining(characterId: string, baseRate: number, userId?: string): Promise<boolean> {
    const now = Date.now();
    
    // First, clean up any expired sessions
    const existingSession = this.activeMining[characterId];
    if (existingSession) {
      // If session exists but has expired, clean it up
      if (now >= existingSession.endTime) {
        console.log(`Cleaning up expired session for ${characterId}`);
        this.stopMining(characterId, true);
      } else if (existingSession.isActive) {
        // Check if the session is truly active (not just marked as active)
        const timeRemaining = (existingSession.endTime - now) / 1000;
        if (timeRemaining > 0) {
          console.log(`Character ${characterId} is already mining with ${Math.floor(timeRemaining)} seconds remaining`);
          return false;
        } else {
          // Session has expired but wasn't cleaned up, clean it now
          console.log(`Cleaning up stale session for ${characterId}`);
          this.stopMining(characterId, true);
        }
      }
    }

    // Calculate mining rate based on level + clan bonus
    let finalMiningRate = baseRate;
    if (userId) {
      try {
        const clanMembership = await clanService.getUserClanMembership(userId);
        const bonus = clanService.getMiningBonus(!!clanMembership);
        finalMiningRate = baseRate * bonus;
        console.log(`Applied clan mining bonus: ${bonus}x - New rate: ${finalMiningRate}/hour`);
      } catch (error) {
        console.error('Error checking clan membership:', error);
      }
    }

    const session: MiningSession = {
      characterId,
      startTime: now,
      endTime: now + (8 * 60 * 60 * 1000), // 8 hours
      miningRate: finalMiningRate,
      isActive: true,
      currentCoinsEarned: 0,
      totalDuration: 8 * 60 * 60 // 8 hours in seconds
    };

    this.activeMining[characterId] = session;
    this.saveMiningState();

    // Start the mining timer
    this.startMiningTimer(characterId);

    console.log(`Started mining for character ${characterId} with rate ${finalMiningRate}/hour`);
    return true;
  }

  collectCoins(characterId: string): number {
    const session = this.activeMining[characterId];
    if (!session) return 0;

    // Clear timer
    if (this.timers[characterId]) {
      clearTimeout(this.timers[characterId]);
      delete this.timers[characterId];
    }

    const coins = session.currentCoinsEarned;
    delete this.activeMining[characterId];
    this.saveMiningState();

    console.log(`Collected ${coins} coins for character ${characterId}`);
    return coins;
  }

  // Method to force reset mining state for debugging
  resetMiningState(characterId?: string) {
    if (characterId) {
      // Clear specific character timer
      if (this.timers[characterId]) {
        clearTimeout(this.timers[characterId]);
        delete this.timers[characterId];
      }
      delete this.activeMining[characterId];
    } else {
      // Clear all timers
      Object.keys(this.timers).forEach(id => {
        clearTimeout(this.timers[id]);
      });
      this.timers = {};
      this.activeMining = {};
    }
    this.saveMiningState();
    console.log('Mining state reset');
  }

  // New method to force clean expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    let hasChanges = false;
    
    Object.keys(this.activeMining).forEach(characterId => {
      const session = this.activeMining[characterId];
      if (session.isActive && now >= session.endTime) {
        console.log(`Force cleaning expired session for ${characterId}`);
        this.stopMining(characterId, true);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveMiningState();
    }
  }
}

export const characterMiningService = new CharacterMiningService();
