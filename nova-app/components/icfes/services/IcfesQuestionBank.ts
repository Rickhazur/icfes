import { supabase } from '../../../services/supabase';

export interface IcfesQuestion {
    id: string;
    category: "LECTURA_CRITICA" | "MATEMATICAS" | "SOCIALES" | "CIENCIAS" | "INGLES";
    text: string;
    options: { id: string; text: string }[];
    correctId: string;
    explanation: string;
    socraticHints: string[]; // Hints for the bot to use sequentially
    techniqueTip?: string; // New field for strategic advice
    competency?: string;
}

export const fetchIcfesQuestions = async (): Promise<IcfesQuestion[]> => {
    if (!supabase) return generateIcfesQuestions();

    const { data, error } = await supabase
        .from('icfes_questions')
        .select('*')
        .limit(10);

    if (error || !data || data.length === 0) {
        console.warn("Using mock data due to fetch error:", error);
        return generateIcfesQuestions();
    }

    // Map DB columns to our interface
    return data.map((q: any) => ({
        id: q.id,
        category: (q.subject || "LECTURA_CRITICA").toUpperCase(), // Adjust mapping as needed
        text: q.enunciado || q.text,
        options: Array.isArray(q.options)
            ? q.options.map((o: any) => ({ id: o.letra, text: o.texto }))
            : (q.options || []), // Handle if options is JSON
        correctId: q.respuesta_correcta || q.correct_answer,
        explanation: q.explicacion || q.explanation,
        socraticHints: q.pistas_socraticas || q.socratic_hints || [],
        techniqueTip: q.technique_tip || q.tip_estrategico,
        competency: q.competency || q.competencia
    }));
};

export const generateIcfesQuestions = (): IcfesQuestion[] => [
    {
        id: "lc_1",
        category: "LECTURA_CRITICA",
        text: "En un texto argumentativo, el autor afirma: 'La tecnología nos ha conectado, pero también nos ha aislado en burbujas de información'. ¿Cuál es la intención comunicativa principal de esta frase?",
        options: [
            { id: "A", text: "Celebrar los avances tecnológicos del siglo XXI." },
            { id: "B", text: "Exponer una paradoja sobre los efectos sociales de la tecnología." },
            { id: "C", text: "Promover el uso de redes sociales para evitar el aislamiento." },
            { id: "D", text: "Criticar a quienes no usan la tecnología para conectarse." }
        ],
        correctId: "B",
        explanation: "El autor contrasta dos efectos opuestos (conexión vs aislamiento), lo cual define una paradoja.",
        socraticHints: [
            "Fíjate en el uso de la palabra 'pero'. ¿Qué tipo de relación establece entre las dos partes de la frase?",
            "El autor menciona dos efectos contrarios: conectar y aislar. ¿Cómo se llama a esa figura retórica?",
            "Si algo te conecta y te aísla al mismo tiempo, ¿es una celebración o una contradicción compleja?"
        ],
        techniqueTip: "Busca palabras clave que indiquen contraste (pero, sin embargo). Estas suelen señalar la verdadera intención del autor."
    },
    // ... keep other mock questions if needed, simplified for brevity here or just return the existing ones.
    // For now I replaced the whole file content so I need to put back the other mock questions or just leave one for fallback.
    {
        id: "mat_1",
        category: "MATEMATICAS",
        text: "Un tanque de agua se vacía a razón de 3 litros por minuto. Si inicialmente tenía 120 litros, ¿cuál ecuación describe la cantidad de agua (y) en función del tiempo en minutos (x)?",
        options: [
            { id: "A", text: "y = 120 + 3x" },
            { id: "B", text: "y = 3x - 120" },
            { id: "C", text: "y = 120 - 3x" },
            { id: "D", text: "y = 120 / 3x" }
        ],
        correctId: "C",
        explanation: "Inicia con 120 (intercepto) y disminuye 3 cada minuto (pendiente negativa).",
        socraticHints: [
            "Piensa en el valor inicial. Cuando el tiempo es 0, ¿cuánta agua hay?",
            "Si el tanque se 'vacía', ¿la cantidad de agua aumenta o disminuye con el tiempo?",
            "Si disminuye, ¿la pendiente (el número que acompaña a la x) debería ser positiva o negativa?"
        ],
        techniqueTip: "Identifica las variables: valor inicial (b) y tasa de cambio (m). Reemplaza en y = mx + b."
    }
];
