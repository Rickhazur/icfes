

import React, { useState } from 'react';
import { useAvatar } from '../../context/AvatarContext';
import {
    AVATARS_GRADE_1,
    AVATARS_GRADE_2,
    AVATARS_GRADE_3,
    AVATARS_GRADE_4,
    AVATARS_GRADE_5,
    Avatar
} from './data/avatars';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';


interface AvatarSelectorProps {
    onSelect?: () => void;
    grade?: number; // 1-5 for elementary
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ onSelect, grade = 4 }) => {
    const { setAvatar } = useAvatar();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Select avatars based on grade
    const getAvatarsForGrade = (): Avatar[] => {
        switch (grade) {
            case 1: return AVATARS_GRADE_1;
            case 2: return AVATARS_GRADE_2;
            case 3: return AVATARS_GRADE_3;
            case 4: return AVATARS_GRADE_4;
            case 5: return AVATARS_GRADE_5;
            default: return AVATARS_GRADE_4; // Default to 4th grade
        }
    };

    const avatars = getAvatarsForGrade();

    const handleConfirm = () => {
        if (selectedId) {
            setAvatar(selectedId as any); // Type assertion for compatibility
            toast.success("¡Avatar seleccionado! ¡Bienvenido!");
            if (onSelect) onSelect();
        }
    };

    return (
        <div className="flex flex-col items-center p-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center font-fredoka">
                Elige tu Compañero de Aventuras
            </h2>
            <p className="text-slate-500 mb-4 text-center max-w-2xl">
                Este amigo te acompañará en todas tus misiones. ¡Elige el que más te guste!
            </p>
            <p className="text-xs font-bold text-indigo-600 mb-8">
                {grade}° GRADO - {avatars.length} AVATARES DISPONIBLES
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-8">
                {avatars.map((avatar) => (
                    <div
                        key={avatar.id}
                        onClick={() => setSelectedId(avatar.id)}
                        className={`
              relative group cursor-pointer rounded-3xl p-4 transition-all duration-300 border-4
              ${selectedId === avatar.id
                                ? 'border-indigo-500 bg-indigo-50 shadow-2xl scale-105'
                                : 'border-white bg-white hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 shadow-md'}
            `}
                    >
                        {/* Selection Checkmark */}
                        {selectedId === avatar.id && (
                            <div className="absolute top-3 right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg z-10 animate-bounce">
                                <Check className="w-5 h-5" strokeWidth={3} />
                            </div>
                        )}

                        {/* Image Container */}
                        <div className={`
              aspect-square rounded-2xl overflow-hidden mb-4 relative
              ${selectedId === avatar.id ? 'bg-white' : 'bg-slate-50'}
            `}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-black/5 z-0" />
                            <img
                                src={avatar.baseImage}
                                alt={avatar.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        {/* Info */}
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-slate-800 font-fredoka group-hover:text-indigo-600 transition-colors">
                                {avatar.name}
                            </h3>
                            <p className="text-xs font-medium text-slate-400 mt-1">
                                {avatar.description}
                            </p>
                            <p className="text-[10px] text-indigo-500 mt-1 font-semibold">
                                {avatar.personality}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                size="lg"
                onClick={handleConfirm}
                disabled={!selectedId}
                className={`
          rounded-full px-12 py-6 text-xl font-bold transition-all duration-500 shadow-xl
          ${selectedId
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-indigo-500/30'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
        `}
            >
                {selectedId ? (
                    <span className="flex items-center gap-2">
                        ¡Comenzar Aventura! <Sparkles className="w-5 h-5 animate-pulse" />
                    </span>
                ) : (
                    "Selecciona un Avatar"
                )}
            </Button>
        </div>
    );
};
