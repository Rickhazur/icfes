
export type MathStep = {
    id: number;
    type: 'question' | 'explanation' | 'action';
    text: { es: string; en: string };
    expectedAnswer?: number;
    expectedKeywords?: string[];
    failureHints?: { es: string[]; en: string[] };
    boardDraw?: {
        type: 'writeQuotient' | 'writeProduct' | 'writeRemainder' | 'writeAnswer' | 'drawLine' | 'highlight';
        value?: number;
        index?: number;
    };
};

// Helper to diagnose specific errors
export const diagnoseMathError = (
    expected: number,
    actual: number,
    type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fraction_addition',
    n1: number,
    n2: number,
    lang: 'es' | 'en'
): string | null => {

    // 1. Operation Confusion
    if (type === 'addition' && actual === n1 * n2) {
        return lang === 'es'
            ? "Multiplicaste en vez de sumar. Fíjate en el signo (+)."
            : "You multiplied instead of adding. Look at the sign (+).";
    }
    if (type === 'addition' && actual === Math.abs(n1 - n2)) {
        return lang === 'es'
            ? "Restaste en lugar de sumar."
            : "You subtracted instead of adding.";
    }
    if (type === 'multiplication' && actual === n1 + n2) {
        return lang === 'es'
            ? "Sumaste en vez de multiplicar. Recuerda que 'veces' significa grupos repetidos."
            : "You added instead of multiplying. Remember 'times' means repeated groups.";
    }

    // 2. Common Sign Errors
    if (type === 'subtraction' && actual === n1 + n2) {
        return lang === 'es'
            ? "Sumaste. En la resta debemos quitar, no poner."
            : "You added. In subtraction we must take away, not add.";
    }

    // 3. Close but not quite (Calculation error)
    if (Math.abs(expected - actual) <= 2 && expected > 10) {
        return lang === 'es'
            ? "¡Uy! Estuviste muy cerca. Revisa tus dedos o tu cálculo mental."
            : "Oops! You were very close. Check your mental math.";
    }

    return null;
};

