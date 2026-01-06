import React from 'react';

interface LevelBadgeProps {
    level: 'Avanzado' | 'Intermedio' | 'Todos los niveles';
}

const levelStyles = {
    'Avanzado': 'bg-primary/10 text-primary border-primary/20',
    'Intermedio': 'bg-accent/20 text-accent-foreground border-accent/30',
    'Todos los niveles': 'bg-secondary/10 text-secondary border-secondary/20',
};

const LevelBadge = ({ level }: LevelBadgeProps) => {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${levelStyles[level]}`}>
            {level}
        </span>
    );
};

export default LevelBadge;
