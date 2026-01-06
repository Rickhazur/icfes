import type { TutorReport } from "@/types/tutor";

// Grade-appropriate vocabulary and responses
export const gradeVocabulary: Record<number, { words: string[]; phrases: string[]; grammarFocus: string[] }> = {
  1: {
    words: ["cat", "dog", "sun", "moon", "book", "ball", "red", "blue", "big", "small", "happy", "sad", "run", "jump", "eat", "drink"],
    phrases: ["I am", "You are", "This is", "What is", "I like", "I see", "I have", "It is"],
    grammarFocus: ["Simple present tense", "Basic nouns", "Colors", "Numbers 1-20", "Simple adjectives"],
  },
  2: {
    words: ["friend", "family", "school", "teacher", "apple", "water", "house", "animal", "plant", "weather", "today", "yesterday"],
    phrases: ["I want to", "Can I have", "Do you like", "Where is the", "I am going to", "She is", "He is", "They are"],
    grammarFocus: ["Present progressive", "Simple questions", "Plurals", "Basic prepositions", "Days of the week"],
  },
  3: {
    words: ["environment", "community", "celebration", "discovery", "adventure", "imagination", "character", "problem", "solution", "describe"],
    phrases: ["In my opinion", "I think that", "For example", "First, then, finally", "Because of", "Even though"],
    grammarFocus: ["Past simple tense", "Conjunctions", "Comparative adjectives", "Sequence words", "Paragraphs"],
  },
  4: {
    words: ["hypothesis", "experiment", "evidence", "conclusion", "perspective", "analyze", "compare", "contrast", "significant", "demonstrate"],
    phrases: ["According to", "In addition", "On the other hand", "As a result", "In conclusion", "For instance"],
    grammarFocus: ["Past progressive", "Passive voice basics", "Complex sentences", "Cause and effect", "Essay structure"],
  },
  5: {
    words: ["interpretation", "synthesis", "evaluation", "methodology", "phenomenon", "implication", "substantial", "predominant", "coherent", "elaborate"],
    phrases: ["Furthermore", "Nevertheless", "Consequently", "In contrast to", "With regard to", "It can be concluded that"],
    grammarFocus: ["Perfect tenses", "Conditional sentences", "Complex passive", "Academic vocabulary", "Research writing"],
  },
};

// Ollie's personality traits by context
export const ollieResponses = {
  greetings: {
    1: ["Hi friend! 🌟", "Hello! Ready to learn? 🦉", "Yay, you're here! 🎉"],
    2: ["Hey there, buddy! 🌈", "Hello! Let's have fun learning! 📚", "Great to see you! 🦉"],
    3: ["Hello! Ready for today's adventure? 🚀", "Hi there! Let's explore English together! 📖", "Welcome back! 🌟"],
    4: ["Hello! Excited to learn something new today? 💡", "Hi! Let's tackle some challenges! 🎯", "Great to have you here! 📚"],
    5: ["Hello! Ready for an engaging lesson? 🎓", "Hi there! Let's dive into today's topic! 🌊", "Welcome! Time to expand your skills! ✨"],
  },
  encouragement: {
    1: ["Super job! ⭐", "Wow, you did it! 🎉", "Yay! You're amazing! 🌟", "Great work! 👏"],
    2: ["Excellent! Keep going! 🚀", "You're doing great! 💪", "Fantastic work! 🌈", "Well done! 🎯"],
    3: ["Impressive work! You're improving! 📈", "Great thinking! 🧠", "You're on fire! 🔥", "Excellent effort! ⭐"],
    4: ["Outstanding! Your skills are growing! 🌱", "Brilliant analysis! 💎", "You're mastering this! 🏆", "Excellent reasoning! 🎯"],
    5: ["Exceptional work! 🌟", "Your understanding is impressive! 💡", "Sophisticated thinking! 🎓", "You're excelling! 🏅"],
  },
  correction: {
    1: ["Oops! Let's try again! 😊", "Almost! Here's a hint... 💡", "Good try! Let me help! 🤝"],
    2: ["Close! Let's figure it out together! 🔍", "Not quite, but you're thinking! 🧠", "Let's practice this one more time! 📝"],
    3: ["Interesting approach! Let's refine it. 🔧", "You're on the right track! Let me explain... 📖", "Good effort! Here's what we can improve... ✨"],
    4: ["That's a common challenge! Let me clarify... 📚", "I see your reasoning! Let's adjust... 🔄", "Good attempt! Consider this perspective... 💭"],
    5: ["Thoughtful response! Let's analyze further... 🔬", "You're close! Let's examine the nuances... 🎯", "Solid thinking! Here's additional context... 📖"],
  },
};

