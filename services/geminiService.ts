
import { GoogleGenAI, Type } from "@google/genai";
import type { Exam, Question } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      enunciado: {
        type: Type.STRING,
        description: "El enunciado o la pregunta principal."
      },
      texto_contexto: {
        type: Type.STRING,
        description: "Un texto de contexto opcional. Para Lectura Crítica, puede ser extenso. Dejar vacío si no aplica."
      },
      opciones: {
        type: Type.ARRAY,
        description: "Un array de 4 objetos, cada uno representando una opción de respuesta.",
        items: {
          type: Type.OBJECT,
          properties: {
            letra: {
              type: Type.STRING,
              description: "La letra de la opción (a, b, c, o d)."
            },
            texto: {
              type: Type.STRING,
              description: "El texto de la opción de respuesta."
            }
          },
          required: ["letra", "texto"]
        }
      },
      respuesta_correcta: {
        type: Type.STRING,
        description: "La letra de la opción correcta (a, b, c, o d)."
      },
      explicacion: {
        type: Type.STRING,
        description: "Una explicación detallada de por qué esa es la respuesta correcta, para que el estudiante aprenda."
      },
      pistas_socraticas: {
        type: Type.ARRAY,
        description: "Array de 3 pistas progresivas. NO des la respuesta. La primera pista es sutil, la segunda más directa, la tercera casi regala la lógica, pero sin decir la letra.",
        items: { type: Type.STRING }
      },
      competencia: {
        type: Type.STRING,
        description: "La competencia específica del ICFES.",
        enum: ["Interpretativa", "Argumentativa", "Propositiva", "Lexical", "Gramatical", "Pragmática", "Indagación", "Uso Comprensivo del Conocimiento", "Explicación de Fenómenos"]
      },
      tip_estrategico: {
        type: Type.STRING,
        description: "Un consejo breve de TÉCNICA (no de contenido) para abordar esta pregunta. Ej: 'Descarta primero las opciones que generalizan con siempre/nunca', 'Identifica la tesis en el primer párrafo antes de leer las opciones'."
      }
    },
    required: ["enunciado", "opciones", "respuesta_correcta", "explicacion", "pistas_socraticas", "competencia", "tip_estrategico"]
  }
};

const getPrompt = (subjectName: string, questionCount: number) => `
Actúa como un experto en la creación de preguntas para el examen ICFES Saber 11 de Colombia. Tu tarea es generar un banco de ${questionCount} preguntas de opción múltiple para el área de ${subjectName}.

Sigue estas reglas ESTRICTAMENTE:

1.  **Formato:**
    *   **IMPORTANTE: Matemáticas y Física:** Si la pregunta requiere fórmulas, usa formato LaTeX para que se renderice bonito (ej: $E=mc^2$, $\\frac{x}{y}$).
    *   Cada pregunta debe tener un enunciado claro y preciso.
    *   Algunas preguntas, especialmente en Lectura Crítica, DEBEN tener un texto de contexto (\`texto_contexto\`). Para otras áreas como Matemáticas, este campo puede ser un string vacío si la pregunta no lo requiere.
    *   Debe haber exactamente 4 opciones de respuesta (a, b, c, d).
    *   Solo una opción debe ser la correcta.
    *   La respuesta correcta debe ser indicada por su letra ('a', 'b', 'c', o 'd').

2.  **Lógica Socrática (CRUCIAL):**
    *   Genera un campo \`pistas_socraticas\` con un array de 3 strings.
    *   Estas pistas NO deben dar la respuesta. Deben hacer preguntas o resaltar partes del texto para que el estudiante piense.
    *   Ejemplo Pista 1: "Fíjate en la última frase del segundo párrafo. ¿Qué implica esa contradicción?"
    *   Ejemplo Pista 2: "Recuerda que la velocidad es la derivada de la posición. ¿Qué pasa cuando la pendiente es cero?"

3.  **Etiquetado de Competencias (NUEVO):**
    *   Debes clasificar CADA pregunta en su competencia oficial del ICFES.
    *   **Lectura Crítica:** Interpretativa (entender el texto), Argumentativa (analizar la tesis), Propositiva (evaluar implicaciones).
    *   **Matemáticas:** Interpretación y Representación, Formulación y Ejecución, Argumentación. *(Nota: Usa 'Interpretativa', 'Argumentativa', 'Propositiva' como genéricos si es más fácil, o los específicos)*.
    *   **Ciencias:** Indagación, Uso Comprensivo del Conocimiento, Explicación de Fenómenos.
    *   **Inglés:** Lexical, Gramatical, Pragmática.
    *   **Sociales:** Pensamiento Social, Interpretación y Análisis de Perspectivas, Pensamiento Reflexivo y Sistémico.
    *   *Simplificación:* Si tienes dudas, usa las generales: 'Interpretativa', 'Argumentativa', 'Propositiva'.

4.  **Área Temática: ${subjectName}**
    *   **Lectura Crítica:** Incluye textos de longitud variable, desde párrafos cortos hasta textos más extensos (3-5 párrafos), de tipo argumentativo, expositivo o literario. Las preguntas deben evaluar la comprensión literal, inferencial, y la capacidad de identificar la estructura, tesis y propósito del texto.
    *   **Matemáticas:** Problemas que requieran interpretación de gráficos, tablas, y situaciones problema. Deben cubrir álgebra, geometría, probabilidad, y aritmética. Incluye problemas conceptuales y de aplicación.
    *   **Ciencias Naturales:** Preguntas sobre biología (célula, ecosistemas, genética), química (materia, reacciones, estequiometría), y física (mecánica, ondas, energía). Deben evaluar tanto el conocimiento de conceptos como la capacidad de aplicarlos en un contexto.
    *   **Ciencias Sociales y Ciudadanas:** Preguntas sobre historia de Colombia y el mundo, geografía, estructura del estado colombiano, constitución política, derechos humanos, economía y competencias ciudadanas.
    *   **Inglés:** Preguntas de gramática, vocabulario y comprensión de textos breves y de mediana longitud. El nivel de dificultad debe ser A2/B1 según el Marco Común Europeo de Referencia.

5.  **Nivel de Dificultad:** Adecuado para estudiantes de grado 11 en Colombia. El lenguaje debe ser formal, académico y preciso, imitando el estilo de los cuadernillos oficiales del ICFES.

6.  **Distractores:** Las 3 opciones incorrectas (distractores) deben ser plausibles, creíbles y estar relacionadas con el tema de la pregunta para evaluar un entendimiento genuino. Evita opciones obviamente incorrectas o absurdas.

7.  **Consejo de Estrategia 🧠:**
    *   Genera un campo \`tip_estrategico\`. NO expliques el tema.
    *   Explica la TÉCNICA para responder.
    *   Ejemplo: "En preguntas de 'título más adecuado', busca la opción que abarque el inicio y el fin del texto, no solo un detalle."

8.  **Salida:** Responde ÚNICAMENTE con un array de objetos JSON válido.
`;

export const generateIcfesExam = async (subjectId: string, subjectName: string, questionCount: number): Promise<Exam> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getPrompt(subjectName, questionCount),
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.85,
      },
    });

    const jsonText = response.text.trim();
    const questions: Question[] = JSON.parse(jsonText);

    if (questions.length !== questionCount) {
      console.warn(`Expected ${questionCount} questions for ${subjectName}, but received ${questions.length}.`);
    }

    return {
      subject: subjectId,
      subjectName: subjectName,
      questions,
    };
  } catch (error) {
    console.error(`Error generating questions for ${subjectName}:`, error);
    throw new Error(`Failed to generate exam for ${subjectName}.`);
  }
};
