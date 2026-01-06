// data/morePedagogicalQuests.ts
// Additional educational quests for all grades

import { PedagogicalQuestData } from './pedagogicalQuests';

export const additionalPedagogicalQuests: PedagogicalQuestData[] = [
    // GRADE 1 QUESTS
    {
        id: 'counting-to-20',
        title: {
            es: 'Contando hasta 20',
            en: 'Counting to 20'
        },
        icon: '🔢',
        category: 'math',
        difficulty: 'easy',
        grade: 1,
        learningObjective: {
            es: 'Aprender a contar del 1 al 20 y reconocer los números.',
            en: 'Learn to count from 1 to 20 and recognize numbers.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: 'Los Números son Nuestros Amigos',
                    en: 'Numbers are Our Friends'
                },
                content: {
                    es: 'Los números nos ayudan a contar cosas todos los días.\n\nPodemos contar:\n🍎 Manzanas\n⭐ Estrellas\n🐶 Perritos\n\n¡Vamos a aprender a contar hasta 20!',
                    en: 'Numbers help us count things every day.\n\nWe can count:\n🍎 Apples\n⭐ Stars\n🐶 Puppies\n\nLet\'s learn to count to 20!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Contemos Juntos',
                    en: 'Let\'s Count Together'
                },
                content: {
                    es: 'Vamos a contar estas estrellas:',
                    en: 'Let\'s count these stars:'
                },
                interactiveExample: {
                    problem: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐',
                    steps: [
                        {
                            text: 'Señalamos cada estrella mientras contamos',
                            highlight: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10'
                        },
                        {
                            text: 'La última estrella que contamos nos dice cuántas hay en total',
                            highlight: '¡Hay 10 estrellas!'
                        }
                    ],
                    answer: '10 estrellas'
                }
            },
            {
                type: 'practice',
                title: {
                    es: 'Tu Turno de Practicar',
                    en: 'Your Turn to Practice'
                },
                content: {
                    es: 'Cuenta estos corazones:\n❤️❤️❤️❤️❤️❤️❤️\n\n¿Cuántos hay?\n\nRespuesta: 7 corazones',
                    en: 'Count these hearts:\n❤️❤️❤️❤️❤️❤️❤️\n\nHow many are there?\n\nAnswer: 7 hearts'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Mira estos globos: 🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈. ¿Cuántos globos hay?',
                en: 'Look at these balloons: 🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈. How many balloons are there?'
            },
            options: [
                { id: 'a', text: { es: '10', en: '10' } },
                { id: 'b', text: { es: '12', en: '12' } },
                { id: 'c', text: { es: '15', en: '15' } },
                { id: 'd', text: { es: '11', en: '11' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Correcto! Hay 12 globos. Si los cuentas uno por uno: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.',
                en: 'Correct! There are 12 balloons. If you count them one by one: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.'
            }
        },
        reward: { coins: 60, xp: 100 }
    },

    // GRADE 2 QUESTS
    {
        id: 'addition-within-100',
        title: {
            es: 'Suma hasta 100',
            en: 'Addition within 100'
        },
        icon: '➕',
        category: 'math',
        difficulty: 'easy',
        grade: 2,
        learningObjective: {
            es: 'Aprender a sumar números de dos dígitos.',
            en: 'Learn to add two-digit numbers.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: 'Sumando Números Grandes',
                    en: 'Adding Big Numbers'
                },
                content: {
                    es: 'Cuando sumamos números de dos dígitos, podemos hacerlo en partes:\n\n1️⃣ Primero sumamos las UNIDADES (el número de la derecha)\n2️⃣ Luego sumamos las DECENAS (el número de la izquierda)\n3️⃣ Juntamos los resultados\n\n¡Es como armar un rompecabezas!',
                    en: 'When we add two-digit numbers, we can do it in parts:\n\n1️⃣ First we add the ONES (the right number)\n2️⃣ Then we add the TENS (the left number)\n3️⃣ We put the results together\n\nIt\'s like building a puzzle!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Ejemplo Paso a Paso',
                    en: 'Step by Step Example'
                },
                content: {
                    es: 'Vamos a sumar 23 + 15:',
                    en: 'Let\'s add 23 + 15:'
                },
                interactiveExample: {
                    problem: '23 + 15 = ?',
                    steps: [
                        {
                            text: 'Separamos en decenas y unidades',
                            highlight: '23 = 20 + 3    y    15 = 10 + 5'
                        },
                        {
                            text: 'Sumamos las unidades',
                            highlight: '3 + 5 = 8'
                        },
                        {
                            text: 'Sumamos las decenas',
                            highlight: '20 + 10 = 30'
                        },
                        {
                            text: 'Juntamos los resultados',
                            highlight: '30 + 8 = 38'
                        }
                    ],
                    answer: '23 + 15 = 38'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Pedro tiene 34 canicas y su amiga le regala 22 más. ¿Cuántas canicas tiene Pedro ahora?',
                en: 'Pedro has 34 marbles and his friend gives him 22 more. How many marbles does Pedro have now?'
            },
            options: [
                { id: 'a', text: { es: '56', en: '56' } },
                { id: 'b', text: { es: '46', en: '46' } },
                { id: 'c', text: { es: '66', en: '66' } },
                { id: 'd', text: { es: '54', en: '54' } }
            ],
            correctOptionId: 'a',
            explanation: {
                es: '¡Excelente! 34 + 22 = 56. Unidades: 4 + 2 = 6. Decenas: 30 + 20 = 50. Total: 50 + 6 = 56 canicas.',
                en: 'Excellent! 34 + 22 = 56. Ones: 4 + 2 = 6. Tens: 30 + 20 = 50. Total: 50 + 6 = 56 marbles.'
            }
        },
        reward: { coins: 90, xp: 130 }
    },

    // GRADE 4 QUESTS
    {
        id: 'area-perimeter',
        title: {
            es: 'Área y Perímetro',
            en: 'Area and Perimeter'
        },
        icon: '📐',
        category: 'math',
        difficulty: 'medium',
        grade: 4,
        learningObjective: {
            es: 'Comprender la diferencia entre área y perímetro y cómo calcularlos.',
            en: 'Understand the difference between area and perimeter and how to calculate them.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: '¿Qué son Área y Perímetro?',
                    en: 'What are Area and Perimeter?'
                },
                content: {
                    es: 'Son dos formas diferentes de medir figuras:\n\n📏 PERÍMETRO: La distancia alrededor de la figura (como una cerca)\n📦 ÁREA: El espacio dentro de la figura (como un piso)\n\nImaginalo así:\n• Perímetro = caminar alrededor\n• Área = pintar por dentro',
                    en: 'They are two different ways to measure shapes:\n\n📏 PERIMETER: The distance around the shape (like a fence)\n📦 AREA: The space inside the shape (like a floor)\n\nThink of it like this:\n• Perimeter = walking around\n• Area = painting inside'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Calculemos un Rectángulo',
                    en: 'Let\'s Calculate a Rectangle'
                },
                content: {
                    es: 'Tenemos un rectángulo de 5 cm de largo y 3 cm de ancho:',
                    en: 'We have a rectangle 5 cm long and 3 cm wide:'
                },
                interactiveExample: {
                    problem: 'Rectángulo: 5 cm × 3 cm',
                    steps: [
                        {
                            text: 'PERÍMETRO: Sumamos todos los lados',
                            highlight: '5 + 3 + 5 + 3 = 16 cm'
                        },
                        {
                            text: 'O usamos la fórmula: 2 × (largo + ancho)',
                            highlight: '2 × (5 + 3) = 2 × 8 = 16 cm'
                        },
                        {
                            text: 'ÁREA: Multiplicamos largo × ancho',
                            highlight: '5 × 3 = 15 cm²'
                        }
                    ],
                    answer: 'Perímetro = 16 cm, Área = 15 cm²'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Un jardín rectangular mide 8 metros de largo y 4 metros de ancho. ¿Cuál es su área?',
                en: 'A rectangular garden is 8 meters long and 4 meters wide. What is its area?'
            },
            options: [
                { id: 'a', text: { es: '24 m²', en: '24 m²' } },
                { id: 'b', text: { es: '32 m²', en: '32 m²' } },
                { id: 'c', text: { es: '12 m²', en: '12 m²' } },
                { id: 'd', text: { es: '16 m²', en: '16 m²' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Correcto! El área se calcula multiplicando largo × ancho: 8 × 4 = 32 metros cuadrados.',
                en: 'Correct! Area is calculated by multiplying length × width: 8 × 4 = 32 square meters.'
            }
        },
        reward: { coins: 130, xp: 190 }
    },

    // GRADE 5 QUESTS
    {
        id: 'decimals-intro',
        title: {
            es: 'Introducción a Decimales',
            en: 'Introduction to Decimals'
        },
        icon: '🔢',
        category: 'math',
        difficulty: 'medium',
        grade: 5,
        learningObjective: {
            es: 'Comprender qué son los decimales y cómo se relacionan con las fracciones.',
            en: 'Understand what decimals are and how they relate to fractions.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: '¿Qué son los Decimales?',
                    en: 'What are Decimals?'
                },
                content: {
                    es: 'Los decimales son otra forma de escribir fracciones.\n\nEl punto decimal (.) separa:\n• La parte ENTERA (a la izquierda)\n• La parte DECIMAL (a la derecha)\n\nEjemplo: 3.5\n• 3 = parte entera\n• .5 = cinco décimos (5/10)\n\n¡Es como tener dinero: 3.50 son 3 pesos y 50 centavos!',
                    en: 'Decimals are another way to write fractions.\n\nThe decimal point (.) separates:\n• The WHOLE part (on the left)\n• The DECIMAL part (on the right)\n\nExample: 3.5\n• 3 = whole part\n• .5 = five tenths (5/10)\n\nIt\'s like having money: 3.50 is 3 dollars and 50 cents!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'De Fracción a Decimal',
                    en: 'From Fraction to Decimal'
                },
                content: {
                    es: 'Convirtamos 1/2 a decimal:',
                    en: 'Let\'s convert 1/2 to decimal:'
                },
                interactiveExample: {
                    problem: '1/2 = ?',
                    steps: [
                        {
                            text: '1/2 significa 1 dividido entre 2',
                            highlight: '1 ÷ 2'
                        },
                        {
                            text: 'Cuando dividimos 1 entre 2 obtenemos',
                            highlight: '0.5'
                        },
                        {
                            text: 'Podemos verificar: 0.5 es lo mismo que 5/10, que simplificado es 1/2',
                            highlight: '✓ Correcto'
                        }
                    ],
                    answer: '1/2 = 0.5'
                }
            }
        ],
        challenge: {
            question: {
                es: 'María corrió 2.75 kilómetros. ¿Cuál fracción representa la parte decimal (.75)?',
                en: 'Maria ran 2.75 kilometers. Which fraction represents the decimal part (.75)?'
            },
            options: [
                { id: 'a', text: { es: '3/4', en: '3/4' } },
                { id: 'b', text: { es: '1/2', en: '1/2' } },
                { id: 'c', text: { es: '2/3', en: '2/3' } },
                { id: 'd', text: { es: '1/4', en: '1/4' } }
            ],
            correctOptionId: 'a',
            explanation: {
                es: '¡Perfecto! 0.75 = 75/100 = 3/4. Tres cuartos es lo mismo que setenta y cinco centésimos.',
                en: 'Perfect! 0.75 = 75/100 = 3/4. Three fourths is the same as seventy-five hundredths.'
            }
        },
        reward: { coins: 150, xp: 210 }
    },

    // SCIENCE QUEST
    {
        id: 'plants-parts',
        title: {
            es: 'Partes de una Planta',
            en: 'Parts of a Plant'
        },
        icon: '🌱',
        category: 'science',
        difficulty: 'easy',
        grade: 3,
        learningObjective: {
            es: 'Identificar las partes principales de una planta y sus funciones.',
            en: 'Identify the main parts of a plant and their functions.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: 'Las Partes de la Planta',
                    en: 'Plant Parts'
                },
                content: {
                    es: 'Cada parte de la planta tiene un trabajo importante:\n\n🌿 RAÍZ: Absorbe agua y nutrientes del suelo\n🌱 TALLO: Sostiene la planta y transporta agua\n🍃 HOJAS: Hacen el alimento de la planta (fotosíntesis)\n🌸 FLOR: Produce semillas para nuevas plantas\n\n¡Todas las partes trabajan juntas!',
                    en: 'Each part of the plant has an important job:\n\n🌿 ROOT: Absorbs water and nutrients from soil\n🌱 STEM: Supports the plant and transports water\n🍃 LEAVES: Make food for the plant (photosynthesis)\n🌸 FLOWER: Produces seeds for new plants\n\nAll parts work together!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Ejemplo: Un Girasol',
                    en: 'Example: A Sunflower'
                },
                content: {
                    es: 'Veamos cómo funciona un girasol:',
                    en: 'Let\'s see how a sunflower works:'
                },
                interactiveExample: {
                    problem: '🌻 Girasol',
                    steps: [
                        {
                            text: 'Las raíces absorben agua del suelo',
                            highlight: '💧 Agua sube'
                        },
                        {
                            text: 'El tallo lleva el agua hasta las hojas',
                            highlight: '⬆️ Transporte'
                        },
                        {
                            text: 'Las hojas usan luz del sol para hacer alimento',
                            highlight: '☀️ Fotosíntesis'
                        },
                        {
                            text: 'La flor produce semillas para más girasoles',
                            highlight: '🌻 Nuevas plantas'
                        }
                    ],
                    answer: '¡Ciclo completo de vida!'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Qué parte de la planta es responsable de hacer el alimento usando la luz del sol?',
                en: 'Which part of the plant is responsible for making food using sunlight?'
            },
            options: [
                { id: 'a', text: { es: 'Raíz', en: 'Root' } },
                { id: 'b', text: { es: 'Hojas', en: 'Leaves' } },
                { id: 'c', text: { es: 'Tallo', en: 'Stem' } },
                { id: 'd', text: { es: 'Flor', en: 'Flower' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Correcto! Las hojas hacen el alimento de la planta mediante la fotosíntesis, usando luz del sol, agua y dióxido de carbono.',
                en: 'Correct! Leaves make food for the plant through photosynthesis, using sunlight, water, and carbon dioxide.'
            }
        },
        reward: { coins: 110, xp: 160 }
    }
];
