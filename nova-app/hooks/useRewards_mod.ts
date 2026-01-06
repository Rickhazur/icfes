import { useState, useEffect, useCallback } from 'react';
import { 
  getUserBalance, 
  creditCoins, 
  spendCoins, 
  calculateGameScore,
  type UserBalance 
} from '@/lib/rewards_mod';

export const useRewards = () => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial balance
  useEffect(() => {
    setBalance(getUserBalance());
    
    // Listen for storage changes (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nova_store_balance_mod') {
        setBalance(getUserBalance());
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(() => {
    setBalance(getUserBalance());
  }, []);

  // Add coins after game completion
  const addCoins = useCallback(async (
    coins: number, 
    gameId: string
  ): Promise<{ success: boolean; coinsAdded: number; message?: string }> => {
    setIsLoading(true);
    try {
      const result = await creditCoins(coins, gameId);
      if (result.success) {
        setBalance(getUserBalance());
      }
      return {
        success: result.success,
        coinsAdded: result.coinsAdded,
        message: result.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Spend coins on store items
  const purchaseItem = useCallback(async (
    amount: number, 
    itemId: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const result = await spendCoins(amount, itemId);
      if (result.success) {
        setBalance(getUserBalance());
      }
      return {
        success: result.success,
        message: result.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate and add score from game
  const completeGame = useCallback(async (
    gameId: string,
    correctAnswers: number,
    totalQuestions: number,
    options?: {
      timeBonus?: boolean;
      streak?: number;
      usedHints?: boolean;
    }
  ) => {
    const scoreResult = calculateGameScore(
      correctAnswers,
      totalQuestions,
      options?.timeBonus,
      options?.streak,
      options?.usedHints
    );
    
    const creditResult = await addCoins(scoreResult.coins, gameId);
    
    return {
      ...scoreResult,
      credited: creditResult.success,
      actualCoinsAdded: creditResult.coinsAdded,
      message: creditResult.message,
    };
  }, [addCoins]);

  return {
    balance: balance?.balance ?? 0,
    totalEarned: balance?.totalEarned ?? 0,
    isLoading,
    refreshBalance,
    addCoins,
    purchaseItem,
    completeGame,
  };
};

export default useRewards;
