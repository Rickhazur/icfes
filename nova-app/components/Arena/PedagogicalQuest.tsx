// components/Arena/PedagogicalQuest.tsx
// Educational quest with guided learning before challenge

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Lightbulb, CheckCircle, ArrowRight, Play, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

// Particle effect for correct answers
const fireConfetti = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            spread: 90,
            startVelocity: 45,
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};

// Sparkle effect for steps
const createSparkle = (x: number, y: number) => {
    const sparkle = document.createElement('div');
    sparkle.className = 'absolute pointer-events-none';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.innerHTML = '✨';
    sparkle.style.fontSize = '24px';
    sparkle.style.animation = 'sparkle-float 1s ease-out forwards';
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1000);
};


interface LearningStep {
    type: 'explanation' | 'example' | 'practice' | 'challenge';
    title: { es: string; en: string };
    content: { es: string; en: string };
    visual?: string; // URL to image or diagram
    interactiveExample?: {
        problem: string;
        steps: Array<{ text: string; highlight?: string }>;
        answer: string;
    };
}

interface PedagogicalQuestProps {
    quest: {
        id: string;
        title: { es: string; en: string };
        icon: string;
        category: string;
        difficulty: 'easy' | 'medium' | 'hard';
        learningObjective: { es: string; en: string };
        learningSteps: LearningStep[];
        challenge: {
            question: { es: string; en: string };
            options: Array<{ id: string; text: { es: string; en: string } }>;
            correctOptionId: string;
            explanation: { es: string; en: string };
        };
        reward: { coins: number; xp: number };
    };
    language: 'es' | 'en';
    onComplete: (questId: string, correct: boolean) => void;
    onClose: () => void;
}

