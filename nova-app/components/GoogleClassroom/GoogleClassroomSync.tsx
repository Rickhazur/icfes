import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    CheckCircle,
    AlertCircle,
    BookOpen,
    Zap,
    Target,
    Trophy,
    Star,
    TrendingUp,
    Globe,
    Lock,
    Unlock,
    Activity,
    Cloud,
    Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useGamification } from '@/context/GamificationContext';
import { useLearning } from '@/context/LearningContext';
import { recordQuestCompletion } from '@/services/learningProgress';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getGoogleAuthUrl,
    exchangeCodeForTokens,
    fetchCourses,
    fetchAllAssignments,
    refreshAccessToken
} from '../../services/googleClassroom';
import {
    saveGoogleTokens,
    getGoogleTokens,
    syncGoogleClassroomCourses,
    syncGoogleClassroomAssignments,
    getGoogleClassroomAssignments,
    claimClassroomRewards,
    supabase
} from '../../services/supabase';
import { convertAssignmentsToMissions, markAssignmentAsSynced } from '../../services/missionConverter';
import { cn } from '@/lib/utils';

export const GoogleClassroomSync = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [userGrade, setUserGrade] = useState(5);
    const [showMissions, setShowMissions] = useState(false);

    const { addXP, addCoins } = useGamification();

    const loadAssignments = useCallback(async (uid: string) => {
        const data = await getGoogleClassroomAssignments(uid);
        setAssignments(data);

        // Auto-convert to missions
        const convertedMissions = convertAssignmentsToMissions(data, userGrade);
        setMissions(convertedMissions);
    }, [userGrade]);



    // NEW: Language Context
    const { setLanguage } = useLearning();

    const handleSync = useCallback(async () => {
        if (!userId) return;

        setIsSyncing(true);
        try {
            let tokens = await getGoogleTokens(userId);
            if (!tokens) {
                toast.error('No estás conectado a Google Classroom');
                return;
            }

            // Check if token expired
            if (new Date(tokens.expires_at) < new Date()) {
                const newTokens = await refreshAccessToken(tokens.refresh_token);
                await saveGoogleTokens(userId, newTokens);
                tokens = await getGoogleTokens(userId);
            }

            // Fetch and sync courses
            const courses = await fetchCourses(tokens!.access_token);
            await syncGoogleClassroomCourses(userId, courses);

            // Fetch and sync assignments
            const allAssignments = await fetchAllAssignments(tokens!.access_token);
            await syncGoogleClassroomAssignments(userId, allAssignments);

            // --- LANGUAGE DETECTION LOGIC ---
            // Combine all titles to detect dominant language
            const combinedText = [
                ...courses.map((c: any) => c.name),
                ...allAssignments.map((a: any) => a.title)
            ].join(' ').toLowerCase();

            const enKeywords = ['math', 'science', 'history', 'geography', 'physics', 'chemistry', 'grade', 'homework', 'assignment'];
            const esKeywords = ['matemática', 'matemáticas', 'ciencia', 'ciencias', 'historia', 'geografía', 'física', 'química', 'grado', 'tarea', 'deber'];

            let enScore = 0;
            let esScore = 0;

            enKeywords.forEach(word => { if (combinedText.includes(word)) enScore++; });
            esKeywords.forEach(word => { if (combinedText.includes(word)) esScore++; });

            if (enScore > esScore) {
                setLanguage('en');
                toast.info("Language updated based on your Classes!", { description: "We detected English content." });
            } else if (esScore > enScore) {
                setLanguage('es');
                toast.info("¡Idioma actualizado según tus Clases!", { description: "Detectamos contenido en Español." });
            }
            // --------------------------------

            toast.success(`✅ ${allAssignments.length} tareas sincronizadas`);

            // AUTOMATED REWARDS LOGIC
            const pendingRewards = await claimClassroomRewards(userId);
            if (pendingRewards.length > 0) {
                let totalXP = 0;
                let totalCoins = 0;

                for (const reward of pendingRewards) {
                    const xp = 50;
                    const coins = 20;

                    totalXP += xp;
                    totalCoins += coins;

                    await recordQuestCompletion(userId, `gc_${reward.google_assignment_id}`, {
                        title: `Classroom: ${reward.title}`,
                        category: 'math',
                        difficulty: 'medium',
                        wasCorrect: true,
                        coinsEarned: coins,
                        xpEarned: xp
                    });
                }

                addXP(totalXP);
                addCoins(totalCoins, `¡Por completar ${pendingRewards.length} tareas de Classroom!`);

                toast.success(`🌟 ¡Ganaste ${totalXP} XP y ${totalCoins} Monedas!`, {
                    description: `Detectamos ${pendingRewards.length} tareas completadas.`,
                    duration: 5000
                });
            }

            await loadAssignments(userId);
        } catch (e: any) {
            console.error('Sync error:', e);
            toast.error('Error al sincronizar: ' + e.message);
        } finally {
            setIsSyncing(false);
        }
    }, [userId, addXP, addCoins, loadAssignments, setLanguage]);

    useEffect(() => {
        const init = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Get user grade from profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('grade')
                    .eq('id', user.id)
                    .single();

                if (profile?.grade) {
                    setUserGrade(parseInt(profile.grade) || 5);
                }

                const tokens = await getGoogleTokens(user.id);
                setIsConnected(!!tokens);
                if (tokens) {
                    loadAssignments(user.id);
                    // Proactive sync check
                    const lastSync = localStorage.getItem(`last_gc_sync_${user.id}`);
                    const now = Date.now();
                    if (!lastSync || (now - parseInt(lastSync)) > 1000 * 60 * 10) { // Sync every 10 mins automatically
                        handleSync();
                        localStorage.setItem(`last_gc_sync_${user.id}`, now.toString());
                    }
                }
            }
        };
        init();

        // Handle OAuth callback
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code && userId) {
            handleOAuthCallback(code);
        }
    }, [userId, handleSync, loadAssignments]);

    const handleOAuthCallback = async (code: string) => {
        if (!userId) return;

        try {
            const tokens = await exchangeCodeForTokens(code);
            await saveGoogleTokens(userId, tokens);
            setIsConnected(true);
            toast.success('¡Conectado a Google Classroom!');

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Trigger initial sync
            handleSync();
        } catch (e: any) {
            toast.error('Error al conectar: ' + e.message);
        }
    };

    const handleConnect = () => {
        const authUrl = getGoogleAuthUrl();
        window.location.href = authUrl;
    };

    const handleConvertToMissions = async () => {
        if (missions.length === 0) {
            toast.error('No hay tareas para convertir');
            return;
        }

        try {
            for (const mission of missions) {
                await markAssignmentAsSynced(mission.sourceId, mission.id);
            }

            toast.success(`🎯 ${missions.length} misiones creadas!`);
            setShowMissions(true);
        } catch (e: any) {
            toast.error('Error al crear misiones: ' + e.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* Main Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:translate-y-[-2px] transition-transform">
                            <Cloud className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 font-fredoka flex items-center gap-2">
                                Centro de Sincronización
                            </h1>
                            <p className="text-slate-500 font-medium">Google Classroom • Nova Schola</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    {isConnected ? (
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 border border-emerald-100">
                                <Activity className="w-4 h-4 animate-pulse" />
                                CONECTADO
                            </div>
                            <Button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="h-14 px-8 bg-indigo-600 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-3"
                            >
                                <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                                {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            className="h-14 px-8 bg-white border-2 border-slate-200 hover:border-black text-slate-700 font-black rounded-2xl shadow-md transition-all flex items-center gap-3"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                            Conectar con Google
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            {isConnected && (
                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-indigo-950 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-20 h-20" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Tareas Activas</div>
                        <div className="text-3xl font-black">{assignments.length}</div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300 font-bold">
                            <TrendingUp className="w-4 h-4" />
                            Actualizado cada vez que sincronizas
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden"
                    >
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Recompensas Nova</div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                <span className="text-2xl font-black text-slate-800">+50 XP</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100" />
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-2xl font-black text-slate-800">+20 🪙</span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-400">Puntos por cada tarea entregada</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-xl flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Misiones Automáticas</div>
                            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-black mb-2">{missions.length} Listas</div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleConvertToMissions}
                                className="w-full h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white border-none font-bold backdrop-blur-sm"
                            >
                                Convertir Todas
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Assignments Table / List */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">
                            {showMissions ? "Tus Misiones Nova" : "Tareas de Classroom"}
                        </h3>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setShowMissions(false)}
                            className={cn("px-4 py-2 rounded-lg font-black text-xs transition-all", !showMissions ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            TAREAS
                        </button>
                        <button
                            onClick={() => setShowMissions(true)}
                            className={cn("px-4 py-2 rounded-lg font-black text-xs transition-all", showMissions ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            MISIONES
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                        {(showMissions ? missions : assignments).length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="p-20 text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Globe className="w-10 h-10 text-slate-200" />
                                </div>
                                <h4 className="text-xl font-black text-slate-300">No hay datos por ahora</h4>
                                <p className="text-slate-400 font-medium">Sincroniza para ver tus tareas escolares</p>
                            </motion.div>
                        ) : (
                            (showMissions ? missions : assignments).map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 hover:bg-slate-50/50 transition-all group flex items-center gap-6"
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                        item.submission_state === 'TURNED_IN' || item.synced_to_mission ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
                                    )}>
                                        {item.submission_state === 'TURNED_IN' ? <Trophy className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-slate-800 text-lg truncate group-hover:text-indigo-600 transition-colors">
                                                {item.title}
                                            </h4>
                                            {item.submission_state === 'TURNED_IN' && (
                                                <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                                                    Entregado
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                            <span className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                                📚 {showMissions ? "Nova Mission" : (item.google_classroom_courses?.name || "General")}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                📅 {item.due_date ? new Date(item.due_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : "Sin fecha"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            <div className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-xl text-xs font-black border border-yellow-100">
                                                +{item.xpReward || 50} XP
                                            </div>
                                            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-100">
                                                +{item.coinReward || 20} 🪙
                                            </div>
                                        </div>
                                        {item.reward_claimed && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                                                <Star className="w-3 h-3 fill-emerald-500" />
                                                Recompensa Cobrada
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Insight */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-xl">
                        <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black mb-1">Nova Detect: Sincronización Inteligente</h4>
                        <p className="text-slate-400 font-medium">
                            Nuestra IA revisa tus entregas en Classroom. Si entregas una tarea real, Nova te premia automáticamente. ¡No hay que avisar a nadie!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
