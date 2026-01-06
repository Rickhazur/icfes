
export interface Challenge {
    id: string;
    area: string;
    severity: "low" | "medium" | "high";
    description: string;
    englishConnection: string;
}

export interface TutorReport {
    id: string;
    source: "research-center" | "math-tutor";
    subject: string;
    emoji: string;
    date: string;
    overallScore: number;
    trend: "up" | "down" | "stable";
    challenges: Challenge[];
    recommendations: string[];
}

export type MathProblemType =
    // Basic Operations
    | 'addition' | 'subtraction' | 'multiplication' | 'division'
    // Fractions
    | 'fractions' | 'fraction_addition' | 'fraction_subtraction' | 'fraction_multiplication' | 'fraction_division' | 'equivalent_fractions' | 'mixed_numbers'
    // Decimals
    | 'decimals' | 'decimal_addition' | 'decimal_subtraction' | 'decimal_multiplication' | 'decimal_division'
    // Geometry
    | 'geometry' | 'area' | 'perimeter' | 'angles' | 'shapes_2d' | 'shapes_3d'
    // Measurement
    | 'measurement' | 'time' | 'money' | 'length' | 'weight' | 'volume'
    // Data
    | 'data' | 'graphs' | 'statistics' | 'probability'
    // Other
    | 'general' | 'word_problems' | 'patterns';

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
    visualType: string;
    starter?: {
        en: string;
        es: string;
    };
}

export interface MathHintSet {
    type: MathProblemType;
    icon: string;
    title: { en: string; es: string };
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

export type Language = 'es' | 'en';
export type GradeLevel = 1 | 2 | 3 | 4 | 5;
export type Curriculum = 'ib-pyp' | 'cambridge-primary' | 'common-core' | 'national' | 'colombia';
