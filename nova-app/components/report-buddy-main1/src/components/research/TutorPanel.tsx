import React from 'react';
import type { TutorMessage, Language, Grade } from '../../types/research';
import { cn } from '../../lib/utils';
import { Lightbulb, AlertTriangle, Sparkles, Brain } from 'lucide-react';
import tutorAvatar from '../../assets/tutor-avatar.png';

interface TutorPanelProps {
  messages: TutorMessage[];
  isAnalyzing: boolean;
  language: Language;
  onStarterClick: (starter: string) => void;
  grade: Grade;
}

const typeIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  encouragement: Sparkles,
  analysis: Brain,
};

const gradeColors: Record<Grade, string> = {
  1: 'bg-blue-100 text-blue-800 border-blue-300',
  2: 'bg-green-100 text-green-800 border-green-300',
  3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  4: 'bg-orange-100 text-orange-800 border-orange-300',
  5: 'bg-purple-100 text-purple-800 border-purple-300',
};

const highlightColors: Record<Grade, string> = {
  1: 'bg-blue-200 text-blue-900',
  2: 'bg-green-200 text-green-900',
  3: 'bg-yellow-200 text-yellow-900',
  4: 'bg-orange-200 text-orange-900',
  5: 'bg-purple-200 text-purple-900',
};

const formatMessage = (text: string, grade: Grade) => {
  // Simple heuristic: highlight words inside *asterisks* or just specific key phrases if needed.
  // For now, let's assume we highlight text between ** ** like markdown bold, but apply specific colors.
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className={cn("px-1 rounded mx-0.5 font-extrabold", highlightColors[grade])}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
};

export function TutorPanel({ messages, isAnalyzing, language, onStarterClick, grade }: TutorPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="glass-panel p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden animate-pulse-soft">
            <img src={tutorAvatar} alt="Nova Tutor" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-fredoka text-lg font-semibold text-foreground mb-1">
              {language === 'es' ? 'Analizando...' : 'Analyzing...'}
            </h3>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="glass-panel p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden">
            <img src={tutorAvatar} alt="Nova Tutor" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-fredoka text-lg font-semibold text-foreground mb-1">
              {language === 'es' ? '¡Hola! Soy tu tutor' : 'Hello! I\'m your tutor'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'es'
                ? 'Pega un texto sobre Historia, Geografía, Ciencias u otra asignatura y te ayudaré a escribir tu reporte.'
                : 'Paste text about History, Geography, Sciences or another subject and I\'ll help you write your report.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const Icon = typeIcons[message.type];
        const isWarning = message.type === 'warning';
        // Use grade color for the generic background, but specific warning color if it's a warning
        const cardStyle = isWarning
          ? 'bg-red-50 border-l-red-500 text-red-900'
          : gradeColors[grade];

        return (
          <div
            key={message.id}
            className={cn(
              'rounded-2xl p-5 border-l-4 animate-bubble-in shadow-sm',
              cardStyle
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/50 rounded-full">
                <Icon className={cn('w-6 h-6', isWarning ? 'text-red-500' : 'text-current opacity-80')} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm uppercase tracking-wide opacity-70">
                    {isWarning
                      ? (language === 'es' ? 'Alerta' : 'Alert')
                      : (language === 'es' ? 'Consejo' : 'Tip')
                    }
                  </span>
                </div>
                <div className={cn(
                  'text-sm leading-relaxed mb-4 font-medium',
                )}>
                  {formatMessage(message.message, grade)}
                </div>

                {message.starters && message.starters.length > 0 && (
                  <div className="space-y-2 mt-4 pt-3 border-t border-black/5">
                    <p className="text-xs font-bold opacity-70 uppercase tracking-wide">
                      {language === 'es' ? 'Puedes empezar así:' : 'Start with:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.starters.map((starter, i) => (
                        <button
                          key={i}
                          onClick={() => onStarterClick(starter)}
                          className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-xs font-bold shadow-sm hover:shadow transition-all text-current"
                          style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                        >
                          <span>✨ </span>
                          <span>{starter}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
