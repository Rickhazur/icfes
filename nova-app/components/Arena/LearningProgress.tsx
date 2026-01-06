// components/Arena/LearningProgress.tsx
// Learning progress tracking dashboard for pedagogical quests

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, BookOpen, TrendingUp, Award, CheckCircle2, Target, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestCompletion {
    questId: string;
    questTitle: string;
    category: 'math' | 'science' | 'language' | 'social_studies';
    difficulty: 'easy' | 'medium' | 'hard';
    completedAt: Date;
    wasCorrect: boolean;
    coinsEarned: number;
    xpEarned: number;
}

interface LearningStats {
    totalQuestsCompleted: number;
    totalXP: number;
    totalCoins: number;
    currentStreak: number;
    longestStreak: number;
    questsByCategory: {
        math: number;
        science: number;
        language: number;
        social_studies: number;
    };
    questsByDifficulty: {
        easy: number;
        medium: number;
        hard: number;
    };
    accuracyRate: number;
    lastCompletedDate: Date | null;
}

interface Badge {
    id: string;
    name: { es: string; en: string };
    description: { es: string; en: string };
    icon: string;
    requirement: number;
    category: 'quests' | 'streak' | 'category' | 'difficulty';
    unlocked: boolean;
    progress: number;
}

interface LearningProgressProps {
    userId: string;
    language: 'es' | 'en';
}

