
import React, { useState } from 'react';
import type { Exam, Question, Option } from '../types';
import { DownloadIcon, RefreshCwIcon, EyeIcon, EyeOffIcon } from './icons';

interface ExamViewProps {
    exams: Exam[];
    examNumber: number;
    onRegenerate: () => void;
}

const ExamView: React.FC<ExamViewProps> = ({ exams, examNumber, onRegenerate }) => {
    const [showAnswers, setShowAnswers] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, Record<number, string>>>({});

    const handleSelectAnswer = (subject: string, questionIndex: number, optionLetter: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [subject]: {
                ...prev[subject],
                [questionIndex]: optionLetter,
            }
        }));
    };

    const getOptionClasses = (question: Question, option: Option, subject: string, questionIndex: number) => {
        const baseClasses = "flex items-start w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer";
        const selectedOption = selectedAnswers[subject]?.[questionIndex];

        if (showAnswers) {
            if (option.letra === question.respuesta_correcta) {
                return `${baseClasses} bg-green-100 dark:bg-green-900 border-green-500 ring-2 ring-green-400`;
            }
            if (option.letra === selectedOption) {
                return `${baseClasses} bg-red-100 dark:bg-red-900 border-red-500`;
            }
            return `${baseClasses} bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600`;
        }

        if (option.letra === selectedOption) {
            return `${baseClasses} bg-blue-100 dark:bg-blue-900 border-blue-500 ring-2 ring-blue-400`;
        }

        return `${baseClasses} bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600`;
    };

    const downloadExamAsText = () => {
        let content = `Examen de Práctica Estilo ICFES Saber 11 - Simulacro #${examNumber}\n\n`;
        content += "========================================\n\n";
        let answerKey = "Respuestas Correctas\n\n";

        exams.forEach(exam => {
            content += `ÁREA: ${exam.subjectName.toUpperCase()}\n`;
            content += "----------------------------------------\n\n";
            answerKey += `${exam.subjectName.toUpperCase()}:\n`;

            exam.questions.forEach((q, i) => {
                const questionNumber = i + 1;
                content += `Pregunta ${questionNumber}:\n`;
                if (q.texto_contexto && q.texto_contexto.trim() !== "") {
                    content += `Contexto: ${q.texto_contexto}\n\n`;
                }
                content += `${q.enunciado}\n`;
                q.opciones.forEach(opt => {
                    content += `  ${opt.letra}) ${opt.texto}\n`;
                });
                content += "\n";
                answerKey += `  ${questionNumber}. ${q.respuesta_correcta.toUpperCase()}\n`;
            });
            content += "========================================\n\n";
            answerKey += "\n";
        });

        content += answerKey;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `examen_icfes_simulacro_${examNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Simulacro de Examen #{examNumber}</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onRegenerate}
                        className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <RefreshCwIcon className="w-4 h-4" />
                        <span>Generar Nuevos</span>
                    </button>
                    <button
                        onClick={downloadExamAsText}
                        className="flex items-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Descargar Examen #{examNumber}</span>
                    </button>
                    <button
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="flex items-center space-x-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {showAnswers ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        <span>{showAnswers ? 'Ocultar' : 'Mostrar'} Respuestas</span>
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                {exams.map((exam) => (
                    <section key={exam.subject}>
                        <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 pb-2">{exam.subjectName}</h3>
                        <div className="space-y-8">
                            {exam.questions.map((question, qIndex) => (
                                <div key={qIndex} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Pregunta {qIndex + 1}</p>
                                    {question.texto_contexto && question.texto_contexto.trim() !== "" && (
                                        <div className="mb-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-md text-sm italic text-gray-700 dark:text-gray-300" style={{ whiteSpace: 'pre-wrap' }}>
                                            {question.texto_contexto}
                                        </div>
                                    )}
                                    <p className="text-gray-800 dark:text-gray-200 mb-4">{question.enunciado}</p>
                                    <div className="space-y-3">
                                        {question.opciones.map((option) => (
                                            <button
                                                key={option.letra}
                                                onClick={() => handleSelectAnswer(exam.subject, qIndex, option.letra)}
                                                disabled={showAnswers}
                                                className={getOptionClasses(question, option, exam.subject, qIndex)}
                                            >
                                                <span className="font-bold mr-3">{option.letra.toUpperCase()}.</span>
                                                <span>{option.texto}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {showAnswers && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in fade-in">
                                            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-3">
                                                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">💡 Explicación Correcta:</h4>
                                                <p className="text-sm text-blue-900 dark:text-blue-100">{question.explicacion}</p>
                                            </div>

                                            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                                                <h4 className="font-bold text-purple-800 dark:text-purple-300 text-sm mb-2">🤖 Pistas Socráticas (Lo que vería el estudiante):</h4>
                                                <ul className="space-y-2">
                                                    {question.pistas_socraticas?.map((hint, hIdx) => (
                                                        <li key={hIdx} className="text-sm text-purple-900 dark:text-purple-100 flex items-start gap-2">
                                                            <span className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs font-bold px-1.5 rounded-full shrink-0 mt-0.5">{hIdx + 1}</span>
                                                            {hint}
                                                        </li>
                                                    )) || <li className="text-sm italic text-gray-500">Sin pistas generadas...</li>}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default ExamView;
