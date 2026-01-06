// components/Arena/AdventureArena.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, ChevronRight, Flag, Star, Trophy, Sparkles, Globe, Info, Brain, Map as MapIcon, User, Waves } from 'lucide-react';
import { AvatarDisplay } from '../Gamification/AvatarDisplay';
import { cn } from '@/lib/utils';
import { adventureWorlds, type AdventureWorld, type AdventureMission } from '../../data/adventureWorlds';
import { PedagogicalQuest } from './PedagogicalQuest';
import { pedagogicalQuests } from '../../data/pedagogicalQuests';
import { Language } from '../../types';
import { supabase } from '@/services/supabase';
import { PET_SPECIES } from '@/data/petsData';

// Spectacular Assets
const ASSETS = {
    MASTER_MAP: '/assets/arena/master_map.png',
    NODE_BEACH: '/assets/arena/node_beach.png',
    NODE_JUNGLE: '/assets/arena/node_jungle.png',
    NODE_VOLCANO: '/assets/arena/node_volcano.png',
    STATION: '/assets/arena/station.png'
};

interface AdventureArenaProps {
    grade: number;
    language: Language;
    userId: string;
    completedMissionIds: string[];
    onComplete: (questId: string, correct: boolean) => void;
}

// Dynamic Atmosphere Component
const DynamicBackground = ({ grade }: { grade: number }) => {
    // 1=Valley (Green), 2=Desert (Orange), 3=Ocean (Blue), 4=Sky (Cyan), 5=Time (Purple/Black)
    // We keep the "Waves" structure but adapt opacity/color/speed or hide them

    if (grade === 4) { // SKY
        return (
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-blue-200 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`cloud-${i}`}
                        className="absolute text-9xl opacity-40 blur-sm text-white"
                        style={{ top: `${Math.random() * 80}%`, left: '-20%' }}
                        animate={{ x: ['120vw'] }}
                        transition={{
                            duration: 20 + Math.random() * 30,
                            repeat: Infinity,
                            delay: i * 5,
                            ease: "linear"
                        }}
                    >
                        ☁️
                    </motion.div>
                ))}
            </div>
        );
    }

    if (grade === 5) { // TIME / SPACE
        return (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-black overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={`star-${i}`}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            width: Math.random() * 3 + 'px',
                            height: Math.random() * 3 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            opacity: Math.random()
                        }}
                    />
                ))}
            </div>
        );
    }

    if (grade === 2) { // DESERT
        return (
            <div className="absolute inset-0 bg-gradient-to-b from-orange-200 to-amber-500 overflow-hidden">
                {/* Heat Haze Effect (Simulated with waving translucent overlay) */}
                <motion.div
                    className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"
                    animate={{ rotate: [0, 1, -1, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>
        );
    }

    if (grade === 1) { // VALLEY
        return (
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-200 to-green-500 overflow-hidden">
                {/* Sun shafts or pollen */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`pollen-${i}`}
                        className="absolute w-2 h-2 bg-yellow-200 rounded-full blur-sm opacity-60"
                        style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%' }}
                        animate={{ y: [0, 50], x: [0, 20] }}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity }}
                    />
                ))}
            </div>
        );
    }

    // DEFAULT: OCEAN (Grade 3)
    return (
        <div className="absolute inset-0 bg-[#001428] overflow-hidden">
            {/* Animated Waves */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-x-0 h-32 opacity-10"
                    style={{ top: `${20 * i}%` }}
                    animate={{
                        x: [-100, 100],
                        y: [0, 10, 0]
                    }}
                    transition={{
                        duration: 15 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-[200%] h-full fill-blue-400">
                        <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" />
                    </svg>
                </motion.div>
            ))}
            {/* Sea foam / Bubbles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={`bubble-${i}`}
                    className="absolute w-1 h-1 bg-white/10 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                    }}
                    animate={{
                        y: [0, -150],
                        opacity: [0, 0.4, 0]
                    }}
                    transition={{
                        duration: 8 + Math.random() * 10,
                        repeat: Infinity,
                        delay: Math.random() * 10
                    }}
                />
            ))}

        </div>
    );
};

// Highly animated and striking Nexus Point Component
const NexusPoint = ({ status }: { status: 'available' | 'completed' | 'locked' }) => (
    <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Pulsing Aura */}
        <motion.div
            className={cn(
                "absolute inset-0 rounded-full blur-xl opacity-40",
                status === 'completed' ? "bg-emerald-400" : status === 'available' ? "bg-blue-400" : "bg-slate-600"
            )}
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Orbital Rings */}
        <motion.div
            className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
            className="absolute inset-2 border-2 border-white/10 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Core Point */}
        <motion.div
            className={cn(
                "w-8 h-8 rounded-full border-4 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.8)] relative z-10",
                status === 'completed' ? "bg-emerald-500" : status === 'available' ? "bg-blue-500" : "bg-slate-700"
            )}
            animate={status === 'available' ? {
                scale: [1, 1.2, 1],
                boxShadow: [
                    '0 0 10px rgba(59,130,246,0.5)',
                    '0 0 30px rgba(59,130,246,0.8)',
                    '0 0 10px rgba(59,130,246,0.5)'
                ]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            {/* Center Eye/Core */}
            <div className="absolute inset-1.5 bg-white rounded-full animate-pulse" />
        </motion.div>

        {/* Orbiting Orbs */}
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]"
                animate={{
                    x: [Math.cos(i * 120 * Math.PI / 180) * 40, Math.cos((i * 120 + 360) * Math.PI / 180) * 40],
                    y: [Math.sin(i * 120 * Math.PI / 180) * 40, Math.sin((i * 120 + 360) * Math.PI / 180) * 40],
                }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
            />
        ))}
    </div>
);

