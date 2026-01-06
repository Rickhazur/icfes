import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { supabase, getUserEconomy, adminAwardCoins } from '@/services/supabase';

interface GamificationState {
    coins: number;
    xp: number;
    level: number;
}

interface GamificationContextType extends GamificationState {
    addCoins: (amount: number, reason: string) => void;
    spendCoins: (amount: number, item: string) => boolean;
    addXP: (amount: number) => void;
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<GamificationState>({
        coins: 50,
        xp: 0,
        level: 1
    });

    // Load from local storage and Supabase
    useEffect(() => {
        // 1. Local Storage Fallback
        const saved = localStorage.getItem('nova_gamification');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setState(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to load gamification state", e);
            }
        }

        // 2. Supabase Sync
        const syncWithSupabase = async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const economy = await getUserEconomy(session.user.id);
                if (economy) {
                    setState(prev => ({ ...prev, coins: economy.coins }));
                }
            }
        };

        if (supabase) syncWithSupabase();
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('nova_gamification', JSON.stringify(state));
    }, [state]);

    const addCoins = async (amount: number, reason: string) => {
        // Optimistic UI Update
        setState(prev => ({ ...prev, coins: prev.coins + amount }));

        toast({
            title: `+${amount} Monedas! 🪙`,
            description: reason,
            className: "bg-kid-yellow border-2 border-black font-fredoka shadow-comic text-black"
        });

        if (amount >= 20) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });
        }

        // Sync to DB
        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await adminAwardCoins(session.user.id, amount);
            }
        }
    };

    const spendCoins = (amount: number, item: string): boolean => {
        if (state.coins < amount) {
            toast({
                title: "¡No tienes suficientes monedas! 😢",
                description: `Necesitas ${amount} monedas para ${item}`,
                variant: "destructive"
            });
            return false;
        }

        // Optimistic Update
        setState(prev => ({ ...prev, coins: prev.coins - amount }));

        // Sync to DB
        if (supabase) {
            (async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // We reuse award with negative amount or implement a spend function
                    await adminAwardCoins(session.user.id, -amount);
                }
            })();
        }

        return true;
    };

    const addXP = (amount: number) => {
        setState(prev => {
            const newXP = prev.xp + amount;
            let newLevel = prev.level;
            const nextThreshold = LEVEL_THRESHOLDS[prev.level] || Infinity;

            if (newXP >= nextThreshold) {
                newLevel += 1;
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FF69B4', '#00BFFF', '#7FFF00']
                });
                toast({
                    title: "¡SUBISTE DE NIVEL! 🌟",
                    description: `¡Ahora eres Nivel ${newLevel}!`,
                    className: "bg-kid-purple border-2 border-black font-fredoka shadow-comic text-white"
                });
            }
            return { ...prev, xp: newXP, level: newLevel };
        });
    };

    return (
        <GamificationContext.Provider value={{
            ...state,
            addCoins,
            spendCoins,
            addXP
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
