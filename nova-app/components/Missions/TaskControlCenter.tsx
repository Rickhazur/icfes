import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, BookOpen, Calculator, Globe, Star, ArrowRight, Zap, CheckCircle, Lock, LayoutDashboard, Trophy, Calendar, Clock, ChevronRight, X, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LinaAvatar } from '@/components/MathMaestro/tutor/LinaAvatar';
import { ViewState } from '@/types';
import { sfx } from '@/services/soundEffects';
import { fetchParentMissions, completeParentMission } from '@/services/supabase';
import { toast } from 'sonner';

// Types
export type Subject = 'MATH' | 'ENGLISH' | 'RESEARCH' | 'ART' | 'PARENT';

export interface AcademicTask {
    id: string;
    title: string;
    description: string;
    subject: Subject;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number; // 0 to 100
    reward: number; // Coins
    dueDate: Date;
    route: ViewState; // ViewState enum
    params?: any; // To pass to the destination
}

interface TaskControlCenterProps {
    onNavigate: (view: ViewState) => void;
    userId: string;
}

// Helpers
const getDayLabel = (date: Date) => {
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return days[date.getDay()];
};

const getRelativeDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `${date.getDate()}/${date.getMonth() + 1}`;
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

// Mock Data
const MOCK_TASKS: AcademicTask[] = [
    {
        id: 't-math-01',
        title: 'Misión Multiplicación',
        description: 'Domina las tablas del 6 y 7 para desbloquear el siguiente nivel.',
        subject: 'MATH',
        difficulty: 'MEDIUM',
        status: 'AVAILABLE',
        progress: 0,
        reward: 50,
        dueDate: new Date(), // Due Today
        route: ViewState.MATH_TUTOR,
        params: { mode: 'multiplication', difficulty: 2 }
    },
    {
        id: 't-eng-01',
        title: 'Vocabulario Espacial',
        description: 'Aprende 10 palabras nuevas sobre el universo en inglés.',
        subject: 'ENGLISH',
        difficulty: 'EASY',
        status: 'IN_PROGRESS',
        progress: 40,
        reward: 30,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Due Tomorrow
        route: ViewState.BUDDY_LEARN,
        params: { topic: 'space', activity: 'flashcards' }
    },
    {
        id: 't-res-01',
        title: 'Investigación: Dinosaurios',
        description: 'Encuentra 3 datos curiosos sobre el T-Rex y escríbelos.',
        subject: 'RESEARCH',
        difficulty: 'HARD',
        status: 'LOCKED',
        progress: 0,
        reward: 100,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Due in 2 days
        route: ViewState.RESEARCH_CENTER,
        params: { topic: 'dinosaurs' }
    },
    {
        id: 't-res-02',
        title: 'Historia de Roma',
        description: 'Investiga quién fue Julio César.',
        subject: 'RESEARCH',
        difficulty: 'MEDIUM',
        status: 'AVAILABLE',
        progress: 0,
        reward: 60,
        dueDate: new Date(), // Due Today
        route: ViewState.RESEARCH_CENTER,
        params: { topic: 'julius caesar' }
    }

];

const SubjectIcons: Record<Subject, React.ReactNode> = {
    MATH: <Calculator className="w-5 h-5" />,
    ENGLISH: <Globe className="w-5 h-5" />,
    RESEARCH: <BookOpen className="w-5 h-5" />,
    ART: <Star className="w-5 h-5" />,
    PARENT: <Heart className="w-5 h-5 text-pink-400" />,
};

const SubjectColors: Record<Subject, string> = {
    MATH: 'bg-blue-500',
    ENGLISH: 'bg-indigo-500',
    RESEARCH: 'bg-emerald-500',
    ART: 'bg-pink-500',
    PARENT: 'bg-rose-500',
};

