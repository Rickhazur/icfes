import { useState } from 'react';
import { Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { Language, MathProblemType, Curriculum, GradeLevel } from '@/types/tutor';
import { mathHints, tutorMessages, curriculumLabels, gradeLabels } from '@/data/mathHints';
import { HintCard } from './HintCard';

interface TutorPanelProps {
  language: Language;
  curriculum: Curriculum;
  grade: GradeLevel;
  onInsertStarter: (starter: string) => void;
}

export function TutorPanel({ language, curriculum, grade, onInsertStarter }: TutorPanelProps) {
  const [selectedType, setSelectedType] = useState<MathProblemType | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const title = language === 'es' ? 'Tablero de Nova' : "Nova's Board";
  const selectLabel = language === 'es' ? '¿Qué tipo de problema?' : 'What type of problem?';

  const selectedHintSet = mathHints.find(h => h.type === selectedType);

  const handleCompleteStep = (stepId: number) => {
    setCompletedSteps(prev => [...prev, stepId]);
    if (selectedHintSet && stepId < selectedHintSet.steps.length) {
      setActiveStep(stepId + 1);
    }
  };

  const handleSelectType = (type: MathProblemType) => {
    setSelectedType(type);
    setActiveStep(1);
    setCompletedSteps([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <span className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-5 h-5 bg-secondary rounded flex items-center justify-center text-xs text-secondary-foreground">
              📋
            </span>
            {title}
          </span>
        </div>

        {/* Curriculum & Grade Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-accent/20 px-2 py-0.5 rounded-full text-xs">
            <BookOpen className="w-3 h-3 text-accent" />
            <span className="text-accent font-medium">{curriculumLabels[curriculum][language]}</span>
          </div>
          <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full text-xs">
            <GraduationCap className="w-3 h-3 text-primary" />
            <span className="text-primary font-medium">{gradeLabels[language][grade - 1]}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-4 mb-4 tutor-panel p-4 overflow-y-auto">
        {!selectedType ? (
          /* Initial State - Problem Type Selection */
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <p className="text-lg text-secondary font-medium mb-6">
              {tutorMessages.greeting[language]}
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              {selectLabel}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {mathHints.map((hint) => (
                <button
                  key={hint.type}
                  onClick={() => handleSelectType(hint.type)}
                  className={`flex flex-col items-center gap-2 p-4 bg-card rounded-xl border-2 border-border 
                           hover:border-primary hover:shadow-md transition-all duration-200 active:scale-95
                           ${hint.type === 'geometry' ? 'col-span-2 bg-accent/10 border-accent/50' : ''}`}
                >
                  <span className="text-3xl">{hint.icon}</span>
                  <span className="font-semibold text-sm text-foreground">
                    {hint.title[language]}
                  </span>
                  {hint.type === 'geometry' && (
                    <span className="text-xs text-accent">
                      {language === 'es' ? '¡Nuevo!' : 'New!'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Hint Steps */
          <div className="space-y-3">
            {/* Back Button & Title */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedType(null)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                ←
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedHintSet?.icon}</span>
                <h3 className="font-bold text-lg text-foreground">
                  {selectedHintSet?.title[language]}
                </h3>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1 mb-4">
              {selectedHintSet?.steps.map((step) => (
                <div
                  key={step.id}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    completedSteps.includes(step.id)
                      ? 'bg-accent'
                      : step.id === activeStep
                        ? 'bg-primary animate-pulse'
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Hint Cards */}
            {selectedHintSet?.steps.map((step) => (
              <HintCard
                key={step.id}
                step={step}
                language={language}
                isActive={step.id === activeStep}
                isCompleted={completedSteps.includes(step.id)}
                onComplete={() => handleCompleteStep(step.id)}
                onInsertStarter={onInsertStarter}
              />
            ))}

            {/* Completion Message */}
            {completedSteps.length === selectedHintSet?.steps.length && (
              <div className="text-center py-6 animate-slide-up">
                <span className="text-4xl mb-2 block">🎉</span>
                <p className="font-bold text-accent text-lg">
                  {language === 'es' ? '¡Excelente trabajo!' : 'Great job!'}
                </p>
                <button
                  onClick={() => setSelectedType(null)}
                  className="mt-3 text-secondary underline text-sm"
                >
                  {language === 'es' ? 'Resolver otro problema' : 'Solve another problem'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
