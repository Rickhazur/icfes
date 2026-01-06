import React from 'react';
import { useLearning } from '@/context/LearningContext';

interface GradeSelectorProps {
    selectedGrade: number;
    onSelectGrade: (grade: number) => void;
}

const grades = [1, 2, 3, 4, 5];

const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onSelectGrade }) => {
    const { language } = useLearning();
    const isEn = language === 'en';

    return (
        <div className="flex flex-col items-center gap-3 mb-10 animate-in fade-in fill-mode-both duration-700 delay-100">
            <span className="text-sm font-medium text-slate-400">
                {isEn ? 'Select your grade:' : 'Selecciona tu grado:'}
            </span>
            <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                {grades.map((grade) => (
                    <button
                        key={grade}
                        onClick={() => onSelectGrade(grade)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedGrade === grade
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                    >
                        {grade}° {isEn ? 'Grade' : 'Grado'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GradeSelector;
