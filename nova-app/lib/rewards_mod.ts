// ============================================
// Rewards System for English Tutor Games
// Mock API and utilities for coin management
// ============================================

export interface RewardEvent {
  userId: string;
  source: 'english_game' | 'daily_bonus' | 'achievement';
  gameId?: string;
  coins: number;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface UserBalance {
  userId: string;
  balance: number;
  totalEarned: number;
  lastUpdated: number;
}

export interface GameSession {
  sessionId: string;
  gameId: string;
  userId: string;
  startTime: number;
  interactions: number;
  coinsEarned: number;
  lastInteraction: number;
}

// Anti-abuse configuration
const ANTI_ABUSE_CONFIG = {
  maxCoinsPerSession: 200,
  maxCoinsPerDay: 500,
  minTimeBetweenGames: 3000, // 3 seconds
  minInteractionsPerGame: 3,
  maxGamesPerHour: 30,
};

// Storage keys
const STORAGE_KEYS = {
  balance: 'nova_store_balance_mod',
  history: 'nova_rewards_history_mod',
  sessions: 'nova_game_sessions_mod',
  dailyStats: 'nova_daily_stats_mod',
};

// Get current user ID (mock)
export const getCurrentUserId = (): string => {
  let userId = localStorage.getItem('nova_user_id_mod');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('nova_user_id_mod', userId);
  }
  return userId;
};

// Get user balance
export const getUserBalance = (): UserBalance => {
  const stored = localStorage.getItem(STORAGE_KEYS.balance);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaultBalance: UserBalance = {
    userId: getCurrentUserId(),
    balance: 0,
    totalEarned: 0,
    lastUpdated: Date.now(),
  };
  localStorage.setItem(STORAGE_KEYS.balance, JSON.stringify(defaultBalance));
  return defaultBalance;
};

// Get daily stats
const getDailyStats = (): { date: string; coinsEarned: number; gamesPlayed: number } => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(STORAGE_KEYS.dailyStats);
  if (stored) {
    const stats = JSON.parse(stored);
    if (stats.date === today) {
      return stats;
    }
  }
  return { date: today, coinsEarned: 0, gamesPlayed: 0 };
};

// Update daily stats
const updateDailyStats = (coins: number, gamesIncrement: number = 0) => {
  const stats = getDailyStats();
  stats.coinsEarned += coins;
  stats.gamesPlayed += gamesIncrement;
  localStorage.setItem(STORAGE_KEYS.dailyStats, JSON.stringify(stats));
  return stats;
};

// Check anti-abuse rules
export const validateReward = (coins: number, gameId: string): { valid: boolean; reason?: string; adjustedCoins: number } => {
  const dailyStats = getDailyStats();
  
  // Check daily limit
  if (dailyStats.coinsEarned >= ANTI_ABUSE_CONFIG.maxCoinsPerDay) {
    return { valid: false, reason: '¡Has alcanzado el límite diario de coins! Vuelve mañana.', adjustedCoins: 0 };
  }
  
  // Check if would exceed daily limit
  const remainingDailyCoins = ANTI_ABUSE_CONFIG.maxCoinsPerDay - dailyStats.coinsEarned;
  const adjustedCoins = Math.min(coins, remainingDailyCoins);
  
  // Check hourly game limit
  if (dailyStats.gamesPlayed >= ANTI_ABUSE_CONFIG.maxGamesPerHour) {
    return { valid: false, reason: 'Has jugado muchos juegos. ¡Toma un descanso!', adjustedCoins: 0 };
  }
  
  return { valid: true, adjustedCoins };
};