export function PedagogicalQuest({ quest, language, onComplete, onClose }: PedagogicalQuestProps) {
    const [currentPhase, setCurrentPhase] = useState<'intro' | 'learning' | 'challenge' | 'result'>('intro');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const currentStep = quest.learningSteps[currentStepIndex];
    const isLastStep = currentStepIndex === quest.learningSteps.length - 1;

    const handleNextStep = () => {
        if (isLastStep) {
            setCurrentPhase('challenge');
        } else {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handleStartLearning = () => {
        setCurrentPhase('learning');
    };

    const handleSubmitAnswer = () => {
        const isCorrect = selectedAnswer === quest.challenge.correctOptionId;
        setShowExplanation(true);

        // Fire confetti if correct
        if (isCorrect) {
            setTimeout(() => fireConfetti(), 300);
        }

        setTimeout(() => {
            setCurrentPhase('result');
            onComplete(quest.id, isCorrect);
            // Fire more confetti on result screen
            if (isCorrect) {
                setTimeout(() => fireConfetti(), 500);
            }
        }, 3000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur">
                            {quest.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-fredoka">
                                {quest.title[language]}
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                {quest.learningObjective[language]}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {currentPhase === 'learning' && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs mb-2">
                                <span>{language === 'es' ? 'Progreso' : 'Progress'}</span>
                                <span>{currentStepIndex + 1} / {quest.learningSteps.length}</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStepIndex + 1) / quest.learningSteps.length) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <AnimatePresence mode="wait">
                        {/* INTRO PHASE */}
                        {currentPhase === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                                    <BookOpen className="w-12 h-12 text-indigo-600" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                        {language === 'es' ? '¿Listo para aprender?' : 'Ready to learn?'}
                                    </h3>
                                    <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                        {language === 'es'
                                            ? 'Antes de enfrentar el desafío, vamos a aprender juntos. Te explicaré el concepto paso a paso con ejemplos claros.'
                                            : 'Before facing the challenge, let\'s learn together. I\'ll explain the concept step by step with clear examples.'}
                                    </p>
                                </div>

                                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 max-w-2xl mx-auto">
                                    <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5" />
                                        {language === 'es' ? 'Objetivo de Aprendizaje:' : 'Learning Objective:'}
                                    </h4>
                                    <p className="text-indigo-700">
                                        {quest.learningObjective[language]}
                                    </p>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={handleStartLearning}
                                        size="lg"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg animate-pulse"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        {language === 'es' ? '¡Comenzar Lección!' : 'Start Lesson!'}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* LEARNING PHASE */}
                        {currentPhase === 'learning' && currentStep && (
                            <motion.div
                                key={`step-${currentStepIndex}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Step Type Badge */}
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide",
                                        currentStep.type === 'explanation' && "bg-blue-100 text-blue-700",
                                        currentStep.type === 'example' && "bg-green-100 text-green-700",
                                        currentStep.type === 'practice' && "bg-amber-100 text-amber-700"
                                    )}>
                                        {currentStep.type === 'explanation' && (language === 'es' ? '📖 Explicación' : '📖 Explanation')}
                                        {currentStep.type === 'example' && (language === 'es' ? '💡 Ejemplo' : '💡 Example')}
                                        {currentStep.type === 'practice' && (language === 'es' ? '✏️ Práctica' : '✏️ Practice')}
                                    </span>
                                </div>

                                {/* Step Content */}
                                <div className="bg-white border-2 border-slate-200 rounded-2xl p-8">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                                        {currentStep.title[language]}
                                    </h3>
                                    <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                                        {currentStep.content[language].split('\n').map((paragraph, idx) => (
                                            <p key={idx} className="mb-4">{paragraph}</p>
                                        ))}
                                    </div>

                                    {/* Visual Aid */}
                                    {currentStep.visual && (
                                        <div className="mt-6 bg-slate-50 rounded-xl p-6 border border-slate-200">
                                            <img src={currentStep.visual} alt="Visual aid" className="max-w-full mx-auto" />
                                        </div>
                                    )}

                                    {/* Interactive Example */}
                                    {currentStep.interactiveExample && (
                                        <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                                            <h4 className="font-bold text-indigo-900 mb-4 text-lg">
                                                {language === 'es' ? '📝 Veamos un ejemplo:' : '📝 Let\'s see an example:'}
                                            </h4>
                                            <div className="bg-white rounded-lg p-4 mb-4 font-mono text-lg">
                                                {currentStep.interactiveExample.problem}
                                            </div>
                                            <div className="space-y-3">
                                                {currentStep.interactiveExample.steps.map((step, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.2 }}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 bg-white rounded-lg p-3">
                                                            <p className="text-slate-700">{step.text}</p>
                                                            {step.highlight && (
                                                                <p className="mt-2 font-mono text-indigo-600 font-bold">{step.highlight}</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                                                <p className="text-green-800 font-bold">
                                                    ✓ {language === 'es' ? 'Respuesta:' : 'Answer:'} {currentStep.interactiveExample.answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between items-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                                        disabled={currentStepIndex === 0}
                                    >
                                        {language === 'es' ? 'Anterior' : 'Previous'}
                                    </Button>

                                    <Button
                                        onClick={handleNextStep}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {isLastStep
                                            ? (language === 'es' ? '¡Ir al Desafío!' : 'Go to Challenge!')
                                            : (language === 'es' ? 'Siguiente' : 'Next')
                                        }
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* CHALLENGE PHASE */}
                        {currentPhase === 'challenge' && (
                            <motion.div
                                key="challenge"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trophy className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                        {language === 'es' ? '¡Hora del Desafío!' : 'Challenge Time!'}
                                    </h3>
                                    <p className="text-slate-600">
                                        {language === 'es'
                                            ? 'Demuestra lo que aprendiste'
                                            : 'Show what you learned'}
                                    </p>
                                </div>

                                <div className="bg-white border-2 border-slate-200 rounded-2xl p-8">
                                    <h4 className="text-xl font-bold text-slate-800 mb-6">
                                        {quest.challenge.question[language]}
                                    </h4>

                                    <div className="space-y-3">
                                        {quest.challenge.options.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedAnswer(option.id)}
                                                disabled={showExplanation}
                                                className={cn(
                                                    "w-full p-4 rounded-xl border-2 text-left transition-all font-medium",
                                                    selectedAnswer === option.id
                                                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                                                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
                                                    showExplanation && option.id === quest.challenge.correctOptionId && "border-green-500 bg-green-50",
                                                    showExplanation && option.id === selectedAnswer && option.id !== quest.challenge.correctOptionId && "border-red-500 bg-red-50"
                                                )}
                                            >
                                                {option.text[language]}
                                            </button>
                                        ))}
                                    </div>

                                    {showExplanation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "mt-6 p-4 rounded-xl border-2",
                                                selectedAnswer === quest.challenge.correctOptionId
                                                    ? "bg-green-50 border-green-300"
                                                    : "bg-blue-50 border-blue-300"
                                            )}
                                        >
                                            <p className={cn(
                                                "font-bold mb-2",
                                                selectedAnswer === quest.challenge.correctOptionId ? "text-green-800" : "text-blue-800"
                                            )}>
                                                {selectedAnswer === quest.challenge.correctOptionId
                                                    ? (language === 'es' ? '¡Correcto! 🎉' : 'Correct! 🎉')
                                                    : (language === 'es' ? 'Explicación:' : 'Explanation:')}
                                            </p>
                                            <p className={cn(
                                                selectedAnswer === quest.challenge.correctOptionId ? "text-green-700" : "text-blue-700"
                                            )}>
                                                {quest.challenge.explanation[language]}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={!selectedAnswer || showExplanation}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg"
                                >
                                    {language === 'es' ? 'Verificar Respuesta' : 'Check Answer'}
                                </Button>
                            </motion.div>
                        )}

                        {/* RESULT PHASE */}
                        {currentPhase === 'result' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6 py-8"
                            >
                                <motion.div
                                    className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <CheckCircle className="w-16 h-16 text-white" />
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3 className="text-3xl font-bold text-slate-800 mb-2">
                                        {language === 'es' ? '¡Misión Completada!' : 'Mission Complete!'}
                                    </h3>
                                    <p className="text-slate-600 text-lg">
                                        {language === 'es'
                                            ? '¡Excelente trabajo! Has aprendido algo nuevo hoy.'
                                            : 'Great job! You learned something new today.'}
                                    </p>
                                </motion.div>

                                <div className="flex justify-center gap-6">
                                    <motion.div
                                        className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6"
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4, type: "spring" }}
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                    >
                                        <p className="text-yellow-600 font-bold text-sm mb-1">MONEDAS</p>
                                        <p className="text-3xl font-black text-yellow-700">+{quest.reward.coins} 🪙</p>
                                    </motion.div>
                                    <motion.div
                                        className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-6"
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.6, type: "spring" }}
                                        whileHover={{ scale: 1.05, rotate: -5 }}
                                    >
                                        <p className="text-purple-600 font-bold text-sm mb-1">XP</p>
                                        <p className="text-3xl font-black text-purple-700">+{quest.reward.xp} ⭐</p>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={onClose}
                                        size="lg"
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 shadow-xl"
                                    >
                                        {language === 'es' ? 'Continuar' : 'Continue'}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
