// services/learningProgress.ts
// Service for tracking and persisting learning progress

import { supabase } from './supabase';

if (!supabase) {
    throw new Error('Supabase client not initialized');
}

export interface QuestCompletionRecord {
    user_id: string;
    quest_id: string;
    quest_title: string;
    category: 'math' | 'science' | 'language' | 'social_studies';
    difficulty: 'easy' | 'medium' | 'hard';
    completed_at: string;
    was_correct: boolean;
    coins_earned: number;
    xp_earned: number;
}

export interface LearningProgressData {
    user_id: string;
    total_quests_completed: number;
    total_xp: number;
    total_coins: number;
    current_streak: number;
    longest_streak: number;
    quests_by_category: {
        math: number;
        science: number;
        language: number;
        social_studies: number;
    };
    quests_by_difficulty: {
        easy: number;
        medium: number;
        hard: number;
    };
    accuracy_rate: number;
    last_completed_date: string | null;
    unlocked_badges: string[];
    unlocked_trophies: string[];
}

/**
 * Record a quest completion
 */
export async function recordQuestCompletion(
    userId: string,
    questId: string,
    questData: {
        title: string;
        category: 'math' | 'science' | 'language' | 'social_studies';
        difficulty: 'easy' | 'medium' | 'hard';
        wasCorrect: boolean;
        coinsEarned: number;
        xpEarned: number;
    }
): Promise<void> {
    try {
        // Insert quest completion record
        const { error: insertError } = await supabase!
            .from('quest_completions')
            .insert({
                user_id: userId,
                quest_id: questId,
                quest_title: questData.title,
                category: questData.category,
                difficulty: questData.difficulty,
                completed_at: new Date().toISOString(),
                was_correct: questData.wasCorrect,
                coins_earned: questData.coinsEarned,
                xp_earned: questData.xpEarned
            });

        if (insertError) throw insertError;

        // Update learning progress
        await updateLearningProgress(userId);
    } catch (error) {
        console.error('Error recording quest completion:', error);
        throw error;
    }
}

/**
 * Update learning progress stats
 */
