
export interface Option {
    letra: string;
    texto: string;
}

export interface Question {
    enunciado: string;
    texto_contexto?: string;
    opciones: Option[];
    respuesta_correcta: string;
    explicacion: string;
    pistas_socraticas: string[];
    competencia: string;
    tip_estrategico: string;
}

export interface Exam {
    subject: string;
    subjectName: string;
    questions: Question[];
}
