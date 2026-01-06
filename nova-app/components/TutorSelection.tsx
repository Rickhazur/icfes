
import React from 'react';
import { Brain, Globe, BookOpen, Microscope, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import { Language } from '../types/tutor'; // Import Language from tutor types

interface TutorSelectionProps {
    onSelect: (view: ViewState) => void;
    language: Language;
}

const TutorSelection: React.FC<TutorSelectionProps> = ({ onSelect, language }) => {
    const isSpanish = language === 'es';
    const subjects = [
        {
            id: ViewState.MATH_TUTOR,
            title: isSpanish ? 'Matemáticas' : 'Mathematics',
            description: isSpanish ? '¡Diviértete con los números!' : 'Have fun with numbers!',
            icon: <Brain className="w-12 h-12 text-white" />,
            color: 'bg-kid-blue',
            gradient: 'from-blue-400 to-blue-600',
            shadow: 'shadow-blue-200'
        },
        {
            id: ViewState.RESEARCH_CENTER, // Mapping Science to Research Center for now
            title: isSpanish ? 'Ciencias' : 'Science',
            description: isSpanish ? 'Descubre el mundo.' : 'Discover the world.',
            icon: <Microscope className="w-12 h-12 text-white" />,
            color: 'bg-kid-green',
            gradient: 'from-green-400 to-green-600',
            shadow: 'shadow-green-200'
        },
        {
            id: ViewState.BUDDY_LEARN,
            title: isSpanish ? 'Idiomas' : 'Languages',
            description: isSpanish ? 'Aprende inglés con Ollie.' : 'Learn English with Ollie.',
            icon: <Globe className="w-12 h-12 text-white" />,
            color: 'bg-kid-purple',
            gradient: 'from-purple-400 to-purple-600',
            shadow: 'shadow-purple-200'
        },
        {
            id: ViewState.RESEARCH_CENTER, // Mapping Humanities to Research Center
            title: isSpanish ? 'Humanidades' : 'Humanities',
            description: isSpanish ? 'Historia y lectura.' : 'History and reading.',
            icon: <BookOpen className="w-12 h-12 text-white" />,
            color: 'bg-kid-orange',
            gradient: 'from-orange-400 to-orange-600',
            shadow: 'shadow-orange-200'
        }
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-comic border-2 border-slate-100">
                    <Sparkles className="w-6 h-6 text-kid-yellow animate-pulse" />
                    <span className="font-black text-slate-800 uppercase tracking-widest text-sm">
                        {isSpanish ? 'Tutoría Inteligente' : 'Smart Tutoring'}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
                    {isSpanish ? '¿Qué quieres aprender hoy?' : 'What do you want to learn today?'}
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                    {isSpanish
                        ? 'Selecciona una materia para comenzar tu aventura.'
                        : 'Select a subject to start your adventure.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {subjects.map((sub, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(sub.id)}
                        className={`group relative flex flex - col items - center p - 8 rounded - [2.5rem] bg - white border - 4 border - transparent hover: border - slate - 100 shadow - xl transition - all duration - 300 hover: -translate - y - 2 hover: shadow - 2xl overflow - hidden`}
                    >
                        <div className={`absolute inset - 0 bg - gradient - to - br ${sub.gradient} opacity - 0 group - hover: opacity - 5 transition - opacity duration - 300`} />

                        <div className={`w - 24 h - 24 rounded - 3xl ${sub.color} shadow - lg ${sub.shadow} flex items - center justify - center mb - 6 transform group - hover: scale - 110 transition - transform duration - 300 rotate - 3 group - hover: rotate - 6`}>
                            {sub.icon}
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 transition-all">
                            {sub.title}
                        </h3>

                        <p className="text-center text-slate-400 font-medium group-hover:text-slate-500 transition-colors">
                            {sub.description}
                        </p>

                        <div className="mt-8 px-6 py-2 bg-slate-50 rounded-full font-bold text-sm text-slate-600 uppercase tracking-wide group-hover:bg-slate-800 group-hover:text-white transition-all">
                            {isSpanish ? 'Comenzar' : 'Start'}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TutorSelection;
