import { MathHintSet, ColorOption, Curriculum } from '@/types/tutor';

// Geometry hints for IB PYP and Colombian curriculum
const geometryHints: MathHintSet = {
  type: 'geometry',
  icon: '📐',
  title: { en: 'Geometry', es: 'Geometría' },
  steps: [
    {
      id: 1,
      title: { en: 'Identify', es: 'Identifica' },
      description: { 
        en: 'What shape is it? Triangle, square, or circle?', 
        es: '¿Qué figura es? ¿Triángulo, cuadrado o círculo?' 
      },
      visualType: 'shapes',
      starter: { 
        en: 'This shape is a...', 
        es: 'Esta figura es un...' 
      }
    },
    {
      id: 2,
      title: { en: 'Count', es: 'Cuenta' },
      description: { 
        en: 'Count the sides and corners (vertices)', 
        es: 'Cuenta los lados y las esquinas (vértices)' 
      },
      visualType: 'shapes',
      starter: { 
        en: 'It has... sides and... corners', 
        es: 'Tiene... lados y... esquinas' 
      }
    },
    {
      id: 3,
      title: { en: 'Measure', es: 'Mide' },
      description: { 
        en: 'Compare the lengths of the sides', 
        es: 'Compara las longitudes de los lados' 
      },
      visualType: 'measurement',
      starter: { 
        en: 'The sides are... (equal/different)', 
        es: 'Los lados son... (iguales/diferentes)' 
      }
    },
    {
      id: 4,
      title: { en: 'Classify', es: 'Clasifica' },
      description: { 
        en: 'What type of shape is it based on its properties?', 
        es: '¿Qué tipo de figura es según sus propiedades?' 
      },
      visualType: 'diagram',
      starter: { 
        en: 'This is a... because...', 
        es: 'Este es un... porque...' 
      }
    },
    {
      id: 5,
      title: { en: 'Area', es: 'Área' },
      description: { 
        en: 'Calculate the area using small squares', 
        es: 'Calcula el área usando cuadrados pequeños' 
      },
      visualType: 'measurement',
      starter: { 
        en: 'The area is approximately... square units', 
        es: 'El área es aproximadamente... unidades cuadradas' 
      }
    }
  ]
};

