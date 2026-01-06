
import React, { useState, useCallback } from 'react';
import { generateIcfesExam } from './services/geminiService';
import type { Exam } from './types';
import { SUBJECTS } from './constants';
import LoadingIndicator from './components/LoadingIndicator';
import ExamView from './components/ExamView';
import { BrainCircuitIcon, DownloadIcon } from './components/icons';

const App: React.FC = () => {
    const [exams, setExams] = useState<Exam[][]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [activeExamIndex, setActiveExamIndex] = useState<number>(0);

    const handleGenerateExams = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setExams([]);
        const totalExams = 4;

        try {
            const allGeneratedExams: Exam[][] = [];
            for (let i = 0; i < totalExams; i++) {
                setLoadingMessage(`Generando Examen ${i + 1} de ${totalExams}...`);
                const examPromises = SUBJECTS.map(subject =>
                    generateIcfesExam(subject.id, subject.name, subject.questionCount)
                );
                const singleExamSet = await Promise.all(examPromises);
                allGeneratedExams.push(singleExamSet);
            }
            setExams(allGeneratedExams);
        } catch (err) {
            console.error(err);
            setError('Hubo un error al generar los exámenes. Por favor, revisa tu clave de API e inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const downloadAllExamsAsText = () => {
        let fullContent = "";
        exams.forEach((examSet, index) => {
            fullContent += `****************************************\n`;
            fullContent += `         EXAMEN DE PRÁCTICA #${index + 1}         \n`;
            fullContent += `****************************************\n\n`;

            let content = "";
            let answerKey = `Respuestas Correctas (Examen #${index + 1})\n\n`;

            examSet.forEach(exam => {
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
            fullContent += content + answerKey + "\n\n";
        });

        const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'examenes_completos_icfes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSaveToSupabase = async () => {
        if (exams.length === 0) return;

        const confirmSave = window.confirm(`¿Estás seguro de guardar estas preguntas en la base de datos de producción? Esto afectará a los estudiantes.`);
        if (!confirmSave) return;

        setIsLoading(true);
        setLoadingMessage('Guardando en Base de Datos Nova Schola...');

        try {
            let count = 0;
            // Import dynamically to avoid top-level issues if not needed immediately
            const { saveQuestionToBank } = await import('./services/supabase');

            for (const examSet of exams) {
                for (const exam of examSet) {
                    for (const q of exam.questions) {
                        try {
                            await saveQuestionToBank({
                                category: exam.subjectName.toUpperCase().replace(/\s+/g, '_'),
                                question_text: (q.texto_contexto ? `CONTEXTO: ${q.texto_contexto}\n\n` : '') + q.enunciado,
                                options: JSON.stringify(q.opciones.map(o => ({ id: o.letra, text: o.texto }))),
                                correct_answer: q.respuesta_correcta,
                                explanation: q.explicacion,
                                socratic_hints: q.pistas_socraticas,
                                competency: q.competencia,
                                technique_tip: q.tip_estrategico,
                                difficulty: 'medium', // Default
                                source_document: 'Nova Factory Generate'
                            });
                            count++;
                            setLoadingMessage(`Guardadas ${count} preguntas...`);
                        } catch (err) {
                            console.error("Failed to save specific question", err);
                            // Continue saving others
                        }
                    }
                }
            }
            alert(`¡Éxito! Se guardaron ${count} preguntas nuevas en la base de datos.`);
        } catch (err) {
            console.error(err);
            setError('Error crítico guardando en la base de datos.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <BrainCircuitIcon className="h-8 w-8 text-blue-500" />
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Generador de Exámenes ICFES
                        </h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 text-center">
                    <h2 className="text-xl md:text-2xl font-semibold mb-2">Genera 4 Simulacros Completos</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                        Crea un set de 4 exámenes de práctica completos, con un número de preguntas más realista y textos complejos para simular fielmente el ICFES Saber 11.
                    </p>
                    <button
                        onClick={handleGenerateExams}
                        disabled={isLoading}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 ease-in-out disabled:bg-blue-400 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                    >
                        {isLoading ? 'Procesando...' : 'Generar 4 Exámenes'}
                    </button>
                </div>

                {isLoading && <LoadingIndicator message={loadingMessage} />}

                {error && (
                    <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && exams.length > 0 && (
                    <div className="mt-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {exams.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveExamIndex(index)}
                                        className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${activeExamIndex === index
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        Examen {index + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveToSupabase}
                                    className="mt-4 sm:mt-0 flex items-center space-x-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                                >
                                    <DownloadIcon className="w-4 h-4" /> {/* Reuse icon for now */}
                                    <span>Guardar en Base de Datos</span>
                                </button>
                                <button
                                    onClick={downloadAllExamsAsText}
                                    className="mt-4 sm:mt-0 flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    <span>Descargar TXT</span>
                                </button>
                            </div>
                        </div>
                        <ExamView
                            key={activeExamIndex}
                            exams={exams[activeExamIndex]}
                            examNumber={activeExamIndex + 1}
                            onRegenerate={handleGenerateExams}
                        />
                    </div>
                )}
            </main>

            <footer className="text-center py-4 mt-8 text-gray-500 dark:text-gray-400 text-sm">
                <p>Desarrollado con IA de Gemini. Diseñado para la preparación académica.</p>
            </footer>
        </div>
    );
};

export default App;
