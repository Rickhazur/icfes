export type Language = 'en' | 'es';

export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type Curriculum = 'ib-pyp' | 'colombia';

export type MathProblemType = 
  | 'addition' 
  | 'subtraction' 
  | 'multiplication' 
  | 'division' 
  | 'fractions' 
  | 'decimals'
  | 'geometry'
  | 'general';

export interface HintStep {
  id: number;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  visualType: 'blocks' | 'numberLine' | 'fractionBar' | 'diagram' | 'equation' | 'shapes' | 'measurement';
  starter?: {
    en: string;
    es: string;
  };
}

export interface MathHintSet {
  type: MathProblemType;
  icon: string;
  title: {
    en: string;
    es: string;
  };
  steps: HintStep[];
}

export interface TutorMessage {
  id: string;
  type: 'greeting' | 'hint' | 'encouragement' | 'question';
  content: {
    en: string;
    es: string;
  };
}

export interface DrawingTool {
  id: 'pen' | 'eraser';
  icon: string;
}

export interface ColorOption {
  id: string;
  color: string;
  name: string;
}