export const mathHints: MathHintSet[] = [
  // Geometry first for visibility
  geometryHints,
  {
    type: 'fractions',
    icon: '🍕',
    title: { en: 'Fractions', es: 'Fracciones' },
    steps: [
      {
        id: 1,
        title: { en: 'Represent', es: 'Representa' },
        description: { 
          en: 'Draw the fractions using blocks or strips', 
          es: 'Dibuja las fracciones usando bloques o tiras' 
        },
        visualType: 'fractionBar',
        starter: { 
          en: 'I can see this fraction as...', 
          es: 'Puedo ver esta fracción como...' 
        }
      },
      {
        id: 2,
        title: { en: 'Common Denominator', es: 'Denominador Común' },
        description: { 
          en: 'Find the common denominator for both fractions', 
          es: 'Encuentra el denominador común para ambas fracciones' 
        },
        visualType: 'equation',
        starter: { 
          en: 'The common denominator is...', 
          es: 'El denominador común es...' 
        }
      },
      {
        id: 3,
        title: { en: 'Convert', es: 'Convierte' },
        description: { 
          en: 'Convert fractions to have the same denominator', 
          es: 'Convierte las fracciones para que tengan el mismo denominador' 
        },
        visualType: 'fractionBar',
        starter: { 
          en: 'Now both fractions are...', 
          es: 'Ahora ambas fracciones son...' 
        }
      },
      {
        id: 4,
        title: { en: 'Calculate', es: 'Calcula' },
        description: { 
          en: 'Perform the operation (add or subtract)', 
          es: 'Realiza la operación (suma o resta)' 
        },
        visualType: 'equation',
        starter: { 
          en: 'The result is...', 
          es: 'El resultado es...' 
        }
      },
      {
        id: 5,
        title: { en: 'Simplify', es: 'Simplifica' },
        description: { 
          en: 'Simplify or convert to mixed number', 
          es: 'Simplifica o convierte a número mixto' 
        },
        visualType: 'fractionBar',
        starter: { 
          en: 'The simplified answer is...', 
          es: 'La respuesta simplificada es...' 
        }
      }
    ]
  },
  {
    type: 'addition',
    icon: '➕',
    title: { en: 'Addition', es: 'Suma' },
    steps: [
      {
        id: 1,
        title: { en: 'Identify', es: 'Identifica' },
        description: { 
          en: 'Find the numbers to add', 
          es: 'Encuentra los números a sumar' 
        },
        visualType: 'blocks',
        starter: { 
          en: 'I need to add...', 
          es: 'Necesito sumar...' 
        }
      },
      {
        id: 2,
        title: { en: 'Visualize', es: 'Visualiza' },
        description: { 
          en: 'Use a number line or blocks', 
          es: 'Usa una línea numérica o bloques' 
        },
        visualType: 'numberLine',
        starter: { 
          en: 'Starting from...', 
          es: 'Empezando desde...' 
        }
      },
      {
        id: 3,
        title: { en: 'Calculate', es: 'Calcula' },
        description: { 
          en: 'Add step by step', 
          es: 'Suma paso a paso' 
        },
        visualType: 'equation',
        starter: { 
          en: 'The sum is...', 
          es: 'La suma es...' 
        }
      }
    ]
  },
  {
    type: 'subtraction',
    icon: '➖',
    title: { en: 'Subtraction', es: 'Resta' },
    steps: [
      {
        id: 1,
        title: { en: 'Identify', es: 'Identifica' },
        description: { 
          en: 'Find what you have and what to take away', 
          es: 'Encuentra lo que tienes y lo que debes quitar' 
        },
        visualType: 'blocks',
        starter: { 
          en: 'I start with... and take away...', 
          es: 'Empiezo con... y quito...' 
        }
      },
      {
        id: 2,
        title: { en: 'Visualize', es: 'Visualiza' },
        description: { 
          en: 'Cross out or move backwards on number line', 
          es: 'Tacha o retrocede en la línea numérica' 
        },
        visualType: 'numberLine',
        starter: { 
          en: 'Moving back from...', 
          es: 'Retrocediendo desde...' 
        }
      },
      {
        id: 3,
        title: { en: 'Calculate', es: 'Calcula' },
        description: { 
          en: 'Find the difference', 
          es: 'Encuentra la diferencia' 
        },
        visualType: 'equation',
        starter: { 
          en: 'The difference is...', 
          es: 'La diferencia es...' 
        }
      }
    ]
  },
  {
    type: 'multiplication',
    icon: '✖️',
    title: { en: 'Multiplication', es: 'Multiplicación' },
    steps: [
      {
        id: 1,
        title: { en: 'Understand', es: 'Comprende' },
        description: { 
          en: 'Groups of equal amounts', 
          es: 'Grupos de cantidades iguales' 
        },
        visualType: 'blocks',
        starter: { 
          en: 'I have... groups of...', 
          es: 'Tengo... grupos de...' 
        }
      },
      {
        id: 2,
        title: { en: 'Visualize', es: 'Visualiza' },
        description: { 
          en: 'Draw arrays or groups', 
          es: 'Dibuja arreglos o grupos' 
        },
        visualType: 'diagram',
        starter: { 
          en: 'I can see... rows of...', 
          es: 'Puedo ver... filas de...' 
        }
      },
      {
        id: 3,
        title: { en: 'Calculate', es: 'Calcula' },
        description: { 
          en: 'Count all or use times tables', 
          es: 'Cuenta todo o usa las tablas' 
        },
        visualType: 'equation',
        starter: { 
          en: 'The product is...', 
          es: 'El producto es...' 
        }
      }
    ]
  },
  {
    type: 'division',
    icon: '➗',
    title: { en: 'Division', es: 'División' },
    steps: [
      {
        id: 1,
        title: { en: 'Understand', es: 'Comprende' },
        description: { 
          en: 'Sharing or grouping equally', 
          es: 'Repartir o agrupar en partes iguales' 
        },
        visualType: 'blocks',
        starter: { 
          en: 'I need to share... into... groups', 
          es: 'Necesito repartir... en... grupos' 
        }
      },
      {
        id: 2,
        title: { en: 'Visualize', es: 'Visualiza' },
        description: { 
          en: 'Draw circles for groups', 
          es: 'Dibuja círculos para los grupos' 
        },
        visualType: 'diagram',
        starter: { 
          en: 'Each group gets...', 
          es: 'Cada grupo recibe...' 
        }
      },
      {
        id: 3,
        title: { en: 'Calculate', es: 'Calcula' },
        description: { 
          en: 'Find how many in each group', 
          es: 'Encuentra cuántos hay en cada grupo' 
        },
        visualType: 'equation',
        starter: { 
          en: 'The quotient is...', 
          es: 'El cociente es...' 
        }
      }
    ]
  }
];

export const drawingColors: ColorOption[] = [
  { id: 'red', color: '#EF4444', name: 'Red' },
  { id: 'yellow', color: '#FBBF24', name: 'Yellow' },
  { id: 'green', color: '#22C55E', name: 'Green' },
  { id: 'cyan', color: '#06B6D4', name: 'Cyan' },
  { id: 'purple', color: '#8B5CF6', name: 'Purple' },
  { id: 'black', color: '#1F2937', name: 'Black' },
];

export const gradeLabels = {
  en: ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
  es: ['1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado']
};

export const curriculumLabels: Record<Curriculum, { en: string; es: string }> = {
  'ib-pyp': { en: 'IB PYP', es: 'IB PEP' },
  'colombia': { en: 'Colombia', es: 'Colombia' }
};

export const curriculumDescriptions: Record<Curriculum, { en: string; es: string }> = {
  'ib-pyp': { 
    en: 'International Baccalaureate Primary Years Programme',
    es: 'Programa de la Escuela Primaria del Bachillerato Internacional'
  },
  'colombia': { 
    en: 'Colombian National Curriculum',
    es: 'Currículo Nacional de Colombia'
  }
};

export const tutorMessages = {
  greeting: {
    en: "Hi! 👋 I'm Nova, your tutor. Hold the microphone and tell me what you need help with! You can also draw on the whiteboard.",
    es: "¡Hola! 👋 Soy Nova, tu tutor. ¡Mantén presionado el micrófono y cuéntame en qué necesitas ayuda! También puedes dibujar en la pizarra."
  },
  selectProblem: {
    en: "What type of math problem are you working on?",
    es: "¿Qué tipo de problema matemático estás resolviendo?"
  },
  selectCurriculum: {
    en: "Select your curriculum:",
    es: "Selecciona tu currículo:"
  },
  encouragement: {
    en: ["Great job! 🌟", "You're doing amazing! ⭐", "Keep going! 💪", "Excellent thinking! 🧠"],
    es: ["¡Excelente trabajo! 🌟", "¡Lo estás haciendo increíble! ⭐", "¡Sigue así! 💪", "¡Excelente pensamiento! 🧠"]
  }
};
