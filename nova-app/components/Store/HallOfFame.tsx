import React from 'react';
import { useGamification } from '@/context/GamificationContext';
import { Trophy, Medal, Star, Crown, Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Achievement {
    id: string;
    title: { es: string; en: string };
    description: { es: string; en: string };
    icon: React.ReactNode;
    color: string;
    requiredXp: number; // Unlock based on XP
}

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'novice',
        title: { es: 'Principiante Curioso', en: 'Curious Novice' },
        description: { es: 'Tus primeros pasos en el aprendizaje.', en: 'Your first steps in learning.' },
        icon: <Star className="w-8 h-8 text-yellow-500" />,
        color: 'bg-yellow-100 border-yellow-300',
        requiredXp: 0
    },
    {
        id: 'student',
        title: { es: 'Estudiante Dedicado', en: 'Dedicated Student' },
        description: { es: 'Has comenzado tu viaje del saber.', en: 'You have started your journey of knowledge.' },
        icon: <Medal className="w-8 h-8 text-blue-500" />,
        color: 'bg-blue-100 border-blue-300',
        requiredXp: 100
    },
    {
        id: 'scholar',
        title: { es: 'Erudito en Potencia', en: 'Scholar in Training' },
        description: { es: 'Tu cerebro se está haciendo más fuerte.', en: 'Your brain is getting stronger.' },
        icon: <Award className="w-8 h-8 text-purple-500" />,
        color: 'bg-purple-100 border-purple-300',
        requiredXp: 500
    },
    {
        id: 'expert',
        title: { es: 'Experto de la Clase', en: 'Class Expert' },
        description: { es: 'Un maestro en formación.', en: 'A master in training.' },
        icon: <Trophy className="w-8 h-8 text-orange-500" />,
        color: 'bg-orange-100 border-orange-300',
        requiredXp: 1000
    },
    {
        id: 'legend',
        title: { es: 'Leyenda de Nova', en: 'Nova Legend' },
        description: { es: '¡Eres imparable!', en: 'You are unstoppable!' },
        icon: <Crown className="w-8 h-8 text-red-500" />,
        color: 'bg-red-100 border-red-300',
        requiredXp: 2500
    }
];

interface HallOfFameProps {
    language: 'es' | 'en';
}

export function HallOfFame({ language }: HallOfFameProps) {
    const { xp } = useGamification();

    return (
        <div className="bg-amber-50 rounded-3xl p-8 border-4 border-amber-200 shadow-comic-lg relative overflow-hidden">
            {/* Shelf Background Texture (CSS generic) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = xp >= achievement.requiredXp;

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "relative flex flex-col items-center p-6 rounded-2xl border-4 transition-all duration-300",
                                isUnlocked
                                    ? `bg-white ${achievement.color} shadow-comic scale-100`
                                    : "bg-slate-200 border-slate-300 opacity-70 grayscale"
                            )}
                        >
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center border-4 mb-4 bg-white shadow-sm",
                                isUnlocked ? achievement.color : "border-slate-400"
                            )}>
                                {isUnlocked ? achievement.icon : <Lock className="w-8 h-8 text-slate-400" />}
                            </div>

                            <h3 className="font-fredoka text-lg font-bold text-center mb-1 text-slate-800">
                                {language === 'es' ? achievement.title.es : achievement.title.en}
                            </h3>

                            <p className="text-xs text-center text-slate-500 font-medium leading-tight">
                                {language === 'es' ? achievement.description.es : achievement.description.en}
                            </p>

                            {!isUnlocked && (
                                <div className="mt-3 px-3 py-1 bg-slate-300 rounded-full text-xs font-bold text-slate-600">
                                    {language === 'es' ? `Necesitas ${achievement.requiredXp} XP` : `Need ${achievement.requiredXp} XP`}
                                </div>
                            )}

                            {isUnlocked && (
                                <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                    {language === 'es' ? '¡DESBLOQUEADO!' : 'UNLOCKED!'}
                                </div>
                            )}

                            {/* Shelf Shadow Base */}
                            <div className="absolute -bottom-6 w-full h-4 bg-black/10 rounded-full filter blur-md" />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