async function updateLearningProgress(userId: string): Promise<void> {
    try {
        // Fetch all completions for user
        const { data: completions, error: fetchError } = await supabase!
            .from('quest_completions')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (!completions || completions.length === 0) return;

        // Calculate stats
        const totalQuests = completions.length;
        const totalXP = completions.reduce((sum, c) => sum + (c.xp_earned || 0), 0);
        const totalCoins = completions.reduce((sum, c) => sum + (c.coins_earned || 0), 0);
        const correctAnswers = completions.filter(c => c.was_correct).length;
        const accuracyRate = Math.round((correctAnswers / totalQuests) * 100);

        // Calculate category counts
        const questsByCategory = {
            math: completions.filter(c => c.category === 'math').length,
            science: completions.filter(c => c.category === 'science').length,
            language: completions.filter(c => c.category === 'language').length,
            social_studies: completions.filter(c => c.category === 'social_studies').length
        };

        // Calculate difficulty counts
        const questsByDifficulty = {
            easy: completions.filter(c => c.difficulty === 'easy').length,
            medium: completions.filter(c => c.difficulty === 'medium').length,
            hard: completions.filter(c => c.difficulty === 'hard').length
        };

        // Calculate streak
        const { currentStreak, longestStreak } = calculateStreak(completions);

        // Determine unlocked badges
        const unlockedBadges = determineUnlockedBadges({
            totalQuests,
            currentStreak,
            questsByCategory,
            questsByDifficulty
        });

        // Upsert progress data
        const { error: upsertError } = await supabase!
            .from('learning_progress')
            .upsert({
                user_id: userId,
                total_quests_completed: totalQuests,
                total_xp: totalXP,
                total_coins: totalCoins,
                current_streak: currentStreak,
                longest_streak: longestStreak,
                quests_by_category: questsByCategory,
                quests_by_difficulty: questsByDifficulty,
                accuracy_rate: accuracyRate,
                last_completed_date: completions[0].completed_at,
                unlocked_badges: unlockedBadges,
                unlocked_trophies: completions
                    .filter(c => c.quest_id.startsWith('m-')) // Identifying adventure missions
                    .map(c => `trophy-${c.quest_id}`), // Simple mapping for now
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (upsertError) throw upsertError;
    } catch (error) {
        console.error('Error updating learning progress:', error);
        throw error;
    }
}

/**
 * Calculate current and longest streak
 */
function calculateStreak(completions: any[]): { currentStreak: number; longestStreak: number } {
    if (completions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Sort by date descending
    const sorted = [...completions].sort((a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(sorted[0].completed_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if last completion was today or yesterday
    const daysSinceLastCompletion = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastCompletion <= 1) {
        currentStreak = 1;

        // Count consecutive days
        for (let i = 1; i < sorted.length; i++) {
            const currentDate = new Date(sorted[i].completed_at);
            const prevDate = new Date(sorted[i - 1].completed_at);

            const daysDiff = Math.floor(
                (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff === 1) {
                currentStreak++;
                tempStreak++;
            } else if (daysDiff > 1) {
                break;
            }
        }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const currentDate = new Date(sorted[i].completed_at);
        const prevDate = new Date(sorted[i - 1].completed_at);

        const daysDiff = Math.floor(
            (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else if (daysDiff > 1) {
            tempStreak = 1;
        }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { currentStreak, longestStreak };
}

/**
 * Determine which badges should be unlocked
 */
function determineUnlockedBadges(stats: {
    totalQuests: number;
    currentStreak: number;
    questsByCategory: { math: number; science: number; language: number; social_studies: number };
    questsByDifficulty: { easy: number; medium: number; hard: number };
}): string[] {
    const badges: string[] = [];

    // Quest-based badges
    if (stats.totalQuests >= 1) badges.push('first-quest');
    if (stats.totalQuests >= 10) badges.push('quest-master');
    if (stats.totalQuests >= 25) badges.push('quest-legend');
    if (stats.totalQuests >= 50) badges.push('quest-champion');

    // Category badges
    if (stats.questsByCategory.math >= 5) badges.push('math-genius');
    if (stats.questsByCategory.science >= 5) badges.push('science-explorer');
    if (stats.questsByCategory.language >= 5) badges.push('language-master');
    if (stats.questsByCategory.social_studies >= 5) badges.push('social-explorer');

    // Streak badges
    if (stats.currentStreak >= 3) badges.push('streak-3');
    if (stats.currentStreak >= 7) badges.push('streak-7');
    if (stats.currentStreak >= 14) badges.push('streak-14');
    if (stats.currentStreak >= 30) badges.push('streak-30');

    // Difficulty badges
    if (stats.questsByDifficulty.hard >= 3) badges.push('hard-mode');
    if (stats.questsByDifficulty.hard >= 10) badges.push('hard-master');

    return badges;
}

/**
 * Get learning progress for a user
 */
export async function getLearningProgress(userId: string): Promise<LearningProgressData | null> {
    try {
        const { data, error } = await supabase!
            .from('learning_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No data found, return default
                return {
                    user_id: userId,
                    total_quests_completed: 0,
                    total_xp: 0,
                    total_coins: 0,
                    current_streak: 0,
                    longest_streak: 0,
                    quests_by_category: { math: 0, science: 0, language: 0, social_studies: 0 },
                    quests_by_difficulty: { easy: 0, medium: 0, hard: 0 },
                    accuracy_rate: 0,
                    last_completed_date: null,
                    unlocked_badges: [],
                    unlocked_trophies: []
                };
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error fetching learning progress:', error);
        throw error;
    }
}

/**
 * Get quest completion history
 */
export async function getQuestCompletions(
    userId: string,
    limit: number = 50
): Promise<QuestCompletionRecord[]> {
    try {
        const { data, error } = await supabase!
            .from('quest_completions')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching quest completions:', error);
        throw error;
    }
}
