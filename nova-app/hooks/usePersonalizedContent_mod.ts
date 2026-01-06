import { useMemo } from "react";
import type { TutorReport } from "@/types/tutor";
import { gradeVocabulary } from "@/lib/olliePersonality_mod";

// Personalized vocabulary based on tutor reports and grade level
export interface PersonalizedVocabulary {
  word: string;
  definition: string;
  example: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  sourceChallenge?: string;
  imageUrl?: string;
}

export interface PersonalizedSentence {
  sentence: string;
  translation?: string;
  focusArea: string;
  grammarPoint: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface PersonalizedContent {
  vocabulary: PersonalizedVocabulary[];
  sentences: PersonalizedSentence[];
  focusAreas: string[];
  gradeLevel: number;
  challenges: Array<{ area: string; englishConnection: string; severity: string }>;
}

// Vocabulary banks organized by challenge areas
const challengeVocabulary: Record<string, PersonalizedVocabulary[]> = {
  "Scientific Vocabulary": [
    { word: "hypothesis", definition: "An educated guess about what will happen", example: "My hypothesis is that plants need sunlight to grow.", category: "science", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400" },
    { word: "experiment", definition: "A test to find out if something is true", example: "We did an experiment with magnets.", category: "science", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400" },
    { word: "observation", definition: "Watching something carefully to learn about it", example: "My observation is that ice melts in heat.", category: "science", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1516339901600-2e1a62986307?auto=format&fit=crop&q=80&w=400" },
    { word: "conclusion", definition: "What you decide after thinking about facts", example: "Our conclusion is that water evaporates.", category: "science", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1454165833267-fe36323bc310?auto=format&fit=crop&q=80&w=400" },
    { word: "evidence", definition: "Facts that prove something is true", example: "The evidence shows plants grow toward light.", category: "science", difficulty: "hard", imageUrl: "https://images.unsplash.com/photo-1582719501235-953cf9533bca?auto=format&fit=crop&q=80&w=400" },
    { word: "laboratory", definition: "A room where scientists do experiments", example: "We went to the laboratory to see microscopes.", category: "science", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=400" },
    { word: "microscope", definition: "A tool that makes tiny things look bigger", example: "I looked at cells through a microscope.", category: "science", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400" },
    { word: "procedure", definition: "The steps you follow to do something", example: "Follow the procedure to complete the experiment.", category: "science", difficulty: "hard", imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
  ],
  "Word Problems": [
    { word: "total", definition: "The whole amount or number", example: "The total of 5 and 3 is 8.", category: "math", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&q=80&w=400" },
    { word: "difference", definition: "How much more or less one number is than another", example: "The difference between 10 and 6 is 4.", category: "math", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1460662136037-3fd94646702e?auto=format&fit=crop&q=80&w=400" },
    { word: "altogether", definition: "All together, combined", example: "How many do we have altogether?", category: "math", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=400" },
    { word: "remaining", definition: "What is left over after taking some away", example: "5 cookies remaining after eating 3.", category: "math", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1499195333224-3ce974eecfb4?auto=format&fit=crop&q=80&w=400" },
    { word: "each", definition: "Every one separately", example: "Each student gets 2 pencils.", category: "math", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=400" },
    { word: "equal", definition: "The same in amount or value", example: "Both sides must be equal.", category: "math", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1614849286521-4c58b2f0ff15?auto=format&fit=crop&q=80&w=400" },
    { word: "divide", definition: "To split into equal parts", example: "Divide 12 cookies among 4 friends.", category: "math", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400" },
    { word: "multiply", definition: "To add a number to itself many times", example: "Multiply 3 by 4 to get 12.", category: "math", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400" },
  ],
  "Historical Dates": [
    { word: "century", definition: "A period of 100 years", example: "The 21st century started in 2001.", category: "history", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400" },
    { word: "decade", definition: "A period of 10 years", example: "A decade ago means 10 years ago.", category: "history", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=400" },
    { word: "ancient", definition: "Very, very old, from long ago", example: "Ancient Egypt had pyramids.", category: "history", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=400" },
    { word: "modern", definition: "From recent times, not old", example: "Modern cars use computers.", category: "history", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&q=80&w=400" },
    { word: "timeline", definition: "A line showing events in order", example: "The timeline shows when things happened.", category: "history", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400" },
    { word: "era", definition: "A long period of time in history", example: "The dinosaur era was millions of years ago.", category: "history", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1523853983214-b42021319904?auto=format&fit=crop&q=80&w=400" },
  ],
  "Essay Writing": [
    { word: "paragraph", definition: "A group of sentences about one idea", example: "Each paragraph should have one main idea.", category: "writing", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400" },
    { word: "introduction", definition: "The beginning that tells what you will write about", example: "Start with an introduction to your topic.", category: "writing", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&q=80&w=400" },
    { word: "conclusion", definition: "The ending that summarizes your ideas", example: "The conclusion wraps up your essay.", category: "writing", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1450101496173-eb4ae5119ba4?auto=format&fit=crop&q=80&w=400" },
    { word: "therefore", definition: "For this reason, so", example: "It was raining, therefore we stayed inside.", category: "writing", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=400" },
    { word: "however", definition: "But, on the other hand", example: "I wanted to go, however it was too late.", category: "writing", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=400" },
    { word: "furthermore", definition: "In addition, also", example: "Furthermore, the project was fun.", category: "writing", difficulty: "hard", imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400" },
  ],
  "Lab Report Writing": [
    { word: "method", definition: "The way you do something", example: "The method explains how we did the experiment.", category: "science", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400" },
    { word: "result", definition: "What happened after an experiment", example: "The result showed the plant grew taller.", category: "science", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { word: "data", definition: "Facts and numbers you collect", example: "We recorded the data in a table.", category: "science", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400" },
    { word: "analyze", definition: "To study something carefully to understand it", example: "We analyze the results to learn what happened.", category: "science", difficulty: "hard", imageUrl: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=400" },
  ],
  "Instructions": [
    { word: "first", definition: "Before anything else", example: "First, wash your hands.", category: "sequence", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" },
    { word: "then", definition: "After that, next", example: "Then, open the book.", category: "sequence", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1544640808-32ca72ac7f67?auto=format&fit=crop&q=80&w=400" },
    { word: "finally", definition: "At the end, last of all", example: "Finally, check your answers.", category: "sequence", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=400" },
    { word: "meanwhile", definition: "At the same time", example: "Meanwhile, mix the other ingredients.", category: "sequence", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400" },
    { word: "afterward", definition: "After something else happens", example: "Afterward, clean up your workspace.", category: "sequence", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400" },
  ],
};

// Sentences organized by challenge areas
const challengeSentences: Record<string, PersonalizedSentence[]> = {
  "Academic vocabulary practice": [
    { sentence: "The scientist made a hypothesis before the experiment.", focusArea: "Science", grammarPoint: "Past simple", difficulty: "medium" },
    { sentence: "We need evidence to prove our conclusion.", focusArea: "Science", grammarPoint: "Infinitive", difficulty: "medium" },
    { sentence: "The laboratory has many microscopes for students.", focusArea: "Science", grammarPoint: "Has/Have", difficulty: "easy" },
    { sentence: "Our observation shows that ice melts quickly.", focusArea: "Science", grammarPoint: "Present simple", difficulty: "medium" },
  ],
  "Reading comprehension for math": [
    { sentence: "If Sara has 12 apples and gives 5 to Tom, how many remain?", focusArea: "Math", grammarPoint: "Conditional + Question", difficulty: "medium" },
    { sentence: "Each student will receive 3 pencils.", focusArea: "Math", grammarPoint: "Future simple", difficulty: "easy" },
    { sentence: "The total cost of the items is twenty dollars.", focusArea: "Math", grammarPoint: "Present simple", difficulty: "easy" },
    { sentence: "Divide the candies equally among the four children.", focusArea: "Math", grammarPoint: "Imperative", difficulty: "medium" },
  ],
  "Sentence structure and clarity": [
    { sentence: "The experiment was successful because we followed the steps.", focusArea: "Writing", grammarPoint: "Cause and effect", difficulty: "medium" },
    { sentence: "First, we mixed the chemicals. Then, we observed the reaction.", focusArea: "Writing", grammarPoint: "Sequence words", difficulty: "easy" },
    { sentence: "Although the weather was cold, we completed the outdoor activity.", focusArea: "Writing", grammarPoint: "Complex sentence", difficulty: "hard" },
  ],
  "Sequence words and imperative verbs": [
    { sentence: "First, read the instructions carefully.", focusArea: "Instructions", grammarPoint: "Imperative", difficulty: "easy" },
    { sentence: "Next, gather all your materials.", focusArea: "Instructions", grammarPoint: "Imperative", difficulty: "easy" },
    { sentence: "Then, follow the steps in order.", focusArea: "Instructions", grammarPoint: "Imperative", difficulty: "easy" },
    { sentence: "Finally, check your work for mistakes.", focusArea: "Instructions", grammarPoint: "Imperative", difficulty: "easy" },
    { sentence: "Meanwhile, the teacher will prepare the next activity.", focusArea: "Instructions", grammarPoint: "Future simple", difficulty: "medium" },
  ],
  "Ordinal numbers and date expressions": [
    { sentence: "The first day of school is in September.", focusArea: "Dates", grammarPoint: "Ordinal numbers", difficulty: "easy" },
    { sentence: "Independence Day is on the fourth of July.", focusArea: "Dates", grammarPoint: "Date format", difficulty: "easy" },
    { sentence: "The twentieth century ended in the year 2000.", focusArea: "Dates", grammarPoint: "Ordinal + Past", difficulty: "medium" },
    { sentence: "My birthday is on the third of May.", focusArea: "Dates", grammarPoint: "Date format", difficulty: "easy" },
  ],
  "Conjunctions and transition words": [
    { sentence: "The rain stopped, so we went outside to play.", focusArea: "Writing", grammarPoint: "Cause/Effect", difficulty: "easy" },
    { sentence: "She studied hard; therefore, she passed the test.", focusArea: "Writing", grammarPoint: "Formal transition", difficulty: "hard" },
    { sentence: "However, the second attempt was more successful.", focusArea: "Writing", grammarPoint: "Contrast", difficulty: "medium" },
    { sentence: "Furthermore, the project helped us learn teamwork.", focusArea: "Writing", grammarPoint: "Addition", difficulty: "hard" },
    { sentence: "Because it was raining, we stayed indoors.", focusArea: "Writing", grammarPoint: "Cause clause", difficulty: "medium" },
  ],
};

// Grade-specific vocabulary additions
const gradeSpecificVocabulary: Record<number, PersonalizedVocabulary[]> = {
  1: [
    { word: "big", definition: "Large in size", example: "The elephant is big.", category: "adjectives", difficulty: "easy" },
    { word: "small", definition: "Little in size", example: "The ant is small.", category: "adjectives", difficulty: "easy" },
    { word: "happy", definition: "Feeling good and joyful", example: "I am happy today!", category: "feelings", difficulty: "easy" },
  ],
  2: [
    { word: "amazing", definition: "Very surprising and wonderful", example: "The magic trick was amazing!", category: "adjectives", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=400" },
    { word: "curious", definition: "Wanting to know more", example: "I am curious about space.", category: "feelings", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" },
    { word: "explore", definition: "To travel and discover new things", example: "Let's explore the forest.", category: "verbs", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400" },
  ],
  3: [
    { word: "brilliant", definition: "Very smart or very bright", example: "She had a brilliant idea.", category: "adjectives", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=400" },
    { word: "discover", definition: "To find something new", example: "Scientists discover new things.", category: "verbs", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&q=80&w=400" },
    { word: "imagine", definition: "To picture something in your mind", example: "Imagine you can fly!", category: "verbs", difficulty: "easy", imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=400" },
  ],
  4: [
    { word: "fascinating", definition: "Extremely interesting", example: "The documentary was fascinating.", category: "adjectives", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?auto=format&fit=crop&q=80&w=400" },
    { word: "investigate", definition: "To study something carefully", example: "Detectives investigate mysteries.", category: "verbs", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=400" },
    { word: "consequence", definition: "The result of an action", example: "Breaking rules has consequences.", category: "nouns", difficulty: "medium", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" },
  ],
  5: [
    { word: "extraordinary", definition: "Very unusual and special", example: "She has extraordinary talent.", category: "adjectives", difficulty: "hard", imageUrl: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=400" },
    { word: "synthesize", definition: "To combine different things to create something new", example: "We synthesize information from many sources.", category: "verbs", difficulty: "hard", imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=400" },
    { word: "elaborate", definition: "To explain in more detail", example: "Please elaborate on your answer.", category: "verbs", difficulty: "hard", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400" },
  ],
};

// Map broad subjects to vocabulary bank keys
const SUBJECT_MAP: Record<string, string[]> = {
  "science": ["Scientific Vocabulary", "Lab Report Writing"],
  "mathematics": ["Word Problems", "Instructions"],
  "math": ["Word Problems", "Instructions"],
  "social studies": ["Historical Dates", "Essay Writing"],
  "history": ["Historical Dates", "Essay Writing"],
  "writing": ["Essay Writing", "Lab Report Writing"],
};

export const usePersonalizedContent = (
  tutorReports: TutorReport[],
  gradeLevel: number
): PersonalizedContent => {
  return useMemo(() => {
    const vocabulary: PersonalizedVocabulary[] = [];
    const sentences: PersonalizedSentence[] = [];
    const focusAreas: string[] = [];
    const challenges: PersonalizedContent["challenges"] = [];

    // Extract challenges and subject vocabulary from tutor reports
    tutorReports.forEach(report => {
      // 1. Add vocabulary based on the overall report subject
      const subjectKey = report.subject.toLowerCase();
      const banks = SUBJECT_MAP[subjectKey];
      if (banks) {
        banks.forEach(bankKey => {
          const bankVocab = challengeVocabulary[bankKey];
          if (bankVocab) {
            vocabulary.push(...bankVocab.map(v => ({ ...v, sourceChallenge: `Subject: ${report.subject}` })));
          }
        });
      }

      // 2. Add specific challenge vocabulary
      report.challenges.forEach(challenge => {
        challenges.push({
          area: challenge.area,
          englishConnection: challenge.englishConnection,
          severity: challenge.severity,
        });

        if (!focusAreas.includes(challenge.englishConnection)) {
          focusAreas.push(challenge.englishConnection);
        }

        // Add vocabulary for this specific challenge area if it matches a bank
        const areaVocab = challengeVocabulary[challenge.area];
        if (areaVocab) {
          vocabulary.push(...areaVocab.map(v => ({ ...v, sourceChallenge: challenge.area })));
        }

        // Add sentences for this english connection
        const areaSentences = challengeSentences[challenge.englishConnection];
        if (areaSentences) {
          sentences.push(...areaSentences);
        }
      });
    });

    // Add grade-specific vocabulary
    const gradeVocab = gradeSpecificVocabulary[gradeLevel];
    if (gradeVocab) {
      vocabulary.push(...gradeVocab);
    }

    // Add general grade vocabulary from olliePersonality
    const gradeContent = gradeVocabulary[gradeLevel];
    if (gradeContent) {
      gradeContent.words.forEach((word, idx) => {
        if (!vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase())) {
          vocabulary.push({
            word,
            definition: `A ${gradeLevel}${gradeLevel === 1 ? 'st' : gradeLevel === 2 ? 'nd' : gradeLevel === 3 ? 'rd' : 'th'} grade vocabulary word`,
            example: `I know the word "${word}".`,
            category: "general",
            difficulty: idx < 5 ? "easy" : idx < 10 ? "medium" : "hard",
          });
        }
      });

      // Add grade-appropriate sentences
      gradeContent.phrases.forEach(phrase => {
        sentences.push({
          sentence: `${phrase} very important for learning.`,
          focusArea: "General",
          grammarPoint: gradeContent.grammarFocus[0] || "Grammar",
          difficulty: gradeLevel <= 2 ? "easy" : gradeLevel <= 4 ? "medium" : "hard",
        });
      });
    }

    // Remove duplicates
    const uniqueVocabulary = vocabulary.filter((v, i, arr) =>
      arr.findIndex(item => item.word.toLowerCase() === v.word.toLowerCase()) === i
    );

    const uniqueSentences = sentences.filter((s, i, arr) =>
      arr.findIndex(item => item.sentence === s.sentence) === i
    );

    return {
      vocabulary: uniqueVocabulary,
      sentences: uniqueSentences,
      focusAreas,
      gradeLevel,
      challenges,
    };
  }, [tutorReports, gradeLevel]);
};

// Helper to get vocabulary for a specific activity
export const getActivityVocabulary = (
  content: PersonalizedContent,
  activityType: string,
  count: number = 10
): PersonalizedVocabulary[] => {
  const shuffled = [...content.vocabulary].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper to get sentences for a specific activity
export const getActivitySentences = (
  content: PersonalizedContent,
  activityType: string,
  count: number = 5
): PersonalizedSentence[] => {
  const shuffled = [...content.sentences].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Generate grade-appropriate context sentence for a word
export const generateGradeContextSentence = (
  word: string,
  definition: string,
  gradeLevel: number
): string => {
  const templates: Record<number, string[]> = {
    1: [
      `I see a ${word.toLowerCase()}.`,
      `The ${word.toLowerCase()} is fun!`,
      `Look at the ${word.toLowerCase()}!`,
    ],
    2: [
      `We learned about ${word.toLowerCase()} today.`,
      `The ${word.toLowerCase()} is very interesting.`,
      `Can you explain what ${word.toLowerCase()} means?`,
    ],
    3: [
      `The ${word.toLowerCase()} helps us understand the topic better.`,
      `We used ${word.toLowerCase()} in our class project.`,
      `My teacher taught us about ${word.toLowerCase()} today.`,
    ],
    4: [
      `Understanding ${word.toLowerCase()} is important for our studies.`,
      `The scientist explained what ${word.toLowerCase()} means.`,
      `We discovered that ${word.toLowerCase()} plays a key role.`,
    ],
    5: [
      `The concept of ${word.toLowerCase()} is fundamental to this subject.`,
      `By analyzing ${word.toLowerCase()}, we gained deeper insights.`,
      `Researchers emphasize the importance of ${word.toLowerCase()}.`,
    ],
  };

  const gradeTemplates = templates[gradeLevel] || templates[3];
  return gradeTemplates[Math.floor(Math.random() * gradeTemplates.length)];
};

// Generate quiz questions from personalized content
export const generatePersonalizedQuizQuestions = (
  content: PersonalizedContent,
  count: number = 5
) => {
  const questions: Array<{
    id: string;
    type: "multiple-choice" | "fill-blank";
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    skill: "grammar" | "vocabulary";
    difficulty: "easy" | "medium" | "hard";
  }> = [];

  // Generate vocabulary questions
  const vocabSample = getActivityVocabulary(content, "quiz", Math.ceil(count / 2));
  vocabSample.forEach((vocab, idx) => {
    const wrongOptions = content.vocabulary
      .filter(v => v.word !== vocab.word)
      .map(v => v.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    questions.push({
      id: `pq-vocab-${idx}`,
      type: "multiple-choice",
      question: `What does "${vocab.word}" mean?`,
      options: [vocab.definition, ...wrongOptions].sort(() => Math.random() - 0.5),
      correctAnswer: vocab.definition,
      explanation: `"${vocab.word}" means ${vocab.definition}. Example: ${vocab.example}`,
      skill: "vocabulary",
      difficulty: vocab.difficulty,
    });
  });

  // Generate sentence-based questions
  const sentenceSample = getActivitySentences(content, "quiz", Math.floor(count / 2));
  sentenceSample.forEach((sent, idx) => {
    questions.push({
      id: `pq-sent-${idx}`,
      type: "fill-blank",
      question: `Complete the sentence using ${sent.grammarPoint}: "${sent.sentence.split(" ").slice(0, 3).join(" ")} ___"`,
      correctAnswer: sent.sentence.split(" ").slice(3).join(" "),
      explanation: `This sentence practices ${sent.grammarPoint}. Full sentence: ${sent.sentence}`,
      skill: "grammar",
      difficulty: sent.difficulty,
    });
  });

  return questions.sort(() => Math.random() - 0.5).slice(0, count);
};

// Generate flashcards from personalized content
export const generatePersonalizedFlashcards = (content: PersonalizedContent) => {
  return content.vocabulary.map((vocab, idx) => ({
    id: `pfc-${idx}`,
    front: `What does "${vocab.word}" mean?`,
    back: `${vocab.definition}\n\nExample: ${vocab.example}`,
    category: vocab.category,
    difficulty: vocab.difficulty,
    correctCount: 0,
    incorrectCount: 0,
  }));
};

export default usePersonalizedContent;
