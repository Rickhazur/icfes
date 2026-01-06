import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Gamepad2, Skull, Sparkles, MessageCircle, Crown, Swords, X, Clock, CheckCircle2, PlayCircle, Lightbulb, BookOpen, TrendingUp, Waves } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useAvatar } from '@/context/AvatarContext';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';
import { AvatarShop } from '@/components/Gamification/AvatarShop';
import { mockArenaPlayers, getDailyQuests, ArenaQuest } from '../../data/arenaMockData';
import { fetchArenaQuests, fetchUserQuestProgress, completeQuest } from '../../services/supabase';
import { Language, GradeLevel, ViewState } from '../../types';
import { cn } from '@/lib/utils';
import { PedagogicalQuest } from './PedagogicalQuest';
import { pedagogicalQuests, getPedagogicalQuestsByGrade, type PedagogicalQuestData } from '../../data/pedagogicalQuests';
import { recordQuestCompletion } from '../../services/learningProgress';
import { LearningProgress } from './LearningProgress';
import { usePresence } from '../../hooks/usePresence';
import { supabase } from '@/services/supabase';
import { PetPanel } from '../Gamification/PetPanel';
import { notifyArenaInteraction } from '@/services/notifications';
import { toast } from 'sonner';
import { AdventureArena } from './AdventureArena';

interface ArenaLobbyProps {
    language: Language;
    grade: GradeLevel;
    userId?: string;
    onNavigate?: (view: ViewState) => void;
}

