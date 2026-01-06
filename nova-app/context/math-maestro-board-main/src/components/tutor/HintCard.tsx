import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HintStep, Language } from '@/types/tutor';
import { VisualHint } from './VisualHint';

interface HintCardProps {
  step: HintStep;
  language: Language;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  onInsertStarter: (starter: string) => void;
}

export function HintCard({ 
  step, 
  language, 
  isActive, 
  isCompleted,
  onComplete,
  onInsertStarter 
}: HintCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyStarter = () => {
    if (step.starter) {
      const text = step.starter[language];
      navigator.clipboard.writeText(text);
      onInsertStarter(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const insertLabel = language === 'es' ? 'Insertar' : 'Insert';
  const copiedLabel = language === 'es' ? '¡Copiado!' : 'Copied!';

  return (
    <div 
      className={`card-hint transition-all duration-300 ${
        isActive ? 'card-hint-active scale-[1.02]' : ''
      } ${isCompleted ? 'opacity-60' : ''}`}
      style={{ animationDelay: `${step.id * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Step Number */}
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
            isCompleted 
              ? 'bg-accent text-accent-foreground' 
              : isActive 
                ? 'bg-primary text-primary-foreground animate-pulse-glow' 
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : step.id}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-bold text-foreground mb-1">
            {step.title[language]}
          </h4>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3">
            {step.description[language]}
          </p>

          {/* Visual Aid */}
          {isActive && <VisualHint step={step} language={language} />}

          {/* Starter Button */}
          {step.starter && isActive && (
            <Button
              variant="starter"
              size="sm"
              onClick={handleCopyStarter}
              className="mt-3 w-full justify-start gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {copiedLabel}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  "{step.starter[language]}"
                </>
              )}
            </Button>
          )}
        </div>

        {/* Complete Button */}
        {isActive && !isCompleted && (
          <Button
            variant="accent"
            size="iconSm"
            onClick={onComplete}
            className="shrink-0"
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
