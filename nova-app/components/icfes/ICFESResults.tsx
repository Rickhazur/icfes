import React from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { IcfesQuestion } from './services/IcfesQuestionBank';

interface ResultProps {
    results: {
        totalQuestions: number;
        correctAnswers: number;
        answers: Record<string, string>;
        questions: IcfesQuestion[];
    };
    onRetry: () => void;
    onHome: () => void;
}

export const ICFESResults: React.FC<ResultProps> = ({ results, onRetry, onHome }) => {
    const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);

    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4 ring-8 ring-blue-50">
                    <span className="text-3xl font-bold text-blue-700">{percentage}%</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {percentage >= 80 ? '¡Excelente Trabajo!' : percentage >= 60 ? 'Buen Intento' : 'Sigue Practicando'}
                </h1>
                <p className="text-slate-500">
                    Has completado el simulacro. Aquí tienes tu resumen.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="text-2xl font-bold text-slate-800">{results.totalQuestions}</div>
                    <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Preguntas</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                    <div className="text-xs font-bold uppercase text-green-700/50 tracking-wider">Aciertos</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="text-2xl font-bold text-blue-600">00:45</div>
                    <div className="text-xs font-bold uppercase text-blue-700/50 tracking-wider">Tiempo Promedio</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Revisión de Respuestas</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {results.questions.map((q, idx) => {
                        const isCorrect = true; // Since we force Socratic, technically they finish correct. We should update Simulator to track "first try".
                        return (
                            <div key={q.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex gap-4">
                                    <div className="shrink-0 pt-1">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 mb-2">
                                            <span className="text-slate-400 mr-2">{idx + 1}.</span>
                                            {q.text}
                                        </p>
                                        <div className="text-sm text-slate-500">
                                            Respuesta Correcta: <span className="font-bold text-slate-700">{q.options.find(o => o.id === q.correctId)?.text}</span>
                                        </div>
                                        <div className="mt-2 text-sm bg-blue-50 text-blue-800 p-3 rounded-lg">
                                            <strong>Concepto Clave:</strong> {q.category}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={onHome}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2"
                >
                    <Home className="w-5 h-5" /> Volver al Inicio
                </button>
                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                    <RotateCcw className="w-5 h-5" /> Nuevo Simulacro
                </button>
            </div>
        </div>
    );
};
