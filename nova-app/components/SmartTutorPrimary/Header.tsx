import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useLearning } from '@/context/LearningContext';

const Header = () => {
    const { language, setLanguage } = useLearning();
    const isEn = language === 'en';

    return (
        <header className="text-center mb-12 animate-in fade-in fill-mode-both duration-700 relative">
            {/* Language Toggle - Absolute Top Right */}
            <div className="absolute top-0 right-0 hidden md:flex bg-white/80 backdrop-blur p-1 rounded-full border border-slate-200">
                <button
                    onClick={() => setLanguage('es')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${language === 'es' || language === 'bilingual' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-indigo-600'}`}
                >
                    🇪🇸 ES
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${language === 'en' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-indigo-600'}`}
                >
                    🇺🇸 EN
                </button>
            </div>

            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full mb-6 ring-1 ring-indigo-100">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">
                    {isEn ? 'IB Curriculum + Colombian Standards' : 'Currículo IB + Colombiano'}
                </span>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <GraduationCap className="text-white" size={28} />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {isEn ? 'Smart Tutoring' : 'Tutoría Inteligente'}
                    <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg align-middle ml-2 uppercase">
                        {isEn ? 'Primary' : 'Primaria'}
                    </span>
                </h1>
            </div>

            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
                {isEn
                    ? 'Select a subject to start your AI tutoring session. Designed for primary students (Grades 1-5).'
                    : 'Selecciona una materia para comenzar tu sesión de tutoría con IA. Diseñado para estudiantes de primaria (1° a 5° grado).'
                }
            </p>

            {/* Mobile Toggle (Centered below desc) */}
            <div className="md:hidden flex justify-center mt-4">
                <div className="inline-flex bg-white/80 p-1 rounded-full border border-slate-200">
                    <button
                        onClick={() => setLanguage('es')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${language === 'es' || language === 'bilingual' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        Español
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${language === 'en' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        English
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