export const MathSolver = {
    // DIVISION (Complete Socratic Flow)
    solveDivision: (dividend: number, divisor: number, method: 'colombia' | 'ib'): MathStep[] => {
        const steps: MathStep[] = [];
        const digits = dividend.toString().split('').map(Number);

        // Step 1: Introduction
        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a dividir ${dividend} entre ${divisor} paso a paso.`,
                en: `Let's divide ${dividend} by ${divisor} step by step.`
            }
        });

        let workingValue = digits[0];
        let digitIndex = 0;
        let quotientDigits: number[] = [];

        // Step 2: Check if first digit is too small
        if (workingValue < divisor && digits.length > 1) {
            steps.push({
                id: steps.length + 1,
                type: 'question',
                text: {
                    es: `Mira el primer número: ${digits[0]}. ¿El ${divisor} cabe en ${digits[0]}? (Responde 0 si no cabe)`,
                    en: `Look at the first number: ${digits[0]}. Does ${divisor} fit into ${digits[0]}? (Answer 0 if it doesn't)`
                },
                expectedAnswer: 0,
                failureHints: {
                    es: [
                        `Compara ${digits[0]} con ${divisor}. ¿Cuál es mayor?`,
                        `${digits[0]} es menor que ${divisor}, entonces no cabe.`
                    ],
                    en: [
                        `Compare ${digits[0]} with ${divisor}. Which is larger?`,
                        `${digits[0]} is smaller than ${divisor}, so it doesn't fit.`
                    ]
                }
            });

            steps.push({
                id: steps.length + 1,
                type: 'explanation',
                text: {
                    es: `Correcto. Como ${digits[0]} < ${divisor}, tomamos las dos primeras cifras: ${digits[0]}${digits[1]}.`,
                    en: `Correct. Since ${digits[0]} < ${divisor}, we take the first two digits: ${digits[0]}${digits[1]}.`
                }
            });

            workingValue = parseInt(`${digits[0]}${digits[1]}`);
            digitIndex = 1;
        }

        // Main Division Loop (simplified for 2-digit by 1-digit)
        const quotient = Math.floor(workingValue / divisor);
        const product = quotient * divisor;
        const remainder = workingValue - product;

        // Step 3: Ask for quotient
        steps.push({
            id: steps.length + 1,
            type: 'question',
            text: {
                es: `¿Cuántas veces cabe el ${divisor} en ${workingValue}?`,
                en: `How many times does ${divisor} fit into ${workingValue}?`
            },
            expectedAnswer: quotient,
            failureHints: {
                es: [
                    `Piensa: ¿${divisor} por cuánto da cerca de ${workingValue}?`,
                    `Prueba: ${divisor} × ${quotient - 1} = ${divisor * (quotient - 1)}`,
                    `La respuesta es ${quotient}.`
                ],
                en: [
                    `Think: ${divisor} times what gives close to ${workingValue}?`,
                    `Try: ${divisor} × ${quotient - 1} = ${divisor * (quotient - 1)}`,
                    `The answer is ${quotient}.`
                ]
            }
        });

        // Step 4: Write quotient
        steps.push({
            id: steps.length + 1,
            type: 'action',
            text: {
                es: `¡Perfecto! ${divisor} cabe ${quotient} veces en ${workingValue}. Escribimos ${quotient}.`,
                en: `Perfect! ${divisor} fits ${quotient} times into ${workingValue}. We write ${quotient}.`
            },
            boardDraw: { type: 'writeQuotient', value: quotient, index: 0 }
        });

        // Step 5: Ask for multiplication
        steps.push({
            id: steps.length + 1,
            type: 'question',
            text: {
                es: `Ahora multiplica: ¿Cuánto es ${divisor} × ${quotient}?`,
                en: `Now multiply: What is ${divisor} × ${quotient}?`
            },
            expectedAnswer: product,
            failureHints: {
                es: [
                    `Recuerda la tabla del ${divisor}.`,
                    `${divisor} × ${quotient} = ${product}`
                ],
                en: [
                    `Remember the ${divisor} times table.`,
                    `${divisor} × ${quotient} = ${product}`
                ]
            }
        });

        // Step 6: Write product
        steps.push({
            id: steps.length + 1,
            type: 'action',
            text: {
                es: `Correcto. ${divisor} × ${quotient} = ${product}. Lo escribimos debajo.`,
                en: `Correct. ${divisor} × ${quotient} = ${product}. We write it below.`
            },
            boardDraw: { type: 'writeProduct', value: product }
        });

        // Step 7: Ask for subtraction
        steps.push({
            id: steps.length + 1,
            type: 'question',
            text: {
                es: `Ahora resta: ¿Cuánto es ${workingValue} - ${product}?`,
                en: `Now subtract: What is ${workingValue} - ${product}?`
            },
            expectedAnswer: remainder,
            failureHints: {
                es: [
                    `Resta de arriba hacia abajo: ${workingValue} - ${product}`,
                    `${workingValue} - ${product} = ${remainder}`
                ],
                en: [
                    `Subtract from top to bottom: ${workingValue} - ${product}`,
                    `${workingValue} - ${product} = ${remainder}`
                ]
            }
        });

        // Step 8: Final result
        if (remainder === 0) {
            steps.push({
                id: steps.length + 1,
                type: 'explanation',
                text: {
                    es: `¡Excelente! ${workingValue} - ${product} = 0. La división es exacta. ${dividend} ÷ ${divisor} = ${quotient}`,
                    en: `Excellent! ${workingValue} - ${product} = 0. The division is exact. ${dividend} ÷ ${divisor} = ${quotient}`
                }
            });
        } else {
            steps.push({
                id: steps.length + 1,
                type: 'explanation',
                text: {
                    es: `Bien. ${workingValue} - ${product} = ${remainder}. El resultado es ${quotient} con residuo ${remainder}.`,
                    en: `Good. ${workingValue} - ${product} = ${remainder}. The result is ${quotient} with remainder ${remainder}.`
                },
                boardDraw: { type: 'writeRemainder', value: remainder }
            });
        }

        return steps;
    },

    // MULTIPLICATION (Standard Algorithm - Socratic)
    solveMultiplication: (factorA: number, factorB: number, method: 'standard' | 'box'): MathStep[] => {
        const steps: MathStep[] = [];

        // Step 1: Introduction
        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a multiplicar ${factorA} × ${factorB}.`,
                en: `Let's multiply ${factorA} × ${factorB}.`
            }
        });

        // For simplicity, handle single-digit × single-digit first
        if (factorA < 10 && factorB < 10) {
            const product = factorA * factorB;

            steps.push({
                id: 2,
                type: 'question',
                text: {
                    es: `¿Cuánto es ${factorA} por ${factorB}?`,
                    en: `What is ${factorA} times ${factorB}?`
                },
                expectedAnswer: product,
                failureHints: {
                    es: [
                        `Piensa en la tabla del ${factorA}.`,
                        `${factorA} × ${factorB} = ${product}`
                    ],
                    en: [
                        `Think of the ${factorA} times table.`,
                        `${factorA} × ${factorB} = ${product}`
                    ]
                }
            });

            steps.push({
                id: 3,
                type: 'explanation',
                text: {
                    es: `¡Correcto! ${factorA} × ${factorB} = ${product}`,
                    en: `Correct! ${factorA} × ${factorB} = ${product}`
                },
                boardDraw: { type: 'writeAnswer', value: product }
            });
        }

        return steps;
    },

    // ADDITION (Column Method with Carrying - Socratic)
    solveAddition: (num1: number, num2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a sumar ${num1} + ${num2}.`,
                en: `Let's add ${num1} + ${num2}.`
            }
        });

        const sum = num1 + num2;

        // Simple addition (no carrying for MVP)
        if (num1 < 100 && num2 < 100) {
            steps.push({
                id: 2,
                type: 'question',
                text: {
                    es: `¿Cuánto es ${num1} más ${num2}?`,
                    en: `What is ${num1} plus ${num2}?`
                },
                expectedAnswer: sum,
                failureHints: {
                    es: [
                        `Suma los números: ${num1} + ${num2}`,
                        `La respuesta es ${sum}`
                    ],
                    en: [
                        `Add the numbers: ${num1} + ${num2}`,
                        `The answer is ${sum}`
                    ]
                }
            });

            steps.push({
                id: 3,
                type: 'explanation',
                text: {
                    es: `¡Perfecto! ${num1} + ${num2} = ${sum}`,
                    en: `Perfect! ${num1} + ${num2} = ${sum}`
                },
                boardDraw: { type: 'writeAnswer', value: sum }
            });
        }

        return steps;
    },

    // SUBTRACTION (Borrowing/Regrouping - Socratic)
    solveSubtraction: (num1: number, num2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a restar ${num1} - ${num2}.`,
                en: `Let's subtract ${num1} - ${num2}.`
            }
        });

        const difference = num1 - num2;

        // Simple subtraction (no borrowing for MVP)
        if (num1 < 100 && num2 < 100 && difference >= 0) {
            steps.push({
                id: 2,
                type: 'question',
                text: {
                    es: `¿Cuánto es ${num1} menos ${num2}?`,
                    en: `What is ${num1} minus ${num2}?`
                },
                expectedAnswer: difference,
                failureHints: {
                    es: [
                        `Resta: ${num1} - ${num2}`,
                        `La respuesta es ${difference}`
                    ],
                    en: [
                        `Subtract: ${num1} - ${num2}`,
                        `The answer is ${difference}`
                    ]
                }
            });

            steps.push({
                id: 3,
                type: 'explanation',
                text: {
                    es: `¡Excelente! ${num1} - ${num2} = ${difference}`,
                    en: `Excellent! ${num1} - ${num2} = ${difference}`
                },
                boardDraw: { type: 'writeAnswer', value: difference }
            });
        }

        return steps;
    },

    // FRACTIONS - Addition (Socratic)
    solveFractionAddition: (num1: number, den1: number, num2: number, den2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a sumar ${num1}/${den1} + ${num2}/${den2}.`,
                en: `Let's add ${num1}/${den1} + ${num2}/${den2}.`
            }
        });

        // Check if denominators are equal
        if (den1 === den2) {
            const sum = num1 + num2;
            steps.push({
                id: 2,
                type: 'question',
                text: {
                    es: `Los denominadores son iguales (${den1}). ¿Cuánto es ${num1} + ${num2}?`,
                    en: `The denominators are equal (${den1}). What is ${num1} + ${num2}?`
                },
                expectedAnswer: sum,
                failureHints: {
                    es: [`Suma solo los numeradores: ${num1} + ${num2}`],
                    en: [`Add only the numerators: ${num1} + ${num2}`]
                }
            });

            steps.push({
                id: 3,
                type: 'explanation',
                text: {
                    es: `¡Correcto! ${num1}/${den1} + ${num2}/${den2} = ${sum}/${den1}`,
                    en: `Correct! ${num1}/${den1} + ${num2}/${den2} = ${sum}/${den1}`
                }
            });
        } else {
            // Find common denominator (simplified - just multiply)
            const commonDen = den1 * den2;
            const newNum1 = num1 * den2;
            const newNum2 = num2 * den1;

            steps.push({
                id: 2,
                type: 'explanation',
                text: {
                    es: `Los denominadores son diferentes. Necesitamos un denominador común: ${den1} × ${den2} = ${commonDen}`,
                    en: `The denominators are different. We need a common denominator: ${den1} × ${den2} = ${commonDen}`
                }
            });

            steps.push({
                id: 3,
                type: 'question',
                text: {
                    es: `Ahora suma: ${newNum1}/${commonDen} + ${newNum2}/${commonDen}. ¿Cuál es el numerador?`,
                    en: `Now add: ${newNum1}/${commonDen} + ${newNum2}/${commonDen}. What is the numerator?`
                },
                expectedAnswer: newNum1 + newNum2,
                failureHints: {
                    es: [`Suma los numeradores: ${newNum1} + ${newNum2}`],
                    en: [`Add the numerators: ${newNum1} + ${newNum2}`]
                }
            });
        }

        return steps;
    },

    // GEOMETRY - Area of Rectangle (Socratic)
    solveRectangleArea: (length: number, width: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a calcular el área de un rectángulo de ${length} × ${width}.`,
                en: `Let's calculate the area of a rectangle ${length} × ${width}.`
            }
        });

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `El área es largo × ancho. ¿Cuánto es ${length} × ${width}?`,
                en: `Area is length × width. What is ${length} × ${width}?`
            },
            expectedAnswer: length * width,
            failureHints: {
                es: [
                    `Multiplica: ${length} × ${width}`,
                    `El área es ${length * width} unidades cuadradas`
                ],
                en: [
                    `Multiply: ${length} × ${width}`,
                    `The area is ${length * width} square units`
                ]
            }
        });

        steps.push({
            id: 3,
            type: 'explanation',
            text: {
                es: `¡Perfecto! El área es ${length * width} unidades cuadradas.`,
                en: `Perfect! The area is ${length * width} square units.`
            }
        });

        return steps;
    },

    // GEOMETRY - Perimeter of Rectangle (Socratic)
    solveRectanglePerimeter: (length: number, width: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a calcular el perímetro de un rectángulo de ${length} × ${width}.`,
                en: `Let's calculate the perimeter of a rectangle ${length} × ${width}.`
            }
        });

        const perimeter = 2 * (length + width);

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `El perímetro es 2 × (largo + ancho). ¿Cuánto es ${length} + ${width}?`,
                en: `Perimeter is 2 × (length + width). What is ${length} + ${width}?`
            },
            expectedAnswer: length + width,
            failureHints: {
                es: [`Suma: ${length} + ${width} = ${length + width}`],
                en: [`Add: ${length} + ${width} = ${length + width}`]
            }
        });

        steps.push({
            id: 3,
            type: 'question',
            text: {
                es: `Ahora multiplica por 2: ¿Cuánto es 2 × ${length + width}?`,
                en: `Now multiply by 2: What is 2 × ${length + width}?`
            },
            expectedAnswer: perimeter,
            failureHints: {
                es: [`2 × ${length + width} = ${perimeter}`],
                en: [`2 × ${length + width} = ${perimeter}`]
            }
        });

        steps.push({
            id: 4,
            type: 'explanation',
            text: {
                es: `¡Excelente! El perímetro es ${perimeter} unidades.`,
                en: `Excellent! The perimeter is ${perimeter} units.`
            }
        });

        return steps;
    },

    // DECIMALS - Addition (Socratic)
    solveDecimalAddition: (num1: number, num2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a sumar ${num1} + ${num2}.`,
                en: `Let's add ${num1} + ${num2}.`
            }
        });

        const sum = num1 + num2;

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `Alinea los puntos decimales y suma. ¿Cuánto es ${num1} + ${num2}?`,
                en: `Align the decimal points and add. What is ${num1} + ${num2}?`
            },
            expectedAnswer: Math.round(sum * 100) / 100, // Round to 2 decimals
            failureHints: {
                es: [
                    `Suma como números normales, mantén el punto decimal`,
                    `La respuesta es ${sum.toFixed(2)}`
                ],
                en: [
                    `Add like normal numbers, keep the decimal point`,
                    `The answer is ${sum.toFixed(2)}`
                ]
            }
        });

        steps.push({
            id: 3,
            type: 'explanation',
            text: {
                es: `¡Correcto! ${num1} + ${num2} = ${sum.toFixed(2)}`,
                en: `Correct! ${num1} + ${num2} = ${sum.toFixed(2)}`
            }
        });

        return steps;
    },

    // WORD PROBLEMS - Simple (Socratic)
    solveWordProblem: (type: 'addition' | 'subtraction' | 'multiplication' | 'division', num1: number, num2: number, context: string): MathStep[] => {
        const steps: MathStep[] = [];

        const operations = {
            addition: { symbol: '+', result: num1 + num2, es: 'sumar', en: 'add' },
            subtraction: { symbol: '-', result: num1 - num2, es: 'restar', en: 'subtract' },
            multiplication: { symbol: '×', result: num1 * num2, es: 'multiplicar', en: 'multiply' },
            division: { symbol: '÷', result: Math.floor(num1 / num2), es: 'dividir', en: 'divide' }
        };

        const op = operations[type];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Problema: ${context}. Necesitamos ${op.es} ${num1} ${op.symbol} ${num2}.`,
                en: `Problem: ${context}. We need to ${op.en} ${num1} ${op.symbol} ${num2}.`
            }
        });

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `¿Cuánto es ${num1} ${op.symbol} ${num2}?`,
                en: `What is ${num1} ${op.symbol} ${num2}?`
            },
            expectedAnswer: op.result,
            failureHints: {
                es: [`Calcula: ${num1} ${op.symbol} ${num2} = ${op.result}`],
                en: [`Calculate: ${num1} ${op.symbol} ${num2} = ${op.result}`]
            }
        });

        steps.push({
            id: 3,
            type: 'explanation',
            text: {
                es: `¡Perfecto! La respuesta es ${op.result}.`,
                en: `Perfect! The answer is ${op.result}.`
            }
        });

        return steps;
    },

    // ADVANCED ADDITION - With Carrying (Socratic)
    solveAdditionWithCarrying: (num1: number, num2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a sumar ${num1} + ${num2} usando el método de columnas.`,
                en: `Let's add ${num1} + ${num2} using the column method.`
            }
        });

        const digits1 = num1.toString().split('').reverse().map(Number);
        const digits2 = num2.toString().split('').reverse().map(Number);
        let carry = 0;
        let currentPlace = 0;

        // Start with ones place
        const onesSum = digits1[0] + digits2[0];

        if (onesSum >= 10) {
            steps.push({
                id: 2,
                type: 'question',
                text: {
                    es: `Empecemos con las unidades: ${digits1[0]} + ${digits2[0]} = ?`,
                    en: `Let's start with the ones: ${digits1[0]} + ${digits2[0]} = ?`
                },
                expectedAnswer: onesSum,
                failureHints: {
                    es: [`${digits1[0]} + ${digits2[0]} = ${onesSum}`],
                    en: [`${digits1[0]} + ${digits2[0]} = ${onesSum}`]
                }
            });

            steps.push({
                id: 3,
                type: 'explanation',
                text: {
                    es: `Como ${onesSum} ≥ 10, escribimos ${onesSum % 10} y llevamos ${Math.floor(onesSum / 10)}.`,
                    en: `Since ${onesSum} ≥ 10, we write ${onesSum % 10} and carry ${Math.floor(onesSum / 10)}.`
                }
            });
        }

        const sum = num1 + num2;
        steps.push({
            id: 4,
            type: 'explanation',
            text: {
                es: `El resultado final es ${sum}.`,
                en: `The final result is ${sum}.`
            },
            boardDraw: { type: 'writeAnswer', value: sum }
        });

        return steps;
    },

    // ADVANCED SUBTRACTION - With Borrowing (Socratic)
    solveSubtractionWithBorrowing: (num1: number, num2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a restar ${num1} - ${num2} usando el método de columnas.`,
                en: `Let's subtract ${num1} - ${num2} using the column method.`
            }
        });

        const digits1 = num1.toString().split('').reverse().map(Number);
        const digits2 = num2.toString().split('').reverse().map(Number);

        // Check if borrowing is needed in ones place
        if (digits1[0] < digits2[0]) {
            steps.push({
                id: 2,
                type: 'explanation',
                text: {
                    es: `En las unidades: ${digits1[0]} < ${digits2[0]}, necesitamos pedir prestado.`,
                    en: `In the ones: ${digits1[0]} < ${digits2[0]}, we need to borrow.`
                }
            });

            const borrowed = digits1[0] + 10;
            steps.push({
                id: 3,
                type: 'question',
                text: {
                    es: `Después de pedir prestado, ${digits1[0]} se convierte en ${borrowed}. ¿Cuánto es ${borrowed} - ${digits2[0]}?`,
                    en: `After borrowing, ${digits1[0]} becomes ${borrowed}. What is ${borrowed} - ${digits2[0]}?`
                },
                expectedAnswer: borrowed - digits2[0],
                failureHints: {
                    es: [`${borrowed} - ${digits2[0]} = ${borrowed - digits2[0]}`],
                    en: [`${borrowed} - ${digits2[0]} = ${borrowed - digits2[0]}`]
                }
            });
        }

        const difference = num1 - num2;
        steps.push({
            id: 4,
            type: 'explanation',
            text: {
                es: `El resultado final es ${difference}.`,
                en: `The final result is ${difference}.`
            },
            boardDraw: { type: 'writeAnswer', value: difference }
        });

        return steps;
    },

    // MEASUREMENT - Time (Socratic)
    solveTimeProblem: (hours1: number, minutes1: number, hours2: number, minutes2: number, operation: 'add' | 'subtract'): MathStep[] => {
        const steps: MathStep[] = [];

        const time1 = `${hours1}:${minutes1.toString().padStart(2, '0')}`;
        const time2 = `${hours2}:${minutes2.toString().padStart(2, '0')}`;

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a ${operation === 'add' ? 'sumar' : 'restar'} tiempos: ${time1} ${operation === 'add' ? '+' : '-'} ${time2}.`,
                en: `Let's ${operation === 'add' ? 'add' : 'subtract'} times: ${time1} ${operation === 'add' ? '+' : '-'} ${time2}.`
            }
        });

        if (operation === 'add') {
            const totalMinutes = minutes1 + minutes2;
            const extraHours = Math.floor(totalMinutes / 60);
            const finalMinutes = totalMinutes % 60;
            const finalHours = hours1 + hours2 + extraHours;

            if (totalMinutes >= 60) {
                steps.push({
                    id: 2,
                    type: 'question',
                    text: {
                        es: `Suma los minutos: ${minutes1} + ${minutes2} = ?`,
                        en: `Add the minutes: ${minutes1} + ${minutes2} = ?`
                    },
                    expectedAnswer: totalMinutes,
                    failureHints: {
                        es: [`${minutes1} + ${minutes2} = ${totalMinutes}`],
                        en: [`${minutes1} + ${minutes2} = ${totalMinutes}`]
                    }
                });

                steps.push({
                    id: 3,
                    type: 'explanation',
                    text: {
                        es: `Como ${totalMinutes} ≥ 60, convertimos: ${finalMinutes} minutos y ${extraHours} hora(s) extra.`,
                        en: `Since ${totalMinutes} ≥ 60, we convert: ${finalMinutes} minutes and ${extraHours} extra hour(s).`
                    }
                });
            }

            steps.push({
                id: 4,
                type: 'explanation',
                text: {
                    es: `El tiempo total es ${finalHours}:${finalMinutes.toString().padStart(2, '0')}.`,
                    en: `The total time is ${finalHours}:${finalMinutes.toString().padStart(2, '0')}.`
                }
            });
        }

        return steps;
    },

    // MEASUREMENT - Money (Socratic)
    solveMoneyProblem: (amount1: number, amount2: number, operation: 'add' | 'subtract' | 'change'): MathStep[] => {
        const steps: MathStep[] = [];

        if (operation === 'change') {
            // Making change problem
            const change = amount1 - amount2;

            steps.push({
                id: 1,
                type: 'explanation',
                text: {
                    es: `Pagas con $${amount1.toFixed(2)} por algo que cuesta $${amount2.toFixed(2)}.`,
                    en: `You pay with $${amount1.toFixed(2)} for something that costs $${amount2.toFixed(2)}.`
                }
            });

            steps.push({
                id: 2,
                type: 'question',
                text: {
                    es: `¿Cuánto cambio recibes? ${amount1.toFixed(2)} - ${amount2.toFixed(2)} = ?`,
                    en: `How much change do you get? ${amount1.toFixed(2)} - ${amount2.toFixed(2)} = ?`
                },
                expectedAnswer: Math.round(change * 100) / 100,
                failureHints: {
                    es: [`Resta: ${amount1.toFixed(2)} - ${amount2.toFixed(2)} = ${change.toFixed(2)}`],
                    en: [`Subtract: ${amount1.toFixed(2)} - ${amount2.toFixed(2)} = ${change.toFixed(2)}`]
                }
            });

            steps.push({
                id: 3,
                type: 'explanation',
                text: {
                    es: `Tu cambio es $${change.toFixed(2)}.`,
                    en: `Your change is $${change.toFixed(2)}.`
                }
            });
        } else {
            const result = operation === 'add' ? amount1 + amount2 : amount1 - amount2;

            steps.push({
                id: 1,
                type: 'question',
                text: {
                    es: `¿Cuánto es $${amount1.toFixed(2)} ${operation === 'add' ? '+' : '-'} $${amount2.toFixed(2)}?`,
                    en: `What is $${amount1.toFixed(2)} ${operation === 'add' ? '+' : '-'} $${amount2.toFixed(2)}?`
                },
                expectedAnswer: Math.round(result * 100) / 100,
                failureHints: {
                    es: [`$${amount1.toFixed(2)} ${operation === 'add' ? '+' : '-'} $${amount2.toFixed(2)} = $${result.toFixed(2)}`],
                    en: [`$${amount1.toFixed(2)} ${operation === 'add' ? '+' : '-'} $${amount2.toFixed(2)} = $${result.toFixed(2)}`]
                }
            });

            steps.push({
                id: 2,
                type: 'explanation',
                text: {
                    es: `La respuesta es $${result.toFixed(2)}.`,
                    en: `The answer is $${result.toFixed(2)}.`
                }
            });
        }

        return steps;
    },

    // PATTERNS & SEQUENCES (Socratic)
    solvePattern: (sequence: number[], rule: string): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Observa este patrón: ${sequence.join(', ')}...`,
                en: `Look at this pattern: ${sequence.join(', ')}...`
            }
        });

        // Find the pattern (simple arithmetic sequence)
        const diff = sequence[1] - sequence[0];
        const nextNumber = sequence[sequence.length - 1] + diff;

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `¿Cuál es el siguiente número en el patrón?`,
                en: `What is the next number in the pattern?`
            },
            expectedAnswer: nextNumber,
            failureHints: {
                es: [
                    `Observa la diferencia entre números: ${diff}`,
                    `El siguiente número es ${nextNumber}`
                ],
                en: [
                    `Look at the difference between numbers: ${diff}`,
                    `The next number is ${nextNumber}`
                ]
            }
        });

        steps.push({
            id: 3,
            type: 'explanation',
            text: {
                es: `¡Correcto! El patrón suma ${diff} cada vez.`,
                en: `Correct! The pattern adds ${diff} each time.`
            }
        });

        return steps;
    },

    // FRACTIONS - Subtraction (Socratic)
    solveFractionSubtraction: (num1: number, den1: number, num2: number, den2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a restar ${num1}/${den1} - ${num2}/${den2}.`,
                en: `Let's subtract ${num1}/${den1} - ${num2}/${den2}.`
            }
        });

        if (den1 === den2) {
            const diff = num1 - num2;
            steps.push({
                id: 2,
                type: 'question',
                text: {
                    es: `Los denominadores son iguales. ¿Cuánto es ${num1} - ${num2}?`,
                    en: `The denominators are equal. What is ${num1} - ${num2}?`
                },
                expectedAnswer: diff,
                failureHints: {
                    es: [`Resta los numeradores: ${num1} - ${num2} = ${diff}`],
                    en: [`Subtract the numerators: ${num1} - ${num2} = ${diff}`]
                }
            });
        }

        return steps;
    },

    // FRACTIONS - Multiplication (Socratic)
    solveFractionMultiplication: (num1: number, den1: number, num2: number, den2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a multiplicar ${num1}/${den1} × ${num2}/${den2}.`,
                en: `Let's multiply ${num1}/${den1} × ${num2}/${den2}.`
            }
        });

        const numProduct = num1 * num2;
        const denProduct = den1 * den2;

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `Multiplica los numeradores: ${num1} × ${num2} = ?`,
                en: `Multiply the numerators: ${num1} × ${num2} = ?`
            },
            expectedAnswer: numProduct,
            failureHints: {
                es: [`${num1} × ${num2} = ${numProduct}`],
                en: [`${num1} × ${num2} = ${numProduct}`]
            }
        });

        steps.push({
            id: 3,
            type: 'explanation',
            text: {
                es: `El resultado es ${numProduct}/${denProduct}.`,
                en: `The result is ${numProduct}/${denProduct}.`
            }
        });

        return steps;
    },

    // GEOMETRY - Triangle Area (Socratic)
    solveTriangleArea: (base: number, height: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a calcular el área de un triángulo con base ${base} y altura ${height}.`,
                en: `Let's calculate the area of a triangle with base ${base} and height ${height}.`
            }
        });

        const product = base * height;
        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `Primero multiplica: ${base} × ${height} = ?`,
                en: `First multiply: ${base} × ${height} = ?`
            },
            expectedAnswer: product,
            failureHints: {
                es: [`${base} × ${height} = ${product}`],
                en: [`${base} × ${height} = ${product}`]
            }
        });

        const area = product / 2;
        steps.push({
            id: 3,
            type: 'question',
            text: {
                es: `Ahora divide entre 2: ${product} ÷ 2 = ?`,
                en: `Now divide by 2: ${product} ÷ 2 = ?`
            },
            expectedAnswer: area,
            failureHints: {
                es: [`El área del triángulo es ${area} unidades cuadradas`],
                en: [`The triangle area is ${area} square units`]
            }
        });

        return steps;
    },

    // GEOMETRY - Circle Area (Socratic)
    solveCircleArea: (radius: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a calcular el área de un círculo con radio ${radius}.`,
                en: `Let's calculate the area of a circle with radius ${radius}.`
            }
        });

        const rSquared = radius * radius;
        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `Primero calcula r²: ${radius} × ${radius} = ?`,
                en: `First calculate r²: ${radius} × ${radius} = ?`
            },
            expectedAnswer: rSquared,
            failureHints: {
                es: [`${radius} × ${radius} = ${rSquared}`],
                en: [`${radius} × ${radius} = ${rSquared}`]
            }
        });

        const area = Math.round(Math.PI * rSquared * 100) / 100;
        steps.push({
            id: 3,
            type: 'explanation',
            text: {
                es: `Ahora multiplica por π (3.14): El área es aproximadamente ${area} unidades cuadradas.`,
                en: `Now multiply by π (3.14): The area is approximately ${area} square units.`
            }
        });

        return steps;
    },

    // DATA & STATISTICS - Mean (Average) (Socratic)
    solveMean: (numbers: number[]): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a calcular la media (promedio) de: ${numbers.join(', ')}.`,
                en: `Let's calculate the mean (average) of: ${numbers.join(', ')}.`
            }
        });

        const sum = numbers.reduce((a, b) => a + b, 0);
        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `Primero suma todos los números: ${numbers.join(' + ')} = ?`,
                en: `First add all the numbers: ${numbers.join(' + ')} = ?`
            },
            expectedAnswer: sum,
            failureHints: {
                es: [`La suma es ${sum}`],
                en: [`The sum is ${sum}`]
            }
        });

        const mean = Math.round((sum / numbers.length) * 100) / 100;
        steps.push({
            id: 3,
            type: 'question',
            text: {
                es: `Ahora divide entre ${numbers.length}: ${sum} ÷ ${numbers.length} = ?`,
                en: `Now divide by ${numbers.length}: ${sum} ÷ ${numbers.length} = ?`
            },
            expectedAnswer: mean,
            failureHints: {
                es: [`La media es ${mean}`],
                en: [`The mean is ${mean}`]
            }
        });

        return steps;
    },

    // DATA & STATISTICS - Median (Socratic)
    solveMedian: (numbers: number[]): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a encontrar la mediana de: ${numbers.join(', ')}.`,
                en: `Let's find the median of: ${numbers.join(', ')}.`
            }
        });

        const sorted = [...numbers].sort((a, b) => a - b);
        steps.push({
            id: 2,
            type: 'explanation',
            text: {
                es: `Primero ordenamos: ${sorted.join(', ')}.`,
                en: `First we sort: ${sorted.join(', ')}.`
            }
        });

        const middle = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 === 0
            ? (sorted[middle - 1] + sorted[middle]) / 2
            : sorted[middle];

        steps.push({
            id: 3,
            type: 'explanation',
            text: {
                es: `La mediana (número del medio) es ${median}.`,
                en: `The median (middle number) is ${median}.`
            }
        });

        return steps;
    },

    // ADVANCED - Prime Numbers (Socratic)
    solvePrimeCheck: (number: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a verificar si ${number} es un número primo.`,
                en: `Let's check if ${number} is a prime number.`
            }
        });

        const isPrime = (n: number) => {
            if (n <= 1) return false;
            if (n <= 3) return true;
            if (n % 2 === 0 || n % 3 === 0) return false;
            for (let i = 5; i * i <= n; i += 6) {
                if (n % i === 0 || n % (i + 2) === 0) return false;
            }
            return true;
        };

        if (number % 2 === 0 && number !== 2) {
            steps.push({
                id: 2,
                type: 'explanation',
                text: {
                    es: `${number} es divisible entre 2, entonces NO es primo.`,
                    en: `${number} is divisible by 2, so it's NOT prime.`
                }
            });
        } else {
            const result = isPrime(number);
            steps.push({
                id: 2,
                type: 'explanation',
                text: {
                    es: `${number} ${result ? 'SÍ' : 'NO'} es un número primo.`,
                    en: `${number} ${result ? 'IS' : 'is NOT'} a prime number.`
                }
            });
        }

        return steps;
    },

    // ADVANCED - Factors (Socratic)
    solveFactors: (number: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a encontrar los factores de ${number}.`,
                en: `Let's find the factors of ${number}.`
            }
        });

        const factors: number[] = [];
        for (let i = 1; i <= number; i++) {
            if (number % i === 0) factors.push(i);
        }

        steps.push({
            id: 2,
            type: 'explanation',
            text: {
                es: `Los factores de ${number} son: ${factors.join(', ')}.`,
                en: `The factors of ${number} are: ${factors.join(', ')}.`
            }
        });

        return steps;
    },

    // ADVANCED - Order of Operations (PEMDAS) (Socratic)
    solveOrderOfOperations: (expression: string, result: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a resolver: ${expression} usando PEMDAS.`,
                en: `Let's solve: ${expression} using PEMDAS.`
            }
        });

        steps.push({
            id: 2,
            type: 'explanation',
            text: {
                es: `PEMDAS: Paréntesis, Exponentes, Multiplicación/División, Adición/Sustracción.`,
                en: `PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction.`
            }
        });

        steps.push({
            id: 3,
            type: 'question',
            text: {
                es: `¿Cuál es el resultado de ${expression}?`,
                en: `What is the result of ${expression}?`
            },
            expectedAnswer: result,
            failureHints: {
                es: [`Recuerda el orden PEMDAS`, `El resultado es ${result}`],
                en: [`Remember PEMDAS order`, `The result is ${result}`]
            }
        });

        return steps;
    },

    // DECIMALS - Multiplication (Socratic)
    solveDecimalMultiplication: (num1: number, num2: number): MathStep[] => {
        const steps: MathStep[] = [];

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a multiplicar ${num1} × ${num2}.`,
                en: `Let's multiply ${num1} × ${num2}.`
            }
        });

        const product = Math.round(num1 * num2 * 100) / 100;

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `¿Cuánto es ${num1} × ${num2}?`,
                en: `What is ${num1} × ${num2}?`
            },
            expectedAnswer: product,
            failureHints: {
                es: [`Multiplica y cuenta los decimales`, `${num1} × ${num2} = ${product}`],
                en: [`Multiply and count the decimals`, `${num1} × ${num2} = ${product}`]
            }
        });

        return steps;
    },

    // MEASUREMENT - Length Conversion (Socratic)
    solveLengthConversion: (value: number, fromUnit: string, toUnit: string): MathStep[] => {
        const steps: MathStep[] = [];

        const conversions: Record<string, number> = {
            'cm_m': 100,
            'm_cm': 0.01,
            'm_km': 1000,
            'km_m': 0.001
        };

        const key = `${fromUnit}_${toUnit}`;
        const factor = conversions[key] || 1;
        const result = Math.round(value * factor * 100) / 100;

        steps.push({
            id: 1,
            type: 'explanation',
            text: {
                es: `Vamos a convertir ${value} ${fromUnit} a ${toUnit}.`,
                en: `Let's convert ${value} ${fromUnit} to ${toUnit}.`
            }
        });

        steps.push({
            id: 2,
            type: 'question',
            text: {
                es: `¿Cuántos ${toUnit} son ${value} ${fromUnit}?`,
                en: `How many ${toUnit} are ${value} ${fromUnit}?`
            },
            expectedAnswer: result,
            failureHints: {
                es: [`La respuesta es ${result} ${toUnit}`],
                en: [`The answer is ${result} ${toUnit}`]
            }
        });

        return steps;
    }
};
