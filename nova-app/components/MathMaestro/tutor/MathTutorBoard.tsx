import { useState, useRef } from 'react';
import { useLearning } from '../../../context/LearningContext';
import { Language, GradeLevel, Curriculum } from '../../../types/tutor';
import { Header } from './Header';
import { Whiteboard, WhiteboardRef } from './Whiteboard';
import { TutorPanel, TutorPanelRef } from './TutorPanel';
import { QuestionInput } from './QuestionInput';
import { toast } from 'sonner';

export function MathTutorBoard({ initialGrade = 3, userName, userId }: { initialGrade?: number; userName?: string; userId?: string }) {
  const { language, setLanguage } = useLearning();
  const [grade, setGrade] = useState<GradeLevel>(initialGrade as GradeLevel);
  const [curriculum, setCurriculum] = useState<Curriculum>('ib-pyp');
  const [starterText, setStarterText] = useState('');

  const whiteboardRef = useRef<WhiteboardRef>(null);
  const tutorPanelRef = useRef<TutorPanelRef>(null);

  const handleInsertStarter = (starter: string) => {
    setStarterText(starter);
    toast.success(
      language === 'es'
        ? '¡Texto copiado! Pégalo en tu respuesta.'
        : 'Text copied! Paste it in your answer.'
    );
  };

  const handleSendText = (text: string) => {
    console.log('[MathTutorBoard] handleSendText:', text);

    // 1. Digitize on Board
    if (whiteboardRef.current) {
      console.log('[MathTutorBoard] Calling whiteboardRef.addText');
      whiteboardRef.current.addText(text);
    } else {
      console.error('[MathTutorBoard] whiteboardRef is null');
    }

    // 2. Trigger Voice Analysis (ElevenLabs)
    if (tutorPanelRef.current) {
      console.log('[MathTutorBoard] Calling tutorPanelRef.triggerVoice');
      tutorPanelRef.current.triggerVoice(text); // Pass raw text, parsing and speech handled in TutorPanel
    } else {
      console.error('[MathTutorBoard] tutorPanelRef is null');
    }

    setStarterText('');
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    if (whiteboardRef.current) {
      whiteboardRef.current.drawImage(url);
      // Announce upload so tutor reacts
      if (tutorPanelRef.current) {
        const prompt = language === 'es'
          ? "He subido una imagen del ejercicio. ¿Me ayudas?"
          : "I uploaded an image of the exercise. Can you help?";
        tutorPanelRef.current.triggerVoice(prompt);
      }
    }
  };

  const { addReport } = useLearning();

  const handleSendBoard = () => {
    const imageData = whiteboardRef.current?.getImageData();

    toast.success(
      language === 'es'
        ? '¡Ejercicio subido correctamente!'
        : 'Exercise uploaded successfully!'
    );

    // Simulate analysis report
    addReport({
      id: `mt-${Date.now()}`,
      source: "math-tutor",
      subject: "Math",
      emoji: "🔢",
      date: new Date().toISOString(),
      overallScore: 85,
      trend: "up",
      challenges: [],
      recommendations: ["Great work on the board!"],
      // @ts-ignore - appending evidence image
      evidenceImage: imageData
    } as any);

    // Trigger Tutor Reaction
    if (tutorPanelRef.current) {
      // We simulate the user saying they finished, so the tutor responds
      const prompt = language === 'es'
        ? "He escrito mi respuesta en la pizarra. ¿Cómo voy?"
        : "I wrote my answer on the board. How am I doing?";
      tutorPanelRef.current.triggerVoice(prompt);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        language={language}
        grade={grade}
        curriculum={curriculum}
        onLanguageChange={setLanguage}
        onGradeChange={setGrade}
        onCurriculumChange={setCurriculum}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Whiteboard - Left */}
        <div className="flex-1 flex flex-col min-w-0">
          <Whiteboard
            ref={whiteboardRef}
            language={language}
          />
        </div>

        {/* Tutor Panel - Right */}
        <div className="w-[420px] flex flex-col border-l border-border">
          <TutorPanel
            ref={tutorPanelRef}
            language={language}
            curriculum={curriculum}
            grade={grade}
            userName={userName}
            userId={userId}
            onInsertStarter={handleInsertStarter}
            onWriteToBoard={(text: string) => whiteboardRef.current?.addText(text)}
            whiteboardRef={whiteboardRef}
          />
        </div>
      </main>

      <QuestionInput
        language={language}
        starterText={starterText}
        onSendText={handleSendText}
        onSendBoard={handleSendBoard}
        onInsertStarter={handleInsertStarter}
        onUploadImage={handleImageUpload}
      />
    </div>
  );
}
