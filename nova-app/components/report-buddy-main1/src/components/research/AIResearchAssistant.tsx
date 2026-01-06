import React, { useState } from 'react';
import { Sparkles, Send, BookMarked, FileText, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import { useGamification } from '../../../../../context/GamificationContext';
import type { Language } from '../../types/research';

interface AIResearchAssistantProps {
    language: Language;
    currentGrade: number;
    searchContext?: string; // The topic they're researching
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export function AIResearchAssistant({ language, currentGrade, searchContext }: AIResearchAssistantProps) {
    const { addXP } = useGamification();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // New State for Curiosity Mode
    const [sparkQuestions, setSparkQuestions] = useState<string[]>([]);
    const [detectiveLevel, setDetectiveLevel] = useState(1);

    const systemPrompt = language === 'es'
        ? `Actúa como el 'Investigador Jefe' de una agencia de detectives de la ciencia. Tu misión NO es dar respuestas, sino ENTRENAR a los estudiantes para que hagan preguntas increíbles.
           1. Cuando el usuario proponga un tema, dale 3 "Pistas de Investigación" (Preguntas fascinantes) para despertar su curiosidad.
           2. Cuando el usuario haga una pregunta:
              - Califícala del 1 al 10 basándote en su profundidad (¿Es una pregunta de 'Qué' o una de 'Por qué/Cómo'?).
              - Si es básica, dale una pista para mejorarla.
              - Si es buena, felicítalo y dale una pequeña "pieza del puzzle" (un dato curioso) y anímalo a seguir investigando.
           Mantén un tono misterioso, divertido y alentador.`
        : `Act as the 'Chief Investigator' of a science detective agency. Your mission is NOT to give answers, but to TRAIN students to ask amazing questions.
           1. When the user proposes a topic, give them 3 "Investigation Clues" (Fascinating questions) to spark curiosity.
           2. When the user asks a question:
              - Rate it 1-10 based on depth (Is it a 'What' question or a 'Why/How' question?).
              - If basic, give a hint to improve it.
              - If good, congratulate them, give a small "puzzle piece" (fun fact), and encourage further inquiry.
           Keep a mysterious, fun, and encouraging tone.`;

    const handleSendMessage = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Clear sparks after selection to focus on the chat
        if (textOverride) setSparkQuestions([]);

        // Fallback Mock System if API Key is missing
        if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
            setTimeout(() => {
                let mockContent = "";

                // Mock Logic for Demo
                if (messages.length === 0) {
                    mockContent = language === 'es'
                        ? "¡Interesante caso! 🕵️‍♂️ Para investigar sobre esto, ¿qué ruta quieres tomar? Aquí tienes 3 misterios:\n1. ¿Por qué sucede esto solo en la Tierra?\n2. ¿Cómo afecta esto a los animales?\n3. ¿Qué pasaría si esto desapareciera mañana?"
                        : "Interesting case! 🕵️‍♂️ To investigate this, which path do you want to take? Here are 3 mysteries:\n1. Why does this only happen on Earth?\n2. How does this affect animals?\n3. What if this disappeared tomorrow?";
                    setSparkQuestions(language === 'es'
                        ? ["¿Por qué sucede esto?", "¿Cómo afecta a los animales?", "¿Y si desaparece?"]
                        : ["Why does this happen?", "How does it affect animals?", "What if it disappears?"]
                    );
                } else {
                    mockContent = language === 'es'
                        ? "¡Esa es una pregunta de Detective de Nivel 5! 🌟 Estás preguntando 'CÓMO', lo cual es clave. Pista: Tiene que ver con la energía del sol. ¿Puedes adivinar qué hace el calor con el agua?"
                        : "That's a Level 5 Detective question! 🌟 You're asking 'HOW', which is key. Clue: It has to do with the sun's energy. Can you guess what heat does to water?";
                    setSparkQuestions([]);
                }

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: mockContent,
                    timestamp: new Date()
                };
                addXP(5);
                setMessages(prev => [...prev, assistantMessage]);
                setIsLoading(false);
            }, 1500);
            return;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: textToSend }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) throw new Error('Failed to get AI response');

            const data = await response.json();
            const content = data.choices[0].message.content;

            const assistantMessage: Message = {
                role: 'assistant',
                content: content,
                timestamp: new Date()
            };

            // Attempt to extract spark questions if AI provides them in a structured way (simple heuristic)
            // ideally we'd use JSON mode, but for chatty text we just append
            // For now, we won't auto-extract sparks from real API to avoid parsing complex text, 
            // unless we instruct AI to output JSON. Let's keep it conversational.

            addXP(10); // More XP for curiosity!
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: language === 'es'
                    ? '🕵️‍♂️ La señal del cuartel general se cortó. Intenta de nuevo.'
                    : '🕵️‍♂️ HQ signal lost. Try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-950/90 to-violet-950/90 rounded-3xl border-2 border-indigo-500/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.15)] h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-indigo-500/20 pb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg border border-white/10 animate-pulse-slow">
                            <Lightbulb className="w-7 h-7 text-yellow-300 fill-yellow-300" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-indigo-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            LVL {detectiveLevel}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-fredoka font-bold text-white text-xl tracking-wide">
                            {language === 'es' ? 'Entrenador de Curiosidad' : 'Curiosity Coach'}
                        </h3>
                        <p className="text-sm text-indigo-300/80 flex items-center gap-2">
                            {language === 'es' ? 'Agencia de Detectives de Ciencia' : 'Science Detective Agency'} 🕵️‍♂️
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent pr-4 space-y-6">
                {messages.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-indigo-500/20">
                            <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">
                            {language === 'es' ? '¿Qué misterio quieres resolver hoy?' : 'What mystery will we solve today?'}
                        </h4>
                        <p className="text-indigo-300/70 text-sm max-w-xs mx-auto mb-8">
                            {language === 'es'
                                ? 'Escribe un tema (ej. Volcanes, Pirámides, Marte) y encontraremos el mejor ángulo.'
                                : 'Type a topic (e.g., Volcanoes, Pyramids, Mars) and we will find the best angle.'}
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <span className="text-lg">🕵️‍♂️</span>
                                </div>
                            )}
                            <div
                                className={cn(
                                    "max-w-[85%] rounded-2xl px-5 py-4 text-sm shadow-md",
                                    msg.role === 'user'
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                                        : 'bg-slate-800/90 border border-indigo-500/30 text-indigo-50 rounded-bl-none'
                                )}
                            >
                                <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}

                {/* Spark Buttons (Future Questions) */}
                {sparkQuestions.length > 0 && (
                    <div className="grid gap-2 ml-14 animate-in fade-in zoom-in duration-300">
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                            {language === 'es' ? 'Pistas sugeridas:' : 'Suggested clues:'}
                        </p>
                        {sparkQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSendMessage(q)}
                                className="text-left bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/40 text-indigo-200 px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 group"
                            >
                                <span className="bg-indigo-500/30 w-5 h-5 rounded-full flex items-center justify-center text-xs group-hover:bg-indigo-500 group-hover:text-white transition-colors">?</span>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {isLoading && (
                    <div className="flex gap-4 ml-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Loader2 className="w-5 h-5 text-indigo-200 animate-spin" />
                        </div>
                        <div className="bg-slate-800/50 rounded-2xl px-4 py-3 flex items-center gap-1">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}

                {/* Scroll Anchor */}
                <div id="messages-end" />
            </div>

            {/* Input Area */}
            <div className="mt-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl opacity-10 blur-md pointer-events-none" />
                <div className="relative bg-slate-900/80 rounded-2xl border border-indigo-500/30 flex items-end gap-2 p-2 focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={language === 'es'
                            ? 'Escribe tu pregunta de detective aquí...'
                            : 'Type your detective question here...'}
                        className="flex-1 min-h-[50px] max-h-32 bg-transparent border-0 text-white placeholder:text-indigo-400/50 resize-none focus-visible:ring-0 py-3"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl w-10 h-10 p-0 shadow-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0 mb-1"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
