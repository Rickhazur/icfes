import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Layers,
    RotateCcw,
    CheckCircle2,
    ArrowRight,
    Brain,
    Plus,
    Loader2,
    XCircle,
    Sparkles,
    Trophy,
    RefreshCw,
    Star,
    Volume2,
    Calendar,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFlashcards } from '../services/openai';
import { useGamification } from '@/context/GamificationContext';
import { recordQuestCompletion } from '@/services/learningProgress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Flashcard {
    id: string;
    front: string;
    back: string;
    category?: 'math' | 'science' | 'language';
    lastReviewed?: number;
    correctCount: number;
    incorrectCount: number;
}

interface FlashcardsProps {
    userId: string;
    language: 'es' | 'en';
}

const Flashcards: React.FC<FlashcardsProps> = ({ userId, language }) => {
    const { addXP, addCoins } = useGamification();

    // States
    const [deck, setDeck] = useState<Flashcard[]>(() => {
        const saved = localStorage.getItem(`flashcard_deck_${userId}`);
        return saved ? JSON.parse(saved) : [
            { id: '1', front: "¡Bienvenido! Genera tarjetas para empezar.", back: "Welcome! Generate cards to start.", correctCount: 0, incorrectCount: 0 },
        ];
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [topicInput, setTopicInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'math' | 'science' | 'language'>('math');
    const [sessionStats, setSessionStats] = useState({ correct: 0, reviewed: 0 });
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        localStorage.setItem(`flashcard_deck_${userId}`, JSON.stringify(deck));
    }, [deck, userId]);

    // TTS Support
    const speak = useCallback((text: string) => {
        if (!text) return;
        window.speechSynthesis.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }, [language]);

    // Auto-speak current card side
    useEffect(() => {
        if (isFinished || !deck[currentIndex] || deck.length === 0) return;
        const sideText = isFlipped ? deck[currentIndex].back : deck[currentIndex].front;
        // Small delay to avoid cutting off animations
        const timer = setTimeout(() => {
            speak(sideText);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentIndex, isFlipped, isFinished, deck, speak]);

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex < deck.length - 1) {
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 200);
        } else {
            handleCompleteSession();
        }
    };

    const handleResponse = (correct: boolean) => {
        const currentCard = deck[currentIndex];
        const updatedDeck = [...deck];

        if (correct) {
            updatedDeck[currentIndex] = {
                ...currentCard,
                correctCount: currentCard.correctCount + 1,
                lastReviewed: Date.now()
            };
            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1, reviewed: prev.reviewed + 1 }));
            addXP(10); // 10 XP per correct card
        } else {
            updatedDeck[currentIndex] = {
                ...currentCard,
                incorrectCount: currentCard.incorrectCount + 1,
                lastReviewed: Date.now()
            };
            setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
            addXP(2); // Even incorrect review counts for 2 XP
        }

        setDeck(updatedDeck);
        handleNext();
    };

    const handleCompleteSession = async () => {
        setIsFinished(true);
        const coinsEarned = Math.floor(sessionStats.correct * 5);
        const xpEarned = sessionStats.reviewed * 5;

        addCoins(coinsEarned, language === 'es' ? "Repaso de Tarjetas" : "Flashcard Review");
        addXP(xpEarned);

        await recordQuestCompletion(userId, `flashcards_${activeCategory}_${Date.now()}`, {
            title: `Flashcards: ${activeCategory}`,
            category: activeCategory,
            difficulty: 'medium',
            wasCorrect: sessionStats.correct > (sessionStats.reviewed / 2),
            coinsEarned,
            xpEarned
        });

        toast.success(language === 'es' ? "¡Sesión terminada! Has ganado monedas y XP." : "Session complete! You earned coins and XP.");
    };

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!topicInput.trim()) return;

        setIsGenerating(true);
        try {
            const newCards = await generateFlashcards(`${activeCategory}: ${topicInput}`);
            if (newCards && newCards.length > 0) {
                const formattedCards = newCards.map((c: any, i: number) => ({
                    id: `gen-${Date.now()}-${i}`,
                    front: c.front,
                    back: c.back,
                    category: activeCategory,
                    correctCount: 0,
                    incorrectCount: 0
                }));
                setDeck(formattedCards);
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsFinished(false);
                setSessionStats({ correct: 0, reviewed: 0 });
                toast.success(language === 'es' ? "¡Nuevas tarjetas creadas!" : "New cards generated!");
            }
        } catch (error) {
            toast.error(language === 'es' ? "Error al generar tarjetas." : "Error generating cards.");
        } finally {
            setIsGenerating(false);
            setTopicInput('');
        }
    };

    const currentCard = deck[currentIndex];

    if (isFinished) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto p-12 bg-white rounded-[3rem] shadow-2xl text-center space-y-8 border-4 border-indigo-100"
            >
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Trophy className="w-12 h-12 text-yellow-600" />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 mb-2">
                        {language === 'es' ? '¡Increíble!' : 'Awesome!'}
                    </h2>
                    <p className="text-slate-500 font-bold">
                        {language === 'es' ? 'Has completado tu sesión de estudio.' : 'You finished your study session.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                        <div className="text-3xl font-black text-indigo-600">{sessionStats.reviewed}</div>
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{language === 'es' ? 'Repasadas' : 'Reviewed'}</div>
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <div className="text-3xl font-black text-emerald-600">{sessionStats.correct}</div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{language === 'es' ? 'Maestría' : 'Mastered'}</div>
                    </div>
                </div>

                <Button
                    onClick={() => { setIsFinished(false); setCurrentIndex(0); setSessionStats({ correct: 0, reviewed: 0 }); }}
                    className="w-full h-16 bg-indigo-600 hover:bg-black rounded-2xl text-xl font-black shadow-xl transition-all"
                >
                    {language === 'es' ? 'Repasar de nuevo' : 'Review again'}
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => setIsFinished(false)}
                    className="text-slate-400 font-bold"
                >
                    {language === 'es' ? 'Volver' : 'Go back'}
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">

            {/* Header & Category Selection */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 font-fredoka flex items-center gap-3">
                        <Layers className="w-10 h-10 text-indigo-600" />
                        {language === 'es' ? 'Tarjetas Mágicas' : 'Magic Cards'}
                    </h1>
                    <p className="text-slate-500 font-medium ml-1">
                        {language === 'es' ? 'Aprender es más divertido con magia.' : 'Learning is more fun with magic.'}
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    {[
                        { id: 'math', label: '🧮' },
                        { id: 'science', label: '🔬' },
                        { id: 'language', label: '📚' }
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as any)}
                            className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all",
                                activeCategory === cat.id ? "bg-white text-indigo-600 shadow-sm scale-110" : "text-slate-400 grayscale hover:grayscale-0"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Generator Box */}
            <form
                onSubmit={handleGenerate}
                className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100 flex gap-2 items-center group focus-within:ring-4 focus-within:ring-indigo-100 transition-all"
            >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder={language === 'es' ? "¿Qué quieres estudiar hoy?" : "What do you want to study today?"}
                    className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-700 placeholder:text-slate-300 px-2"
                />
                <Button
                    type="submit"
                    disabled={isGenerating || !topicInput.trim()}
                    className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-black transition-all font-black"
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    {language === 'es' ? 'Darle Magia' : 'Add Magic'}
                </Button>
            </form>

            <div className="grid lg:grid-cols-5 gap-10 items-start">

                {/* Lateral Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6 rounded-[2rem] bg-indigo-950 text-white border-none shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-12 h-12" /></div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Tu Progreso</div>
                        <div className="text-2xl font-black">{currentIndex + 1} / {deck.length}</div>
                        <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-indigo-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
                            />
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[2rem] bg-white border-none shadow-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Racha</div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-black">Level 3</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="font-black text-slate-800 text-lg">3 Días</div>
                        </div>
                    </Card>
                </div>

                {/* Main Flashcard Container */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="relative group perspective-2000 h-[450px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentIndex}-${isFlipped}`}
                                initial={{ rotateY: isFlipped ? -180 : 0, opacity: 0, scale: 0.95 }}
                                animate={{ rotateY: isFlipped ? 180 : 0, opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="w-full h-full cursor-pointer preserve-3d"
                            >
                                <div className={cn(
                                    "absolute inset-0 rounded-[3rem] shadow-2xl border-b-8 border-slate-200 bg-white p-12 flex flex-col items-center justify-center text-center transition-all backface-hidden",
                                    isFlipped ? "invisible" : "visible"
                                )}>
                                    <div className="absolute top-8 left-8 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pregunta</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); speak(currentCard.front); }}
                                        className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                    >
                                        <Volume2 className="w-6 h-6" />
                                    </button>

                                    <h2 className="text-4xl font-black text-slate-800 leading-tight">
                                        {currentCard.front}
                                    </h2>

                                    <p className="absolute bottom-12 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                        Pulsa para ver la respuesta
                                    </p>
                                </div>

                                <div className={cn(
                                    "absolute inset-0 rounded-[3rem] shadow-2xl border-b-8 border-indigo-700 bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 flex flex-col items-center justify-center text-center text-white backface-hidden rotate-y-180",
                                    isFlipped ? "visible" : "invisible"
                                )}>
                                    <div className="absolute top-8 left-8 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-white/60" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Respuesta</span>
                                    </div>

                                    <h2 className="text-4xl font-black leading-tight">
                                        {currentCard.back}
                                    </h2>

                                    <div className="absolute bottom-12 flex gap-4">
                                        <Button
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); speak(currentCard.back); }}
                                            className="text-white/60 hover:text-white hover:bg-white/10"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Interaction Buttons */}
                    <div className="flex justify-center gap-6">
                        <Button
                            onClick={() => handleResponse(false)}
                            className="h-20 px-10 rounded-[2rem] bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border-b-4 border-slate-300 hover:border-rose-300 transition-all font-black text-xl flex items-center gap-3"
                        >
                            <XCircle className="w-8 h-8" />
                            {language === 'es' ? 'Aún no' : 'Not yet'}
                        </Button>
                        <Button
                            onClick={() => handleResponse(true)}
                            className="h-20 px-12 rounded-[2rem] bg-indigo-600 text-white hover:bg-black border-b-4 border-indigo-800 transition-all font-black text-xl flex items-center gap-3 shadow-xl"
                        >
                            <CheckCircle2 className="w-8 h-8" />
                            {language === 'es' ? '¡Lo tengo!' : 'Got it!'}
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
};

// UI Components
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 rounded-3xl", className)}>
        {children}
    </div>
);

export default Flashcards;
