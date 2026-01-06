import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Utensils, Sparkles, Star, PlusCircle, Ghost, Zap, Award } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useGamification } from '@/context/GamificationContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PET_SPECIES, PetSpecies, PetStage } from '@/data/petsData';
import { cn } from '@/lib/utils';

interface Pet {
    id: string;
    student_id: string;
    name: string;
    type: string;
    level: number;
    xp: number;
    hunger: number;
    happiness: number;
}

export function PetPanel({ userId }: { userId: string }) {
    const { coins, spendCoins, addXP } = useGamification();
    const [pet, setPet] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPet();
    }, [userId]);

    const fetchPet = async () => {
        if (!supabase || !userId) return;
        const { data, error } = await supabase
            .from('student_pets')
            .select('*')
            .eq('student_id', userId)
            .maybeSingle();

        if (data) setPet(data);
        setIsLoading(false);
    };

    const species = useMemo(() =>
        PET_SPECIES.find(s => s.type === pet?.type),
        [pet?.type]
    );

    const currentStage = useMemo(() => {
        if (!species || !pet) return null;
        return [...species.stages].reverse().find(s => pet.level >= s.level) || species.stages[0];
    }, [species, pet?.level]);

    const nextStage = useMemo(() => {
        if (!species || !pet) return null;
        return species.stages.find(s => s.level > pet.level);
    }, [species, pet?.level]);

    const adoptPet = async (name: string, type: 'dragon' | 'robot') => {
        const cost = 250; // Discounted for first adopt or low barrier
        if (coins < cost) {
            toast.error(`Necesitas ${cost} coins para adoptar una mascota.`);
            return;
        }

        if (!supabase || !userId) return;

        try {
            const newPet = {
                student_id: userId,
                name: name || (type === 'dragon' ? 'Drago' : 'Bit'),
                type,
                hunger: 100,
                happiness: 100,
                level: 0, // Starts as egg
                xp: 0
            };

            const { data, error } = await supabase
                .from('student_pets')
                .insert([newPet])
                .select()
                .single();

            if (error) throw error;

            spendCoins(cost, `Adopción de ${newPet.name}`);
            setPet(data);
            toast.success(`¡Has encontrado un ${type === 'dragon' ? 'Huevo Ancestral' : 'Núcleo Tech'}! Ciúdalo para que eclosione.`);
        } catch (error) {
            console.error(error);
            toast.error("Error al adoptar mascota.");
        }
    };

    const interact = async (type: 'feed' | 'play') => {
        if (!pet || !supabase) return;
        const cost = 25;

        if (coins < cost) {
            toast.error("No tienes suficientes coins.");
            return;
        }

        try {
            const xpGained = 15;
            const updates = {
                hunger: type === 'feed' ? Math.min(100, pet.hunger + 20) : pet.hunger,
                happiness: type === 'play' ? Math.min(100, pet.happiness + 20) : pet.happiness,
                xp: pet.xp + xpGained
            };

            // Level up logic
            let newLevel = pet.level;
            const xpForNextLevel = (pet.level + 1) * 100;
            if (updates.xp >= xpForNextLevel) {
                newLevel += 1;
                toast.success(`¡${pet.name} ha subido al nivel ${newLevel}!`);
            }

            const finalUpdates = { ...updates, level: newLevel };

            const { error } = await supabase
                .from('student_pets')
                .update(finalUpdates)
                .eq('id', pet.id);

            if (error) throw error;

            spendCoins(cost, type === 'feed' ? `Comida para ${pet.name}` : `Juego con ${pet.name}`);
            setPet({ ...pet, ...finalUpdates });

            // Visual feedback
            if (newLevel > pet.level) {
                const stageChange = PET_SPECIES.find(s => s.type === pet.type)?.stages.find(s => s.level === newLevel);
                if (stageChange) {
                    toast(`✨ ¡EVOLUCIÓN! ${pet.name} ahora es un ${stageChange.title.es}`, {
                        icon: '🌟',
                        duration: 5000
                    });
                }
            }
        } catch (error) {
            toast.error("Error al interactuar.");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Despertando a los compañeros...</div>;

    if (!pet) {
        return (
            <div className="p-10 bg-white/80 backdrop-blur-xl rounded-[3rem] border-4 border-dashed border-indigo-200 text-center shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3 group-hover:rotate-6 transition-transform">
                        <PlusCircle className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-3 font-fredoka">¡Adopta un Compañero!</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Escoge un huevo místico o un núcleo tecnológico y ayúdalo a evolucionar mediante el estudio.</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <button
                            onClick={() => adoptPet('Sparky', 'dragon')}
                            className="group/btn bg-white p-6 rounded-[2rem] border-2 border-indigo-100 hover:border-indigo-500 hover:shadow-xl transition-all w-48"
                        >
                            <img src="/pets/dragon_egg.png" className="w-24 h-24 mx-auto mb-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="block font-black text-indigo-600 uppercase tracking-widest text-xs">Huevo de Dragón</span>
                            <span className="text-[10px] font-bold text-slate-400">250 🪙</span>
                        </button>
                        <button
                            onClick={() => adoptPet('Volt', 'robot')}
                            className="group/btn bg-white p-6 rounded-[2rem] border-2 border-purple-100 hover:border-purple-500 hover:shadow-xl transition-all w-48"
                        >
                            <img src="/pets/robot_egg.png" className="w-24 h-24 mx-auto mb-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="block font-black text-purple-600 uppercase tracking-widest text-xs">Núcleo Robot</span>
                            <span className="text-[10px] font-bold text-slate-400">250 🪙</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const xpProgress = (pet.xp % ((pet.level + 1) * 100)) / ((pet.level + 1) * 100) * 100;

    return (
        <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10 group">
            {/* Animated Background effects */}
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    {/* PET VISUAL */}
                    <div className="relative w-48 h-48 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentStage?.image}
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 1.2 }}
                                src={currentStage?.image}
                                alt={pet.name}
                                className="w-36 h-36 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            />
                        </AnimatePresence>

                        {/* XP Ring around pet */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                            <circle
                                cx="96" cy="96" r="88"
                                fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.05"
                            />
                            <motion.circle
                                cx="96" cy="96" r="88"
                                fill="none" stroke="url(#petXpGradient)" strokeWidth="6"
                                strokeDasharray="552"
                                initial={{ strokeDashoffset: 552 }}
                                animate={{ strokeDashoffset: 552 - (552 * xpProgress / 100) }}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="petXpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <div className="absolute -bottom-4 bg-white/10 backdrop-blur-xl px-4 py-1 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-white/70">
                            {currentStage?.title.es}
                        </div>
                    </div>

                    {/* PET INFO */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h3 className="text-4xl font-black font-fredoka tracking-tight">{pet.name}</h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-indigo-950 text-xs font-black px-4 py-1 rounded-full shadow-lg">LV. {pet.level}</span>
                                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-200 border border-white/5">{pet.type}</span>
                            </div>
                        </div>

                        <p className="text-indigo-200/70 font-medium mb-6 italic">
                            "{currentStage?.description.es}"
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 flex items-center gap-4 group/stat">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover/stat:scale-110 transition-transform">
                                    <Utensils className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">Hambruna</span>
                                        <span className="text-xs font-black text-emerald-400">{pet.hunger}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pet.hunger}%` }} className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 flex items-center gap-4 group/stat">
                                <div className="w-10 h-10 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30 group-hover/stat:scale-110 transition-transform">
                                    <Heart className="w-5 h-5 text-rose-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400/70">Felicidad</span>
                                        <span className="text-xs font-black text-rose-400">{pet.happiness}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pet.happiness}%` }} className="h-full bg-rose-400 shadow-[0_0_10px_#fb7185]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => interact('feed')}
                        disabled={pet.hunger >= 100}
                        className="flex-1 min-w-[150px] group/act relative overflow-hidden bg-white/10 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10 flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:bg-white/10"
                    >
                        <Utensils className="w-4 h-4 group-hover/act:rotate-12 transition-transform" />
                        <span>Alimentar (25 🪙)</span>
                        <Zap className="w-3 h-3 text-emerald-400 absolute top-2 right-2 opacity-0 group-hover/act:opacity-100 transition-opacity" />
                    </button>
                    <button
                        onClick={() => interact('play')}
                        disabled={pet.happiness >= 100}
                        className="flex-1 min-w-[150px] group/act relative overflow-hidden bg-white/10 hover:bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10 flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:bg-white/10"
                    >
                        <Heart className="w-4 h-4 group-hover/act:scale-125 transition-transform" />
                        <span>Jugar (25 🪙)</span>
                        <Sparkles className="w-3 h-3 text-rose-400 absolute top-2 right-2 opacity-0 group-hover/act:opacity-100 transition-opacity" />
                    </button>
                    {nextStage && (
                        <div className="w-full flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-dashed border-white/20">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                <Award className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Próxima Evolución</p>
                                <p className="text-sm font-bold">{nextStage.title.es} <span className="text-white/40 font-medium">al nivel {nextStage.level}</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
