import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

export type AvatarState = 'idle' | 'speaking' | 'thinking' | 'celebrating' | 'waiting';

interface LinaAvatarProps {
    state: AvatarState;
    className?: string;
    size?: number;
}

export const LinaAvatar: React.FC<LinaAvatarProps> = ({ state, className = '', size = 120 }) => {
    const [blink, setBlink] = useState(false);

    // Blinking Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Mouth Animation Variants
    const mouthVariants: Variants = {
        idle: { scaleY: 0.2, scaleX: 0.8, transition: { duration: 0.5 } },
        speaking: {
            scaleY: [0.2, 0.8, 0.3, 0.9, 0.4],
            scaleX: [0.9, 0.7, 0.9, 0.8, 0.9],
            transition: {
                repeat: Infinity,
                duration: 0.4,
                ease: "easeInOut"
            }
        },
        thinking: { scaleY: 0.1, scaleX: 0.6, rotate: -5, transition: { duration: 0.3 } },
        celebrating: { scaleY: 0.6, scaleX: 1, transition: { duration: 0.3 } },
        waiting: { scaleY: 0.2, scaleX: 0.8 },
    };

    const headVariants: Variants = {
        idle: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
        speaking: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
        thinking: { rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
        celebrating: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 0.5, ease: "easeOut" } },
    };

    const glassesVariants: Variants = {
        thinking: { y: -2, transition: { duration: 0.3 } },
        idle: { y: 0 },
        speaking: { y: 0 },
        celebrating: { y: -3, transition: { repeat: Infinity, duration: 0.5, repeatType: 'reverse' } }
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>

            {/* Background Aura */}
            <motion.div
                animate={{ scale: state === 'speaking' ? [1, 1.1, 1] : 1, opacity: state === 'speaking' ? 0.6 : 0.3 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-indigo-200 rounded-full blur-xl"
            />

            <motion.svg
                width={size}
                height={size}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                variants={headVariants}
                animate={state}
            >
                {/* Hair Back */}
                <path d="M40 80C40 40 70 10 100 10C130 10 160 40 160 80V140C160 160 150 180 100 180C50 180 40 160 40 140V80Z" fill="#3E2723" />

                {/* Face Shape */}
                <path d="M50 90C50 50 75 30 100 30C125 30 150 50 150 90V130C150 160 130 175 100 175C70 175 50 160 50 130V90Z" fill="#FFDFC4" />

                {/* Hair Front / Bangs */}
                <path d="M50 90C50 50 60 30 100 30C140 30 150 50 150 90C150 60 130 40 100 40C70 40 50 60 50 90Z" fill="#3E2723" />

                {/* Eyes */}
                <g transform="translate(0, 10)">
                    {/* Left Eye */}
                    <motion.ellipse
                        cx="75" cy="90" rx="6" ry={blink ? 0.5 : 8}
                        fill="#2c3e50"
                        animate={{ ry: blink ? 0.5 : (state === 'celebrating' ? 2 : 8), rx: state === 'celebrating' ? 8 : 6 }}
                    />
                    {/* Right Eye */}
                    <motion.ellipse
                        cx="125" cy="90" rx="6" ry={blink ? 0.5 : 8}
                        fill="#2c3e50"
                        animate={{ ry: blink ? 0.5 : (state === 'celebrating' ? 2 : 8), rx: state === 'celebrating' ? 8 : 6 }}
                    />

                    {/* Glasses */}
                    <motion.g variants={glassesVariants} animate={state}>
                        <circle cx="75" cy="90" r="18" stroke="#ef4444" strokeWidth="3" fill="rgba(255,255,255,0.2)" />
                        <circle cx="125" cy="90" r="18" stroke="#ef4444" strokeWidth="3" fill="rgba(255,255,255,0.2)" />
                        <path d="M93 90H107" stroke="#ef4444" strokeWidth="3" />
                    </motion.g>
                </g>

                {/* Mouth */}
                <motion.ellipse
                    cx="100"
                    cy="145"
                    rx="15"
                    ry="8"
                    fill={state === 'speaking' || state === 'celebrating' ? '#be185d' : 'transparent'}
                    stroke={state === 'thinking' ? '#d97706' : '#be185d'}
                    strokeWidth="3"
                    variants={mouthVariants}
                    animate={state}
                />

                {/* Thinking Bubbles (Only when thinking) */}
                {state === 'thinking' && (
                    <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <circle cx="160" cy="50" r="5" fill="#94a3b8" />
                        <circle cx="170" cy="35" r="8" fill="#94a3b8" />
                        <circle cx="185" cy="15" r="12" fill="#94a3b8" />
                        <text x="180" y="20" fontSize="16" fill="white">?</text>
                    </motion.g>
                )}

                {/* Celebrating Sparkles */}
                {state === 'celebrating' && (
                    <motion.g animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <text x="30" y="50" fontSize="24">✨</text>
                        <text x="150" y="50" fontSize="24">✨</text>
                    </motion.g>
                )}

            </motion.svg>
        </div>
    );
};
