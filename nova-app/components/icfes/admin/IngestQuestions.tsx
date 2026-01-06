import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Save, Database, ArrowRight } from 'lucide-react';
import { supabase } from '@/services/supabase'; // We'll need to export the client if not already
import { IcfesQuestion } from '../services/IcfesQuestionBank';

// Mock function to simulate AI extraction (replace with real Gemini call later)
const mockExtractFromText = async (rawText: string): Promise<IcfesQuestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Fake API delay

    // This is where the LLM would run. For now, we return a sample if text is present.
    if (rawText.length < 50) return [];

    return [
        {
            id: crypto.randomUUID(),
            category: 'MATEMATICAS',
            text: "Pregunta extraída del texto: " + rawText.substring(0, 50) + "...",
            options: [
                { id: 'A', text: "Opción A generada" },
                { id: 'B', text: "Opción B generada" },
                { id: 'C', text: "Opción C generada" },
                { id: 'D', text: "Opción D generada" }
            ],
            correctId: 'B',
            explanation: "Explicación generada por IA basada en el contexto.",
            socraticHints: ["Pista 1 generada", "Pista 2 generada"]
        }
    ];
};

export const IngestQuestions: React.FC = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [rawText, setRawText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedQuestions, setExtractedQuestions] = useState<IcfesQuestion[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleProcess = async () => {
        setIsProcessing(true);
        try {
            const results = await mockExtractFromText(rawText);
            setExtractedQuestions(results);
            setStep(2);
        } catch (error) {
            alert("Error processing text");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveToDB = async () => {
        setIsSaving(true);
        try {
            // Loop through and insert (in real app, use bulk insert)
            for (const q of extractedQuestions) {
                const { error } = await supabase
                    .from('icfes_questions')
                    .insert({
                        category: q.category,
                        question_text: q.text,
                        options: q.options,
                        correct_answer: q.correctId,
                        explanation: q.explanation,
                        socratic_hints: q.socraticHints,
                        source_document: 'Manual Paste'
                    });

                if (error) throw error;
            }
            setStep(3);
        } catch (error) {
            console.error('Error saving:', error);
            alert("Error saving to database. Check console.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Database className="w-8 h-8 text-blue-600" />
                    Nova Ingestor <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">BETA</span>
                </h1>
                <p className="text-slate-500 mt-2">Convierte texto crudo de PDFs en preguntas estructuradas usando IA.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8 text-sm font-medium text-slate-400">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : ''}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>1</span>
                    Input
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : ''}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>2</span>
                    Review
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : ''}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>3</span>
                    Save
                </div>
            </div>

            {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pegar Texto del Cuadernillo</label>
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Copia y pega aquí el texto de una pregunta o una página entera del PDF..."
                    />
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleProcess}
                            disabled={!rawText.trim() || isProcessing}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isProcessing ? 'Procesando con IA...' : 'Analizar Texto'} <FileText className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800 font-medium">Se encontraron {extractedQuestions.length} preguntas posibles.</span>
                    </div>

                    <div className="space-y-4">
                        {extractedQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">{q.category}</span>
                                        </div>
                                        <h3 className="font-medium text-slate-900 mb-4">{q.text}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                            {q.options.map(opt => (
                                                <div key={opt.id} className={`p-2 rounded border text-sm ${opt.id === q.correctId ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                    <span className="font-bold">{opt.id}.</span> {opt.text}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded text-sm text-slate-600">
                                            <strong className="text-slate-800">Hints Socráticos:</strong>
                                            <ul className="list-disc pl-5 mt-1">
                                                {q.socraticHints.map((hint, hIdx) => (
                                                    <li key={hIdx}>{hint}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between mt-8 sticky bottom-8 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg">
                        <button onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-slate-800">
                            Atrás
                        </button>
                        <button
                            onClick={handleSaveToDB}
                            disabled={isSaving}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar en Base de Datos'} <Save className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Ingesta Completada!</h2>
                    <p className="text-slate-500 mb-8">Las preguntas han sido guardadas exitosamente en Supabase y ya están disponibles en el Simulador.</p>
                    <button
                        onClick={() => { setStep(1); setRawText(''); setExtractedQuestions([]); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                    >
                        Ingestar Más Preguntas
                    </button>
                </div>
            )}
        </div>
    );
};
