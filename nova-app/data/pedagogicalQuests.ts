// data/pedagogicalQuests.ts
// Educational quests with guided learning content

import { additionalPedagogicalQuests } from './morePedagogicalQuests';

export interface PedagogicalQuestData {
    id: string;
    title: { es: string; en: string };
    icon: string;
    category: 'math' | 'science' | 'language' | 'social_studies';
    difficulty: 'easy' | 'medium' | 'hard';
    grade: number;
    learningObjective: { es: string; en: string };
    learningSteps: Array<{
        type: 'explanation' | 'example' | 'practice';
        title: { es: string; en: string };
        content: { es: string; en: string };
        visual?: string;
        interactiveExample?: {
            problem: string;
            steps: Array<{ text: string; highlight?: string }>;
            answer: string;
        };
    }>;
    challenge: {
        question: { es: string; en: string };
        options: Array<{ id: string; text: { es: string; en: string } }>;
        correctOptionId: string;
        explanation: { es: string; en: string };
    };
    reward: { coins: number; xp: number };
}

export const basePedagogicalQuests: PedagogicalQuestData[] = [
    {
        id: 'fractions-intro-1',
        title: {
            es: 'Introducción a las Fracciones',
            en: 'Introduction to Fractions'
        },
        icon: '🍕',
        category: 'math',
        difficulty: 'easy',
        grade: 3,
        learningObjective: {
            es: 'Comprender qué es una fracción y cómo representar partes de un entero.',
            en: 'Understand what a fraction is and how to represent parts of a whole.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: '¿Qué es una Fracción?',
                    en: 'What is a Fraction?'
                },
                content: {
                    es: 'Una fracción representa una parte de algo completo. Imagina que tienes una pizza entera y la cortas en pedazos iguales.\n\nCada pedazo es una FRACCIÓN de la pizza completa.\n\nLas fracciones se escriben con dos números separados por una línea:\n• El número de ARRIBA (numerador) dice cuántos pedazos tienes\n• El número de ABAJO (denominador) dice en cuántos pedazos se dividió el total',
                    en: 'A fraction represents a part of something whole. Imagine you have a whole pizza and cut it into equal pieces.\n\nEach piece is a FRACTION of the complete pizza.\n\nFractions are written with two numbers separated by a line:\n• The TOP number (numerator) tells how many pieces you have\n• The BOTTOM number (denominator) tells how many pieces the whole was divided into'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Ejemplo con Pizza',
                    en: 'Pizza Example'
                },
                content: {
                    es: 'Vamos a ver un ejemplo práctico con una pizza:',
                    en: 'Let\'s see a practical example with a pizza:'
                },
                interactiveExample: {
                    problem: '🍕 Una pizza se corta en 8 pedazos iguales. Comes 3 pedazos.',
                    steps: [
                        {
                            text: 'La pizza completa se dividió en 8 pedazos',
                            highlight: 'Denominador = 8'
                        },
                        {
                            text: 'Tú comiste 3 pedazos',
                            highlight: 'Numerador = 3'
                        },
                        {
                            text: 'Escribimos la fracción poniendo el numerador arriba y el denominador abajo',
                            highlight: '3/8'
                        }
                    ],
                    answer: 'Comiste 3/8 (tres octavos) de la pizza'
                }
            },
            {
                type: 'practice',
                title: {
                    es: 'Practiquemos Juntos',
                    en: 'Let\'s Practice Together'
                },
                content: {
                    es: 'Ahora intenta pensar en este ejemplo:\n\nTienes una barra de chocolate dividida en 4 partes iguales. Te comes 1 parte.\n\n¿Qué fracción del chocolate comiste?\n\n• El chocolate se dividió en 4 partes → Denominador = 4\n• Comiste 1 parte → Numerador = 1\n• Fracción = 1/4 (un cuarto)',
                    en: 'Now try thinking about this example:\n\nYou have a chocolate bar divided into 4 equal parts. You eat 1 part.\n\nWhat fraction of the chocolate did you eat?\n\n• The chocolate was divided into 4 parts → Denominator = 4\n• You ate 1 part → Numerator = 1\n• Fraction = 1/4 (one fourth)'
                }
            }
        ],
        challenge: {
            question: {
                es: 'María tiene una caja con 6 crayones. 2 de ellos son rojos. ¿Qué fracción de los crayones son rojos?',
                en: 'Maria has a box with 6 crayons. 2 of them are red. What fraction of the crayons are red?'
            },
            options: [
                { id: 'a', text: { es: '2/6', en: '2/6' } },
                { id: 'b', text: { es: '6/2', en: '6/2' } },
                { id: 'c', text: { es: '2/4', en: '2/4' } },
                { id: 'd', text: { es: '4/6', en: '4/6' } }
            ],
            correctOptionId: 'a',
            explanation: {
                es: '¡Correcto! La respuesta es 2/6. El total de crayones es 6 (denominador), y los crayones rojos son 2 (numerador). Por lo tanto, 2/6 de los crayones son rojos.',
                en: 'Correct! The answer is 2/6. The total crayons is 6 (denominator), and the red crayons are 2 (numerator). Therefore, 2/6 of the crayons are red.'
            }
        },
        reward: { coins: 100, xp: 150 }
    },
    {
        id: 'multiplication-tables-5',
        title: {
            es: 'Tabla del 5: Patrones y Trucos',
            en: 'Times Table 5: Patterns and Tricks'
        },
        icon: '✋',
        category: 'math',
        difficulty: 'easy',
        grade: 2,
        learningObjective: {
            es: 'Dominar la tabla del 5 usando patrones y estrategias visuales.',
            en: 'Master the 5 times table using patterns and visual strategies.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: 'El Patrón Mágico del 5',
                    en: 'The Magic Pattern of 5'
                },
                content: {
                    es: 'La tabla del 5 es una de las más fáciles porque tiene un patrón especial:\n\n✋ Todos los resultados terminan en 5 o en 0\n✋ Los números van alternando: 5, 10, 15, 20, 25, 30...\n✋ Puedes usar tus dedos: cada mano tiene 5 dedos\n\n¡Es como contar de 5 en 5!',
                    en: 'The 5 times table is one of the easiest because it has a special pattern:\n\n✋ All results end in 5 or 0\n✋ Numbers alternate: 5, 10, 15, 20, 25, 30...\n✋ You can use your fingers: each hand has 5 fingers\n\nIt\'s like counting by 5s!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Truco de las Manos',
                    en: 'Hand Trick'
                },
                content: {
                    es: 'Vamos a calcular 5 × 4 usando tus manos:',
                    en: 'Let\'s calculate 5 × 4 using your hands:'
                },
                interactiveExample: {
                    problem: '5 × 4 = ?',
                    steps: [
                        {
                            text: 'Levanta 4 dedos (porque queremos 5 × 4)',
                            highlight: '4 dedos levantados'
                        },
                        {
                            text: 'Cuenta de 5 en 5 por cada dedo',
                            highlight: '5, 10, 15, 20'
                        },
                        {
                            text: 'El último número es la respuesta',
                            highlight: '20'
                        }
                    ],
                    answer: '5 × 4 = 20'
                }
            },
            {
                type: 'practice',
                title: {
                    es: 'Practica el Patrón',
                    en: 'Practice the Pattern'
                },
                content: {
                    es: 'Observa cómo funciona el patrón:\n\n5 × 1 = 5 (termina en 5)\n5 × 2 = 10 (termina en 0)\n5 × 3 = 15 (termina en 5)\n5 × 4 = 20 (termina en 0)\n5 × 5 = 25 (termina en 5)\n\n¿Ves el patrón? ¡Siempre alterna entre 5 y 0!',
                    en: 'Watch how the pattern works:\n\n5 × 1 = 5 (ends in 5)\n5 × 2 = 10 (ends in 0)\n5 × 3 = 15 (ends in 5)\n5 × 4 = 20 (ends in 0)\n5 × 5 = 25 (ends in 5)\n\nSee the pattern? It always alternates between 5 and 0!'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Si tienes 7 bolsas y cada bolsa tiene 5 caramelos, ¿cuántos caramelos tienes en total?',
                en: 'If you have 7 bags and each bag has 5 candies, how many candies do you have in total?'
            },
            options: [
                { id: 'a', text: { es: '30', en: '30' } },
                { id: 'b', text: { es: '35', en: '35' } },
                { id: 'c', text: { es: '40', en: '40' } },
                { id: 'd', text: { es: '25', en: '25' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Excelente! 7 × 5 = 35. Puedes contarlo: 5, 10, 15, 20, 25, 30, 35. O usar el patrón: como es 7 (impar), el resultado termina en 5.',
                en: 'Excellent! 7 × 5 = 35. You can count it: 5, 10, 15, 20, 25, 30, 35. Or use the pattern: since it\'s 7 (odd), the result ends in 5.'
            }
        },
        reward: { coins: 80, xp: 120 }
    },
    {
        id: 'water-cycle-1',
        title: {
            es: 'El Ciclo del Agua',
            en: 'The Water Cycle'
        },
        icon: '💧',
        category: 'science',
        difficulty: 'medium',
        grade: 4,
        learningObjective: {
            es: 'Comprender las etapas del ciclo del agua y cómo el agua se mueve en la naturaleza.',
            en: 'Understand the stages of the water cycle and how water moves in nature.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: '¿Qué es el Ciclo del Agua?',
                    en: 'What is the Water Cycle?'
                },
                content: {
                    es: 'El agua en nuestro planeta está en constante movimiento. ¡Nunca desaparece, solo cambia de forma!\n\nEl ciclo del agua tiene 4 etapas principales:\n\n1. ☀️ EVAPORACIÓN: El sol calienta el agua y la convierte en vapor\n2. ☁️ CONDENSACIÓN: El vapor se enfría y forma nubes\n3. 🌧️ PRECIPITACIÓN: El agua cae como lluvia, nieve o granizo\n4. 🏞️ ESCORRENTÍA: El agua fluye de vuelta a ríos y océanos',
                    en: 'Water on our planet is constantly moving. It never disappears, it just changes form!\n\nThe water cycle has 4 main stages:\n\n1. ☀️ EVAPORATION: The sun heats water and turns it into vapor\n2. ☁️ CONDENSATION: Vapor cools and forms clouds\n3. 🌧️ PRECIPITATION: Water falls as rain, snow, or hail\n4. 🏞️ RUNOFF: Water flows back to rivers and oceans'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Un Viaje de una Gota de Agua',
                    en: 'A Water Drop\'s Journey'
                },
                content: {
                    es: 'Imagina que eres una gota de agua en el océano:',
                    en: 'Imagine you are a water drop in the ocean:'
                },
                interactiveExample: {
                    problem: '💧 Sigue el viaje de la gota',
                    steps: [
                        {
                            text: 'Estás en el océano. El sol te calienta y te conviertes en vapor (evaporación)',
                            highlight: '🌊 → ☁️'
                        },
                        {
                            text: 'Subes al cielo y te unes con otras gotas para formar una nube (condensación)',
                            highlight: '☁️ Nube formada'
                        },
                        {
                            text: 'La nube se llena y caes como lluvia sobre una montaña (precipitación)',
                            highlight: '🌧️ ¡Lluvia!'
                        },
                        {
                            text: 'Fluyes por un río de vuelta al océano (escorrentía)',
                            highlight: '🏞️ → 🌊 De vuelta al inicio'
                        }
                    ],
                    answer: '¡El ciclo se repite una y otra vez!'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Qué proceso del ciclo del agua ocurre cuando el agua de un charco desaparece en un día soleado?',
                en: 'What process of the water cycle occurs when water from a puddle disappears on a sunny day?'
            },
            options: [
                { id: 'a', text: { es: 'Condensación', en: 'Condensation' } },
                { id: 'b', text: { es: 'Evaporación', en: 'Evaporation' } },
                { id: 'c', text: { es: 'Precipitación', en: 'Precipitation' } },
                { id: 'd', text: { es: 'Escorrentía', en: 'Runoff' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Correcto! Es evaporación. El sol calienta el agua del charco y la convierte en vapor de agua invisible que sube al aire. Por eso el charco "desaparece".',
                en: 'Correct! It\'s evaporation. The sun heats the puddle water and turns it into invisible water vapor that rises into the air. That\'s why the puddle "disappears".'
            }
        },
        reward: { coins: 120, xp: 180 }
    },
    {
        id: 'historical-timeline-1',
        title: {
            es: 'Líneas del Tiempo',
            en: 'Historical Timelines'
        },
        icon: '⏳',
        category: 'social_studies',
        difficulty: 'medium',
        grade: 4,
        learningObjective: {
            es: 'Comprender cómo organizar eventos históricos cronológicamente.',
            en: 'Understand how to organize historical events chronologically.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: '¿Qué es una Línea del Tiempo?',
                    en: 'What is a Timeline?'
                },
                content: {
                    es: 'Una línea del tiempo es como una regla que mide el tiempo en lugar de centímetros.\n\n📅 Nos ayuda a ver qué pasó PRIMERO y qué pasó DESPUÉS.\n📅 La izquierda suele ser el pasado lejano y la derecha el presente.\n📅 Los eventos se colocan en orden, como en una fila.',
                    en: 'A timeline is like a ruler that measures time instead of centimeters.\n\n📅 It helps us see what happened FIRST and what happened AFTER.\n📅 The left is usually the distant past and the right is the present.\n📅 Events are placed in order, like in a line.'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'La Historia de un Día',
                    en: 'The History of a Day'
                },
                content: {
                    es: 'Imagina tu mañana en una línea del tiempo:',
                    en: 'Imagine your morning on a timeline:'
                },
                interactiveExample: {
                    problem: '🗓️ Tu Mañana',
                    steps: [
                        {
                            text: '7:00 AM - Te despiertas',
                            highlight: 'Inicio'
                        },
                        {
                            text: '7:30 AM - Desayunas',
                            highlight: 'Después'
                        },
                        {
                            text: '8:00 AM - Sales para la escuela',
                            highlight: 'Más tarde'
                        }
                    ],
                    answer: '¡Los eventos están en orden cronológico!'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Si un evento A ocurrió en 1990 y un evento B ocurrió en 1950, ¿cuál de los dos aparecería más a la IZQUIERDA en una línea del tiempo?',
                en: 'If event A happened in 1990 and event B happened in 1950, which one would appear further to the LEFT on a timeline?'
            },
            options: [
                { id: 'a', text: { es: 'Evento A (1990)', en: 'Event A (1990)' } },
                { id: 'b', text: { es: 'Evento B (1950)', en: 'Event B (1950)' } },
                { id: 'c', text: { es: 'Aparecerían en el mismo lugar', en: 'They would appear in the same place' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Así es! 1950 ocurrió antes que 1990, por lo que en una línea del tiempo convencional, el evento más antiguo siempre se coloca más a la izquierda.',
                en: 'That\'s right! 1950 happened before 1990, so on a conventional timeline, the older event is always placed further to the left.'
            }
        },
        reward: { coins: 140, xp: 200 }
    }
];

// Combine base quests with additional quests
export const pedagogicalQuests = [...basePedagogicalQuests, ...additionalPedagogicalQuests];

export function getPedagogicalQuestsByGrade(grade: number): PedagogicalQuestData[] {
    return pedagogicalQuests.filter(q => q.grade === grade);
}

export function getPedagogicalQuestById(id: string): PedagogicalQuestData | undefined {
    return pedagogicalQuests.find(q => q.id === id);
}
