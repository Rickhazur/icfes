// components/Gamification/HallOfFame.tsx
// Epic "Salón de la Fama" for student achievements and learning progress

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, BookOpen, TrendingUp, Award, CheckCircle2, Target, Brain, Zap, Crown, Medal, Sparkles, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLearningProgress, LearningProgressData } from '../../services/learningProgress';
import { AvatarDisplay } from './AvatarDisplay';

interface HallOfFameProps {
    userId: string;
    userName: string;
    language: 'es' | 'en';
}

export function HallOfFame({ userId, userName, language }: HallOfFameProps) {
    const [stats, setStats] = useState<LearningProgressData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'worlds'>('overview');

    useEffect(() => {
        const loadStats = async () => {
            if (userId) {
                const data = await getLearningProgress(userId);
                setStats(data);
            }
        };
        loadStats();
    }, [userId]);

    const badges = [
        {
            id: 'first-quest',
            name: { es: 'Primer Paso', en: 'First Step' },
            description: { es: 'Completa tu primera misión', en: 'Complete your first quest' },
            icon: '🎯',
            rarity: 'common'
        },
        {
            id: 'quest-master',
            name: { es: 'Maestro de Misiones', en: 'Quest Master' },
            description: { es: 'Completa 10 misiones', en: 'Complete 10 quests' },
            icon: '🏆',
            rarity: 'rare'
        },
        {
            id: 'math-genius',
            name: { es: 'Genio Matemático', en: 'Math Genius' },
            description: { es: 'Completa 5 misiones de matemáticas', en: 'Complete 5 math quests' },
            icon: '🧮',
            rarity: 'rare'
        },
        {
            id: 'science-explorer',
            name: { es: 'Explorador Científico', en: 'Science Explorer' },
            description: { es: 'Completa 5 misiones de ciencias', en: 'Complete 5 science quests' },
            icon: '🔬',
            rarity: 'rare'
        },
        {
            id: 'streak-3',
            name: { es: 'Racha de Fuego', en: 'Fire Streak' },
            description: { es: 'Mantén una racha de 3 días', en: 'Maintain a 3-day streak' },
            icon: '🔥',
            rarity: 'uncommon'
        },
        {
            id: 'streak-7',
            name: { es: 'Semana Perfecta', en: 'Perfect Week' },
            description: { es: 'Mantén una racha de 7 días', en: 'Maintain a 7-day streak' },
            icon: '⭐',
            rarity: 'epic'
        },
        {
            id: 'hard-mode',
            name: { es: 'Modo Difícil', en: 'Hard Mode' },
            description: { es: 'Completa 3 misiones difíciles', en: 'Complete 3 hard quests' },
            icon: '💪',
            rarity: 'legendary'
        }
    ];

    const rarityStyles = {
        common: 'from-slate-100 to-slate-200 border-slate-300 text-slate-600',
        uncommon: 'from-blue-50 to-blue-100 border-blue-300 text-blue-600',
        rare: 'from-purple-50 to-purple-100 border-purple-300 text-purple-600',
        epic: 'from-pink-50 to-pink-100 border-pink-300 text-pink-600',
        legendary: 'from-amber-50 to-yellow-100 border-yellow-400 text-yellow-700 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
    };

    const speakStats = () => {
        if (!stats) return;
        const text = language === 'es'
            ? `¡Hola ${userName}! Tu nivel actual es ${Math.floor(stats.total_xp / 1000) + 1}. Has completado ${stats.total_quests_completed} misiones y tienes una racha de ${stats.current_streak} días. ¡Sigue así, héroe!`
            : `Hello ${userName}! Your current level is ${Math.floor(stats.total_xp / 1000) + 1}. You have completed ${stats.total_quests_completed} quests and have a ${stats.current_streak} day streak. Keep it up, hero!`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    if (!stats) return (
        <div className="flex items-center justify-center p-20 min-h-[60vh]">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative"
            >
                <Sparkles className="w-16 h-16 text-yellow-500" />
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
            </motion.div>
        </div>
    );

    const currentLevel = Math.floor(stats.total_xp / 1000) + 1;
    const nextLevelXP = currentLevel * 1000;
    const progressToNextLevel = ((stats.total_xp % 1000) / 1000) * 100;

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 font-fredoka animate-fade-in px-4">
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden bg-[#0F172A] rounded-[3.5rem] p-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/5">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    {/* Avatar Display with Glow */}
                    <div className="relative group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-56 h-56 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-full border-4 border-yellow-400 shadow-[0_0_40px_rgba(251,191,36,0.3)] flex items-center justify-center p-6 relative"
                        >
                            <AvatarDisplay size="xl" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="absolute -inset-2 border-2 border-dashed border-white/20 rounded-full"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-950 font-black px-6 py-2 rounded-2xl shadow-xl whitespace-nowrap flex items-center gap-2 border-4 border-indigo-950"
                        >
                            <Crown className="w-5 h-5 fill-indigo-950" />
                            NIVEL {currentLevel}
                        </motion.div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
                                {language === 'es' ? 'Perfil Legendario' : 'Legendary Profile'}
                            </h1>
                            <button
                                onClick={speakStats}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
                                title={language === 'es' ? 'Escuchar mis logros' : 'Hear my achievements'}
                            >
                                <Activity className="w-6 h-6 text-yellow-400" />
                            </button>
                        </div>
                        <p className="text-2xl text-indigo-300/90 font-bold mb-8">
                            {language === 'es' ? `¡Bienvenido de nuevo, ${userName}!` : `Welcome back, ${userName}!`}
                        </p>

                        {/* XP Progress Bar */}
                        <div className="max-w-md space-y-2">
                            <div className="flex justify-between text-sm font-black text-indigo-300 uppercase tracking-widest">
                                <span>{stats.total_xp} XP</span>
                                <span>{nextLevelXP} XP</span>
                            </div>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNextLevel}%` }}
                                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-[length:200%_100%] rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-xs text-center text-white/40 font-bold">
                                {language === 'es' ? `Faltan ${nextLevelXP - stats.total_xp} XP para subir de nivel` : `${nextLevelXP - stats.total_xp} XP to next level`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-black transition-all shadow-lg border-2",
                        activeTab === 'overview' ? "bg-indigo-600 text-white border-indigo-400 translate-y-[-2px]" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                >
                    📊 {language === 'es' ? 'Resumen' : 'Overview'}
                </button>
                <button
                    onClick={() => setActiveTab('badges')}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-black transition-all shadow-lg border-2",
                        activeTab === 'badges' ? "bg-amber-500 text-white border-amber-400 translate-y-[-2px]" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                >
                    🏅 {language === 'es' ? 'Medallas' : 'Medals'}
                </button>
                <button
                    onClick={() => setActiveTab('worlds')}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-black transition-all shadow-lg border-2",
                        activeTab === 'worlds' ? "bg-emerald-600 text-white border-emerald-400 translate-y-[-2px]" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                >
                    🏆 {language === 'es' ? 'Mundos' : 'Worlds'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-12"
                    >
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: language === 'es' ? 'Misiones' : 'Quests', value: stats.total_quests_completed, icon: Trophy, color: 'emerald' },
                                { label: language === 'es' ? 'Monedas' : 'Coins', value: stats.total_coins, icon: Sparkles, color: 'amber' },
                                { label: language === 'es' ? 'Racha 🔥' : 'Streak 🔥', value: stats.current_streak, icon: Flame, color: 'orange' },
                                { label: language === 'es' ? 'Precisión' : 'Accuracy', value: `${stats.accuracy_rate}%`, icon: Target, color: 'rose' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-slate-100 flex flex-col items-center justify-center text-center gap-1 group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={cn("w-6 h-6", `text-${stat.color}-500`)} />
                                    </div>
                                    <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Column: Learning Powers */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-slate-100">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-800 font-fredoka">
                                                {language === 'es' ? 'Poderes de Aprendizaje' : 'Learning Powers'}
                                            </h3>
                                            <p className="text-slate-400 font-bold text-sm">Tus puntos por completar tareas y flashcards</p>
                                        </div>
                                        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl font-black text-xs">
                                            ACTUALIZADO
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        {[
                                            {
                                                id: 'math',
                                                label: language === 'es' ? 'Matemáticas' : 'Math',
                                                icon: '🧮',
                                                value: stats.quests_by_category.math,
                                                color: 'from-blue-400 to-indigo-600',
                                                glow: 'shadow-blue-500/20'
                                            },
                                            {
                                                id: 'science',
                                                label: language === 'es' ? 'Ciencias' : 'Science',
                                                icon: '🔬',
                                                value: stats.quests_by_category.science,
                                                color: 'from-emerald-400 to-teal-600',
                                                glow: 'shadow-emerald-500/20'
                                            },
                                            {
                                                id: 'language',
                                                label: language === 'es' ? 'Lenguaje' : 'Language',
                                                icon: '📚',
                                                value: stats.quests_by_category.language,
                                                color: 'from-purple-400 to-pink-600',
                                                glow: 'shadow-purple-500/20'
                                            },
                                            {
                                                id: 'social_studies',
                                                label: language === 'es' ? 'Sociales' : 'Social Studies',
                                                icon: '🌍',
                                                value: stats.quests_by_category.social_studies,
                                                color: 'from-orange-400 to-amber-600',
                                                glow: 'shadow-orange-500/20'
                                            }
                                        ].map((subject) => {
                                            const level = Math.floor(subject.value / 5) + 1;
                                            const progress = ((subject.value % 5) / 5) * 100;

                                            return (
                                                <div key={subject.id} className="group cursor-help">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                                                {subject.icon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-2xl font-black text-slate-800">{subject.label}</span>
                                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                                        NIVEL {level}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-400">
                                                                    {subject.value} {language === 'es' ? 'Puntos de Sabiduría' : 'Wisdom Points'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-4xl font-black text-slate-800">{Math.round(progress)}%</div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase">Progreso</div>
                                                        </div>
                                                    </div>
                                                    <div className="h-6 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 p-1">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.max(progress, 8)}%` }}
                                                            className={`h-full bg-gradient-to-r ${subject.color} rounded-xl shadow-lg ${subject.glow}`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Badges & Streaks */}
                            <div className="space-y-8">
                                {/* Streaks Card */}
                                <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                    <Flame className="absolute -bottom-8 -right-8 w-40 h-40 opacity-20 rotate-12" />
                                    <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                        <Flame className="w-6 h-6" />
                                        {language === 'es' ? 'Racha de Estudio' : 'Study Streak'}
                                    </h4>
                                    <div className="text-6xl font-black mb-2">{stats.current_streak}</div>
                                    <p className="text-orange-100 font-bold">
                                        {language === 'es' ? '¡Días seguidos aprendiendo!' : 'Days learning in a row!'}
                                    </p>
                                    <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                        <span>Record: {stats.longest_streak} días</span>
                                        <div className="bg-white/20 px-3 py-1 rounded-full border border-white/20">
                                            {stats.current_streak >= 1 ? "ON FIRE 🔥" : "KEEP GOING"}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Badges Overlay */}
                                <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-slate-100">
                                    <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                        <Award className="w-6 h-6 text-purple-500" />
                                        {language === 'es' ? 'Tus Medallas' : 'Your Medals'}
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {badges.slice(0, 6).map((badge) => {
                                            const isUnlocked = stats.unlocked_badges.includes(badge.id);
                                            return (
                                                <div
                                                    key={badge.id}
                                                    title={badge.name[language]}
                                                    className={cn(
                                                        "aspect-square rounded-2xl flex items-center justify-center text-3xl",
                                                        isUnlocked ? "bg-slate-50 shadow-inner" : "bg-slate-100 opacity-20 scale-90"
                                                    )}
                                                >
                                                    {badge.icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('badges')}
                                        className="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold text-sm rounded-2xl transition-all"
                                    >
                                        {language === 'es' ? 'VER TODAS' : 'VIEW ALL'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : activeTab === 'badges' ? (
                    <motion.div
                        key="badges"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {badges.map((badge) => {
                            const isUnlocked = stats.unlocked_badges.includes(badge.id);
                            return (
                                <motion.div
                                    key={badge.id}
                                    whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                                    className={cn(
                                        "relative p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-center text-center",
                                        isUnlocked
                                            ? `bg-gradient-to-br ${rarityStyles[badge.rarity as keyof typeof rarityStyles]} shadow-2xl`
                                            : "bg-slate-100 border-slate-200 opacity-40 grayscale"
                                    )}
                                >
                                    <div className="text-6xl mb-4 drop-shadow-lg">{badge.icon}</div>
                                    <h3 className="text-lg font-black leading-tight mb-2">{badge.name[language]}</h3>
                                    <p className="text-xs font-medium opacity-80">{badge.description[language]}</p>

                                    {isUnlocked && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="mt-4 px-3 py-1 rounded-full bg-black/5 text-[10px] font-black uppercase tracking-tighter">
                                        {badge.rarity}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="worlds"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                    >
                        {/* World Trophies Gallery */}
                        <div className="bg-white rounded-[3rem] p-10 shadow-xl border-4 border-slate-100">
                            <h3 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <Crown className="w-8 h-8 text-yellow-500" />
                                {language === 'es' ? 'Trofeos de Aventura' : 'Adventure Trophies'}
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                                {[
                                    { id: 'm-g1-1', name: 'Censo G1', icon: '🐾' },
                                    { id: 'm-g1-2', name: 'Médico G1', icon: '🩺' },
                                    { id: 'm-g1-3', name: 'Boss G1', icon: '👑' },
                                    { id: 'm-g3-1', name: 'Energía G3', icon: '⚡' },
                                    { id: 'm-g5-1', name: 'Oxígeno G5', icon: '💨' },
                                ].map((trophy) => {
                                    const isUnlocked = stats.unlocked_trophies?.includes(`trophy-${trophy.id}`);
                                    return (
                                        <motion.div
                                            key={trophy.id}
                                            whileHover={isUnlocked ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
                                            className={cn(
                                                "relative aspect-square rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all overflow-hidden p-4",
                                                isUnlocked
                                                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-200 shadow-xl"
                                                    : "bg-slate-100 border-slate-200 opacity-40"
                                            )}
                                        >
                                            <div className="text-5xl mb-2 filter drop-shadow-md">
                                                {isUnlocked ? trophy.icon : '❓'}
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest text-center leading-tight",
                                                isUnlocked ? "text-white" : "text-slate-400"
                                            )}>
                                                {isUnlocked ? trophy.name : 'Bloqueado'}
                                            </span>

                                            {/* Sparkle Effect for Unlocked */}
                                            {isUnlocked && (
                                                <motion.div
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="absolute inset-0 bg-white/20 pointer-events-none"
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