export function LearningProgress({ userId, language }: LearningProgressProps) {
    const [stats, setStats] = useState<LearningStats>({
        totalQuestsCompleted: 0,
        totalXP: 0,
        totalCoins: 0,
        currentStreak: 0,
        longestStreak: 0,
        questsByCategory: { math: 0, science: 0, language: 0, social_studies: 0 },
        questsByDifficulty: { easy: 0, medium: 0, hard: 0 },
        accuracyRate: 0,
        lastCompletedDate: null
    });

    const [badges, setBadges] = useState<Badge[]>([
        {
            id: 'first-quest',
            name: { es: 'Primer Paso', en: 'First Step' },
            description: { es: 'Completa tu primera misión', en: 'Complete your first quest' },
            icon: '🎯',
            requirement: 1,
            category: 'quests',
            unlocked: false,
            progress: 0
        },
        {
            id: 'quest-master',
            name: { es: 'Maestro de Misiones', en: 'Quest Master' },
            description: { es: 'Completa 10 misiones', en: 'Complete 10 quests' },
            icon: '🏆',
            requirement: 10,
            category: 'quests',
            unlocked: false,
            progress: 0
        },
        {
            id: 'math-genius',
            name: { es: 'Genio Matemático', en: 'Math Genius' },
            description: { es: 'Completa 5 misiones de matemáticas', en: 'Complete 5 math quests' },
            icon: '🧮',
            requirement: 5,
            category: 'category',
            unlocked: false,
            progress: 0
        },
        {
            id: 'science-explorer',
            name: { es: 'Explorador Científico', en: 'Science Explorer' },
            description: { es: 'Completa 5 misiones de ciencias', en: 'Complete 5 science quests' },
            icon: '🔬',
            requirement: 5,
            category: 'category',
            unlocked: false,
            progress: 0
        },
        {
            id: 'streak-3',
            name: { es: 'Racha de Fuego', en: 'Fire Streak' },
            description: { es: 'Mantén una racha de 3 días', en: 'Maintain a 3-day streak' },
            icon: '🔥',
            requirement: 3,
            category: 'streak',
            unlocked: false,
            progress: 0
        },
        {
            id: 'streak-7',
            name: { es: 'Semana Perfecta', en: 'Perfect Week' },
            description: { es: 'Mantén una racha de 7 días', en: 'Maintain a 7-day streak' },
            icon: '⭐',
            requirement: 7,
            category: 'streak',
            unlocked: false,
            progress: 0
        },
        {
            id: 'hard-mode',
            name: { es: 'Modo Difícil', en: 'Hard Mode' },
            description: { es: 'Completa 3 misiones difíciles', en: 'Complete 3 hard quests' },
            icon: '💪',
            requirement: 3,
            category: 'difficulty',
            unlocked: false,
            progress: 0
        }
    ]);

    // Load stats from localStorage (will be replaced with Supabase)
    useEffect(() => {
        const savedStats = localStorage.getItem(`learning-stats-${userId}`);
        if (savedStats) {
            const parsed = JSON.parse(savedStats);
            setStats({
                ...parsed,
                lastCompletedDate: parsed.lastCompletedDate ? new Date(parsed.lastCompletedDate) : null
            });
        }
    }, [userId]);

    // Update badges based on stats
    useEffect(() => {
        setBadges(prev => prev.map(badge => {
            let progress = 0;
            let unlocked = false;

            switch (badge.category) {
                case 'quests':
                    progress = stats.totalQuestsCompleted;
                    break;
                case 'streak':
                    progress = stats.currentStreak;
                    break;
                case 'category':
                    if (badge.id === 'math-genius') progress = stats.questsByCategory.math;
                    if (badge.id === 'science-explorer') progress = stats.questsByCategory.science;
                    break;
                case 'difficulty':
                    if (badge.id === 'hard-mode') progress = stats.questsByDifficulty.hard;
                    break;
            }

            unlocked = progress >= badge.requirement;

            return { ...badge, progress, unlocked };
        }));
    }, [stats]);

    const categoryColors = {
        math: 'from-blue-500 to-indigo-600',
        science: 'from-green-500 to-emerald-600',
        language: 'from-purple-500 to-pink-600',
        social_studies: 'from-orange-500 to-amber-600'
    };

    const categoryIcons = {
        math: '🧮',
        science: '🔬',
        language: '📚',
        social_studies: '🌍'
    };

    return (
        <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-3xl">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    {language === 'es' ? '📊 Tu Progreso de Aprendizaje' : '📊 Your Learning Progress'}
                </h2>
                <p className="text-slate-600">
                    {language === 'es'
                        ? '¡Sigue aprendiendo y desbloqueando logros!'
                        : 'Keep learning and unlocking achievements!'}
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Quests */}
                <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <span className="text-3xl font-black text-indigo-600">
                            {stats.totalQuestsCompleted}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">
                        {language === 'es' ? 'Misiones' : 'Quests'}
                    </p>
                </motion.div>

                {/* Current Streak */}
                <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Flame className="w-8 h-8 text-orange-500" />
                        <span className="text-3xl font-black text-orange-600">
                            {stats.currentStreak}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">
                        {language === 'es' ? 'Racha' : 'Streak'}
                    </p>
                </motion.div>

                {/* Total XP */}
                <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Zap className="w-8 h-8 text-purple-500" />
                        <span className="text-3xl font-black text-purple-600">
                            {stats.totalXP}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">XP</p>
                </motion.div>

                {/* Accuracy */}
                <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 text-green-500" />
                        <span className="text-3xl font-black text-green-600">
                            {stats.accuracyRate}%
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">
                        {language === 'es' ? 'Precisión' : 'Accuracy'}
                    </p>
                </motion.div>
            </div>

            {/* Category Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    {language === 'es' ? 'Progreso por Materia' : 'Progress by Subject'}
                </h3>
                <div className="space-y-4">
                    {Object.entries(stats.questsByCategory).map(([category, count]) => (
                        <div key={category}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-slate-700 flex items-center gap-2">
                                    <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                                    {language === 'es'
                                        ? category === 'math' ? 'Matemáticas' : category === 'science' ? 'Ciencias' : category === 'language' ? 'Lenguaje' : 'Sociales'
                                        : category === 'math' ? 'Math' : category === 'science' ? 'Science' : category === 'language' ? 'Language' : 'Social Studies'}
                                </span>
                                <span className="font-black text-lg text-slate-800">{count}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className={`h-full bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]} rounded-full`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges/Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-600" />
                    {language === 'es' ? 'Logros Desbloqueados' : 'Unlocked Achievements'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                        <motion.div
                            key={badge.id}
                            whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
                            className={cn(
                                "relative p-4 rounded-xl border-2 transition-all",
                                badge.unlocked
                                    ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-lg"
                                    : "bg-slate-50 border-slate-200 opacity-60"
                            )}
                        >
                            <div className="text-center">
                                <div className={cn(
                                    "text-4xl mb-2",
                                    !badge.unlocked && "grayscale opacity-50"
                                )}>
                                    {badge.icon}
                                </div>
                                <h4 className="font-bold text-sm text-slate-800 mb-1">
                                    {badge.name[language]}
                                </h4>
                                <p className="text-xs text-slate-600 mb-2">
                                    {badge.description[language]}
                                </p>
                                <div className="text-xs font-bold text-slate-700">
                                    {badge.progress}/{badge.requirement}
                                </div>
                                {badge.unlocked && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    {language === 'es' ? 'Nivel de Desafío' : 'Challenge Level'}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-3xl font-black text-green-600">
                                {stats.questsByDifficulty.easy}
                            </span>
                        </div>
                        <p className="font-bold text-green-700">
                            {language === 'es' ? 'Fácil' : 'Easy'}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-3xl font-black text-yellow-600">
                                {stats.questsByDifficulty.medium}
                            </span>
                        </div>
                        <p className="font-bold text-yellow-700">
                            {language === 'es' ? 'Medio' : 'Medium'}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-3xl font-black text-red-600">
                                {stats.questsByDifficulty.hard}
                            </span>
                        </div>
                        <p className="font-bold text-red-700">
                            {language === 'es' ? 'Difícil' : 'Hard'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
