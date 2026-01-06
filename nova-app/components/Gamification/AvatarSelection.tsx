import React, { useState } from 'react';
import { AVATARS_GRADE_1, AVATARS_GRADE_2, AVATARS_GRADE_3, AVATARS_GRADE_4, AVATARS_GRADE_5, Avatar } from './data/avatars';
import { useAvatar } from '@/context/AvatarContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Sparkles, ArrowRight, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export function AvatarSelection() {
    const { setAvatar } = useAvatar();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<1 | 2 | 3 | 4 | 5>(4); // Default to Grade 4

    const activeAvatars = (() => {
        switch (selectedGrade) {
            case 1: return AVATARS_GRADE_1;
            case 2: return AVATARS_GRADE_2;
            case 3: return AVATARS_GRADE_3;
            case 4: return AVATARS_GRADE_4;
            case 5: return AVATARS_GRADE_5;
            default: return AVATARS_GRADE_4;
        }
    })();

    const handleConfirm = () => {
        if (selectedId) {
            setAvatar(selectedId as any);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-poppins relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-10 left-10 w-32 h-32 bg-kid-blue rounded-full blur-[100px] opacity-20" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-kid-pink rounded-full blur-[100px] opacity-20" />

            <div className="relative z-10 max-w-6xl w-full flex flex-col items-center gap-8">

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg font-fredoka">
                        ¡Elige tu Héroe!
                    </h1>

                    {/* Grade Selector */}
                    <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
                        {[1, 2, 3, 4, 5].map((g) => (
                            <Button
                                key={g}
                                variant={selectedGrade === g ? "default" : "ghost"}
                                onClick={() => { setSelectedGrade(g as any); setSelectedId(null); }}
                                className={cn(
                                    "h-10 rounded-lg font-bold transition-all",
                                    selectedGrade === g
                                        ? "bg-kid-orange hover:bg-kid-orange/90 text-white"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                {g}° Grado
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {activeAvatars.map((avatar) => {
                        const isSelected = selectedId === avatar.id;

                        return (
                            <motion.div
                                key={avatar.id}
                                layoutId={avatar.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSelectedId(avatar.id)}
                                className={cn(
                                    "cursor-pointer group relative bg-white rounded-3xl p-6 border-4 transition-all duration-300 transform hover:scale-105",
                                    isSelected
                                        ? "border-kid-green shadow-[0_0_30px_rgba(74,222,128,0.5)] scale-105"
                                        : "border-slate-800 opacity-90 hover:opacity-100 hover:border-slate-600"
                                )}
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 bg-kid-green text-white p-2 rounded-full shadow-lg z-20">
                                        <Check className="w-6 h-6 stroke-[3]" />
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-4">
                                    <div
                                        className={cn(
                                            "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2 shadow-inner",
                                            isSelected ? "bg-kid-green/10 border-kid-green" : "bg-slate-100 border-slate-200"
                                        )}
                                        style={{ backgroundColor: isSelected ? undefined : avatar.colors[0] + '20' }}
                                    >
                                        {/* Placeholder Logic Based on Grade */}
                                        {/* Placeholder Logic Based on Grade */}
                                        {/* Simple fallback emoji logic based on ID string match */}
                                        {avatar.id.includes('bunny') ? '🐰' :
                                            avatar.id.includes('dino') ? '🦖' :
                                                avatar.id.includes('princess') ? '👸' :
                                                    avatar.id.includes('knight') ? '🛡️' :
                                                        avatar.id.includes('cat') ? '🐱' :
                                                            avatar.id.includes('robot') ? '🤖' :
                                                                avatar.id.includes('hero_girl') ? '🦸‍♀️' :
                                                                    avatar.id.includes('hero_boy') ? '🦸‍♂️' :
                                                                        // G2
                                                                        avatar.id.includes('explorer') ? '🤠' :
                                                                            avatar.id.includes('mermaid') ? '🧜‍♀️' :
                                                                                avatar.id.includes('pirate') ? '🏴‍☠️' :
                                                                                    avatar.id.includes('fairy') ? '🧚‍♀️' :
                                                                                        avatar.id.includes('elf') ? '🧝' :
                                                                                            avatar.id.includes('doc') ? '🩺' :
                                                                                                avatar.id.includes('builder') ? '👷' :
                                                                                                    // G3
                                                                                                    avatar.id.includes('wizard') ? '🧙‍♂️' :
                                                                                                        avatar.id.includes('witch') ? '🧙‍♀️' :
                                                                                                            avatar.id.includes('skater') ? '🛹' :
                                                                                                                avatar.id.includes('detective') ? '🕵️' :
                                                                                                                    avatar.id.includes('ninja') ? '🥷' :
                                                                                                                        avatar.id.includes('artist') ? '🎨' :
                                                                                                                            avatar.id.includes('rock') ? '🎸' :
                                                                                                                                // G4
                                                                                                                                avatar.id.includes('astro') ? '🧑‍🚀' :
                                                                                                                                    avatar.id.includes('pixel') ? '👾' :
                                                                                                                                        avatar.id.includes('street') ? '🧥' :
                                                                                                                                            avatar.id.includes('tech') ? '🤓' :
                                                                                                                                                avatar.id.includes('anime') ? '🤺' :
                                                                                                                                                    avatar.id.includes('gamer') ? '🎮' :
                                                                                                                                                        // G5
                                                                                                                                                        avatar.id.includes('imaginaut') ? '🌌' :
                                                                                                                                                            avatar.id.includes('maga') ? '🔮' :
                                                                                                                                                                avatar.id.includes('synth') ? '🦾' :
                                                                                                                                                                    avatar.id.includes('vis') ? '💠' :
                                                                                                                                                                        avatar.id.includes('cyber') ? '⚡' : '✨'}
                                        {/* Fallback */}
                                        {avatar.baseImage.includes('astro') || avatar.baseImage.includes('imaginaut') ? '' : '✨'}
                                    </div>
                                    <div>
                                        <h3 className="font-fredoka text-xl font-black text-slate-800 leading-tight">
                                            {avatar.name}
                                        </h3>
                                        <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">
                                            <Sparkles className="w-3 h-3" />
                                            {avatar.style}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                                    {avatar.description}
                                </p>

                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Personalidad</div>
                                    <div className="text-xs font-bold text-slate-800 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-center">
                                        {avatar.personality}
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-2 rounded-b-2xl"
                                    style={{ background: `linear-gradient(to right, ${avatar.colors[0]}, ${avatar.colors[1]})` }} />
                            </motion.div>
                        );
                    })}
                </div>

                <div className="h-24 flex items-center justify-center w-full sticky bottom-0 pointer-events-none">
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedId}
                        className={cn(
                            "pointer-events-auto h-16 px-12 rounded-2xl text-xl font-black transition-all shadow-xl",
                            selectedId
                                ? "bg-kid-green hover:bg-kid-green/90 text-white shadow-comic-green translate-y-0 opacity-100"
                                : "bg-slate-700 text-slate-500 translate-y-10 opacity-0"
                        )}
                    >
                        Confirmar Selección <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                </div>

            </div>
        </div>
    );
}