export function TaskControlCenter({ onNavigate, userId }: TaskControlCenterProps) {
    const [tasks, setTasks] = useState<AcademicTask[]>(MOCK_TASKS);
    const [selectedTask, setSelectedTask] = useState<AcademicTask | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [linaState, setLinaState] = useState<'idle' | 'speaking' | 'celebrating'>('idle');

    // Load Parent Missions
    useEffect(() => {
        const loadParentMissions = async () => {
            if (!userId) return;
            try {
                const missions = await fetchParentMissions(userId);
                if (missions && missions.length > 0) {
                    const mappedMissions: AcademicTask[] = missions.map((m: any) => ({
                        id: m.id,
                        title: `Misión: ${m.title}`,
                        description: `Categoría: ${m.category}. Recompensa especial: ¡${m.reward_coins} monedas!`,
                        subject: 'PARENT',
                        difficulty: 'MEDIUM',
                        status: 'AVAILABLE',
                        progress: 0,
                        reward: m.reward_coins,
                        dueDate: new Date(),
                        route: ViewState.DASHBOARD
                    }));

                    setTasks(prev => {
                        // Avoid duplicates if re-rendered
                        const existingIds = new Set(prev.map(t => t.id));
                        const newMissions = mappedMissions.filter(m => !existingIds.has(m.id));
                        return [...prev, ...newMissions];
                    });

                    // Auto-select first mission if none selected
                    if (!selectedTask) setSelectedTask(mappedMissions[0]);
                }
            } catch (err) {
                console.error("Error loading parent missions:", err);
            }
        };

        loadParentMissions();
    }, [userId]);

    const handleLaunchMission = async (task: AcademicTask) => {
        if (task.subject === 'PARENT') {
            // Logic for completing parent mission immediately
            try {
                await completeParentMission(task.id);
                setTasks(prev => prev.map(t =>
                    t.id === task.id
                        ? { ...t, status: 'COMPLETED', progress: 100 }
                        : t
                ));
                toast.success('¡Misión especial completada!');
                triggerCelebration();
                return;
            } catch (error) {
                console.error('Failed to complete mission:', error);
                toast.error('No se pudo completar la misión');
                return;
            }
        }

        console.log(`🚀 Launching mission: ${task.title} -> ${task.route}`);

        if (task.params) {
            localStorage.setItem('nova_mission_params', JSON.stringify(task.params));
        }

        onNavigate(task.route);
    };

    // DEBUG: Function to toggle task completion (For demo purposes)
    const toggleTaskCompletion = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening detail
        setTasks(prev => prev.map(t =>
            t.id === taskId
                ? { ...t, status: t.status === 'COMPLETED' ? 'AVAILABLE' : 'COMPLETED', progress: t.status === 'COMPLETED' ? 0 : 100 }
                : t
        ));
    };

    // Check for Daily Completion
    useEffect(() => {
        const dailyTasks = tasks.filter(t => isToday(t.dueDate));
        const completedDailyTasks = dailyTasks.filter(t => t.status === 'COMPLETED');

        if (dailyTasks.length > 0 && dailyTasks.length === completedDailyTasks.length) {
            triggerCelebration();
        }
    }, [tasks]);

    const triggerCelebration = () => {
        if (showCelebration) return; // Prevent double trigger

        setShowCelebration(true);
        setLinaState('celebrating');
        sfx.playSuccess();

        // Galactic Confetti Burst
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // Group tasks by relative date for the Agenda
    const agendaGroups = tasks.reduce((acc, task) => {
        const key = getRelativeDay(task.dueDate);
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
    }, {} as Record<string, AcademicTask[]>);

    const sortedGroups = Object.entries(agendaGroups).sort((a, b) => {
        if (a[0] === 'Hoy') return -1;
        if (b[0] === 'Hoy') return 1;
        if (a[0] === 'Mañana') return -1;
        if (b[0] === 'Mañana') return 1;
        return 0; // Simplified sort
    });

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-poppins selection:bg-cyan-500 overflow-hidden relative flex flex-col">

            {/* Celebration Modal Overlay */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => {
                            setShowCelebration(false);
                            setLinaState('idle');
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border-2 border-cyan-400 rounded-[3rem] p-8 max-w-2xl w-full relative shadow-[0_0_100px_rgba(34,211,238,0.3)] text-center overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Beams */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-cyan-500/20 to-transparent blur-[100px] -z-10" />

                            <button onClick={() => setShowCelebration(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                                <X className="w-8 h-8" />
                            </button>

                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 animate-ping opacity-20 bg-yellow-400 rounded-full" />
                                    <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                                </div>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 mb-4 tracking-tight">
                                ¡MISIÓN CUMPLIDA!
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-300 mb-8 font-medium">
                                Has completado todas las tareas de hoy. <br />
                                <span className="text-cyan-400 font-bold">¡Excelente trabajo, Cadete!</span>
                            </p>

                            <Button
                                className="h-16 px-12 text-xl font-black bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-2xl shadow-xl shadow-yellow-500/20"
                                onClick={() => {
                                    setShowCelebration(false);
                                    setLinaState('idle');
                                }}
                            >
                                RECIBIR RECOMPENSA
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent" />
                <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[0] left-[20%] w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[80px]" />

                {/* Abstract Grid */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
            </div>

            <div className="container mx-auto px-4 py-6 relative z-10 flex-1 flex flex-col">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="bg-slate-800 p-2 rounded-full border-2 border-slate-700 shadow-xl">
                            <LinaAvatar state={linaState === 'celebrating' ? 'celebrating' : 'idle'} size={80} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-3">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                                    CENTRO DE MANDO
                                </span>
                                <Rocket className="w-8 h-8 text-cyan-400 animate-pulse" />
                            </h1>
                            <p className="text-slate-400 font-medium text-lg">
                                Agenda Espacial Sincronizada.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex flex-col items-center min-w-[120px]">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Progreso</span>
                            <div className="text-2xl font-black text-emerald-400">35%</div>
                        </div>
                        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex flex-col items-center min-w-[120px]">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Recompensas</span>
                            <div className="text-2xl font-black text-yellow-400 flex items-center gap-1">
                                240 <span className="text-sm">🪙</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-8 flex-1 min-h-0">

                    {/* Left Column: Space Agenda (Timeline) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-cyan-500/30 p-6 flex flex-col h-full relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                            {/* Holographic Header */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                            <h3 className="text-cyan-400 font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Agenda Espacial
                            </h3>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
                                {sortedGroups.map(([day, dayTasks]) => (
                                    <div key={day} className="relative pl-6 border-l-2 border-slate-700/50">
                                        {/* Timeline Node */}
                                        <div className={cn(
                                            "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-slate-900",
                                            day === 'Hoy' ? "border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "border-slate-600"
                                        )} />

                                        <h4 className={cn(
                                            "text-lg font-bold mb-3 uppercase tracking-wider",
                                            day === 'Hoy' ? "text-white" : "text-slate-500"
                                        )}>{day}</h4>

                                        <div className="space-y-3">
                                            {dayTasks.map(task => (
                                                <motion.button
                                                    key={task.id}
                                                    onClick={() => setSelectedTask(task)}
                                                    whileHover={{ scale: 1.02, x: 5 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "w-full text-left p-3 rounded-xl border transition-all duration-300 relative group overflow-hidden",
                                                        selectedTask?.id === task.id
                                                            ? "bg-cyan-950/30 border-cyan-500/50"
                                                            : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                                            SubjectColors[task.subject].replace('bg-', 'bg-opacity-20 text-')
                                                        )}>
                                                            {SubjectIcons[task.subject]}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                                                                {task.title}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                                                <Clock className="w-3 h-3" />
                                                                16:00 PM
                                                            </div>
                                                        </div>
                                                        {/* CLICKABLE STATUS FOR DEMO (Hidden feature for testing) */}
                                                        <div
                                                            onClick={(e) => toggleTaskCompletion(task.id, e)}
                                                            className="cursor-pointer hover:scale-110 transition-transform"
                                                            title="Click para completar (Debug)"
                                                        >
                                                            {task.status === 'COMPLETED' ? (
                                                                <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-cyan-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Mission Detail (Enhanced) */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        <AnimatePresence mode="wait">
                            {selectedTask ? (
                                <motion.div
                                    key={selectedTask.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-700 p-8 flex flex-col relative overflow-hidden"
                                >
                                    {/* Large Glow Effect */}
                                    <div className={cn(
                                        "absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-15 pointer-events-none",
                                        SubjectColors[selectedTask.subject]
                                    )} />

                                    {/* Mission Header */}
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-700/50 pb-8">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 border-2 border-white/10",
                                                SubjectColors[selectedTask.subject]
                                            )}>
                                                <div className="text-white scale-[2.5] transform drop-shadow-md">
                                                    {SubjectIcons[selectedTask.subject]}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/10"
                                                    )}>
                                                        Misión Prioritaria
                                                    </span>
                                                    {selectedTask.status === 'COMPLETED' && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                                            Completada
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2">
                                                    {selectedTask.title}
                                                </h2>
                                                <div className="flex items-center gap-4 text-slate-400">
                                                    <span className="flex items-center gap-1 text-sm font-medium">
                                                        <Clock className="w-4 h-4" />
                                                        Entrega: {getRelativeDay(selectedTask.dueDate)}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span className="text-sm font-medium text-cyan-400">
                                                        Dificultad: {selectedTask.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mission Briefing */}
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="md:col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                                            <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                Instrucciones de la Misión
                                            </h3>
                                            <p className="text-lg text-slate-300 leading-relaxed">
                                                {selectedTask.description}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center text-center h-[calc(50%-8px)]">
                                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Recompensa</div>
                                                <div className="text-3xl font-black text-yellow-400 flex items-center gap-2">
                                                    +{selectedTask.reward} <span className="text-xl">XP</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center text-center h-[calc(50%-8px)]">
                                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Estado</div>
                                                <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                                                    <div className={cn("h-full transition-all duration-1000", SubjectColors[selectedTask.subject])} style={{ width: `${selectedTask.progress}%` }} />
                                                </div>
                                                <span className="text-xs font-bold mt-1 text-slate-400">{selectedTask.progress}% Completado</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Launch Button */}
                                    <div className="relative z-10 mt-auto">
                                        <Button
                                            onClick={() => handleLaunchMission(selectedTask)}
                                            disabled={selectedTask.status === 'LOCKED'}
                                            className={cn(
                                                "w-full h-20 text-2xl font-black tracking-widest rounded-2xl transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] group",
                                                selectedTask.status === 'LOCKED'
                                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                                    : `bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20`
                                            )}
                                        >
                                            {selectedTask.status === 'LOCKED' ? (
                                                <span className="flex items-center gap-3">
                                                    <Lock className="w-6 h-6" />
                                                    ACCESO DENEGADO
                                                </span>
                                            ) : selectedTask.status === 'COMPLETED' ? (
                                                <span className="flex items-center gap-3">
                                                    <CheckCircle className="w-6 h-6" />
                                                    MISIÓN CUMPLIDA
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-4">
                                                    {selectedTask.subject === 'PARENT' ? 'COMPLETAR MISIÓN' : 'INICIAR DESPEGUE'}
                                                    <ChevronRight className="w-8 h-8 animate-pulse text-cyan-200" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 rounded-[2rem] border border-slate-800 border-dashed">
                                    <Rocket className="w-24 h-24 mb-6 opacity-20" />
                                    <h3 className="text-xl font-bold">Sin Misiones Seleccionadas</h3>
                                    <p>Selecciona una misión de tu agenda espacial.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}
