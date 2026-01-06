import React from 'react';
import Header from './Header';
import GradeSelector from './GradeSelector';
import SubjectsGrid from './SubjectsGrid';
import { ViewState } from '../../types';
import { useLearning } from '@/context/LearningContext';

interface PrimaryTutorProps {
    onNavigate: (view: ViewState) => void;
    gradeLevel: number;
    setGradeLevel: (grade: number) => void;
}

const PrimaryTutor: React.FC<PrimaryTutorProps> = ({ onNavigate, gradeLevel, setGradeLevel }) => {
    const { language } = useLearning();
    const isEn = language === 'en';

    return (
        <div className="min-h-screen bg-transparent font-poppins">
            {/* Use max-w-6xl for container width and center it */}
            <div className="container max-w-6xl py-4 px-4 mx-auto">
                <Header />
                <GradeSelector selectedGrade={gradeLevel} onSelectGrade={setGradeLevel} />
                <SubjectsGrid onSelectSubject={onNavigate} />

                <footer className="mt-16 text-center text-sm text-slate-400 opacity-0 animate-in fade-in fill-mode-both delay-500 duration-1000">
                    <p>📚 {isEn ? 'Aligned with IB standards and Colombian curriculum' : 'Alineado con estándares IB y currículo colombiano'}</p>
                </footer>
            </div>
        </div>
    );
};

export default PrimaryTutor;