// Generate personalized lesson based on reports
export const generatePersonalizedContent = (
  reports: TutorReport[],
  gradeLevel: number,
  focusArea?: string
): { topic: string; vocabulary: string[]; exercise: string; tips: string[] } => {
  const gradeContent = gradeVocabulary[gradeLevel] || gradeVocabulary[3];

  // Extract challenges from reports
  const allChallenges = reports.flatMap(r => r.challenges);
  const priorityChallenge = focusArea
    ? allChallenges.find(c => c.area.toLowerCase().includes(focusArea.toLowerCase()))
    : allChallenges.find(c => c.severity === "high") || allChallenges[0];

  if (priorityChallenge) {
    return {
      topic: priorityChallenge.englishConnection,
      vocabulary: gradeContent.words.slice(0, 6),
      exercise: `Let's practice ${priorityChallenge.englishConnection} to help with ${priorityChallenge.area} in ${reports.find(r => r.challenges.includes(priorityChallenge))?.subject || "your studies"}!`,
      tips: [
        `Focus on: ${priorityChallenge.englishConnection}`,
        `This will help you with: ${priorityChallenge.description}`,
        `Grade ${gradeLevel} goal: ${gradeContent.grammarFocus[0]}`,
      ],
    };
  }

  return {
    topic: gradeContent.grammarFocus[0],
    vocabulary: gradeContent.words.slice(0, 6),
    exercise: `Today we'll work on ${gradeContent.grammarFocus[0]}!`,
    tips: gradeContent.grammarFocus.slice(0, 3),
  };
};

// Get Ollie's response based on grade and context
export const getOllieResponse = (
  gradeLevel: number,
  context: "greeting" | "encouragement" | "correction",
): string => {
  const responses = ollieResponses[context === "greeting" ? "greetings" : context];
  const gradeResponses = responses[gradeLevel as keyof typeof responses] || responses[3];
  return gradeResponses[Math.floor(Math.random() * gradeResponses.length)];
};

// Sample reports for demo
export const sampleTutorReports: TutorReport[] = [
  {
    id: "1",
    source: "research-center",
    subject: "Science",
    emoji: "🔬",
    date: new Date().toISOString(),
    overallScore: 72,
    trend: "up",
    challenges: [
      {
        id: "c1",
        area: "Scientific Vocabulary",
        severity: "high",
        description: "Struggles with scientific terms like 'hypothesis' and 'experiment'",
        englishConnection: "Academic vocabulary practice",
      },
      {
        id: "c2",
        area: "Lab Report Writing",
        severity: "medium",
        description: "Difficulty writing clear conclusions",
        englishConnection: "Sentence structure and clarity",
      },
    ],
    recommendations: [
      "Practice science-related vocabulary daily",
      "Work on writing complete sentences",
      "Use visual aids for complex terms",
    ],
  },
  {
    id: "2",
    source: "math-tutor",
    subject: "Mathematics",
    emoji: "🧮",
    date: new Date().toISOString(),
    overallScore: 65,
    trend: "stable",
    challenges: [
      {
        id: "c3",
        area: "Word Problems",
        severity: "high",
        description: "Difficulty understanding math word problems in English",
        englishConnection: "Reading comprehension for math",
      },
      {
        id: "c4",
        area: "Instructions",
        severity: "medium",
        description: "Misunderstands multi-step instructions",
        englishConnection: "Sequence words and imperative verbs",
      },
    ],
    recommendations: [
      "Focus on keywords in word problems",
      "Practice step-by-step instructions",
      "Learn math vocabulary in English",
    ],
  },
  {
    id: "3",
    source: "research-center",
    subject: "Social Studies",
    emoji: "🌍",
    date: new Date().toISOString(),
    overallScore: 58,
    trend: "down",
    challenges: [
      {
        id: "c5",
        area: "Historical Dates",
        severity: "medium",
        description: "Confuses date formats and ordinal numbers",
        englishConnection: "Ordinal numbers and date expressions",
      },
      {
        id: "c6",
        area: "Essay Writing",
        severity: "high",
        description: "Struggles with cause-and-effect explanations",
        englishConnection: "Conjunctions and transition words",
      },
    ],
    recommendations: [
      "Practice writing dates in English format",
      "Learn cause-effect connectors",
      "Work on paragraph organization",
    ],
  },
];
