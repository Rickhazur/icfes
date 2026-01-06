
import React from 'react';
import { useAvatar } from '../../context/AvatarContext';
import { AVATARS, ACCESSORIES } from './data/avatars';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showBackground?: boolean;
    className?: string;
    avatarId?: string; // Optional override 
    accessoriesOverride?: Record<string, string>;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
    size = 'md',
    showBackground = true,
    className,
    avatarId,
    accessoriesOverride
}) => {
    const { currentAvatar, equippedAccessories: contextAccessories } = useAvatar();

    const activeId = avatarId || currentAvatar;
    const activeAccessories = accessoriesOverride || contextAccessories;

    const avatarData = AVATARS.find(a => a.id === activeId);

    if (!avatarData) return null;

    const sizeClasses = {
        sm: 'w-12 h-12 text-xs',
        md: 'w-24 h-24 text-sm',
        lg: 'w-48 h-48 text-base',
        xl: 'w-72 h-72 text-xl'
    };

    // Find equipped item objects
    const equippedItems = Object.values(activeAccessories)
        .map(id => ACCESSORIES.find(a => a.id === id))
        .filter(Boolean);

    return (
        <div className={cn(
            "relative flex items-center justify-center transition-all",
            sizeClasses[size],
            showBackground ? 'rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl' : '',
            className
        )}
            style={showBackground ? { backgroundColor: `${avatarData.colors[0]}20`, borderColor: avatarData.colors[0] } : {}}
        >
            {/* Base Avatar */}
            <img
                src={avatarData.baseImage}
                alt={avatarData.name}
                className="w-full h-full object-contain"
            />

            {/* Accessories Layer - Improved Positioning */}
            {equippedItems.map(item => {
                if (!item) return null;

                // Position and size based on type
                let posClass = '';
                let sizeClass = 'text-[1.8em]'; // Default size

                switch (item.type) {
                    case 'head':
                        posClass = 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/4';
                        sizeClass = 'text-[2.2em]';
                        break;
                    case 'face':
                        posClass = 'top-[35%] left-1/2 -translate-x-1/2';
                        sizeClass = 'text-[1.5em]';
                        break;
                    case 'hand':
                        posClass = 'bottom-[5%] right-[2%] rotate-12 z-20';
                        sizeClass = 'text-[1.4em]';
                        break;
                    case 'back':
                        posClass = 'top-[15%] -right-[10%] -z-10 opacity-90 scale-x-[-1]';
                        sizeClass = 'text-[2em]';
                        break;
                    case 'pet':
                        posClass = 'bottom-0 -left-[10%] z-20 hover:scale-110 transition-transform origin-bottom-left';
                        sizeClass = 'w-[40%] h-[40%]'; // Use explicit dimensions for Image
                        return (
                            <div key={item.id} className={`absolute ${posClass} pointer-events-none select-none`}>
                                {/* Check if it's a "Real" pet from the new assets, otherwise fallback to emoji */}
                                {(item.id === 'acc_drone' || item.id === 'acc_parrot') ? (
                                    <span className="text-[1.5em] leading-none block filter drop-shadow-lg">{item.icon}</span>
                                ) : (
                                    <img src={item.icon} alt="Pet" className="w-full h-full object-contain drop-shadow-md animate-bounce-slow" />
                                )}
                            </div>
                        );
                    case 'effect':
                        posClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 -z-20 scale-[1.5] animate-pulse';
                        sizeClass = 'text-[3em]';
                        break;
                    default:
                        posClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
                }

                return (
                    <div
                        key={item.id}
                        className={`absolute ${posClass} pointer-events-none select-none transition-all`}
                    >
                        <span className={`${sizeClass} leading-none block filter drop-shadow-lg`}>
                            {item.icon}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
