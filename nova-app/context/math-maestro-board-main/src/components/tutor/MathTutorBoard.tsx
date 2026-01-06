import { useState } from 'react';
import { Language, GradeLevel, Curriculum } from '@/types/tutor';
import { Header } from './Header';
import { Whiteboard } from './Whiteboard';
import { TutorPanel } from './TutorPanel';
import { QuestionInput } from './QuestionInput';
import { toast } from 'sonner';

export function MathTutorBoard() {
  const [language, setLanguage] = useState<Language>('es');
  const [grade, setGrade] = useState<GradeLevel>(3);
  const [curriculum, setCurriculum] = useState<Curriculum>('ib-pyp');
  const [starterText, setStarterText] = useState('');

  const handleInsertStarter = (starter: string) => {
    setStarterText(starter);
    toast.success(
      language === 'es' 
        ? '¡Texto copiado! Pégalo en tu respuesta.' 
        : 'Text copied! Paste it in your answer.'
    );
  };

  const handleSendText = (text: string) => {
    toast.success(
      language === 'es'
        ? '¡Mensaje enviado a Nova!'
        : 'Message sent to Nova!'
    );
    setStarterText('');
  };

  const handleSendBoard = () => {
    toast.success(
      language === 'es'
        ? '¡Pizarra enviada para análisis!'
        : 'Whiteboard sent for analysis!'
    );
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
          <Whiteboard language={language} />
        </div>

        {/* Tutor Panel - Right */}
        <div className="w-[420px] flex flex-col border-l border-border">
          <TutorPanel 
            language={language}
            curriculum={curriculum}
            grade={grade}
            onInsertStarter={handleInsertStarter}
          />
        </div>
      </main>

      <QuestionInput 
        language={language}
        starterText={starterText}
        onSendText={handleSendText}
        onSendBoard={handleSendBoard}
      />
    </div>
  );
}
