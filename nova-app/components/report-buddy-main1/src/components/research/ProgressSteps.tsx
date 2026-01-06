import React from 'react';
import type { Step } from '../../types/research';
import { cn } from '../../lib/utils';
import { ClipboardPaste, Search, PenLine, CheckCircle } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: Step;
  language: 'es' | 'en';
}

const steps: { id: Step; icon: typeof ClipboardPaste; labelEs: string; labelEn: string }[] = [
  { id: 'paste', icon: ClipboardPaste, labelEs: 'Pegar', labelEn: 'Paste' },
  { id: 'analyze', icon: Search, labelEs: 'Analizar', labelEn: 'Analyze' },
  { id: 'paraphrase', icon: PenLine, labelEs: 'Escribir', labelEn: 'Write' },
  { id: 'review', icon: CheckCircle, labelEs: 'Revisar', labelEn: 'Review' },
];

const stepOrder: Step[] = ['paste', 'analyze', 'paraphrase', 'review'];

export function ProgressSteps({ currentStep, language }: ProgressStepsProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto relative px-4">
      {/* Connecting Line */}
      <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-[18px] -z-10 rounded-full" />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isPending = index > currentIndex;

        // Custom colorful schemes for each step
        const stepColors = {
          paste: isCompleted ? "bg-orange-500 text-white" : isActive ? "bg-orange-500 text-white ring-4 ring-orange-100" : "bg-white text-orange-200 border-2 border-orange-100",
          analyze: isCompleted ? "bg-purple-500 text-white" : isActive ? "bg-purple-500 text-white ring-4 ring-purple-100" : "bg-white text-purple-200 border-2 border-purple-100",
          paraphrase: isCompleted ? "bg-blue-500 text-white" : isActive ? "bg-blue-500 text-white ring-4 ring-blue-100" : "bg-white text-blue-200 border-2 border-blue-100",
          review: isCompleted ? "bg-green-500 text-white" : isActive ? "bg-green-500 text-white ring-4 ring-green-100" : "bg-white text-green-200 border-2 border-green-100",
        };

        const activeTextColor = {
          paste: "text-orange-600",
          analyze: "text-purple-600",
          paraphrase: "text-blue-600",
          review: "text-green-600",
        };

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 relative">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm z-10',
                stepColors[step.id]
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wider transition-colors duration-300',
                isActive ? activeTextColor[step.id] : isCompleted ? "text-slate-500" : "text-slate-300"
              )}
            >
              {language === 'es' ? step.labelEs : step.labelEn}
            </span>
          </div>
        );
      })}
    </div>
  );
}
