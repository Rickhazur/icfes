import React, { useMemo } from 'react';
import { Calculator, FlaskConical, BookOpen, Languages, Palette } from 'lucide-react';
import SubjectCard, { SubjectType } from './SubjectCard';
import { ViewState } from '../../types';
import { useLearning } from '@/context/LearningContext';

interface SubjectsGridProps {
    onSelectSubject?: (view: ViewState) => void;
}

const SubjectsGrid: React.FC<SubjectsGridProps> = ({ onSelectSubject }) => {
    const { language } = useLearning();
    const isEn = language === 'en';

    const subjects = useMemo(() => [
        {
            title: isEn ? 'Mathematics' : 'Matemáticas',
            description: isEn
                ? 'Master numeric concepts, operations, and problem solving in a fun way.'
                : 'Domina conceptos numéricos, operaciones y resolución de problemas de forma divertida.',
            icon: Calculator,
            topics: isEn
                ? ['Algebra', 'Geometry', 'Statistics', 'Arithmetic']
                : ['Álgebra', 'Geometría', 'Estadística', 'Aritmética'],
            level: (isEn ? 'All levels' : 'Todos los niveles') as any,
            type: 'math' as SubjectType,
            viewState: ViewState.MATH_TUTOR
        },
        {
            title: isEn ? 'Natural Sciences' : 'Ciencias Naturales',
            description: isEn
                ? 'Explore the world around you with experiments and scientific discoveries.'
                : 'Explora el mundo que te rodea con experimentos y descubrimientos científicos.',
            icon: FlaskConical,
            topics: isEn
                ? ['Biology', 'Physics', 'Chemistry', 'Environment']
                : ['Biología', 'Física', 'Química', 'Medio Ambiente'],
            level: (isEn ? 'Intermediate' : 'Intermedio') as any,
            type: 'science' as SubjectType,
            viewState: ViewState.RESEARCH_CENTER
        },
        {
            title: isEn ? 'Humanities' : 'Humanidades',
            description: isEn
                ? 'Travel through history, learn geography, and understand citizenship.'
                : 'Viaja por la historia, conoce geografía y aprende sobre ciudadanía.',
            icon: BookOpen,
            topics: isEn
                ? ['History', 'Geography', 'Citizenship']
                : ['Historia', 'Geografía', 'Ciudadanía'],
            level: (isEn ? 'All levels' : 'Todos los niveles') as any,
            type: 'humanities' as SubjectType,
            viewState: ViewState.RESEARCH_CENTER
        },
        {
            title: isEn ? 'Languages' : 'Idiomas',
            description: isEn
                ? 'Develop bilingual skills in Spanish, English, and more.'
                : 'Desarrolla habilidades bilingües en español, inglés y más.',
            icon: Languages,
            topics: isEn
                ? ['Spanish', 'English', 'Reading', 'Writing']
                : ['Español', 'Inglés', 'Lectura', 'Escritura'],
            level: (isEn ? 'All levels' : 'Todos los niveles') as any,
            type: 'languages' as SubjectType,
            viewState: ViewState.BUDDY_LEARN
        },
        {
            title: isEn ? 'Arts & PE' : 'Arte y Educación Física',
            description: isEn
                ? 'Express your creativity and stay active with music, art, and sports.'
                : 'Expresa tu creatividad y mantente activo con música, arte y deportes.',
            icon: Palette,
            topics: isEn
                ? ['Music', 'Visual Arts', 'Sports']
                : ['Música', 'Artes Visuales', 'Deportes'],
            level: (isEn ? 'All levels' : 'Todos los niveles') as any,
            type: 'arts' as SubjectType,
            viewState: ViewState.ARTS_TUTOR
        },
    ], [isEn]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
                <SubjectCard
                    key={subject.title}
                    {...subject}
                    delay={index * 100}
                    onClick={() => subject.viewState && onSelectSubject?.(subject.viewState)}
                />
            ))}
        </div>
    );
};

export default SubjectsGrid;