export function AdventureArena({ grade, language, userId, completedMissionIds, onComplete }: AdventureArenaProps) {
    const displayLang = language === 'bilingual' ? 'es' : language;

    // DYNAMIC ATMOSPHERE CONFIG
    const atmosphere = useMemo(() => {
        switch (grade) {
            case 1: return {
                type: 'VALLEY',
                emojis: ['🦋', '🐝', '🍂', '🐞'],
                bottomZoneOnly: false, // Flies everywhere
                facing: true // Turn them
            };
            case 2: return {
                type: 'DESERT',
                emojis: ['🦅', '🦎', '🐫'],
                bottomZoneOnly: false,
                facing: true
            };
            case 3: return {
                type: 'OCEAN',
                emojis: ['🐠', '🐟', '🐡'],
                bottomZoneOnly: true, // FISH STAY LOW
                facing: true
            };
            case 4: return {
                type: 'SKY',
                emojis: ['🕊️', '🪁', '🦅', '🛫'],
                bottomZoneOnly: false, // Sky things fly high
                facing: true
            };
            case 5: return {
                type: 'TIME',
                emojis: ['✨', '⚙️', '⏳'],
                bottomZoneOnly: false,
                facing: false // Gears spin, don't face
            };
            default: return { type: 'OCEAN', emojis: ['🐠', '🐟', '🐡'], bottomZoneOnly: true, facing: true };
        }
    }, [grade]);

    // Filter to really kill that white background
    const whiteKillerFilter = "url(#removeWhiteBg)";

    const world = useMemo(() =>
        adventureWorlds.find(w => w.grade === grade) || adventureWorlds[0],
        [grade]);

    const [selectedMission, setSelectedMission] = useState<AdventureMission | null>(null);
    const [activePedagogicalQuestId, setActivePedagogicalQuestId] = useState<string | null>(null);
    const [avatarMissionId, setAvatarMissionId] = useState<string | null>(null);
    const [selectedRiddle, setSelectedRiddle] = useState<{ icon: string; text: string } | null>(null);
    const [pet, setPet] = useState<any>(null);
    const [revealedNodeIds, setRevealedNodeIds] = useState<string[]>([]);
    const [isMissionDockVisible, setIsMissionDockVisible] = useState(true);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const scrollToLocation = (missionId: string, x: number) => {
        if (mapContainerRef.current) {
            mapContainerRef.current.scrollTo({
                left: x - mapContainerRef.current.offsetWidth / 2,
                behavior: 'smooth'
            });
            setAvatarMissionId(missionId);
            if (!revealedNodeIds.includes(missionId)) {
                setRevealedNodeIds(prev => [...prev, missionId]);
            }
        }
    };

    // Automatic Avatar Advancement
    useEffect(() => {
        const nextAvailable = decoratedMissions.find(m => m.status === 'available');
        if (nextAvailable) {
            setAvatarMissionId(nextAvailable.id);
            // Optionally scroll to it automatically
            if (mapContainerRef.current) {
                mapContainerRef.current.scrollTo({
                    left: nextAvailable.position.x - mapContainerRef.current.offsetWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [completedMissionIds, world.id]); // world.id added to reset on grade change

    // Fetch Pet Data for Visuals
    useEffect(() => {
        const fetchPet = async () => {
            if (!supabase || !userId) return;
            const { data } = await supabase
                .from('student_pets')
                .select('*')
                .eq('student_id', userId)
                .maybeSingle();

            if (data) {
                const species = PET_SPECIES.find(s => s.type === data.type);
                const stage = [...(species?.stages || [])].reverse().find(s => data.level >= s.level);
                setPet({ ...data, image: stage?.image });
            }
        };
        fetchPet();
    }, [userId]);

    const decoratedMissions = useMemo(() => {
        return world.missions.map((m, idx) => {
            const isCompleted = completedMissionIds.includes(m.id);
            const isAvailable = idx === 0 || completedMissionIds.includes(world.missions[idx - 1].id) || isCompleted;
            return {
                ...m,
                status: isCompleted ? 'completed' : isAvailable ? 'available' : 'locked'
            } as AdventureMission;
        });
    }, [world, completedMissionIds]);

    const visualAvatarMission = useMemo(() => {
        if (avatarMissionId) {
            return decoratedMissions.find(m => m.id === avatarMissionId);
        }
        // Fallback to the current progress
        return decoratedMissions.find(m => m.status === 'available') || (decoratedMissions.length > 0 ? decoratedMissions[0] : null);
    }, [decoratedMissions, avatarMissionId]);

    const activePedQuest = useMemo(() =>
        pedagogicalQuests.find(q => q.id === (activePedagogicalQuestId || '')),
        [activePedagogicalQuestId]);

    const handleStartMission = (missionId: string) => {
        const mapping: Record<string, string> = {
            'm-g1-1': 'counting-to-20',
            'm-g1-2': 'plants-parts',
            'm-g3-1': 'fractions-intro-1',
            'm-g3-2': 'water-cycle-1',
            'm-g5-1': 'decimals-intro'
        };
        setActivePedagogicalQuestId(mapping[missionId] || pedagogicalQuests[0].id);
        setSelectedMission(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* World Header - Premium */}
            <div className={cn(
                "relative overflow-hidden rounded-[3rem] p-10 text-white shadow-2xl border-4 border-white/20",
                `bg-gradient-to-br ${world.bgGradient} transition-all duration-1000`
            )}>
                <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 text-[15rem]">🏝️</motion.div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                            transition={{ repeat: Infinity, duration: 6 }}
                            className="w-28 h-28 bg-white/20 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center text-6xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-2 border-white/30"
                        >
                            {world.icon}
                        </motion.div>

                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="bg-white/20 backdrop-blur-md px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 shadow-sm"
                                >
                                    {language === 'es' ? `EL ARCHIPIÉLAGO NOVA` : `THE NOVA ARCHIPELAGO`}
                                </motion.span>
                            </div>
                            <h2 className="text-5xl font-black font-fredoka drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-tight">
                                {world.title[displayLang]}
                            </h2>
                            <p className="text-white/80 font-bold mt-2 text-lg italic opacity-90">
                                {language === 'es' ? 'Una expedición de conocimiento sin límites' : 'An expedition of limitless knowledge'}
                            </p>
                        </div>
                    </div>

                    <div className="hidden xl:flex items-center gap-6 bg-black/40 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] border-2 border-white/10 shadow-inner">
                        <div className="text-right">
                            <div className="text-[12px] font-black uppercase tracking-widest text-white/50 mb-1">{language === 'es' ? 'MAESTRÍA' : 'MASTERY'}</div>
                            <div className="text-3xl font-black font-mono">
                                {completedMissionIds.filter(id => id.startsWith(`m-g${grade}`)).length} <span className="text-white/30">/ 10</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-yellow-500 rounded-[1.5rem] flex items-center justify-center shadow-[0_10px_20px_rgba(234,179,8,0.3)] border-2 border-yellow-400 transform rotate-3">
                            <Trophy className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Adventure Map - SPECTACULAR NOVA ARCHIPELAGO */}
            <div className="relative rounded-[4rem] border-8 border-white/10 shadow-inner overflow-hidden min-h-[850px] bg-[#001428] group">
                <DynamicBackground grade={grade} />

                {/* THE SPECTACULAR MASTER MAP IMAGE */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: 1,
                            x: [0, 10, -10, 0],
                            y: [0, -5, 5, 0]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut",
                            opacity: { duration: 1.5 }
                        }}
                        className="relative w-full h-full"
                    >
                        <img
                            src={world.mapImage || ASSETS.MASTER_MAP}
                            alt={world.title[displayLang]}
                            className={cn(
                                "w-full h-full object-cover transition-all duration-1000",
                                grade === 1 ? "hue-rotate-0 saturate-100" :
                                    grade === 3 ? "hue-rotate-[180deg] saturate-120 brightness-110" :
                                        grade === 4 ? "hue-rotate-[220deg] saturate-130 brightness-105" :
                                            "hue-rotate-[280deg] saturate-150 contrast-125"
                            )}
                        />
                    </motion.div>
                </div>

                {/* DYNAMIC ATMOSPHERE OVERLAY (Fish, Birds, etc) */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {useMemo(() => [...Array(20)].map((_, i) => {
                        // ZONE LOGIC BASED ON GRADE
                        let topPos;
                        if (grade === 3) { // OCEAN: Deep sea only
                            topPos = 90 + Math.random() * 10;
                        } else if (grade === 4) { // SKY: Everywhere, mostly high
                            topPos = Math.random() * 60;
                        } else if (grade === 2) { // DESERT: Ground (low) and Sky (high)
                            topPos = Math.random() > 0.5 ? 85 + Math.random() * 10 : Math.random() * 20;
                        } else {
                            topPos = Math.random() * 100; // Valley/Time: Everywhere
                        }

                        const isRightToLeft = Math.random() > 0.5;
                        const duration = 25 + Math.random() * 20;
                        const delay = Math.random() * 20;
                        const emoji = atmosphere.emojis[i % atmosphere.emojis.length];

                        return { id: i, topPos, isRightToLeft, duration, delay, emoji };
                    }), [grade, atmosphere]).map((item) => (
                        <motion.div
                            key={`atmos-${item.id}`}
                            className="absolute text-4xl filter drop-shadow-lg opacity-80"
                            style={{
                                top: `${item.topPos}%`,
                                left: item.isRightToLeft ? '110%' : '-10%',
                            }}
                            animate={{
                                left: item.isRightToLeft ? ['110%', '-10%'] : ['-10%', '110%'],
                                y: [0, Math.random() * 10 - 5],
                                rotate: atmosphere.type === 'TIME' ? [0, 360] : 0 // Gears spin
                            }}
                            transition={{
                                duration: item.duration,
                                repeat: Infinity,
                                delay: item.delay,
                                ease: "linear"
                            }}
                        >
                            {/* Inner Span handles orientation if needed */}
                            <span
                                className="block"
                                style={{
                                    transform: (atmosphere.facing)
                                        ? (item.isRightToLeft ? 'scaleX(1)' : 'scaleX(-1)')
                                        : 'none'
                                }}
                            >
                                {item.emoji}
                            </span>
                        </motion.div>
                    ))}
                </div>


                <div
                    ref={mapContainerRef}
                    className="overflow-x-auto pb-10 pt-32 custom-scrollbar scroll-smooth relative z-10 no-scrollbar"
                >
                    <div className="relative flex items-center min-w-[2000px] h-[700px] px-32">

                        {/* Filter Definitions - HIDDEN BUT NECESSARY */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-0">
                            <defs>
                                <filter id="removeWhiteBg">
                                    <feColorMatrix type="matrix"
                                        values="1 0 0 0 0
                                                0 1 0 0 0
                                                0 0 1 0 0
                                                -3 -3 -3 8 0" />
                                </filter>
                            </defs>
                        </svg>


                        {/* THE SPECTACULAR AVATAR */}
                        {visualAvatarMission && (
                            <motion.div
                                className="absolute z-40 pointer-events-none"
                                animate={{
                                    x: visualAvatarMission.position.x - 64,
                                    y: visualAvatarMission.position.y - 140
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 45,
                                    damping: 25
                                }}
                            >
                                <div className="relative">
                                    {/* Sublte Shadow beneath the avatar */}
                                    <motion.div
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/20 blur-md rounded-full -z-10"
                                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    />

                                    <motion.div
                                        className="transform"
                                        style={{ filter: whiteKillerFilter }}
                                        // User requested "no girl moving", so we keep it static or extremely subtle breathing
                                        animate={{ y: [0, -2, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <AvatarDisplay size="lg" showBackground={false} />
                                    </motion.div>

                                    {/* VISUAL PET FOLLOWER - Simplified */}
                                    {pet && pet.image && (
                                        <motion.div
                                            className="absolute -right-16 -bottom-4 w-16 h-16 z-50 pointer-events-none"
                                            animate={{
                                                y: [0, -10, 0],
                                                scale: [1, 1.05, 1],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={pet.image}
                                                    alt={pet.name}
                                                    className="w-full h-full object-contain"
                                                    style={{ filter: whiteKillerFilter }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* BUTTON TO SHOW MISSIONS */}
                {
                    !isMissionDockVisible && (
                        <div className="absolute top-10 right-10 z-[70]">
                            <motion.button
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMissionDockVisible(true)}
                                className="bg-blue-600 border-2 border-blue-400 p-6 rounded-full text-white shadow-[0_20px_40px_rgba(37,99,235,0.4)] flex items-center gap-4 group"
                            >
                                <MapIcon className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                <span className="font-black tracking-widest uppercase pr-2">Mapa De Misiones</span>
                            </motion.button>
                        </div>
                    )
                }

                {/* THE SPECTACULAR NAVIGATION SIDE DOCK - 10 LEVELS */}
                <AnimatePresence>
                    {isMissionDockVisible && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className="absolute top-1/2 -translate-y-1/2 right-10 z-[60] flex flex-col gap-3 p-8 bg-black/50 backdrop-blur-3xl rounded-[4rem] border-2 border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] max-h-[85%] w-[400px]"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col items-start">
                                    <div className="text-[12px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1">PROGRESO DE ISLA</div>
                                    <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    onClick={() => setIsMissionDockVisible(false)}
                                    className="p-3 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <ChevronRight className="w-8 h-8 text-white/50" />
                                </motion.button>
                            </div>

                            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                                {decoratedMissions.map((m, i) => (
                                    <motion.button
                                        key={`nav-${m.id}`}
                                        whileHover={m.status !== 'locked' ? { x: -10, scale: 1.02 } : {}}
                                        whileTap={m.status !== 'locked' ? { scale: 0.98 } : {}}
                                        onClick={() => {
                                            if (m.status !== 'locked') {
                                                scrollToLocation(m.id, m.position.x);
                                                setSelectedMission(m);
                                                setIsMissionDockVisible(false); // AUTO HIDE ON CLICK!
                                            }
                                        }}
                                        className={cn(
                                            "group relative flex items-center gap-5 px-6 py-4 rounded-[2rem] transition-all duration-300",
                                            avatarMissionId === m.id
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl border-2 border-white/30"
                                                : m.status === 'locked'
                                                    ? "bg-black/30 opacity-40 cursor-not-allowed border border-white/5 grayscale"
                                                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-all group-hover:rotate-6",
                                            avatarMissionId === m.id ? "bg-white text-blue-600" : "bg-black/20 text-white/80"
                                        )}>
                                            {m.status === 'completed' ? '🏆' : m.status === 'locked' ? <Lock className="w-6 h-6" /> : (i + 1)}
                                        </div>

                                        <div className="flex flex-col items-start leading-none flex-1">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5"> NIVEL {m.level}</span>
                                            <span className="text-sm font-black text-white uppercase truncate w-40 drop-shadow-sm">{m.title[displayLang]}</span>
                                        </div>

                                        {/* Status Glow Dot */}
                                        <div className={cn(
                                            "w-3 h-3 rounded-full shadow-[0_0_15px_currentColor]",
                                            m.status === 'completed' ? "bg-emerald-400 text-emerald-400" :
                                                m.status === 'available' ? "bg-yellow-400 text-yellow-400" :
                                                    "bg-slate-700 text-slate-700"
                                        )} />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >

            {/* Mission Briefing Modal - SPECTACULAR DESIGN */}
            <AnimatePresence>
                {
                    selectedMission && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001428]/95 backdrop-blur-2xl">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                                exit={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                                className="bg-white rounded-[4rem] w-full max-w-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-4 border-white/20 relative"
                            >
                                {/* Biome Header Banner */}
                                <div className={cn(
                                    "p-14 text-white relative h-72",
                                    selectedMission.position.x < 500 ? "bg-gradient-to-br from-yellow-400 to-amber-600" :
                                        selectedMission.position.x < 1200 ? "bg-gradient-to-br from-green-500 to-emerald-800" :
                                            "bg-gradient-to-br from-red-500 to-rose-950"
                                )}>
                                    <div className="absolute top-0 right-0 p-12 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                                        <Globe className="w-64 h-64" />
                                    </div>
                                    <div className="flex items-center gap-10 relative z-10">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="w-28 h-28 bg-white/20 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border-2 border-white/30"
                                        >
                                            {selectedMission.category === 'math' ? '🧮' : selectedMission.category === 'science' ? '🧪' : '📚'}
                                        </motion.div>
                                        <div>
                                            <span className="bg-black/20 backdrop-blur-md px-5 py-1.5 rounded-full text-[12px] font-black uppercase tracking-[0.3em] border border-white/20 mb-4 inline-block">
                                                {selectedMission.id.includes('g1') ? 'NIVEL ELEMENTAL' : 'RETO SUPERIOR'}
                                            </span>
                                            <h3 className="text-5xl font-black font-fredoka mb-3 leading-tight drop-shadow-lg">
                                                {selectedMission.title[displayLang]}
                                            </h3>
                                            <div className="flex gap-4">
                                                <span className="bg-white/20 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-sm">
                                                    {selectedMission.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-14 space-y-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-blue-600">
                                                <div className="p-3 bg-blue-100 rounded-2xl shadow-sm"><Info className="w-8 h-8" /></div>
                                                <h4 className="font-black text-2xl uppercase tracking-tighter">
                                                    {language === 'es' || language === 'bilingual' ? 'OBJETIVO DE MISIÓN' : 'MISSION OBJECTIVE'}
                                                </h4>
                                            </div>
                                            {/* SPECTACULAR HINTS */}
                                            <div className="flex gap-3">
                                                {selectedMission.hints[displayLang as 'es' | 'en'].map((_, hi) => (
                                                    <motion.button
                                                        key={hi}
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        className="w-14 h-14 bg-yellow-400 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white transition-all"
                                                    >
                                                        💡
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 leading-[1.3] opacity-90">
                                            {selectedMission.problem[displayLang]}
                                        </h3>
                                    </div>

                                    <div className="bg-slate-50 rounded-[2.5rem] p-10 border-4 border-slate-100 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Brain className="w-32 h-32" />
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-500 mb-4 relative z-10">
                                            <span className="text-[12px] font-black uppercase tracking-[0.4em] bg-white px-5 py-1.5 rounded-full shadow-sm">ESTÁNDAR DBA</span>
                                        </div>
                                        <p className="text-slate-700 font-bold text-xl leading-relaxed relative z-10 border-l-4 border-blue-500 pl-6">
                                            {selectedMission.dba}
                                        </p>
                                    </div>

                                    <div className="flex gap-8 items-center justify-between border-t-4 border-slate-50 pt-12">
                                        <div className="flex gap-10">
                                            <div className="flex flex-col items-center group/reward">
                                                <motion.span whileHover={{ scale: 1.5, rotate: 360 }} className="text-5xl mb-3 drop-shadow-md">🪙</motion.span>
                                                <span className="font-black text-lg text-amber-600 tracking-tighter">+{selectedMission.reward.coins}</span>
                                            </div>
                                            <div className="flex flex-col items-center group/reward">
                                                <motion.span whileHover={{ scale: 1.5, rotate: 360 }} className="text-5xl mb-3 drop-shadow-md">⭐</motion.span>
                                                <span className="font-black text-lg text-indigo-600 tracking-tighter">+{selectedMission.reward.xp} XP</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-6">
                                            <button
                                                onClick={() => setSelectedMission(null)}
                                                className="px-10 py-6 rounded-[2rem] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-lg"
                                            >
                                                {language === 'es' || language === 'bilingual' ? 'CANCELAR' : 'CANCEL'}
                                            </button>
                                            <button
                                                onClick={() => handleStartMission(selectedMission.id)}
                                                className="px-16 py-7 rounded-[2rem] font-black text-white shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 flex items-center gap-6 text-2xl border-t-2 border-white/20"
                                            >
                                                <Play className="w-10 h-10 fill-current shadow-sm" />
                                                {language === 'es' || language === 'bilingual' ? '¡INICIAR!' : 'START!'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Pedagogical Quest Integration */}
            <AnimatePresence>
                {
                    activePedQuest && (
                        <PedagogicalQuest
                            quest={activePedQuest as any}
                            language={displayLang}
                            onComplete={onComplete}
                            onClose={() => setActivePedagogicalQuestId(null)}
                        />
                    )
                }
            </AnimatePresence >
        </div >
    );
}
