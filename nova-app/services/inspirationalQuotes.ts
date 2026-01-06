// services/inspirationalQuotes.ts
// Motivational quotes for students

export interface Quote {
    text: string;
    author?: string;
}

const quotesES: Quote[] = [
    { text: "¡Los errores son prueba de que lo estás intentando!", author: "Anónimo" },
    { text: "Cada problema que resuelves te hace más fuerte.", author: "Nova" },
    { text: "Las matemáticas son como un superpoder secreto.", author: "Nova" },
    { text: "No importa qué tan lento vayas, siempre y cuando no te detengas.", author: "Confucio" },
    { text: "Eres más valiente de lo que crees y más inteligente de lo que piensas.", author: "A.A. Milne" },
    { text: "El único error real es aquel del que no aprendemos nada.", author: "Henry Ford" },
    { text: "¡Hoy es un gran día para aprender algo nuevo!", author: "Nova" },
    { text: "Tu cerebro es como un músculo: mientras más lo usas, más fuerte se vuelve.", author: "Nova" },
    { text: "Cada experto fue una vez un principiante.", author: "Helen Hayes" },
    { text: "La práctica no te hace perfecto, te hace mejor.", author: "Nova" },
    { text: "¡Tú puedes con esto y con mucho más!", author: "Nova" },
    { text: "Las estrellas no pueden brillar sin oscuridad.", author: "D.H. Sidebottom" },
    { text: "Cree en ti mismo y todo será posible.", author: "Anónimo" },
    { text: "Los grandes logros requieren tiempo y paciencia.", author: "Anónimo" },
    { text: "Cada día es una nueva oportunidad para aprender.", author: "Nova" },
    { text: "¡Tu esfuerzo de hoy es tu éxito de mañana!", author: "Nova" },
    { text: "No te rindas, el comienzo siempre es lo más difícil.", author: "Anónimo" },
    { text: "Aprende de ayer, vive el hoy, ten esperanza para mañana.", author: "Albert Einstein" },
    { text: "El conocimiento es poder.", author: "Francis Bacon" },
    { text: "¡Eres increíble tal como eres!", author: "Nova" },
];

const quotesEN: Quote[] = [
    { text: "Mistakes are proof that you're trying!", author: "Anonymous" },
    { text: "Every problem you solve makes you stronger.", author: "Nova" },
    { text: "Math is like a secret superpower.", author: "Nova" },
    { text: "It doesn't matter how slowly you go, as long as you don't stop.", author: "Confucius" },
    { text: "You're braver than you believe and smarter than you think.", author: "A.A. Milne" },
    { text: "The only real mistake is the one from which we learn nothing.", author: "Henry Ford" },
    { text: "Today is a great day to learn something new!", author: "Nova" },
    { text: "Your brain is like a muscle: the more you use it, the stronger it gets.", author: "Nova" },
    { text: "Every expert was once a beginner.", author: "Helen Hayes" },
    { text: "Practice doesn't make perfect, it makes you better.", author: "Nova" },
    { text: "You can do this and so much more!", author: "Nova" },
    { text: "Stars can't shine without darkness.", author: "D.H. Sidebottom" },
    { text: "Believe in yourself and anything is possible.", author: "Anonymous" },
    { text: "Great achievements require time and patience.", author: "Anonymous" },
    { text: "Every day is a new opportunity to learn.", author: "Nova" },
    { text: "Your effort today is your success tomorrow!", author: "Nova" },
    { text: "Don't give up, the beginning is always the hardest.", author: "Anonymous" },
    { text: "Learn from yesterday, live for today, hope for tomorrow.", author: "Albert Einstein" },
    { text: "Knowledge is power.", author: "Francis Bacon" },
    { text: "You're amazing just the way you are!", author: "Nova" },
];

/**
 * Get a random inspirational quote
 * @param language - 'es' or 'en'
 * @returns A random quote object
 */
export function getRandomQuote(language: 'es' | 'en' = 'es'): Quote {
    const quotes = language === 'es' ? quotesES : quotesEN;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

/**
 * Get the first name from a full name
 * @param fullName - Full name (e.g., "Luna García")
 * @returns First name only (e.g., "Luna")
 */
export function getFirstName(fullName: string | undefined): string {
    if (!fullName) return '';

    // Split by space and take the first part
    const parts = fullName.trim().split(/\s+/);
    return parts[0];
}

/**
 * Format a quote for display
 * @param quote - Quote object
 * @param language - 'es' or 'en'
 * @returns Formatted quote string
 */
export function formatQuote(quote: Quote, language: 'es' | 'en' = 'es'): string {
    if (quote.author) {
        return language === 'es'
            ? `"${quote.text}" - ${quote.author}`
            : `"${quote.text}" - ${quote.author}`;
    }
    return `"${quote.text}"`;
}