// Credit coins to user (mock API call)
export const creditCoins = async (
  coins: number,
  gameId: string,
  source: RewardEvent['source'] = 'english_game'
): Promise<{ success: boolean; newBalance: number; coinsAdded: number; message?: string }> => {
  const userId = getCurrentUserId();
  
  // Validate against anti-abuse rules
  const validation = validateReward(coins, gameId);
  if (!validation.valid) {
    return { 
      success: false, 
      newBalance: getUserBalance().balance, 
      coinsAdded: 0,
      message: validation.reason 
    };
  }
  
  const coinsToAdd = validation.adjustedCoins;
  
  // Update balance
  const currentBalance = getUserBalance();
  const newBalance: UserBalance = {
    ...currentBalance,
    balance: currentBalance.balance + coinsToAdd,
    totalEarned: currentBalance.totalEarned + coinsToAdd,
    lastUpdated: Date.now(),
  };
  localStorage.setItem(STORAGE_KEYS.balance, JSON.stringify(newBalance));
  
  // Log the event
  const event: RewardEvent = {
    userId,
    source,
    gameId,
    coins: coinsToAdd,
    timestamp: Date.now(),
  };
  logRewardEvent(event);
  
  // Update daily stats
  updateDailyStats(coinsToAdd, 1);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    newBalance: newBalance.balance,
    coinsAdded: coinsToAdd,
  };
};

// Spend coins (for store purchases)
export const spendCoins = async (
  amount: number,
  itemId: string
): Promise<{ success: boolean; newBalance: number; message?: string }> => {
  const currentBalance = getUserBalance();
  
  if (currentBalance.balance < amount) {
    return {
      success: false,
      newBalance: currentBalance.balance,
      message: '¡No tienes suficientes coins!',
    };
  }
  
  const newBalance: UserBalance = {
    ...currentBalance,
    balance: currentBalance.balance - amount,
    lastUpdated: Date.now(),
  };
  localStorage.setItem(STORAGE_KEYS.balance, JSON.stringify(newBalance));
  
  // Log purchase
  const event: RewardEvent = {
    userId: getCurrentUserId(),
    source: 'daily_bonus',
    coins: -amount,
    timestamp: Date.now(),
    details: { itemId, type: 'purchase' },
  };
  logRewardEvent(event);
  
  return {
    success: true,
    newBalance: newBalance.balance,
  };
};

// Log reward events
const logRewardEvent = (event: RewardEvent) => {
  const stored = localStorage.getItem(STORAGE_KEYS.history);
  const history: RewardEvent[] = stored ? JSON.parse(stored) : [];
  history.push(event);
  // Keep only last 100 events
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
};

// Get reward history
export const getRewardHistory = (): RewardEvent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.history);
  return stored ? JSON.parse(stored) : [];
};

// Calculate score based on performance
export const calculateGameScore = (
  correctAnswers: number,
  totalQuestions: number,
  timeBonus: boolean = false,
  streak: number = 0,
  usedHints: boolean = false
): { score: number; coins: number; breakdown: { base: number; streak: number; speed: number; penalty: number } } => {
  // Base points: 10 per correct answer
  const basePoints = correctAnswers * 10;
  
  // Speed bonus: +5 if time bonus
  const speedBonus = timeBonus ? 5 : 0;
  
  // Streak bonus: +5 for every 3 consecutive correct
  const streakBonus = Math.floor(streak / 3) * 5;
  
  // Hint penalty: -3 per hint used (simplified)
  const hintPenalty = usedHints ? 3 : 0;
  
  const totalScore = Math.max(0, basePoints + speedBonus + streakBonus - hintPenalty);
  
  // Coins are equal to score
  const coins = totalScore;
  
  return {
    score: totalScore,
    coins,
    breakdown: {
      base: basePoints,
      streak: streakBonus,
      speed: speedBonus,
      penalty: hintPenalty,
    },
  };
};

// Game content by grade level
export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export interface GameContent<T> {
  grade: GradeLevel;
  difficulty: 'easy' | 'medium' | 'hard';
  items: T[];
}

// Weakness-based content prioritization
export interface WeaknessArea {
  category: 'grammar' | 'vocabulary' | 'reading' | 'writing';
  specificArea: string;
  priority: number;
}

export const prioritizeContent = <T extends { tags?: string[] }>(
  content: T[],
  weaknesses: WeaknessArea[]
): T[] => {
  return content.sort((a, b) => {
    const aScore = weaknesses.reduce((sum, w) => {
      return sum + (a.tags?.some(t => t.toLowerCase().includes(w.specificArea.toLowerCase())) ? w.priority : 0);
    }, 0);
    const bScore = weaknesses.reduce((sum, w) => {
      return sum + (b.tags?.some(t => t.toLowerCase().includes(w.specificArea.toLowerCase())) ? w.priority : 0);
    }, 0);
    return bScore - aScore;
  });
};
