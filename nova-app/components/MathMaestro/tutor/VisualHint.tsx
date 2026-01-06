import { HintStep, Language, MathProblemType } from '../../../types/tutor';

interface VisualHintProps {
  step: HintStep;
  language: Language;
  problemType?: MathProblemType;
}

export function VisualHint({ step, language, problemType }: VisualHintProps) {
  const renderVisual = () => {
    switch (step.visualType) {
      case 'fractionBar':
        // If specific starter text exists, show it. Otherwise generic.
        if (step.starter) {
          return (
            <div className="flex items-center justify-center my-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-2xl font-bold text-secondary font-mono">{step.starter[language]}</span>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-2 my-3">
            <div className="flex flex-col items-center">
              <div className="flex">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-6 border-2 border-secondary ${i <= 2 ? 'bg-primary' : 'bg-muted'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold mt-1">?</span>
            </div>
            <span className="text-2xl font-bold text-secondary">=</span>
            <div className="flex flex-col items-center">
              <div className="flex">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-12 h-6 border-2 border-secondary ${i === 1 ? 'bg-primary' : 'bg-muted'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold mt-1">?</span>
            </div>
          </div>
        );

      case 'numberLine':
        return (
          <div className="flex flex-col items-center my-3">
            <div className="relative w-full h-8">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary rounded-full" />
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-secondary rounded-full"
                  style={{ left: `${n * 20}%` }}
                >
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium">
                    {n}
                  </span>
                </div>
              ))}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full animate-bounce-subtle shadow-glow-orange"
                style={{ left: '40%' }}
              />
            </div>
          </div>
        );

      case 'blocks':
        let operator = '+';
        if (problemType === 'subtraction') operator = '-';
        if (problemType === 'multiplication') operator = '×';
        if (problemType === 'division') operator = '÷';

        return (
          <div className="flex items-center justify-center gap-4 my-3">
            <div className={`grid ${problemType === 'division' ? 'grid-flow-col' : 'grid-cols-3'} gap-1`}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-primary rounded-md shadow-sm animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-secondary">{operator}</span>
            <div className={`grid ${problemType === 'division' ? 'grid-flow-col' : 'grid-cols-2'} gap-1`}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-accent rounded-md shadow-sm animate-fade-in"
                  style={{ animationDelay: `${(i + 6) * 50}ms` }}
                />
              ))}
            </div>
          </div>
        );

      case 'diagram':
        return (
          <div className="flex items-center justify-center gap-4 my-3">
            {[1, 2, 3].map((group) => (
              <div
                key={group}
                className="w-16 h-16 border-3 border-dashed border-secondary rounded-full flex items-center justify-center gap-1 animate-fade-in"
                style={{ animationDelay: `${group * 100}ms` }}
              >
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="w-4 h-4 bg-primary rounded-full"
                  />
                ))}
              </div>
            ))}
          </div>
        );

      case 'equation':
        const equationText = step.starter?.[language] || "?";
        return (
          <div className="flex items-center justify-center my-3">
            <div className="bg-muted px-6 py-3 rounded-xl">
              <span className="text-2xl font-bold text-foreground font-mono">
                {equationText}
              </span>
            </div>
          </div>
        );

      case 'shapes':
        return (
          <div className="flex items-center justify-center gap-4 my-3">
            {/* Triangle */}
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[40px] border-l-transparent border-r-transparent border-b-primary" />
              <span className="text-xs font-medium mt-1">?</span>
            </div>
            {/* Square */}
            <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-10 h-10 bg-accent border-2 border-secondary" />
              <span className="text-xs font-medium mt-1">?</span>
            </div>
            {/* Circle */}
            <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-10 h-10 bg-secondary rounded-full" />
              <span className="text-xs font-medium mt-1">?</span>
            </div>
            {/* Pentagon */}
            <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <svg viewBox="0 0 40 40" className="w-10 h-10">
                <polygon
                  points="20,2 38,15 32,38 8,38 2,15"
                  className="fill-primary/70 stroke-secondary stroke-2"
                />
              </svg>
              <span className="text-xs font-medium mt-1">?</span>
            </div>
          </div>
        );

      case 'measurement':
        return (
          <div className="flex flex-col items-center my-3 gap-3">
            {/* Ruler visualization */}
            <div className="relative w-full max-w-[200px]">
              <div className="h-6 bg-muted rounded border-2 border-secondary relative">
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute top-0 w-px bg-secondary ${i % 5 === 0 ? 'h-4' : 'h-2'}`}
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
            {/* Grid for area */}
            <div className="grid grid-cols-4 gap-px bg-secondary p-px rounded">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 ${i < 8 ? 'bg-primary/70' : 'bg-muted'} animate-fade-in`}
                  style={{ animationDelay: `${i * 30}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Area = ? {language === 'es' ? 'unidades²' : 'units²'}
            </span>
          </div>
        );

      case 'division_setup':
      case 'division_select':
      case 'division_solve':
      case 'division_repeat':
        return (
          <div className="flex flex-col items-center justify-center gap-2 my-3">
            <div className="text-4xl">➗</div>
            <span className="text-sm font-bold text-slate-500">{step.title[language]}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card/50 rounded-lg p-3">
      {renderVisual()}
    </div>
  );
}
