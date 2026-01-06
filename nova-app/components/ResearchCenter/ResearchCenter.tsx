import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useResearchState } from '@/hooks/useResearchState';
import { useLearning } from '@/context/LearningContext';
import { useGamification } from '@/context/GamificationContext';
import { GradeSelector } from './GradeSelector';
import { LanguageToggle } from './LanguageToggle';
import { SaveStatusIndicator } from './SaveStatus';
import { ProgressSteps } from './ProgressSteps';
import { TutorPanel } from './TutorPanel';
import { TextPasteArea } from './TextPasteArea';
import { ReportEditor } from './ReportEditor';
import { ReportCompleteness } from './ReportCompleteness';
import { ReportReview } from './ReportReview';
import { CitationHelper } from './CitationHelper';
import { WritingFeedbackPopup, generateWritingFeedback, type WritingFeedback } from './WritingFeedbackPopup';
import { BookOpen, Sparkles, Search, Loader2 } from 'lucide-react';
import { streamConsultation } from '@/services/openai';
import { toast } from '@/hooks/use-toast';
import { LinaAvatar } from '../MathMaestro/tutor/LinaAvatar';
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';
import type { SourceInfo } from '@/types/research';

export function ResearchCenter() {
  const {
    state,
    setSourceText,
    setParaphrasedText,
    analyzeSourceText,
    setGrade,
    setLanguage,
    saveNow,
    addSource,
    removeSource,
  } = useResearchState();

  const { addReport, language: globalLanguage, setLanguage: setGlobalLanguage } = useLearning();
  const { coins, addCoins, addXP } = useGamification();

  // Sync global language changes to local state
  useEffect(() => {
    if (globalLanguage) {
      // Map bilingual to 'es' for internal ResearchCenter logic which only supports es/en
      const effectiveLang = globalLanguage === 'bilingual' ? 'es' : globalLanguage;
      if (effectiveLang !== state.language) {
        setLanguage(effectiveLang);
      }
    }
  }, [globalLanguage, state.language, setLanguage]);

  const [currentFeedback, setCurrentFeedback] = useState<WritingFeedback | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const lastFeedbackId = useRef<string>('');
  const feedbackCooldown = useRef<boolean>(false);

  // Generate writing feedback as user types
  useEffect(() => {
    if (feedbackCooldown.current) return;

    const feedback = generateWritingFeedback(
      state.paraphrasedText,
      state.grade,
      state.language,
      state.sourceText
    );

    if (feedback && feedback.id !== lastFeedbackId.current) {
      lastFeedbackId.current = feedback.id;
      setCurrentFeedback(feedback);
      feedbackCooldown.current = true;

      // Cooldown to prevent feedback spam
      setTimeout(() => {
        feedbackCooldown.current = false;
      }, 5000);
    }
  }, [state.paraphrasedText, state.grade, state.language, state.sourceText]);

  // Send report to BuddyLearn when analysis updates
  useEffect(() => {
    if (state.analysis) {
      addReport({
        id: `rc-${Date.now()}`,
        source: "research-center",
        subject: "Social Studies", // Could be dynamic
        emoji: "🌍",
        date: new Date().toISOString(),
        overallScore: 75, // Simplified
        trend: "stable",
        challenges: [
          {
            id: `c-${Date.now()}`,
            area: "Paraphrasing",
            severity: "medium",
            description: "Improving paraphrasing skills",
            englishConnection: "Writing",
          }
        ],
        recommendations: ["Practice more reading"]
      });
    }
  }, [state.analysis]);

  const handleDismissFeedback = useCallback(() => {
    setCurrentFeedback(null);
  }, []);

  const handleStarterClick = (starter: string) => {
    // Insert starter text into the report
    const currentText = state.paraphrasedText;
    const newText = currentText
      ? `${currentText}\n\n${starter} `
      : `${starter} `;
    setParaphrasedText(newText);

    // Also trigger the global insert function if available
    if ((window as any).__insertReportText) {
      (window as any).__insertReportText(starter + ' ');
    }
  };

  const handleInsertCitation = (citation: string) => {
    const currentText = state.paraphrasedText;
    const newText = currentText ? `${currentText} ${citation}` : citation;
    setParaphrasedText(newText);

    if ((window as any).__insertReportText) {
      (window as any).__insertReportText(citation);
    }
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isResearching) return;

    setIsResearching(true);
    setSourceText(''); // Clear previous source
    let fullText = '';

    try {
      const prompt = `Actúa como un Bibliotecario Experto para niños de ${state.grade} grado. 
      Investiga sobre: "${searchQuery}". 
      Proporciona un texto fuente informativo, veraz y fácil de entender de unas 300 palabras. 
      Al final, incluye una pequeña cita bibliográfica sugerida. 
      Idioma: ${state.language === 'es' ? 'Español' : 'Inglés'}.`;

      const stream = streamConsultation([], prompt, undefined, true);

      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setSourceText(fullText);
        }
      }

      addCoins(20, state.language === 'es' ? 'Investigación IA completada' : 'AI Research completed');
      addXP(40);
      sfx.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      toast({
        title: state.language === 'es' ? '¡Investigación lista!' : 'Research ready!',
        description: state.language === 'es'
          ? 'He encontrado información para tu reporte.'
          : 'I found information for your report.',
      });
      setSearchQuery('');
    } catch (error) {
      console.error("Research Error:", error);
      toast({
        title: "Error",
        description: "No pude completar la investigación. Intenta pegar el texto manualmente.",
        variant: "destructive"
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleSubmitReport = () => {
    saveNow();
    addCoins(50, state.language === 'es' ? 'Reporte completado' : 'Report completed');
    addXP(100);
    sfx.playSuccess();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
    toast({
      title: state.language === 'es' ? '¡Reporte enviado!' : 'Report submitted!',
      description: state.language === 'es'
        ? 'Tu reporte ha sido guardado. ¡Buen trabajo!'
        : 'Your report has been saved. Great job!',
    });
  };

  return (
    <div className="min-h-screen bg-yellow-50 font-poppins relative overflow-hidden selection:bg-kid-yellow selection:text-black">

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-kid-pink/20 rounded-full blur-2xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-kid-blue/20 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-kid-green/20 rounded-full blur-3xl" />
      </div>

      {/* Writing Feedback Popup */}
      <WritingFeedbackPopup
        feedback={currentFeedback}
        onDismiss={handleDismissFeedback}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-4 border-black/5 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-dashed border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-kid-orange flex items-center justify-center border-2 border-black shadow-comic transform rotate-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-fredoka text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
                  {state.language === 'es' ? 'Centro de Investigación' : 'Research Center'}
                  <Sparkles className="w-5 h-5 text-kid-yellow animate-bounce" />
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {state.language === 'es'
                    ? '📚 Historia • 🌍 Geografía • 🔬 Ciencias'
                    : '📚 History • 🌍 Geography • 🔬 Sciences'
                  }
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap bg-white p-2 rounded-2xl border-2 border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-kid-yellow/20 rounded-xl border-2 border-kid-yellow/50">
                <span className="text-xl">🪙</span>
                <span className="font-black text-slate-800">{coins}</span>
              </div>
              <div className="w-px h-8 bg-stone-200"></div>
              <GradeSelector
                grade={state.grade}
                onChange={setGrade}
                language={state.language}
              />
              <div className="w-px h-8 bg-stone-200"></div>
              <LanguageToggle
                language={state.language}
                onChange={(lang) => {
                  setLanguage(lang);
                  setGlobalLanguage(lang);
                }}
              />
              <div className="w-px h-8 bg-stone-200"></div>
              <SaveStatusIndicator
                status={state.saveStatus}
                language={state.language}
                onSave={saveNow}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 max-w-3xl mx-auto">
            <ProgressSteps
              currentStep={state.currentStep}
              language={state.language}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Source Text & Editor */}
          <div className="space-y-6">
            {/* NEW: Smart Search Area */}
            <div className="bg-white rounded-[2rem] p-6 border-2 border-dashed border-indigo-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <h3 className="font-fredoka text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                {state.language === 'es' ? '¿Sobre qué quieres investigar?' : 'What do you want to research?'}
              </h3>
              <form onSubmit={handleSmartSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={state.language === 'es' ? 'Ej: El Imperio Romano, Los Volcanes...' : 'Ex: The Roman Empire, Volcanoes...'}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-100 focus:border-indigo-400 focus:outline-none text-sm font-medium"
                  disabled={isResearching}
                />
                <button
                  type="submit"
                  disabled={isResearching || !searchQuery.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isResearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {state.language === 'es' ? 'Investigar' : 'Research'}
                </button>
              </form>
              <p className="mt-3 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                🚀 {state.language === 'es' ? 'Nova buscará información segura para ti' : 'Nova will find safe info for you'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-1 border-2 border-stone-100 shadow-lg">
              <TextPasteArea
                value={state.sourceText}
                onChange={setSourceText}
                onAnalyze={analyzeSourceText}
                language={state.language}
                disabled={state.isAnalyzing}
              />
            </div>

            {state.analysis && (
              <div className="bg-white rounded-3xl p-1 border-2 border-kid-blue shadow-comic-lg transform transition-all">
                <ReportEditor
                  value={state.paraphrasedText}
                  onChange={setParaphrasedText}
                  language={state.language}
                  analysis={state.analysis}
                  disabled={state.isAnalyzing}
                  grade={state.grade}
                />
              </div>
            )}
          </div>

          {/* Right Column - Tutor & Progress */}
          <div className="lg:sticky lg:top-40 lg:self-start space-y-6">
            {/* Tutor Avatar */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border-2 border-black shadow-comic-blue transform hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-kid-blue/10 rounded-bl-full"></div>
              <div className="relative -mt-2">
                <LinaAvatar
                  state={state.isAnalyzing || isResearching ? 'thinking' : 'idle'}
                  size={80}
                />
              </div>
              <div className="relative z-10">
                <h2 className="font-fredoka text-xl font-black text-slate-800">
                  {state.language === 'es' ? 'Tu Tutor Nova' : 'Your Nova Tutor'}
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  {state.language === 'es'
                    ? '¡Estoy aquí para ayudarte a escribir!'
                    : 'I\'m here to help you write!'
                  }
                </p>
                <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold border-2 border-black ${state.grade <= 2 ? 'bg-kid-pink text-white' : 'bg-kid-green text-white'
                  }`}>
                  <Sparkles className="w-3 h-3" />
                  {state.language === 'es' ? `${state.grade}º Grado` : `Grade ${state.grade}`}
                </div>
              </div>
            </div>

            {/* Tutor Messages */}
            <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-sm overflow-hidden">
              <TutorPanel
                messages={state.tutorMessages}
                isAnalyzing={state.isAnalyzing}
                language={state.language}
                onStarterClick={handleStarterClick}
              />
            </div>

            {/* Citation Helper */}
            {state.analysis && (
              <div className="bg-indigo-50 rounded-3xl border-2 border-indigo-200 p-4">
                <CitationHelper
                  grade={state.grade}
                  language={state.language}
                  sources={state.sources}
                  onAddSource={addSource}
                  onRemoveSource={removeSource}
                  onInsertCitation={handleInsertCitation}
                />
              </div>
            )}

            {/* Report Completeness Checklist */}
            {state.analysis && (
              <div className="bg-white rounded-3xl border-2 border-stone-200 p-4 shadow-sm">
                <ReportCompleteness
                  paraphrasedText={state.paraphrasedText}
                  analysis={state.analysis}
                  grade={state.grade}
                  language={state.language}
                />
              </div>
            )}

            {/* Report Review */}
            {state.analysis && (
              <ReportReview
                paraphrasedText={state.paraphrasedText}
                sourceText={state.sourceText}
                analysis={state.analysis}
                grade={state.grade}
                language={state.language}
                onRequestFeedback={handleSubmitReport}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-sm font-bold text-stone-400 bg-white border-t-4 border-black/5">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-kid-yellow" />
          {state.language === 'es'
            ? '¡Recuerda usar siempre tus propias palabras!'
            : 'Remember to always use your own words!'
          }
          <Sparkles className="w-4 h-4 text-kid-yellow" />
        </p>
      </footer>
    </div>
  );
}
