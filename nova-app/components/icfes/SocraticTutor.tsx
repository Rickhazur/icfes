import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS

interface Message {
    id: string;
    role: 'ai' | 'user';
    text: string;
}

interface SocraticTutorProps {
    questionContext: string;
    studentAnswer: string;
    correctAnswer: string;
    hints: string[]; // Dynamic hints from the question bank
    onSolved: () => void;
}

export const SocraticTutor: React.FC<SocraticTutorProps> = ({
    questionContext,
    studentAnswer,
    correctAnswer,
    hints,
    onSolved
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            text: `Veo que elegiste una opción incorrecta. Analicemos juntos. ${hints[0] || "¿Por qué crees que esa es la respuesta?"}`
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hintIndex, setHintIndex] = useState(0); // Track which hint to show next
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // SIMPLE RULE-BASED LOGIC FOR PROTOTYPE
        setTimeout(() => {
            let aiResponse = '';
            const lowerInput = inputText.toLowerCase();

            // Check if user seems to understand ("ahora entiendo", "es la B", "gracias")
            // OR if we ran out of hints, give the answer
            if (lowerInput.includes('entiendo') || lowerInput.includes('gracias') || lowerInput.includes('ya se') || lowerInput.includes('listo')) {
                aiResponse = "¡Excelente! Me alegra que lo hayas deducido. Intenta seleccionar la respuesta correcta ahora.";
                setTimeout(onSolved, 2000);
            } else {
                // Provide next hint if available
                const nextIndex = hintIndex + 1;
                if (nextIndex < hints.length) {
                    aiResponse = hints[nextIndex];
                    setHintIndex(nextIndex);
                } else {
                    // If no more hints, guide strongly
                    aiResponse = "Parece que es difícil. La clave está en que " + (hints[hints.length - 1] || "debes leer con más cuidado") + ". Intenta seleccionar la respuesta nuevamente.";
                    setTimeout(onSolved, 4000); // Auto-solve if stuck
                }
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: aiResponse }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 w-full max-w-md">
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Tutor Socrático</h3>
                    <p className="text-xs text-slate-500">Pizarrón Matemático Activo 📐</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-none prose prose-sm max-w-none'
                            }`}>
                            {msg.role === 'user' ? (
                                msg.text
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-none animate-pulse text-xs text-slate-400">
                            Escribiendo fórmula...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe tu duda..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
