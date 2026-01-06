import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import LevelBadge from './LevelBadge';
import TopicTag from './TopicTag';

export type SubjectType = 'math' | 'science' | 'humanities' | 'languages' | 'arts';

interface SubjectCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    topics: string[];
    level: 'Avanzado' | 'Intermedio' | 'Todos los niveles';
    type: SubjectType;
    delay?: number;
    onClick?: () => void;
}

const cardStyles: Record<SubjectType, string> = {
    math: 'bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border-blue-200',
    science: 'bg-gradient-to-br from-emerald-500/10 to-teal-400/10 border-emerald-200',
    humanities: 'bg-gradient-to-br from-orange-500/10 to-amber-400/10 border-orange-200',
    languages: 'bg-gradient-to-br from-purple-500/10 to-pink-400/10 border-purple-200',
    arts: 'bg-gradient-to-br from-pink-500/10 to-rose-400/10 border-pink-200',
};

const iconStyles: Record<SubjectType, string> = {
    math: 'bg-blue-100 text-blue-600',
    science: 'bg-emerald-100 text-emerald-600',
    humanities: 'bg-orange-100 text-orange-600',
    languages: 'bg-purple-100 text-purple-600',
    arts: 'bg-pink-100 text-pink-600',
};

const SubjectCard = ({
    title,
    description,
    icon: Icon,
    topics,
    level,
    type,
    delay = 0,
    onClick
}: SubjectCardProps) => {
    return (
        <div
            className={`${cardStyles[type]} border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in fill-mode-both`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${iconStyles[type]}`}>
                    <Icon size={28} strokeWidth={2} />
                </div>
                <LevelBadge level={level} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {title}
            </h3>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                {description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
                {topics.map((topic) => (
                    <TopicTag key={topic} topic={topic} />
                ))}
            </div>

            <button
                onClick={onClick}
                className="w-full bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm group">
                Comenzar
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

export default SubjectCard;