export function ArenaLobby({ language, grade, userId, onNavigate }: ArenaLobbyProps) {
    // Gamification & Tabs
    const { xp, coins, addCoins, addXP } = useGamification();
    const [activeTab, setActiveTab] = useState<'lobby' | 'quests' | 'leaderboard' | 'shop' | 'pets'>('lobby');

    // Quests State
    const [quests, setQuests] = useState<ArenaQuest[]>([]);
    const [isLoadingQuests, setIsLoadingQuests] = useState(true);

    // Fetch Quests from Supabase (with fallback to mock)
    useEffect(() => {
        const loadQuests = async () => {
            setIsLoadingQuests(true);
            try {
                // 1. Fetch Quests
                const dbQuests = await fetchArenaQuests(grade);
                if (dbQuests && dbQuests.length > 0) {
                    setQuests(dbQuests);
                } else {
                    // Fallback to mock data if DB is empty
                    console.log('Using mock quests fallback');
                    setQuests(getDailyQuests(grade));
                }

                // 2. Fetch Progress
                if (userId) {
                    const completed = await fetchUserQuestProgress(userId);
                    setCompletedQuestIds(completed);
                }
            } catch (error) {
                console.error('Error loading arena:', error);
                setQuests(getDailyQuests(grade));
            } finally {
                setIsLoadingQuests(false);
            }
        };

        loadQuests();
    }, [grade, userId]);

    // REAL-TIME: Online Players State
    const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);

    // AVATAR CONTEXT for User
    const { currentAvatar, equippedAccessories } = useAvatar();

    // MOCK: Current User Player
    const currentPlayer = {
        name: 'Tú (You)',
        level: Math.floor(xp / 1000) + 1,
        avatar: currentAvatar,
        accessories: equippedAccessories,
        coins: coins,
        grade: grade
    };

    // TRACK PRESENCE:
    usePresence(userId, currentPlayer.name, 'arena', currentAvatar || undefined, equippedAccessories, grade);

    useEffect(() => {
        if (!supabase) return;

        const fetchOnlinePlayers = async () => {
            if (!supabase) return;
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
            const { data } = await supabase
                .from('players_presence')
                .select('*')
                .eq('current_view', 'arena')
                .gt('last_seen', fiveMinutesAgo)
                .eq('grade', grade); // Only show classmates from SAME GRADE

            if (data && supabase) {
                setOnlinePlayers(data.filter(p => p.user_id !== userId));
            }
        };

        fetchOnlinePlayers();

        const channel = supabase
            .channel('online-players')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'players_presence',
                filter: `current_view=eq.arena`
            }, () => {
                fetchOnlinePlayers();
            })
            .subscribe();

        return () => {
            if (supabase) {
                supabase.removeChannel(channel);
            }
        };
    }, [userId]);

    const handleInteraction = async (player: any, type: 'wave' | 'challenge') => {
        if (!userId) {
            toast.error(language === 'es' ? 'Debes iniciar sesión' : 'You must log in');
            return;
        }

        try {
            await notifyArenaInteraction(player.user_id, currentPlayer.name, type);
            toast.success(
                type === 'wave'
                    ? (language === 'es' ? `¡Has saludado a ${player.user_name}!` : `You waved to ${player.user_name}!`)
                    : (language === 'es' ? `¡Has desafiado a ${player.user_name}!` : `You challenged ${player.user_name}!`)
            );
        } catch (err) {
            console.error('Interaction failed:', err);
            toast.error(language === 'es' ? 'Error al interactuar' : 'Interaction failed');
        }
    };

    // Load Pedagogical Quests for current grade
    useEffect(() => {
        const pedQuests = getPedagogicalQuestsByGrade(grade);
        setPedagogicalQuestsForGrade(pedQuests);
    }, [grade]);

    // --- QUEST LOGIC ---
    const [selectedQuest, setSelectedQuest] = useState<ArenaQuest | null>(null);
    const [questStep, setQuestStep] = useState<'briefing' | 'active' | 'success'>('briefing');
    const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);

    // Pedagogical Quest State
    const [selectedPedagogicalQuest, setSelectedPedagogicalQuest] = useState<PedagogicalQuestData | null>(null);
    const [pedagogicalQuestsForGrade, setPedagogicalQuestsForGrade] = useState<PedagogicalQuestData[]>([]);
    const [showStats, setShowStats] = useState(false);

    const speakArena = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    const handlePlayClick = (quest: ArenaQuest) => {
        if (completedQuestIds.includes(quest.id)) return;
        setSelectedQuest(quest);
        setQuestStep('briefing');
        setShowHint(false);

        const title = language === 'es' ? quest.title.es : quest.title.en;
        speakArena(language === 'es' ? `Misión: ${title}` : `Mission: ${title}`);
    };

    const handleStartMission = () => {
        if (!selectedQuest || !onNavigate) {
            // Fallback for no navigation context
            setSelectedQuest(null);
            return;
        }

        // 1. Prepare Mission Context
        const missionContext = {
            id: selectedQuest.id,
            title: language === 'es' ? selectedQuest.title.es : selectedQuest.title.en,
            description: language === 'es' ? selectedQuest.description.es : selectedQuest.description.en,
            category: selectedQuest.category,
            difficulty: selectedQuest.difficulty,
            reward: selectedQuest.reward
        };

        // 2. Save to LocalStorage for the Tutor to pick up
        localStorage.setItem('nova_mission_params', JSON.stringify(missionContext));

        // 3. Navigate to appropriate tool
        const categoryMap: Record<string, ViewState> = {
            'math': ViewState.MATH_TUTOR,
            'sci': ViewState.RESEARCH_CENTER,
            'hist': ViewState.RESEARCH_CENTER,
            'lang': ViewState.BUDDY_LEARN,
            'art': ViewState.ARTS_TUTOR
        };

        // Fuzzy match or default
        const targetView = categoryMap[selectedQuest.category] || ViewState.MATH_TUTOR;

        speakArena(language === 'es' ? '¡Desplegando herramientas de misión!' : 'Deploying mission tools!');
        onNavigate(targetView);
    };

    const handleAnswer = (optionId: string) => {
        if (!selectedQuest?.challenge) return;

        if (optionId === selectedQuest.challenge.correctOptionId) {
            setQuestStep('success');
        } else {
            // Shake effect or simple alert for now
            // In a real app we'd use a toast or shake animation
            alert(language === 'es' ? '¡Inténtalo de nuevo!' : 'Try again!');
        }
    };

    const [showHint, setShowHint] = useState(false);

    const handleClaimReward = async () => {
        if (!selectedQuest || !userId) return;

        // Optimistic UI update
        addCoins(selectedQuest.reward.coins, `Misión Arena: ${selectedQuest.title.es}`);
        addXP(selectedQuest.reward.xp);
        setCompletedQuestIds([...completedQuestIds, selectedQuest.id]);

        // Persist to DB
        await completeQuest(userId, selectedQuest);

        setSelectedQuest(null);
    };

    // Pedagogical Quest Handlers
    const handlePedagogicalQuestComplete = async (questId: string, correct: boolean) => {
        const quest = pedagogicalQuestsForGrade.find(q => q.id === questId);
        if (!quest) return;

        // Award rewards
        const questTitle = language === 'es' ? quest.title.es : quest.title.en;
        addCoins(quest.reward.coins, `Misión Pedagógica: ${questTitle}`);
        addXP(quest.reward.xp);

        // Mark as completed
        setCompletedQuestIds([...completedQuestIds, questId]);

        // Save to database if userId available
        if (userId) {
            // Award Pet XP if the student has a pet
            const awardPetXP = async () => {
                if (!supabase) return;
                const { data: pet } = await supabase
                    .from('student_pets')
                    .select('*')
                    .eq('student_id', userId)
                    .maybeSingle();

                if (pet) {
                    const xpGained = 20;
                    let newLevel = pet.level;
                    const newXp = (pet.xp || 0) + xpGained;
                    const xpForNextLevel = (pet.level + 1) * 100;

                    if (newXp >= xpForNextLevel) {
                        newLevel += 1;
                    }

                    await supabase
                        .from('student_pets')
                        .update({ xp: newXp, level: newLevel })
                        .eq('id', pet.id);
                }
            };
            awardPetXP();

            // General Quest Completion (existing gamification)
            await completeQuest(userId, {
                id: questId,
                title: quest.title,
                description: { es: '', en: '' },
                icon: quest.icon,
                category: quest.category === 'language' ? 'history' : quest.category as any,
                difficulty: quest.difficulty,
                reward: quest.reward,
                challenge: quest.challenge as any,
                duration: 10,
                minPlayers: 1,
                maxPlayers: 1,
                minGrade: quest.grade,
                maxGrade: quest.grade
            });

            // Detailed Learning Progress Tracking
            await recordQuestCompletion(userId, questId, {
                title: questTitle,
                category: quest.category as any,
                difficulty: quest.difficulty,
                wasCorrect: correct,
                coinsEarned: quest.reward.coins,
                xpEarned: quest.reward.xp
            });
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
            </div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg transform rotate-3">
                        <Swords className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 font-fredoka tracking-tight">
                            {language === 'es' ? 'El Archipiélago Nova' : 'The Nova Archipelago'}
                        </h1>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Waves className="w-3 h-3" />
                            {language === 'es' ? `Aventura de ${grade}° Grado` : `${grade === 1 ? '1st' : grade === 2 ? '2nd' : grade === 3 ? '3rd' : grade + 'th'} Grade Adventure`}
                        </span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
                    <button
                        onClick={() => setActiveTab('lobby')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'lobby' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lobby
                    </button>
                    <button
                        onClick={() => setActiveTab('quests')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'quests' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {language === 'es' ? 'Misiones' : 'Quests'}
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Ranking
                    </button>
                    <button
                        onClick={() => setActiveTab('pets')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'pets' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {language === 'es' ? 'Mascotas' : 'Pets'}
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowStats(true)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors shadow-sm flex items-center gap-2 px-3"
                        title={language === 'es' ? 'Mis Estadísticas' : 'My Stats'}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-bold hidden sm:inline">
                            {language === 'es' ? 'Mis Logros' : 'My Achievements'}
                        </span>
                    </button>
                    <div className="bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 flex items-center gap-2">
                        <span className="text-lg">🪙</span>
                        <span className="font-bold text-yellow-700">{coins}</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-6 z-10">
                <AnimatePresence mode="wait">

                    {/* LOBBY VIEW */}
                    {activeTab === 'lobby' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        >
                            {/* Current User Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-100 relative group transform transition hover:-translate-y-1">
                                <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    YOU
                                </div>
                                <div className="flex justify-center mb-4">
                                    <AvatarDisplay size="lg" className="shadow-md group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-center font-bold text-slate-800 text-lg">{currentPlayer.name}</h3>
                                <p className="text-center text-slate-500 text-sm font-bold mb-4">Lvl {currentPlayer.level}</p>
                                <button
                                    onClick={() => setActiveTab('shop')}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                                >
                                    {language === 'es' ? 'Editar Avatar' : 'Edit Avatar'}
                                </button>
                            </div>

                            {/* Other Online Players (Real-time) */}
                            {onlinePlayers.length === 0 ? (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-10 flex-col opacity-60">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-400">
                                        {language === 'es' ? 'No hay otros héroes en línea' : 'No other heroes online'}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {language === 'es' ? '¡Invita a tus amigos a la arena!' : 'Invite your friends to the arena!'}
                                    </p>
                                </div>
                            ) : (
                                onlinePlayers.map((player) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={player.user_id}
                                        className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-md border border-slate-100 relative group hover:shadow-xl transition-all hover:bg-white flex flex-col items-center"
                                    >
                                        <div className="absolute top-3 right-3 flex gap-1">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                En Vivo
                                            </span>
                                        </div>
                                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-105">
                                            {player.avatar_id ? (
                                                <AvatarDisplay
                                                    avatarId={player.avatar_id}
                                                    accessoriesOverride={player.equipped_accessories}
                                                    size="md"
                                                    className="w-full h-full shadow-lg border-2 border-indigo-100"
                                                />
                                            ) : (
                                                <div className="text-4xl">👤</div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">{player.user_name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-indigo-100 italic">
                                                Exploring Arena
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2 w-full">
                                            <button
                                                onClick={() => handleInteraction(player, 'wave')}
                                                className="flex-1 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-xs font-bold text-slate-500 transition border border-slate-100 flex items-center justify-center gap-1"
                                            >
                                                Saludar 👋
                                            </button>
                                            <button
                                                onClick={() => handleInteraction(player, 'challenge')}
                                                className="flex-1 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-xl text-xs font-bold text-indigo-600 transition border border-indigo-100 flex items-center justify-center gap-1"
                                            >
                                                Desafiar ⚔️
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* QUESTS VIEW */}
                    {activeTab === 'quests' && (
                        <motion.div
                            key="quests"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-6xl mx-auto"
                        >
                            <AdventureArena
                                grade={grade}
                                language={language}
                                userId={userId || ''}
                                completedMissionIds={completedQuestIds}
                                onComplete={handlePedagogicalQuestComplete}
                            />
                        </motion.div>
                    )}

                    {/* LEADERBOARD VIEW */}
                    {activeTab === 'leaderboard' && (
                        <motion.div
                            key="leaderboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200"
                        >
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-center text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, white 20%)', backgroundSize: '20px 20px' }} />
                                <Crown className="w-16 h-16 mx-auto mb-4 drop-shadow-md" />
                                <h2 className="text-3xl font-black font-fredoka mb-2">{language === 'es' ? 'Ranking Semanal' : 'Weekly Ranking'}</h2>
                                <p className="font-medium opacity-90">{language === 'es' ? '¡Compite para ganar premios exclusivos!' : 'Compete to win exclusive prizes!'}</p>
                            </div>

                            <div className="p-6">
                                {[
                                    {
                                        id: userId || 'current_user',
                                        name: language === 'es' ? 'Tú (You)' : 'You',
                                        level: Math.floor(xp / 100) + 1,
                                        avatarUrl: '', // Not used for current user
                                        grade: grade,
                                        coins: coins,
                                        status: 'online',
                                        badges: ['🌟'],
                                        isCurrentUser: true
                                    },
                                    ...mockArenaPlayers
                                ].sort((a, b) => b.coins - a.coins).map((player, idx) => (
                                    <div key={player.id} className={cn(
                                        "flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition border-b border-slate-50 last:border-0",
                                        (player as any).isCurrentUser && "bg-indigo-50 hover:bg-indigo-100 border-indigo-100"
                                    )}>
                                        <div className={`w-8 h-8 flex items-center justify-center font-black rounded-full ${idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                                            idx === 1 ? 'bg-slate-200 text-slate-600' :
                                                idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                                            }`}>
                                            {idx + 1}
                                        </div>

                                        {/* Avatar Logic: Use Component for User, Img for Bots */}
                                        {(player as any).isCurrentUser ? (
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-indigo-200">
                                                <AvatarDisplay size="sm" showBackground={false} className="w-full h-full" />
                                            </div>
                                        ) : (
                                            <img src={(player as any).avatarUrl} alt={player.name} className="w-12 h-12 rounded-full bg-slate-100" />
                                        )}

                                        <div className="flex-1">
                                            <h4 className={cn("font-bold", (player as any).isCurrentUser ? "text-indigo-700" : "text-slate-700")}>
                                                {player.name} {(player as any).isCurrentUser && (language === 'es' ? '(Yo)' : '(Me)')}
                                            </h4>
                                            <div className="flex text-xs text-slate-400 gap-2">
                                                <span>Lvl {player.level}</span>
                                                <span>•</span>
                                                <span>{player.grade}° Grade</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-indigo-600">{(player as any).coins.toLocaleString()} 🪙</span>
                                            <span className="text-xs text-slate-400">{(player as any).badges?.join(' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SHOP VIEW */}
                    {activeTab === 'shop' && (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full"
                        >
                            <div className="flex items-center mb-4">
                                <button onClick={() => setActiveTab('lobby')} className="mr-4 text-slate-500 hover:text-slate-800">
                                    ← {language === 'es' ? 'Volver' : 'Back'}
                                </button>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {language === 'es' ? 'Tienda de Avatar' : 'Avatar Shop'}
                                </h2>
                            </div>
                            <div className="h-[calc(100%-60px)]">
                                <AvatarShop />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'pets' && (
                        <motion.div
                            key="pets"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto py-10"
                        >
                            <PetPanel userId={userId || ''} />

                            <div className="mt-8 bg-white/50 backdrop-blur-md rounded-[2rem] p-8 border-2 border-dashed border-indigo-100 text-center">
                                <h3 className="text-lg font-bold text-slate-400 mb-2 italic">Próximamente...</h3>
                                <p className="text-sm text-slate-400 max-w-sm mx-auto">Estamos preparando un establo completo para que tus mascotas puedan entrenar y ganar habilidades especiales.</p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* QUEST MODAL */}
            <AnimatePresence>
                {
                    selectedQuest && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                            >
                                {/* Modal Header */}
                                <div className={`p-6 text-white text-center relative overflow-hidden ${selectedQuest.category === 'math' ? 'bg-blue-500' :
                                    selectedQuest.category === 'science' ? 'bg-green-500' :
                                        'bg-amber-500'
                                    }`}>
                                    <button
                                        onClick={() => setSelectedQuest(null)}
                                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                    <div className="text-6xl mb-2 animate-bounce-slow">
                                        {selectedQuest.icon}
                                    </div>
                                    <h2 className="text-2xl font-black font-fredoka">
                                        {language === 'en' ? selectedQuest.title.en : selectedQuest.title.es}
                                    </h2>
                                    <div className="flex justify-center gap-4 mt-2 mb-2 text-sm font-bold bg-white/20 py-1 px-4 rounded-full mx-auto w-fit">
                                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> +{selectedQuest.reward.coins}</span>
                                        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> +{selectedQuest.reward.xp} XP</span>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-8 text-center">
                                    {questStep === 'briefing' && (
                                        <div className="space-y-6">
                                            <p className="text-lg text-slate-600 font-medium">
                                                {language === 'en' ? selectedQuest.description.en : selectedQuest.description.es}
                                            </p>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                    {language === 'es' ? 'OBJETIVO' : 'OBJECTIVE'}
                                                </h4>
                                                <p className="font-bold text-slate-800">
                                                    {selectedQuest.dbaReference ? `Complete: ${selectedQuest.dbaReference}` : (language === 'es' ? 'Completa la misión satisfactoriamente.' : 'Complete the mission successfully.')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleStartMission}
                                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-200 hover:scale-105 transition-transform flex items-center justify-center gap-3"
                                            >
                                                <PlayCircle className="w-6 h-6" />
                                                {language === 'es' ? '¡Comenzar Misión!' : 'Start Mission!'}
                                            </button>
                                        </div>
                                    )}

                                    {questStep === 'active' && (
                                        <div className="space-y-6 py-2 text-left">
                                            {selectedQuest.challenge ? (
                                                <>
                                                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-indigo-100 mb-6 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                                            <Sparkles className="w-24 h-24 text-indigo-500" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-slate-800 mb-2 font-fredoka flex items-center gap-2 relative z-10">
                                                            <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg text-xs uppercase tracking-wider shadow-sm border border-indigo-200">
                                                                {language === 'es' ? 'Situación Real' : 'Real Scenario'}
                                                            </span>
                                                        </h3>
                                                        <p className="text-slate-700 font-medium relative z-10 text-lg leading-relaxed">
                                                            {language === 'en' ? selectedQuest.challenge.question.en : selectedQuest.challenge.question.es}
                                                        </p>
                                                    </div>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="grid gap-3"
                                                    >
                                                        {selectedQuest.challenge.options?.map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => handleAnswer(opt.id)}
                                                                className="w-full p-4 text-left bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition-all font-medium text-slate-700 active:scale-95 flex items-center gap-3 group"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-colors">
                                                                    {opt.id.toUpperCase()}
                                                                </div>
                                                                <span className="flex-1">
                                                                    {language === 'en' ? opt.text.en : opt.text.es}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </motion.div>

                                                    <div className="mt-6 flex justify-center">
                                                        {!showHint ? (
                                                            <button
                                                                onClick={() => setShowHint(true)}
                                                                className="flex items-center gap-2 text-amber-500 font-bold hover:text-amber-600 transition animate-pulse hover:scale-105"
                                                            >
                                                                <Lightbulb className="w-5 h-5 fill-current" />
                                                                {language === 'es' ? 'Invocar Ayuda del Ángel' : 'Summon Angel Help'}
                                                            </button>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4 shadow-sm w-full"
                                                            >
                                                                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                                                                    <div className="relative">
                                                                        <Lightbulb className="w-6 h-6 text-amber-600 fill-amber-600 animate-pulse" />
                                                                        <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 animate-spin-slow" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-amber-700 uppercase mb-1 tracking-wider">
                                                                        {language === 'es' ? 'Tu Ángel Guardián susurra:' : 'Your Guardian Angel whispers:'}
                                                                    </p>
                                                                    <p className="text-sm text-amber-900 italic font-medium leading-relaxed">
                                                                        "{language === 'en' ? selectedQuest.challenge.hint.en : selectedQuest.challenge.hint.es}"
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </>

                                            ) : (
                                                <div className="text-center py-10">
                                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                                            <circle cx="48" cy="48" r="40" stroke="#6366f1" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset="0" className="animate-[dash_2s_linear_forwards]" />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Clock className="w-8 h-8 text-indigo-500 animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-500 italic">
                                                        {language === 'es' ? 'Simulando desafío...' : 'Simulating challenge...'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {questStep === 'success' && (
                                        <div className="space-y-6">
                                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1s_infinite]">
                                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-800">
                                                {language === 'es' ? '¡Misión Cumplida!' : 'Mission Accomplished!'}
                                            </h3>
                                            <div className="flex justify-center gap-4">
                                                <div className="px-6 py-3 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                                                    <p className="text-xs font-bold text-yellow-600 uppercase">Coins</p>
                                                    <p className="text-2xl font-black text-yellow-500">+{selectedQuest.reward.coins}</p>
                                                </div>
                                                <div className="px-6 py-3 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                                                    <p className="text-xs font-bold text-purple-600 uppercase">XP</p>
                                                    <p className="text-2xl font-black text-purple-500">+{selectedQuest.reward.xp}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleClaimReward}
                                                className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-xl shadow-xl shadow-green-200 hover:bg-green-600 transition-colors"
                                            >
                                                {language === 'es' ? '¡Reclamar Recompensa!' : 'Claim Reward!'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Pedagogical Quest Modal */}
            {selectedPedagogicalQuest && (
                <PedagogicalQuest
                    quest={selectedPedagogicalQuest}
                    language={language === 'bilingual' ? 'es' : language}
                    onComplete={handlePedagogicalQuestComplete}
                    onClose={() => setSelectedPedagogicalQuest(null)}
                />
            )}

            {/* Learning Stats Modal */}
            {showStats && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative border-4 border-indigo-200"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowStats(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-500 transition-all z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="overflow-y-auto max-h-[90vh]">
                            <LearningProgress
                                userId={userId || ''}
                                language={language === 'bilingual' ? 'es' : language}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </div >
    );
}
