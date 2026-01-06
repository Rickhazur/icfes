import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SocraticTutor } from './SocraticTutor';
import { generateIcfesQuestions, fetchIcfesQuestions, IcfesQuestion } from './services/IcfesQuestionBank';
import { Lightbulb, MousePointer2 } from 'lucide-react';

export const ExamSimulator: React.FC<{ onExit: () => void; onComplete: (results: any) => void }> = ({ onExit, onComplete }) => {
    const [questions, setQuestions] = useState<IcfesQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // Track ID -> Answer
    const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({}); // QuestionID -> [OptionIDs]
    const [isEliminationMode, setIsEliminationMode] = useState(false);
    const [showTip, setShowTip] = useState(false);

    // Load questions on mount (Async now)
    useEffect(() => {
        const load = async () => {
            const qs = await fetchIcfesQuestions();
            setQuestions(qs);
        };
        load();
    }, []);

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG_SOCRATIC'>('IDLE');

    const currentQuestion = questions[currentIndex];

    // Reset local state on question change
    useEffect(() => {
        setIsEliminationMode(false);
        setShowTip(false);
    }, [currentIndex]);

    const handleOptionClick = (optionId: string) => {
        if (isEliminationMode) {
            // Toggle elimination
            setEliminatedOptions(prev => {
                const current = prev[currentQuestion.id] || [];
                const isEliminated = current.includes(optionId);
                const newEliminated = isEliminated
                    ? current.filter(id => id !== optionId)
                    : [...current, optionId];
                return { ...prev, [currentQuestion.id]: newEliminated };
            });
            return;
        }

        if (status !== 'CORRECT' && status !== 'WRONG_SOCRATIC') {
            // Block selecting eliminated options? Or just allow it? Usually block.
            const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(optionId);
            if (!isEliminated) {
                handleAnswer(optionId);
            }
        }
    };

    const handleAnswer = (optionId: string) => {
        setSelectedOption(optionId);
        if (optionId === currentQuestion.correctId) {
            setStatus('CORRECT');
            setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
        } else {
            setStatus('WRONG_SOCRATIC');
        }
    };

    // ... existing handleNextQuestion ...
    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStatus('IDLE');
            setSelectedOption(null);
        } else {
            const score = Object.keys(answers).length;
            onComplete({
                totalQuestions: questions.length,
                correctAnswers: score,
                answers: answers,
                questions: questions
            });
        }
    };

    if (!currentQuestion) return <div className="p-10 flex items-center justify-center h-full text-slate-500">Cargando preguntas de alta calidad...</div>;

    return (
        <div className="flex h-full bg-slate-50/50">
            {/* LEFT: Exam Content */}
            <div className={`flex-1 p-8 flex flex-col ${status === 'WRONG_SOCRATIC' ? 'w-2/3' : 'w-full'} transition-all duration-300 ease-in-out`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
                    {/* ... existing header content ... */}
                    <button onClick={onExit} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" /> Salir del Simulacro
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-slate-700 bg-white border border-slate-200 px-4 py-1.5 rounded-full text-sm font-mono shadow-sm">
                            <Clock className="w-4 h-4 text-blue-600" /> 00:45:20
                        </div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="mb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                                    {currentQuestion.category.replace('_', ' ')}
                                </span>
                                <span className="text-slate-400 text-sm">Pregunta {currentIndex + 1} de {questions.length}</span>
                            </div>

                            {/* Strategy Tools */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEliminationMode(!isEliminationMode)}
                                    className={`p-2 rounded-lg transition-colors border ${isEliminationMode ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    title="Modo Descarte: Tacha opciones incorrectas"
                                >
                                    <MousePointer2 className="w-5 h-5" />
                                </button>
                                {currentQuestion.techniqueTip && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowTip(!showTip)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showTip ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <Lightbulb className="w-4 h-4" />
                                            <span className="text-sm font-medium">Estrategia</span>
                                        </button>
                                        {showTip && (
                                            <div className="absolute top-12 right-0 w-64 bg-yellow-50 border border-yellow-200 p-3 rounded-xl shadow-lg z-20 text-sm text-yellow-800 animate-in fade-in slide-in-from-top-2">
                                                <strong>💡 Tip Táctico:</strong>
                                                <p className="mt-1">{currentQuestion.techniqueTip}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h2 className="text-xl md:text-2xl font-serif text-slate-900 leading-relaxed font-medium mt-2">
                            {currentQuestion.text}
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {currentQuestion.options.map((option) => {
                            const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(option.id);
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option.id)}
                                    disabled={status !== 'IDLE' && !isEliminationMode}
                                    className={`w-full p-5 text-left rounded-xl border-2 transition-all group relative overflow-hidden shadow-sm ${selectedOption === option.id
                                            ? status === 'CORRECT'
                                                ? 'border-green-500 bg-green-50 text-green-900 shadow-green-100'
                                                : 'border-red-400 bg-red-50 text-red-900 shadow-red-100'
                                            : isEliminated
                                                ? 'border-slate-100 bg-slate-50 text-slate-300 opacity-60'
                                                : 'border-white bg-white hover:border-blue-300 hover:shadow-md text-slate-700'
                                        } ${isEliminationMode ? 'cursor-cell hover:opacity-80' : ''}`}
                                >
                                    <div className={`flex items-center gap-4 relative z-10 ${isEliminated ? 'line-through decoration-slate-400' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-sm font-bold border-2 transition-colors ${selectedOption === option.id
                                                ? status === 'CORRECT' ? 'border-green-600 bg-green-600 text-white' : 'border-red-500 bg-red-500 text-white'
                                                : isEliminated ? 'border-slate-200 text-slate-300' : 'border-slate-200 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500'
                                            }`}>
                                            {option.id}
                                        </div>
                                        <span className="font-medium text-lg">{option.text}</span>
                                    </div>

                                    {/* Selection Indicator */}
                                    {selectedOption === option.id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {status === 'CORRECT' ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Socratic Trigger Visual */}
                    {status === 'WRONG_SOCRATIC' && (
                        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                            <div className="p-3 bg-white rounded-full shadow-sm border border-indigo-100">
                                <AlertCircle className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-indigo-900">¡Alto ahí! No te daré la respuesta todavía.</h4>
                                <p className="text-sm text-indigo-700">Mira a la derecha. Tu Tutor Socrático quiere ayudarte a que tú mismo la encuentres.</p>
                            </div>
                        </div>
                    )}

                    {status === 'CORRECT' && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 flex justify-end">
                            <button onClick={handleNextQuestion} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center gap-2">
                                Siguiente Pregunta <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Socratic Tutor Panel */}
            {status === 'WRONG_SOCRATIC' && (
                <div className="w-[400px] shrink-0 h-full border-l border-slate-200 animate-in slide-in-from-right duration-500 shadow-2xl z-20 bg-white">
                    <SocraticTutor
                        questionContext={currentQuestion.text}
                        studentAnswer={selectedOption || ''}
                        correctAnswer={currentQuestion.options.find(o => o.id === currentQuestion.correctId)?.text || ''}
                        hints={currentQuestion.socraticHints}
                        onSolved={() => {
                            setStatus('CORRECT');
                            setSelectedOption(currentQuestion.correctId);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
