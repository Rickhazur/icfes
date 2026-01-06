import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, CheckCircle2, XCircle, ChevronRight, ArrowLeft, Trophy, Star, Sparkles, RotateCcw, MessageCircle, Loader2, BookOpen, Zap, Brain, Target, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";
import { generateGradeContextSentence } from "@/hooks/usePersonalizedContent_mod";

interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "fill-blank" | "reorder" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  skill: "grammar" | "vocabulary" | "reading" | "writing";
  difficulty: "easy" | "medium" | "hard";
  word?: string;
  example?: string;
}

interface PracticeQuizProps {
  title?: string;
  questions?: QuizQuestion[];
  timed?: boolean;
  timeLimit?: number;
  onComplete: (score: number, totalCoins: number) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
}

// Speak function for pronunciation
const speakText = (text: string, rate: number = 0.8) => {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
};

// Quiz topic templates for AI generation
const quizTopics = [
  { id: "verbs", label: "Verbs & Tenses", icon: Zap, description: "Past, present, future tenses" },
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen, description: "New words and meanings" },
  { id: "grammar", label: "Grammar Rules", icon: Brain, description: "Sentence structure, articles" },
  { id: "reading", label: "Reading Comprehension", icon: Target, description: "Understanding texts" },
  { id: "custom", label: "Custom Topic", icon: MessageCircle, description: "Tell me what you want!" },
];

// AI-powered question generation based on custom topic
const generateCustomQuestions = (prompt: string): QuizQuestion[] => {
  const lowerPrompt = prompt.toLowerCase();
  const questions: QuizQuestion[] = [];
  
  // Detect topic keywords and generate relevant questions
  const topicPatterns = [
    // Animals
    { keywords: ["animal", "animals", "pet", "pets", "dog", "cat", "bird", "zoo"], generator: generateAnimalQuestions },
    // Food
    { keywords: ["food", "eat", "eating", "fruit", "vegetable", "cook", "kitchen", "meal"], generator: generateFoodQuestions },
    // Colors
    { keywords: ["color", "colors", "colour", "colours", "red", "blue", "green"], generator: generateColorQuestions },
    // Family
    { keywords: ["family", "mother", "father", "sister", "brother", "parent", "relative"], generator: generateFamilyQuestions },
    // School
    { keywords: ["school", "class", "classroom", "teacher", "student", "learn", "study"], generator: generateSchoolQuestions },
    // Weather/Nature
    { keywords: ["weather", "rain", "sun", "cloud", "nature", "season", "summer", "winter"], generator: generateWeatherQuestions },
    // Sports
    { keywords: ["sport", "sports", "play", "game", "soccer", "football", "basketball", "swim"], generator: generateSportsQuestions },
    // Body parts
    { keywords: ["body", "head", "hand", "foot", "arm", "leg", "face", "eye"], generator: generateBodyQuestions },
    // Clothes
    { keywords: ["clothes", "clothing", "wear", "shirt", "pants", "dress", "shoe"], generator: generateClothesQuestions },
    // House/Home
    { keywords: ["house", "home", "room", "bedroom", "kitchen", "bathroom", "living"], generator: generateHouseQuestions },
    // Numbers/Math
    { keywords: ["number", "numbers", "count", "counting", "math", "add", "subtract"], generator: generateNumberQuestions },
    // Days/Time
    { keywords: ["day", "days", "week", "month", "time", "clock", "hour", "minute", "monday", "tuesday"], generator: generateTimeQuestions },
    // Feelings/Emotions
    { keywords: ["feeling", "feelings", "emotion", "happy", "sad", "angry", "scared", "emotion"], generator: generateFeelingQuestions },
    // Travel/Places
    { keywords: ["travel", "trip", "vacation", "place", "city", "country", "visit", "go to"], generator: generateTravelQuestions },
    // Jobs/Professions
    { keywords: ["job", "jobs", "work", "profession", "doctor", "teacher", "police", "firefighter"], generator: generateJobQuestions },
  ];

  // Find matching topic
  for (const pattern of topicPatterns) {
    if (pattern.keywords.some(kw => lowerPrompt.includes(kw))) {
      return pattern.generator();
    }
  }

  // Default: generate general mixed questions based on keywords in prompt
  return generateGeneralQuestions(prompt);
};

// Topic-specific question generators
const generateAnimalQuestions = (): QuizQuestion[] => [
  { id: "a1", type: "multiple-choice", question: "What animal says 'woof'?", options: ["Cat", "Dog", "Bird", "Fish"], correctAnswer: "Dog", explanation: "Dogs bark and say 'woof woof'!", skill: "vocabulary", difficulty: "easy" },
  { id: "a2", type: "multiple-choice", question: "Which animal can fly?", options: ["Dog", "Cat", "Bird", "Fish"], correctAnswer: "Bird", explanation: "Birds have wings that allow them to fly.", skill: "vocabulary", difficulty: "easy" },
  { id: "a3", type: "fill-blank", question: "A baby cat is called a ___.", correctAnswer: "kitten", explanation: "A kitten is a young cat, just like a puppy is a young dog.", skill: "vocabulary", difficulty: "easy" },
  { id: "a4", type: "multiple-choice", question: "Where do fish live?", options: ["In trees", "In water", "In the sky", "Underground"], correctAnswer: "In water", explanation: "Fish breathe underwater using gills.", skill: "vocabulary", difficulty: "easy" },
  { id: "a5", type: "multiple-choice", question: "What is the plural of 'mouse'?", options: ["Mouses", "Mice", "Mouse", "Mousies"], correctAnswer: "Mice", explanation: "Mouse → Mice is an irregular plural.", skill: "grammar", difficulty: "medium" },
  { id: "a6", type: "fill-blank", question: "The lion ___ (live) in Africa.", correctAnswer: "lives", explanation: "With 'the lion' (singular), we add -s to the verb.", skill: "grammar", difficulty: "easy" },
  { id: "a7", type: "multiple-choice", question: "Which sentence is correct?", options: ["The dogs is running.", "The dog are running.", "The dogs are running.", "The dog running."], correctAnswer: "The dogs are running.", explanation: "Plural subject 'dogs' needs 'are' not 'is'.", skill: "grammar", difficulty: "medium" },
  { id: "a8", type: "multiple-choice", question: "What does 'enormous' mean when describing an elephant?", options: ["Very small", "Very big", "Very fast", "Very loud"], correctAnswer: "Very big", explanation: "Enormous means very large or huge.", skill: "vocabulary", difficulty: "easy" },
  { id: "a9", type: "fill-blank", question: "Yesterday, I ___ (see) a beautiful butterfly.", correctAnswer: "saw", explanation: "'Saw' is the past tense of 'see'.", skill: "grammar", difficulty: "medium" },
  { id: "a10", type: "multiple-choice", question: "A group of fish is called a...", options: ["Herd", "Pack", "School", "Flock"], correctAnswer: "School", explanation: "A group of fish swimming together is called a school.", skill: "vocabulary", difficulty: "medium" },
  { id: "a11", type: "reorder", question: "Put the words in order:", options: ["cat", "The", "is", "sleeping"], correctAnswer: ["The", "cat", "is", "sleeping"], explanation: "The cat is sleeping - Subject + Verb + Present Participle", skill: "grammar", difficulty: "easy" },
  { id: "a12", type: "multiple-choice", question: "Which animal is a mammal?", options: ["Snake", "Whale", "Frog", "Lizard"], correctAnswer: "Whale", explanation: "Whales are mammals - they breathe air and feed milk to babies.", skill: "vocabulary", difficulty: "hard" },
  { id: "a13", type: "fill-blank", question: "Birds ___ (have) feathers and wings.", correctAnswer: "have", explanation: "Plural subject 'birds' uses 'have' not 'has'.", skill: "grammar", difficulty: "easy" },
  { id: "a14", type: "multiple-choice", question: "What is the opposite of 'wild'?", options: ["Tame", "Fast", "Big", "Loud"], correctAnswer: "Tame", explanation: "Wild animals live in nature; tame animals are domesticated.", skill: "vocabulary", difficulty: "medium" },
  { id: "a15", type: "multiple-choice", question: "What sound does a cow make?", options: ["Meow", "Woof", "Moo", "Tweet"], correctAnswer: "Moo", explanation: "Cows say 'moo'.", skill: "vocabulary", difficulty: "easy" },
  { id: "a16", type: "fill-blank", question: "The tiger ___ (run) very fast yesterday.", correctAnswer: "ran", explanation: "'Ran' is the past tense of 'run'.", skill: "grammar", difficulty: "medium" },
  { id: "a17", type: "multiple-choice", question: "Which word describes how a snake moves?", options: ["Hop", "Slither", "Gallop", "Fly"], correctAnswer: "Slither", explanation: "Snakes slither because they have no legs.", skill: "vocabulary", difficulty: "medium" },
  { id: "a18", type: "reorder", question: "Make a question:", options: ["you", "Do", "pets", "have", "any", "?"], correctAnswer: ["Do", "you", "have", "any", "pets", "?"], explanation: "Do + subject + verb + object", skill: "grammar", difficulty: "medium" },
  { id: "a19", type: "multiple-choice", question: "A baby dog is called a...", options: ["Kitten", "Puppy", "Cub", "Chick"], correctAnswer: "Puppy", explanation: "Baby dogs are called puppies.", skill: "vocabulary", difficulty: "easy" },
  { id: "a20", type: "fill-blank", question: "My pet rabbit ___ (eat) carrots every day.", correctAnswer: "eats", explanation: "Third person singular 'rabbit' needs 'eats'.", skill: "grammar", difficulty: "easy" },
  { id: "a21", type: "multiple-choice", question: "Which animal has stripes?", options: ["Lion", "Elephant", "Zebra", "Giraffe"], correctAnswer: "Zebra", explanation: "Zebras have black and white stripes.", skill: "vocabulary", difficulty: "easy" },
  { id: "a22", type: "multiple-choice", question: "What do we call a person who takes care of sick animals?", options: ["Doctor", "Veterinarian", "Teacher", "Chef"], correctAnswer: "Veterinarian", explanation: "A veterinarian (or vet) is an animal doctor.", skill: "vocabulary", difficulty: "medium" },
  { id: "a23", type: "fill-blank", question: "The birds ___ (fly) south in winter.", correctAnswer: "fly", explanation: "Plural 'birds' uses base form 'fly'.", skill: "grammar", difficulty: "easy" },
  { id: "a24", type: "multiple-choice", question: "Which animal lives in the Arctic and is white?", options: ["Polar bear", "Brown bear", "Panda", "Koala"], correctAnswer: "Polar bear", explanation: "Polar bears live in the Arctic and have white fur.", skill: "vocabulary", difficulty: "easy" },
  { id: "a25", type: "short-answer", question: "Write a sentence about your favorite animal.", correctAnswer: "animal", explanation: "Great job writing about animals!", skill: "writing", difficulty: "medium" },
];

const generateFoodQuestions = (): QuizQuestion[] => [
  { id: "f1", type: "multiple-choice", question: "Which food is a fruit?", options: ["Carrot", "Apple", "Bread", "Cheese"], correctAnswer: "Apple", explanation: "Apples grow on trees and have seeds - they are fruits!", skill: "vocabulary", difficulty: "easy" },
  { id: "f2", type: "fill-blank", question: "I ___ (eat) breakfast every morning.", correctAnswer: "eat", explanation: "With 'I', we use the base form of the verb.", skill: "grammar", difficulty: "easy" },
  { id: "f3", type: "multiple-choice", question: "What is the plural of 'tomato'?", options: ["Tomatos", "Tomatoes", "Tomatoies", "Tomato"], correctAnswer: "Tomatoes", explanation: "Words ending in 'o' often add 'es' for plural.", skill: "grammar", difficulty: "medium" },
  { id: "f4", type: "multiple-choice", question: "Which meal do we eat in the morning?", options: ["Lunch", "Dinner", "Breakfast", "Snack"], correctAnswer: "Breakfast", explanation: "Breakfast is the first meal of the day, in the morning.", skill: "vocabulary", difficulty: "easy" },
  { id: "f5", type: "fill-blank", question: "She ___ (cook) dinner right now.", correctAnswer: "is cooking", explanation: "Present continuous for actions happening now: is + verb-ing.", skill: "grammar", difficulty: "medium" },
  { id: "f6", type: "multiple-choice", question: "What does 'delicious' mean?", options: ["Bad taste", "No taste", "Very good taste", "Sour"], correctAnswer: "Very good taste", explanation: "Delicious describes food that tastes very good.", skill: "vocabulary", difficulty: "easy" },
  { id: "f7", type: "reorder", question: "Put the words in order:", options: ["pizza", "loves", "She", "eating"], correctAnswer: ["She", "loves", "eating", "pizza"], explanation: "Subject + Verb + Gerund + Object", skill: "grammar", difficulty: "medium" },
  { id: "f8", type: "multiple-choice", question: "Which food comes from cows?", options: ["Eggs", "Milk", "Honey", "Bread"], correctAnswer: "Milk", explanation: "Cows produce milk. Eggs come from chickens.", skill: "vocabulary", difficulty: "easy" },
  { id: "f9", type: "fill-blank", question: "Yesterday, we ___ (have) pizza for dinner.", correctAnswer: "had", explanation: "'Had' is the past tense of 'have'.", skill: "grammar", difficulty: "easy" },
  { id: "f10", type: "multiple-choice", question: "What is the opposite of 'sweet'?", options: ["Sour", "Hot", "Cold", "Soft"], correctAnswer: "Sour", explanation: "Sweet and sour are opposite tastes.", skill: "vocabulary", difficulty: "easy" },
  { id: "f11", type: "multiple-choice", question: "Which is a vegetable?", options: ["Banana", "Orange", "Carrot", "Strawberry"], correctAnswer: "Carrot", explanation: "Carrots are vegetables that grow underground.", skill: "vocabulary", difficulty: "easy" },
  { id: "f12", type: "fill-blank", question: "There ___ some milk in the fridge.", correctAnswer: "is", explanation: "Milk is uncountable, so we use 'is' not 'are'.", skill: "grammar", difficulty: "medium" },
  { id: "f13", type: "multiple-choice", question: "What utensil do we use to eat soup?", options: ["Fork", "Knife", "Spoon", "Chopsticks"], correctAnswer: "Spoon", explanation: "We use a spoon to eat liquid foods like soup.", skill: "vocabulary", difficulty: "easy" },
  { id: "f14", type: "multiple-choice", question: "Which sentence is correct?", options: ["I don't like vegetables.", "I doesn't like vegetables.", "I not like vegetables.", "I no like vegetables."], correctAnswer: "I don't like vegetables.", explanation: "With 'I', we use 'don't' for negatives.", skill: "grammar", difficulty: "easy" },
  { id: "f15", type: "fill-blank", question: "How ___ apples do you want?", correctAnswer: "many", explanation: "Use 'many' with countable nouns (apples).", skill: "grammar", difficulty: "easy" },
  { id: "f16", type: "multiple-choice", question: "What do you call the first course of a meal?", options: ["Dessert", "Main course", "Appetizer", "Snack"], correctAnswer: "Appetizer", explanation: "An appetizer is a small dish before the main meal.", skill: "vocabulary", difficulty: "medium" },
  { id: "f17", type: "reorder", question: "Make a sentence:", options: ["ice cream", "want", "I", "some"], correctAnswer: ["I", "want", "some", "ice cream"], explanation: "Subject + Verb + Determiner + Object", skill: "grammar", difficulty: "easy" },
  { id: "f18", type: "fill-blank", question: "How ___ sugar do you need?", correctAnswer: "much", explanation: "Use 'much' with uncountable nouns (sugar).", skill: "grammar", difficulty: "medium" },
  { id: "f19", type: "multiple-choice", question: "Which food is made from wheat?", options: ["Rice", "Bread", "Potato", "Corn"], correctAnswer: "Bread", explanation: "Bread is made from wheat flour.", skill: "vocabulary", difficulty: "medium" },
  { id: "f20", type: "multiple-choice", question: "What meal do we eat at night?", options: ["Breakfast", "Lunch", "Dinner", "Brunch"], correctAnswer: "Dinner", explanation: "Dinner is the evening meal.", skill: "vocabulary", difficulty: "easy" },
  { id: "f21", type: "fill-blank", question: "The soup ___ (taste) delicious!", correctAnswer: "tastes", explanation: "Singular 'soup' needs 'tastes' with -s.", skill: "grammar", difficulty: "easy" },
  { id: "f22", type: "multiple-choice", question: "What does 'spicy' describe?", options: ["Cold food", "Sweet food", "Hot/peppery food", "Sour food"], correctAnswer: "Hot/peppery food", explanation: "Spicy food has peppers and makes your mouth feel hot.", skill: "vocabulary", difficulty: "easy" },
  { id: "f23", type: "fill-blank", question: "Would you like ___ orange?", correctAnswer: "an", explanation: "Use 'an' before vowel sounds (orange).", skill: "grammar", difficulty: "easy" },
  { id: "f24", type: "multiple-choice", question: "Where do we usually cook food?", options: ["Bedroom", "Bathroom", "Kitchen", "Garden"], correctAnswer: "Kitchen", explanation: "The kitchen is the room for cooking.", skill: "vocabulary", difficulty: "easy" },
  { id: "f25", type: "short-answer", question: "What is your favorite food? Write a sentence.", correctAnswer: "favorite", explanation: "Great job describing your favorite food!", skill: "writing", difficulty: "easy" },
];

const generateColorQuestions = (): QuizQuestion[] => [
  { id: "c1", type: "multiple-choice", question: "What color is the sky on a sunny day?", options: ["Red", "Green", "Blue", "Yellow"], correctAnswer: "Blue", explanation: "The sky appears blue during the day.", skill: "vocabulary", difficulty: "easy" },
  { id: "c2", type: "multiple-choice", question: "What color do you get when you mix red and yellow?", options: ["Purple", "Orange", "Green", "Pink"], correctAnswer: "Orange", explanation: "Red + Yellow = Orange", skill: "vocabulary", difficulty: "easy" },
  { id: "c3", type: "fill-blank", question: "Grass ___ (be) green.", correctAnswer: "is", explanation: "Singular 'grass' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "c4", type: "multiple-choice", question: "What color do you get when you mix blue and yellow?", options: ["Orange", "Purple", "Green", "Brown"], correctAnswer: "Green", explanation: "Blue + Yellow = Green", skill: "vocabulary", difficulty: "easy" },
  { id: "c5", type: "multiple-choice", question: "What color is a banana?", options: ["Red", "Blue", "Yellow", "Purple"], correctAnswer: "Yellow", explanation: "Ripe bananas are yellow.", skill: "vocabulary", difficulty: "easy" },
  { id: "c6", type: "fill-blank", question: "The roses ___ (be) red.", correctAnswer: "are", explanation: "Plural 'roses' uses 'are'.", skill: "grammar", difficulty: "easy" },
  { id: "c7", type: "multiple-choice", question: "What color represents 'stop' in traffic lights?", options: ["Green", "Yellow", "Red", "Blue"], correctAnswer: "Red", explanation: "Red means stop, green means go.", skill: "vocabulary", difficulty: "easy" },
  { id: "c8", type: "reorder", question: "Put the words in order:", options: ["is", "blue", "The", "car"], correctAnswer: ["The", "car", "is", "blue"], explanation: "The + Noun + Verb + Adjective", skill: "grammar", difficulty: "easy" },
  { id: "c9", type: "multiple-choice", question: "What color do you get when you mix red and blue?", options: ["Green", "Orange", "Purple", "Brown"], correctAnswer: "Purple", explanation: "Red + Blue = Purple", skill: "vocabulary", difficulty: "easy" },
  { id: "c10", type: "fill-blank", question: "Snow ___ (be) white.", correctAnswer: "is", explanation: "Singular 'snow' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "c11", type: "multiple-choice", question: "What color is a typical school bus?", options: ["Blue", "Red", "Yellow", "Green"], correctAnswer: "Yellow", explanation: "School buses are typically yellow for visibility.", skill: "vocabulary", difficulty: "easy" },
  { id: "c12", type: "multiple-choice", question: "Which color is associated with nature and plants?", options: ["Red", "Blue", "Green", "Yellow"], correctAnswer: "Green", explanation: "Green represents nature, plants, and the environment.", skill: "vocabulary", difficulty: "easy" },
  { id: "c13", type: "fill-blank", question: "My favorite color ___ (be) purple.", correctAnswer: "is", explanation: "Singular 'color' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "c14", type: "multiple-choice", question: "What are black and white together called?", options: ["Colorful", "Monochrome", "Rainbow", "Pastel"], correctAnswer: "Monochrome", explanation: "Monochrome means using only black, white, and gray.", skill: "vocabulary", difficulty: "hard" },
  { id: "c15", type: "reorder", question: "Make a sentence:", options: ["favorite", "What", "your", "is", "color", "?"], correctAnswer: ["What", "is", "your", "favorite", "color", "?"], explanation: "Question word + is + possessive + adjective + noun", skill: "grammar", difficulty: "medium" },
  { id: "c16", type: "multiple-choice", question: "What color is chocolate?", options: ["White", "Brown", "Black", "Yellow"], correctAnswer: "Brown", explanation: "Most chocolate is brown.", skill: "vocabulary", difficulty: "easy" },
  { id: "c17", type: "fill-blank", question: "These flowers ___ (be) pink and beautiful.", correctAnswer: "are", explanation: "Plural 'flowers' uses 'are'.", skill: "grammar", difficulty: "easy" },
  { id: "c18", type: "multiple-choice", question: "A rainbow has how many main colors?", options: ["5", "6", "7", "8"], correctAnswer: "7", explanation: "Rainbow: Red, Orange, Yellow, Green, Blue, Indigo, Violet.", skill: "vocabulary", difficulty: "medium" },
  { id: "c19", type: "multiple-choice", question: "What color is the sun often drawn as?", options: ["Blue", "Green", "Yellow", "Purple"], correctAnswer: "Yellow", explanation: "The sun is typically drawn as yellow or orange.", skill: "vocabulary", difficulty: "easy" },
  { id: "c20", type: "fill-blank", question: "The ocean ___ (look) blue and beautiful.", correctAnswer: "looks", explanation: "Singular 'ocean' needs 'looks' with -s.", skill: "grammar", difficulty: "easy" },
  { id: "c21", type: "multiple-choice", question: "What does 'colorful' mean?", options: ["No colors", "Many bright colors", "Only black", "Only white"], correctAnswer: "Many bright colors", explanation: "Colorful means having many different bright colors.", skill: "vocabulary", difficulty: "easy" },
  { id: "c22", type: "multiple-choice", question: "Which is NOT a primary color?", options: ["Red", "Blue", "Green", "Yellow"], correctAnswer: "Green", explanation: "Primary colors are Red, Blue, and Yellow. Green is secondary.", skill: "vocabulary", difficulty: "medium" },
  { id: "c23", type: "fill-blank", question: "I ___ (like) the color blue best.", correctAnswer: "like", explanation: "With 'I', use the base form.", skill: "grammar", difficulty: "easy" },
  { id: "c24", type: "multiple-choice", question: "What color are most leaves in autumn?", options: ["Green", "Blue", "Orange/Brown", "Purple"], correctAnswer: "Orange/Brown", explanation: "Leaves change to orange, red, and brown in fall.", skill: "vocabulary", difficulty: "easy" },
  { id: "c25", type: "short-answer", question: "Describe something using a color. Example: The red apple.", correctAnswer: "color", explanation: "Great use of color adjectives!", skill: "writing", difficulty: "easy" },
];

const generateFamilyQuestions = (): QuizQuestion[] => [
  { id: "fam1", type: "multiple-choice", question: "What do you call your mother's mother?", options: ["Aunt", "Grandmother", "Sister", "Cousin"], correctAnswer: "Grandmother", explanation: "Your mother's mother is your grandmother.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam2", type: "fill-blank", question: "My father's brother is my ___.", correctAnswer: "uncle", explanation: "Your parent's brother is your uncle.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam3", type: "multiple-choice", question: "What is the plural of 'family'?", options: ["Familys", "Families", "Familyes", "Family"], correctAnswer: "Families", explanation: "Words ending in 'y' change to 'ies' for plural.", skill: "grammar", difficulty: "easy" },
  { id: "fam4", type: "multiple-choice", question: "What do you call your aunt's son?", options: ["Brother", "Uncle", "Cousin", "Nephew"], correctAnswer: "Cousin", explanation: "Your aunt or uncle's children are your cousins.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam5", type: "fill-blank", question: "She ___ (have) two brothers and one sister.", correctAnswer: "has", explanation: "With 'she', use 'has' not 'have'.", skill: "grammar", difficulty: "easy" },
  { id: "fam6", type: "multiple-choice", question: "What is another word for 'mom'?", options: ["Father", "Mother", "Sister", "Aunt"], correctAnswer: "Mother", explanation: "Mom and mother mean the same thing.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam7", type: "reorder", question: "Put the words in order:", options: ["sister", "My", "is", "younger", "than", "me"], correctAnswer: ["My", "sister", "is", "younger", "than", "me"], explanation: "Possessive + noun + verb + comparative + than + object", skill: "grammar", difficulty: "medium" },
  { id: "fam8", type: "multiple-choice", question: "Your sister's daughter is your...", options: ["Cousin", "Niece", "Aunt", "Daughter"], correctAnswer: "Niece", explanation: "Your sibling's daughter is your niece.", skill: "vocabulary", difficulty: "medium" },
  { id: "fam9", type: "fill-blank", question: "My parents ___ (love) me very much.", correctAnswer: "love", explanation: "Plural 'parents' uses base form 'love'.", skill: "grammar", difficulty: "easy" },
  { id: "fam10", type: "multiple-choice", question: "What do you call your father's father?", options: ["Uncle", "Grandfather", "Brother", "Cousin"], correctAnswer: "Grandfather", explanation: "Your father's father is your grandfather.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam11", type: "fill-blank", question: "I ___ (be) the oldest child in my family.", correctAnswer: "am", explanation: "With 'I', use 'am'.", skill: "grammar", difficulty: "easy" },
  { id: "fam12", type: "multiple-choice", question: "What is the opposite of 'older'?", options: ["Taller", "Younger", "Bigger", "Faster"], correctAnswer: "Younger", explanation: "Older and younger are opposites for age.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam13", type: "multiple-choice", question: "Your brother's son is your...", options: ["Cousin", "Nephew", "Uncle", "Son"], correctAnswer: "Nephew", explanation: "Your sibling's son is your nephew.", skill: "vocabulary", difficulty: "medium" },
  { id: "fam14", type: "fill-blank", question: "My grandmother ___ (make) the best cookies.", correctAnswer: "makes", explanation: "Singular 'grandmother' needs 'makes' with -s.", skill: "grammar", difficulty: "easy" },
  { id: "fam15", type: "reorder", question: "Make a sentence:", options: ["have", "Do", "any", "you", "siblings", "?"], correctAnswer: ["Do", "you", "have", "any", "siblings", "?"], explanation: "Do + subject + verb + object", skill: "grammar", difficulty: "medium" },
  { id: "fam16", type: "multiple-choice", question: "What do we call parents of your parents?", options: ["Uncles", "Cousins", "Grandparents", "Siblings"], correctAnswer: "Grandparents", explanation: "Grandparents = grandmother + grandfather.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam17", type: "fill-blank", question: "There ___ five people in my family.", correctAnswer: "are", explanation: "Plural 'five people' uses 'are'.", skill: "grammar", difficulty: "easy" },
  { id: "fam18", type: "multiple-choice", question: "What does 'sibling' mean?", options: ["Parent", "Brother or sister", "Cousin", "Grandparent"], correctAnswer: "Brother or sister", explanation: "Siblings are your brothers and sisters.", skill: "vocabulary", difficulty: "medium" },
  { id: "fam19", type: "multiple-choice", question: "Which is correct?", options: ["My sister she is tall.", "My sister is tall.", "My is sister tall.", "Sister my is tall."], correctAnswer: "My sister is tall.", explanation: "Don't repeat the subject (my sister = she).", skill: "grammar", difficulty: "medium" },
  { id: "fam20", type: "fill-blank", question: "My mother's sister is my ___.", correctAnswer: "aunt", explanation: "Your parent's sister is your aunt.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam21", type: "multiple-choice", question: "What is a 'relative'?", options: ["A friend", "A family member", "A neighbor", "A teacher"], correctAnswer: "A family member", explanation: "Relatives are people in your family.", skill: "vocabulary", difficulty: "easy" },
  { id: "fam22", type: "fill-blank", question: "My brother and I ___ (be) twins.", correctAnswer: "are", explanation: "'My brother and I' is plural, so use 'are'.", skill: "grammar", difficulty: "medium" },
  { id: "fam23", type: "multiple-choice", question: "What does 'only child' mean?", options: ["The oldest child", "A child with no siblings", "The youngest child", "A cousin"], correctAnswer: "A child with no siblings", explanation: "An only child has no brothers or sisters.", skill: "vocabulary", difficulty: "medium" },
  { id: "fam24", type: "reorder", question: "Put in order:", options: ["brother", "older", "My", "is", "than", "me"], correctAnswer: ["My", "brother", "is", "older", "than", "me"], explanation: "Possessive + noun + verb + comparative + than + object", skill: "grammar", difficulty: "medium" },
  { id: "fam25", type: "short-answer", question: "Write a sentence about your family.", correctAnswer: "family", explanation: "Great job describing your family!", skill: "writing", difficulty: "easy" },
];

const generateSchoolQuestions = (): QuizQuestion[] => [
  { id: "s1", type: "multiple-choice", question: "What do you use to write on a whiteboard?", options: ["Pencil", "Pen", "Marker", "Crayon"], correctAnswer: "Marker", explanation: "Markers are used to write on whiteboards.", skill: "vocabulary", difficulty: "easy" },
  { id: "s2", type: "fill-blank", question: "The students ___ (study) English every day.", correctAnswer: "study", explanation: "Plural 'students' uses base form 'study'.", skill: "grammar", difficulty: "easy" },
  { id: "s3", type: "multiple-choice", question: "Where do students eat lunch at school?", options: ["Classroom", "Library", "Cafeteria", "Gym"], correctAnswer: "Cafeteria", explanation: "The cafeteria is the dining area at school.", skill: "vocabulary", difficulty: "easy" },
  { id: "s4", type: "multiple-choice", question: "What do you call the person who teaches?", options: ["Student", "Teacher", "Principal", "Parent"], correctAnswer: "Teacher", explanation: "A teacher is someone who helps students learn.", skill: "vocabulary", difficulty: "easy" },
  { id: "s5", type: "fill-blank", question: "She ___ (go) to school at 8 o'clock.", correctAnswer: "goes", explanation: "With 'she', add -es to 'go' → goes.", skill: "grammar", difficulty: "easy" },
  { id: "s6", type: "reorder", question: "Put the words in order:", options: ["your", "is", "What", "subject", "favorite", "?"], correctAnswer: ["What", "is", "your", "favorite", "subject", "?"], explanation: "Question word + is + possessive + adjective + noun", skill: "grammar", difficulty: "medium" },
  { id: "s7", type: "multiple-choice", question: "What is homework?", options: ["Work done at school", "Work done at home", "Playing games", "Watching TV"], correctAnswer: "Work done at home", explanation: "Homework is schoolwork to complete at home.", skill: "vocabulary", difficulty: "easy" },
  { id: "s8", type: "fill-blank", question: "The teacher ___ (help) the students with math.", correctAnswer: "helps", explanation: "Singular 'teacher' needs 'helps' with -s.", skill: "grammar", difficulty: "easy" },
  { id: "s9", type: "multiple-choice", question: "What do you call a test given at school?", options: ["Homework", "Exam", "Recess", "Lunch"], correctAnswer: "Exam", explanation: "An exam or test measures what you've learned.", skill: "vocabulary", difficulty: "easy" },
  { id: "s10", type: "multiple-choice", question: "Which is NOT a school subject?", options: ["Math", "Science", "Television", "English"], correctAnswer: "Television", explanation: "Math, Science, and English are subjects; TV is not.", skill: "vocabulary", difficulty: "easy" },
  { id: "s11", type: "fill-blank", question: "We ___ (have) PE class on Mondays.", correctAnswer: "have", explanation: "Plural 'we' uses base form 'have'.", skill: "grammar", difficulty: "easy" },
  { id: "s12", type: "multiple-choice", question: "What is 'recess'?", options: ["A test", "A break to play", "A class", "Homework"], correctAnswer: "A break to play", explanation: "Recess is break time for students to play.", skill: "vocabulary", difficulty: "easy" },
  { id: "s13", type: "multiple-choice", question: "Which sentence is correct?", options: ["I am study hard.", "I studying hard.", "I am studying hard.", "I study am hard."], correctAnswer: "I am studying hard.", explanation: "Present continuous: am/is/are + verb-ing.", skill: "grammar", difficulty: "medium" },
  { id: "s14", type: "fill-blank", question: "The library ___ (be) a quiet place.", correctAnswer: "is", explanation: "Singular 'library' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "s15", type: "multiple-choice", question: "What do you carry books in?", options: ["Lunchbox", "Backpack", "Pencil case", "Locker"], correctAnswer: "Backpack", explanation: "A backpack is a bag to carry school supplies.", skill: "vocabulary", difficulty: "easy" },
  { id: "s16", type: "reorder", question: "Make a sentence:", options: ["likes", "She", "very", "science", "much"], correctAnswer: ["She", "likes", "science", "very", "much"], explanation: "Subject + Verb + Object + Adverb", skill: "grammar", difficulty: "medium" },
  { id: "s17", type: "fill-blank", question: "My teacher ___ (teach) us new things every day.", correctAnswer: "teaches", explanation: "With 'teacher' (singular), use 'teaches'.", skill: "grammar", difficulty: "easy" },
  { id: "s18", type: "multiple-choice", question: "What is a 'classmate'?", options: ["A teacher", "A student in your class", "A parent", "A principal"], correctAnswer: "A student in your class", explanation: "Classmates are students in the same class as you.", skill: "vocabulary", difficulty: "easy" },
  { id: "s19", type: "multiple-choice", question: "What do we use to erase pencil marks?", options: ["Pen", "Marker", "Eraser", "Scissors"], correctAnswer: "Eraser", explanation: "An eraser removes pencil marks from paper.", skill: "vocabulary", difficulty: "easy" },
  { id: "s20", type: "fill-blank", question: "The students ___ (not/like) homework.", correctAnswer: "don't like", explanation: "Plural 'students' uses 'don't' for negative.", skill: "grammar", difficulty: "medium" },
  { id: "s21", type: "multiple-choice", question: "When does school usually start?", options: ["At night", "In the afternoon", "In the morning", "At midnight"], correctAnswer: "In the morning", explanation: "Most schools start in the morning.", skill: "vocabulary", difficulty: "easy" },
  { id: "s22", type: "fill-blank", question: "___you finish your homework?", correctAnswer: "Did", explanation: "Past tense questions start with 'Did'.", skill: "grammar", difficulty: "medium" },
  { id: "s23", type: "multiple-choice", question: "What is 'attendance'?", options: ["A test", "Being present at school", "A subject", "Homework"], correctAnswer: "Being present at school", explanation: "Attendance means being present at school.", skill: "vocabulary", difficulty: "medium" },
  { id: "s24", type: "reorder", question: "Form a question:", options: ["study", "you", "do", "What", "?"], correctAnswer: ["What", "do", "you", "study", "?"], explanation: "Question word + do/does + subject + verb", skill: "grammar", difficulty: "easy" },
  { id: "s25", type: "short-answer", question: "What is your favorite subject? Write a sentence.", correctAnswer: "subject favorite", explanation: "Great job sharing about school!", skill: "writing", difficulty: "easy" },
];

const generateWeatherQuestions = (): QuizQuestion[] => [
  { id: "w1", type: "multiple-choice", question: "What do we call water falling from clouds?", options: ["Snow", "Rain", "Wind", "Sun"], correctAnswer: "Rain", explanation: "Rain is water that falls from clouds.", skill: "vocabulary", difficulty: "easy" },
  { id: "w2", type: "fill-blank", question: "It ___ (rain) right now.", correctAnswer: "is raining", explanation: "Present continuous for weather happening now.", skill: "grammar", difficulty: "medium" },
  { id: "w3", type: "multiple-choice", question: "Which season comes after summer?", options: ["Spring", "Winter", "Autumn/Fall", "Summer"], correctAnswer: "Autumn/Fall", explanation: "The seasons go: Spring, Summer, Autumn, Winter.", skill: "vocabulary", difficulty: "easy" },
  { id: "w4", type: "multiple-choice", question: "What do you need when it rains?", options: ["Sunglasses", "Umbrella", "Shorts", "Sandals"], correctAnswer: "Umbrella", explanation: "An umbrella keeps you dry in the rain.", skill: "vocabulary", difficulty: "easy" },
  { id: "w5", type: "fill-blank", question: "Yesterday, it ___ (be) very cold.", correctAnswer: "was", explanation: "'Was' is the past tense of 'is' for weather.", skill: "grammar", difficulty: "easy" },
  { id: "w6", type: "reorder", question: "Put the words in order:", options: ["sunny", "today", "is", "It"], correctAnswer: ["It", "is", "sunny", "today"], explanation: "It + is + adjective + time", skill: "grammar", difficulty: "easy" },
  { id: "w7", type: "multiple-choice", question: "What is frozen rain called?", options: ["Wind", "Cloud", "Snow", "Fog"], correctAnswer: "Snow", explanation: "Snow is frozen water crystals.", skill: "vocabulary", difficulty: "easy" },
  { id: "w8", type: "fill-blank", question: "The wind ___ (blow) strongly yesterday.", correctAnswer: "blew", explanation: "'Blew' is the past tense of 'blow'.", skill: "grammar", difficulty: "medium" },
  { id: "w9", type: "multiple-choice", question: "What makes rainbows appear?", options: ["Wind", "Snow", "Sun and rain", "Clouds"], correctAnswer: "Sun and rain", explanation: "Rainbows form when sunlight shines through rain.", skill: "vocabulary", difficulty: "medium" },
  { id: "w10", type: "multiple-choice", question: "Which is the hottest season?", options: ["Winter", "Spring", "Summer", "Autumn"], correctAnswer: "Summer", explanation: "Summer has the hottest weather.", skill: "vocabulary", difficulty: "easy" },
  { id: "w11", type: "fill-blank", question: "It ___ (snow) in winter.", correctAnswer: "snows", explanation: "General truth: It + verb-s for weather.", skill: "grammar", difficulty: "easy" },
  { id: "w12", type: "multiple-choice", question: "What is 'cloudy' weather?", options: ["Lots of sun", "Lots of clouds", "Lots of rain", "Lots of wind"], correctAnswer: "Lots of clouds", explanation: "Cloudy means the sky is covered with clouds.", skill: "vocabulary", difficulty: "easy" },
  { id: "w13", type: "fill-blank", question: "___it going to rain tomorrow?", correctAnswer: "Is", explanation: "Future questions with 'going to' start with Is/Are.", skill: "grammar", difficulty: "medium" },
  { id: "w14", type: "multiple-choice", question: "What season has falling leaves?", options: ["Spring", "Summer", "Autumn", "Winter"], correctAnswer: "Autumn", explanation: "Leaves fall from trees in autumn.", skill: "vocabulary", difficulty: "easy" },
  { id: "w15", type: "reorder", question: "Make a sentence:", options: ["will", "It", "tomorrow", "be", "sunny"], correctAnswer: ["It", "will", "be", "sunny", "tomorrow"], explanation: "It + will + be + adjective + time", skill: "grammar", difficulty: "medium" },
  { id: "w16", type: "multiple-choice", question: "What do we call a storm with lightning?", options: ["Snowstorm", "Thunderstorm", "Windstorm", "Rainstorm"], correctAnswer: "Thunderstorm", explanation: "Thunder and lightning come in a thunderstorm.", skill: "vocabulary", difficulty: "medium" },
  { id: "w17", type: "fill-blank", question: "The flowers ___ (bloom) in spring.", correctAnswer: "bloom", explanation: "General truth about spring - plural uses base form.", skill: "grammar", difficulty: "easy" },
  { id: "w18", type: "multiple-choice", question: "What is 'humid' weather?", options: ["Very dry", "Very wet and sticky", "Very cold", "Very windy"], correctAnswer: "Very wet and sticky", explanation: "Humid means there's lots of moisture in the air.", skill: "vocabulary", difficulty: "medium" },
  { id: "w19", type: "multiple-choice", question: "In which season do birds fly south?", options: ["Spring", "Summer", "Autumn", "Winter"], correctAnswer: "Autumn", explanation: "Many birds migrate south before winter.", skill: "vocabulary", difficulty: "medium" },
  { id: "w20", type: "fill-blank", question: "Look! The sun ___ (shine)!", correctAnswer: "is shining", explanation: "Present continuous for what's happening now.", skill: "grammar", difficulty: "medium" },
  { id: "w21", type: "multiple-choice", question: "What does 'freezing' mean?", options: ["Very hot", "Very cold", "Very warm", "Very nice"], correctAnswer: "Very cold", explanation: "Freezing means extremely cold, 0°C or below.", skill: "vocabulary", difficulty: "easy" },
  { id: "w22", type: "fill-blank", question: "It ___ (not/rain) yesterday.", correctAnswer: "didn't rain", explanation: "Past negative: didn't + base verb.", skill: "grammar", difficulty: "medium" },
  { id: "w23", type: "multiple-choice", question: "What season do flowers start to grow?", options: ["Winter", "Autumn", "Spring", "Summer"], correctAnswer: "Spring", explanation: "Spring is when plants and flowers begin to grow.", skill: "vocabulary", difficulty: "easy" },
  { id: "w24", type: "reorder", question: "Form a question:", options: ["the", "like", "weather", "What", "is", "?"], correctAnswer: ["What", "is", "the", "weather", "like", "?"], explanation: "What is the weather like? - Common weather question.", skill: "grammar", difficulty: "medium" },
  { id: "w25", type: "short-answer", question: "Describe today's weather in a sentence.", correctAnswer: "weather", explanation: "Great job describing the weather!", skill: "writing", difficulty: "easy" },
];

const generateSportsQuestions = (): QuizQuestion[] => [
  { id: "sp1", type: "multiple-choice", question: "What sport uses a round ball and a hoop?", options: ["Soccer", "Tennis", "Basketball", "Baseball"], correctAnswer: "Basketball", explanation: "Basketball uses a hoop/net to score.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp2", type: "fill-blank", question: "She ___ (play) tennis every Saturday.", correctAnswer: "plays", explanation: "With 'she', add -s to the verb.", skill: "grammar", difficulty: "easy" },
  { id: "sp3", type: "multiple-choice", question: "What do you wear on your feet to run?", options: ["Gloves", "Hat", "Sneakers", "Scarf"], correctAnswer: "Sneakers", explanation: "Sneakers/trainers are shoes for running and sports.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp4", type: "multiple-choice", question: "In which sport do you swim?", options: ["Running", "Cycling", "Swimming", "Dancing"], correctAnswer: "Swimming", explanation: "Swimming takes place in water.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp5", type: "fill-blank", question: "They ___ (win) the game yesterday.", correctAnswer: "won", explanation: "'Won' is the past tense of 'win'.", skill: "grammar", difficulty: "medium" },
  { id: "sp6", type: "reorder", question: "Put the words in order:", options: ["soccer", "playing", "love", "I"], correctAnswer: ["I", "love", "playing", "soccer"], explanation: "Subject + Verb + Gerund + Object", skill: "grammar", difficulty: "easy" },
  { id: "sp7", type: "multiple-choice", question: "What is the goal in a race?", options: ["To score points", "To be first", "To catch a ball", "To jump high"], correctAnswer: "To be first", explanation: "In a race, you try to finish first.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp8", type: "fill-blank", question: "He ___ (not/like) playing football.", correctAnswer: "doesn't like", explanation: "Negative with 'he': doesn't + base verb.", skill: "grammar", difficulty: "medium" },
  { id: "sp9", type: "multiple-choice", question: "What sport uses a bat and ball?", options: ["Soccer", "Swimming", "Baseball", "Running"], correctAnswer: "Baseball", explanation: "In baseball, you hit a ball with a bat.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp10", type: "multiple-choice", question: "What do we call a sports teacher?", options: ["Chef", "Coach", "Driver", "Doctor"], correctAnswer: "Coach", explanation: "A coach trains and teaches athletes.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp11", type: "fill-blank", question: "The team ___ (practice) every afternoon.", correctAnswer: "practices", explanation: "Singular 'team' needs 'practices' with -s.", skill: "grammar", difficulty: "easy" },
  { id: "sp12", type: "multiple-choice", question: "What is a 'team'?", options: ["One player", "A group of players", "A coach", "A stadium"], correctAnswer: "A group of players", explanation: "A team is multiple players working together.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp13", type: "multiple-choice", question: "Which sentence is correct?", options: ["I can swimming.", "I can swim.", "I can to swim.", "I can swims."], correctAnswer: "I can swim.", explanation: "After 'can', use the base verb (no 'to').", skill: "grammar", difficulty: "medium" },
  { id: "sp14", type: "fill-blank", question: "We ___ (run) 5 kilometers last week.", correctAnswer: "ran", explanation: "'Ran' is the past tense of 'run'.", skill: "grammar", difficulty: "medium" },
  { id: "sp15", type: "multiple-choice", question: "What do you wear to protect your head in cycling?", options: ["Gloves", "Helmet", "Boots", "Goggles"], correctAnswer: "Helmet", explanation: "A helmet protects your head during sports.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp16", type: "reorder", question: "Make a question:", options: ["sport", "your", "is", "favorite", "What", "?"], correctAnswer: ["What", "is", "your", "favorite", "sport", "?"], explanation: "Question word + is + possessive + adjective + noun", skill: "grammar", difficulty: "medium" },
  { id: "sp17", type: "fill-blank", question: "He ___ (be) a very good swimmer.", correctAnswer: "is", explanation: "With 'he', use 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "sp18", type: "multiple-choice", question: "What does 'score a goal' mean?", options: ["Lose the game", "Get a point", "Start the game", "End the game"], correctAnswer: "Get a point", explanation: "Scoring a goal means getting a point for your team.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp19", type: "multiple-choice", question: "Where do people play tennis?", options: ["On a field", "In a pool", "On a court", "On ice"], correctAnswer: "On a court", explanation: "Tennis is played on a tennis court.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp20", type: "fill-blank", question: "___you play any sports?", correctAnswer: "Do", explanation: "Questions with 'you' start with 'Do'.", skill: "grammar", difficulty: "easy" },
  { id: "sp21", type: "multiple-choice", question: "What sport do you play on ice?", options: ["Soccer", "Tennis", "Hockey", "Basketball"], correctAnswer: "Hockey", explanation: "Ice hockey is played on an ice rink.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp22", type: "fill-blank", question: "She ___ (be) the fastest runner in our class.", correctAnswer: "is", explanation: "Superlative sentence with 'she' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "sp23", type: "multiple-choice", question: "What does an 'athlete' do?", options: ["Cooks food", "Plays sports", "Drives cars", "Builds houses"], correctAnswer: "Plays sports", explanation: "An athlete is someone who plays sports.", skill: "vocabulary", difficulty: "easy" },
  { id: "sp24", type: "reorder", question: "Put in order:", options: ["can", "very", "He", "run", "fast"], correctAnswer: ["He", "can", "run", "very", "fast"], explanation: "Subject + can + verb + adverb", skill: "grammar", difficulty: "medium" },
  { id: "sp25", type: "short-answer", question: "What is your favorite sport and why?", correctAnswer: "sport because", explanation: "Great job writing about sports!", skill: "writing", difficulty: "medium" },
];

const generateBodyQuestions = (): QuizQuestion[] => [
  { id: "b1", type: "multiple-choice", question: "What do you use to see?", options: ["Ears", "Nose", "Eyes", "Mouth"], correctAnswer: "Eyes", explanation: "We see with our eyes.", skill: "vocabulary", difficulty: "easy" },
  { id: "b2", type: "fill-blank", question: "I have two ___ and two legs.", correctAnswer: "arms", explanation: "We have two arms and two legs.", skill: "vocabulary", difficulty: "easy" },
  { id: "b3", type: "multiple-choice", question: "What is the plural of 'foot'?", options: ["Foots", "Feet", "Feets", "Foot"], correctAnswer: "Feet", explanation: "'Feet' is the irregular plural of 'foot'.", skill: "grammar", difficulty: "easy" },
  { id: "b4", type: "multiple-choice", question: "What do you use to hear?", options: ["Eyes", "Ears", "Nose", "Hands"], correctAnswer: "Ears", explanation: "We hear sounds with our ears.", skill: "vocabulary", difficulty: "easy" },
  { id: "b5", type: "fill-blank", question: "She ___ (have) long hair.", correctAnswer: "has", explanation: "With 'she', use 'has' not 'have'.", skill: "grammar", difficulty: "easy" },
  { id: "b6", type: "multiple-choice", question: "How many fingers does one hand have?", options: ["Three", "Four", "Five", "Six"], correctAnswer: "Five", explanation: "Each hand has five fingers.", skill: "vocabulary", difficulty: "easy" },
  { id: "b7", type: "reorder", question: "Put the words in order:", options: ["are", "My", "brown", "eyes"], correctAnswer: ["My", "eyes", "are", "brown"], explanation: "Possessive + noun + verb + adjective", skill: "grammar", difficulty: "easy" },
  { id: "b8", type: "fill-blank", question: "We smell with our ___.", correctAnswer: "nose", explanation: "The nose is for smelling.", skill: "vocabulary", difficulty: "easy" },
  { id: "b9", type: "multiple-choice", question: "What is the plural of 'tooth'?", options: ["Tooths", "Teeth", "Toothes", "Teeths"], correctAnswer: "Teeth", explanation: "'Teeth' is the irregular plural of 'tooth'.", skill: "grammar", difficulty: "easy" },
  { id: "b10", type: "multiple-choice", question: "What body part is between your head and shoulders?", options: ["Arm", "Leg", "Neck", "Hand"], correctAnswer: "Neck", explanation: "The neck connects your head to your body.", skill: "vocabulary", difficulty: "easy" },
  { id: "b11", type: "fill-blank", question: "He ___ (brush) his teeth every morning.", correctAnswer: "brushes", explanation: "With 'he', add -es to verbs ending in 'sh'.", skill: "grammar", difficulty: "easy" },
  { id: "b12", type: "multiple-choice", question: "What do you use to taste food?", options: ["Nose", "Ears", "Tongue", "Fingers"], correctAnswer: "Tongue", explanation: "Our tongue helps us taste food.", skill: "vocabulary", difficulty: "easy" },
  { id: "b13", type: "multiple-choice", question: "Which sentence is correct?", options: ["My hairs are black.", "My hair is black.", "My hair are black.", "My hairs is black."], correctAnswer: "My hair is black.", explanation: "'Hair' is usually uncountable, so use 'is'.", skill: "grammar", difficulty: "medium" },
  { id: "b14", type: "fill-blank", question: "We walk with our ___ and feet.", correctAnswer: "legs", explanation: "Legs and feet are used for walking.", skill: "vocabulary", difficulty: "easy" },
  { id: "b15", type: "multiple-choice", question: "What covers our body?", options: ["Hair", "Skin", "Bones", "Muscles"], correctAnswer: "Skin", explanation: "Skin covers and protects our whole body.", skill: "vocabulary", difficulty: "easy" },
  { id: "b16", type: "reorder", question: "Make a sentence:", options: ["has", "curly", "She", "hair"], correctAnswer: ["She", "has", "curly", "hair"], explanation: "Subject + has + adjective + noun", skill: "grammar", difficulty: "easy" },
  { id: "b17", type: "fill-blank", question: "The heart ___ (pump) blood through the body.", correctAnswer: "pumps", explanation: "Singular 'heart' needs 'pumps' with -s.", skill: "grammar", difficulty: "medium" },
  { id: "b18", type: "multiple-choice", question: "What do you use to grab things?", options: ["Feet", "Ears", "Hands", "Nose"], correctAnswer: "Hands", explanation: "We use our hands to grab and hold things.", skill: "vocabulary", difficulty: "easy" },
  { id: "b19", type: "multiple-choice", question: "How many toes does one foot have?", options: ["Three", "Four", "Five", "Ten"], correctAnswer: "Five", explanation: "Each foot has five toes.", skill: "vocabulary", difficulty: "easy" },
  { id: "b20", type: "fill-blank", question: "My brother ___ (be) taller than me.", correctAnswer: "is", explanation: "With 'brother' (singular), use 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "b21", type: "multiple-choice", question: "Where is your elbow?", options: ["On your leg", "On your arm", "On your head", "On your foot"], correctAnswer: "On your arm", explanation: "The elbow is the joint in the middle of your arm.", skill: "vocabulary", difficulty: "easy" },
  { id: "b22", type: "fill-blank", question: "I ___ (have) ten fingers.", correctAnswer: "have", explanation: "With 'I', use 'have' not 'has'.", skill: "grammar", difficulty: "easy" },
  { id: "b23", type: "multiple-choice", question: "What is the back of your hand called?", options: ["Palm", "Wrist", "Knuckle", "Back of hand"], correctAnswer: "Back of hand", explanation: "The palm is the inside; the back is the outside.", skill: "vocabulary", difficulty: "medium" },
  { id: "b24", type: "reorder", question: "Form a question:", options: ["color", "What", "your", "are", "eyes", "?"], correctAnswer: ["What", "color", "are", "your", "eyes", "?"], explanation: "What color are + possessive + noun", skill: "grammar", difficulty: "medium" },
  { id: "b25", type: "short-answer", question: "Describe yourself using body parts (e.g., I have brown eyes).", correctAnswer: "have", explanation: "Great job describing yourself!", skill: "writing", difficulty: "easy" },
];

const generateClothesQuestions = (): QuizQuestion[] => [
  { id: "cl1", type: "multiple-choice", question: "What do you wear on your feet?", options: ["Hat", "Gloves", "Shoes", "Scarf"], correctAnswer: "Shoes", explanation: "We wear shoes on our feet.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl2", type: "fill-blank", question: "She ___ (wear) a blue dress today.", correctAnswer: "is wearing", explanation: "Present continuous for what someone is wearing now.", skill: "grammar", difficulty: "medium" },
  { id: "cl3", type: "multiple-choice", question: "What do you wear when it's cold?", options: ["Shorts", "T-shirt", "Jacket", "Sandals"], correctAnswer: "Jacket", explanation: "Jackets keep us warm in cold weather.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl4", type: "multiple-choice", question: "What do you wear on your head?", options: ["Socks", "Hat", "Pants", "Shoes"], correctAnswer: "Hat", explanation: "Hats are worn on the head.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl5", type: "fill-blank", question: "I need to ___ my shoes before going outside.", correctAnswer: "put on", explanation: "'Put on' means to wear something.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl6", type: "reorder", question: "Put the words in order:", options: ["wearing", "What", "you", "are", "?"], correctAnswer: ["What", "are", "you", "wearing", "?"], explanation: "What are you wearing? - Present continuous question.", skill: "grammar", difficulty: "easy" },
  { id: "cl7", type: "multiple-choice", question: "What are 'jeans'?", options: ["A type of shirt", "A type of pants", "A type of shoes", "A type of hat"], correctAnswer: "A type of pants", explanation: "Jeans are casual pants made of denim.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl8", type: "fill-blank", question: "His shirt ___ (be) too big for him.", correctAnswer: "is", explanation: "Singular 'shirt' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "cl9", type: "multiple-choice", question: "What do you wear to swim?", options: ["Jeans", "Swimsuit", "Sweater", "Boots"], correctAnswer: "Swimsuit", explanation: "Swimsuits are made for swimming.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl10", type: "multiple-choice", question: "What is the opposite of 'tight'?", options: ["Small", "Loose", "Short", "Long"], correctAnswer: "Loose", explanation: "Tight clothes are close-fitting; loose clothes are roomy.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl11", type: "fill-blank", question: "These shoes ___ (be) too small.", correctAnswer: "are", explanation: "Plural 'shoes' uses 'are'.", skill: "grammar", difficulty: "easy" },
  { id: "cl12", type: "multiple-choice", question: "What do you wear around your neck when it's cold?", options: ["Belt", "Scarf", "Bracelet", "Ring"], correctAnswer: "Scarf", explanation: "A scarf keeps your neck warm.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl13", type: "multiple-choice", question: "Which sentence is correct?", options: ["She dress nice.", "She is dressing nice.", "She dresses nicely.", "She dress nicely."], correctAnswer: "She dresses nicely.", explanation: "With 'she', add -es and use adverb 'nicely'.", skill: "grammar", difficulty: "medium" },
  { id: "cl14", type: "fill-blank", question: "I usually ___ (wear) jeans to school.", correctAnswer: "wear", explanation: "With 'I' and present habit, use base form.", skill: "grammar", difficulty: "easy" },
  { id: "cl15", type: "multiple-choice", question: "What are 'sneakers'?", options: ["Formal shoes", "Sports shoes", "Boots", "Sandals"], correctAnswer: "Sports shoes", explanation: "Sneakers are casual athletic shoes.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl16", type: "reorder", question: "Make a sentence:", options: ["wearing", "today", "I", "am", "a", "red", "shirt"], correctAnswer: ["I", "am", "wearing", "a", "red", "shirt", "today"], explanation: "Subject + am + verb-ing + article + adjective + noun + time", skill: "grammar", difficulty: "medium" },
  { id: "cl17", type: "fill-blank", question: "Take ___ your coat; it's hot inside.", correctAnswer: "off", explanation: "'Take off' means to remove clothing.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl18", type: "multiple-choice", question: "What do gloves protect?", options: ["Feet", "Head", "Hands", "Neck"], correctAnswer: "Hands", explanation: "Gloves protect and warm our hands.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl19", type: "multiple-choice", question: "What holds up your pants?", options: ["Scarf", "Belt", "Tie", "Hat"], correctAnswer: "Belt", explanation: "A belt goes around your waist to hold up pants.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl20", type: "fill-blank", question: "Her new dress ___ (look) beautiful.", correctAnswer: "looks", explanation: "Singular 'dress' needs 'looks' with -s.", skill: "grammar", difficulty: "easy" },
  { id: "cl21", type: "multiple-choice", question: "What is a 'uniform'?", options: ["Any clothes", "Special matching clothes for work/school", "Party clothes", "Sleep clothes"], correctAnswer: "Special matching clothes for work/school", explanation: "A uniform is special clothes everyone wears in a group.", skill: "vocabulary", difficulty: "medium" },
  { id: "cl22", type: "fill-blank", question: "___you like my new shoes?", correctAnswer: "Do", explanation: "Questions with 'you' start with 'Do'.", skill: "grammar", difficulty: "easy" },
  { id: "cl23", type: "multiple-choice", question: "What is another word for 'trousers'?", options: ["Shirts", "Pants", "Socks", "Shoes"], correctAnswer: "Pants", explanation: "Trousers and pants mean the same thing.", skill: "vocabulary", difficulty: "easy" },
  { id: "cl24", type: "reorder", question: "Form a question:", options: ["like", "you", "Do", "this", "color", "?"], correctAnswer: ["Do", "you", "like", "this", "color", "?"], explanation: "Do + subject + verb + object", skill: "grammar", difficulty: "easy" },
  { id: "cl25", type: "short-answer", question: "Describe what you are wearing today.", correctAnswer: "wearing", explanation: "Great job describing your clothes!", skill: "writing", difficulty: "easy" },
];

const generateHouseQuestions = (): QuizQuestion[] => [
  { id: "h1", type: "multiple-choice", question: "Where do you sleep?", options: ["Kitchen", "Bathroom", "Bedroom", "Garage"], correctAnswer: "Bedroom", explanation: "The bedroom is where we sleep.", skill: "vocabulary", difficulty: "easy" },
  { id: "h2", type: "fill-blank", question: "There ___ three bedrooms in my house.", correctAnswer: "are", explanation: "Plural 'bedrooms' uses 'are'.", skill: "grammar", difficulty: "easy" },
  { id: "h3", type: "multiple-choice", question: "Where do you cook food?", options: ["Bedroom", "Kitchen", "Bathroom", "Living room"], correctAnswer: "Kitchen", explanation: "The kitchen is for cooking.", skill: "vocabulary", difficulty: "easy" },
  { id: "h4", type: "multiple-choice", question: "Where do you take a shower?", options: ["Kitchen", "Bedroom", "Bathroom", "Garden"], correctAnswer: "Bathroom", explanation: "The bathroom has the shower and toilet.", skill: "vocabulary", difficulty: "easy" },
  { id: "h5", type: "fill-blank", question: "My bedroom ___ (be) on the second floor.", correctAnswer: "is", explanation: "Singular 'bedroom' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "h6", type: "reorder", question: "Put the words in order:", options: ["is", "big", "The", "living room", "very"], correctAnswer: ["The", "living room", "is", "very", "big"], explanation: "The + noun + is + adverb + adjective", skill: "grammar", difficulty: "medium" },
  { id: "h7", type: "multiple-choice", question: "What piece of furniture do you sit on?", options: ["Table", "Bed", "Sofa", "Lamp"], correctAnswer: "Sofa", explanation: "A sofa (couch) is for sitting.", skill: "vocabulary", difficulty: "easy" },
  { id: "h8", type: "fill-blank", question: "There ___ a TV in the living room.", correctAnswer: "is", explanation: "Singular 'TV' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "h9", type: "multiple-choice", question: "Where do you keep your car?", options: ["Kitchen", "Bedroom", "Garage", "Bathroom"], correctAnswer: "Garage", explanation: "A garage is for parking cars.", skill: "vocabulary", difficulty: "easy" },
  { id: "h10", type: "multiple-choice", question: "What do you use to go upstairs?", options: ["Door", "Window", "Stairs", "Roof"], correctAnswer: "Stairs", explanation: "Stairs connect different floors.", skill: "vocabulary", difficulty: "easy" },
  { id: "h11", type: "fill-blank", question: "We ___ (have) a beautiful garden.", correctAnswer: "have", explanation: "With 'we', use 'have' not 'has'.", skill: "grammar", difficulty: "easy" },
  { id: "h12", type: "multiple-choice", question: "What covers the floor?", options: ["Curtains", "Carpet", "Ceiling", "Roof"], correctAnswer: "Carpet", explanation: "Carpet is a floor covering.", skill: "vocabulary", difficulty: "easy" },
  { id: "h13", type: "multiple-choice", question: "Which sentence is correct?", options: ["There is many rooms.", "There are many rooms.", "There many rooms.", "There is rooms."], correctAnswer: "There are many rooms.", explanation: "Plural 'rooms' uses 'There are'.", skill: "grammar", difficulty: "easy" },
  { id: "h14", type: "fill-blank", question: "The kitchen ___ (have) a big refrigerator.", correctAnswer: "has", explanation: "Singular 'kitchen' uses 'has'.", skill: "grammar", difficulty: "easy" },
  { id: "h15", type: "multiple-choice", question: "What lets light into a room?", options: ["Door", "Wall", "Window", "Floor"], correctAnswer: "Window", explanation: "Windows let in light and air.", skill: "vocabulary", difficulty: "easy" },
  { id: "h16", type: "reorder", question: "Make a sentence:", options: ["is", "next to", "bedroom", "The", "bathroom", "the"], correctAnswer: ["The", "bedroom", "is", "next to", "the", "bathroom"], explanation: "The + noun + is + preposition + the + noun", skill: "grammar", difficulty: "medium" },
  { id: "h17", type: "fill-blank", question: "My house ___ (not/have) a swimming pool.", correctAnswer: "doesn't have", explanation: "Singular 'house' uses 'doesn't' for negative.", skill: "grammar", difficulty: "medium" },
  { id: "h18", type: "multiple-choice", question: "Where do families usually watch TV together?", options: ["Garage", "Bathroom", "Living room", "Basement"], correctAnswer: "Living room", explanation: "Families gather in the living room.", skill: "vocabulary", difficulty: "easy" },
  { id: "h19", type: "multiple-choice", question: "What is the 'roof'?", options: ["Bottom of house", "Top of house", "Side of house", "Inside of house"], correctAnswer: "Top of house", explanation: "The roof covers the top of a building.", skill: "vocabulary", difficulty: "easy" },
  { id: "h20", type: "fill-blank", question: "The sofa ___ (be) in the living room.", correctAnswer: "is", explanation: "Singular 'sofa' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "h21", type: "multiple-choice", question: "What do you sleep on?", options: ["Chair", "Table", "Bed", "Carpet"], correctAnswer: "Bed", explanation: "We sleep on beds.", skill: "vocabulary", difficulty: "easy" },
  { id: "h22", type: "fill-blank", question: "___there a basement in your house?", correctAnswer: "Is", explanation: "Questions about singular start with 'Is there'.", skill: "grammar", difficulty: "easy" },
  { id: "h23", type: "multiple-choice", question: "What do you use to enter a house?", options: ["Window", "Door", "Roof", "Wall"], correctAnswer: "Door", explanation: "We enter through doors.", skill: "vocabulary", difficulty: "easy" },
  { id: "h24", type: "reorder", question: "Form a question:", options: ["rooms", "are", "How many", "there", "?"], correctAnswer: ["How many", "rooms", "are", "there", "?"], explanation: "How many + noun + are there?", skill: "grammar", difficulty: "medium" },
  { id: "h25", type: "short-answer", question: "Describe your favorite room in your house.", correctAnswer: "room", explanation: "Great job describing your home!", skill: "writing", difficulty: "easy" },
];

const generateNumberQuestions = (): QuizQuestion[] => [
  { id: "n1", type: "multiple-choice", question: "How do you spell 15?", options: ["Fiveteen", "Fifteen", "Fiften", "Fithteen"], correctAnswer: "Fifteen", explanation: "15 is spelled 'fifteen'.", skill: "vocabulary", difficulty: "easy" },
  { id: "n2", type: "fill-blank", question: "There ___ 30 students in my class.", correctAnswer: "are", explanation: "Plural number uses 'are'.", skill: "grammar", difficulty: "easy" },
  { id: "n3", type: "multiple-choice", question: "What comes after twelve?", options: ["Eleven", "Thirteen", "Fourteen", "Ten"], correctAnswer: "Thirteen", explanation: "After 12 comes 13 (thirteen).", skill: "vocabulary", difficulty: "easy" },
  { id: "n4", type: "fill-blank", question: "I have ___ (one/a) sister.", correctAnswer: "one", explanation: "Both 'one' and 'a' are correct for singular.", skill: "grammar", difficulty: "easy" },
  { id: "n5", type: "multiple-choice", question: "How do you say '1st' in words?", options: ["One", "Oneth", "First", "Firsth"], correctAnswer: "First", explanation: "1st = first (ordinal number).", skill: "vocabulary", difficulty: "easy" },
  { id: "n6", type: "reorder", question: "Put in order:", options: ["100", "students", "are", "There"], correctAnswer: ["There", "are", "100", "students"], explanation: "There are + number + noun", skill: "grammar", difficulty: "easy" },
  { id: "n7", type: "multiple-choice", question: "What is 20 + 30?", options: ["40", "50", "60", "70"], correctAnswer: "50", explanation: "Twenty plus thirty equals fifty.", skill: "vocabulary", difficulty: "easy" },
  { id: "n8", type: "fill-blank", question: "My birthday is on the ___ (3rd) of July.", correctAnswer: "third", explanation: "3rd = third (ordinal number).", skill: "vocabulary", difficulty: "easy" },
  { id: "n9", type: "multiple-choice", question: "How many is 'a dozen'?", options: ["10", "11", "12", "13"], correctAnswer: "12", explanation: "A dozen means twelve.", skill: "vocabulary", difficulty: "medium" },
  { id: "n10", type: "multiple-choice", question: "How do you spell 40?", options: ["Fourty", "Forty", "Forthy", "Fourthy"], correctAnswer: "Forty", explanation: "40 is spelled 'forty' (no 'u').", skill: "vocabulary", difficulty: "medium" },
  { id: "n11", type: "fill-blank", question: "She is ___ (2nd) in line.", correctAnswer: "second", explanation: "2nd = second (ordinal number).", skill: "vocabulary", difficulty: "easy" },
  { id: "n12", type: "multiple-choice", question: "What is half of 20?", options: ["5", "10", "15", "25"], correctAnswer: "10", explanation: "Half of twenty is ten.", skill: "vocabulary", difficulty: "easy" },
  { id: "n13", type: "multiple-choice", question: "Which sentence is correct?", options: ["I have five book.", "I have five books.", "I have fives book.", "I have fives books."], correctAnswer: "I have five books.", explanation: "After numbers, nouns are plural.", skill: "grammar", difficulty: "easy" },
  { id: "n14", type: "fill-blank", question: "There ___ only one cookie left.", correctAnswer: "is", explanation: "Singular 'one cookie' uses 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "n15", type: "multiple-choice", question: "How do you say 100?", options: ["A thousand", "A hundred", "A million", "A billion"], correctAnswer: "A hundred", explanation: "100 = one hundred or a hundred.", skill: "vocabulary", difficulty: "easy" },
  { id: "n16", type: "reorder", question: "Make a sentence:", options: ["are", "books", "on", "There", "five", "the table"], correctAnswer: ["There", "are", "five", "books", "on", "the table"], explanation: "There are + number + noun + location", skill: "grammar", difficulty: "medium" },
  { id: "n17", type: "fill-blank", question: "Today is my ___ (5th) birthday.", correctAnswer: "fifth", explanation: "5th = fifth (ordinal number).", skill: "vocabulary", difficulty: "easy" },
  { id: "n18", type: "multiple-choice", question: "What comes before twenty?", options: ["Eighteen", "Nineteen", "Twenty-one", "Seventeen"], correctAnswer: "Nineteen", explanation: "19 comes before 20.", skill: "vocabulary", difficulty: "easy" },
  { id: "n19", type: "multiple-choice", question: "How do you write 'twice'?", options: ["One time", "Two times", "Three times", "Four times"], correctAnswer: "Two times", explanation: "Twice means two times.", skill: "vocabulary", difficulty: "easy" },
  { id: "n20", type: "fill-blank", question: "I am ___ (9) years old.", correctAnswer: "nine", explanation: "9 = nine.", skill: "vocabulary", difficulty: "easy" },
  { id: "n21", type: "multiple-choice", question: "What is '0' called?", options: ["One", "Zero", "None", "Nil"], correctAnswer: "Zero", explanation: "0 is called zero.", skill: "vocabulary", difficulty: "easy" },
  { id: "n22", type: "fill-blank", question: "She finished in ___ (1st) place!", correctAnswer: "first", explanation: "1st = first.", skill: "vocabulary", difficulty: "easy" },
  { id: "n23", type: "multiple-choice", question: "How many zeros are in 1,000?", options: ["2", "3", "4", "5"], correctAnswer: "3", explanation: "1,000 = one thousand (3 zeros).", skill: "vocabulary", difficulty: "medium" },
  { id: "n24", type: "reorder", question: "Form a question:", options: ["old", "How", "you", "are", "?"], correctAnswer: ["How", "old", "are", "you", "?"], explanation: "How old are you? - asking about age.", skill: "grammar", difficulty: "easy" },
  { id: "n25", type: "short-answer", question: "Write a sentence using a number.", correctAnswer: "number", explanation: "Great job using numbers!", skill: "writing", difficulty: "easy" },
];

const generateTimeQuestions = (): QuizQuestion[] => [
  { id: "t1", type: "multiple-choice", question: "How many days are in a week?", options: ["5", "6", "7", "8"], correctAnswer: "7", explanation: "A week has 7 days.", skill: "vocabulary", difficulty: "easy" },
  { id: "t2", type: "fill-blank", question: "There ___ 12 months in a year.", correctAnswer: "are", explanation: "Plural '12 months' uses 'are'.", skill: "grammar", difficulty: "easy" },
  { id: "t3", type: "multiple-choice", question: "Which day comes after Monday?", options: ["Sunday", "Tuesday", "Wednesday", "Friday"], correctAnswer: "Tuesday", explanation: "The order is Monday, Tuesday, Wednesday...", skill: "vocabulary", difficulty: "easy" },
  { id: "t4", type: "fill-blank", question: "I wake up ___ 7 o'clock.", correctAnswer: "at", explanation: "Use 'at' with specific times.", skill: "grammar", difficulty: "easy" },
  { id: "t5", type: "multiple-choice", question: "Which month comes after April?", options: ["March", "May", "June", "July"], correctAnswer: "May", explanation: "The months go: April, May, June...", skill: "vocabulary", difficulty: "easy" },
  { id: "t6", type: "reorder", question: "Put the words in order:", options: ["time", "What", "is", "it", "?"], correctAnswer: ["What", "time", "is", "it", "?"], explanation: "What time is it? - asking the time.", skill: "grammar", difficulty: "easy" },
  { id: "t7", type: "multiple-choice", question: "How many minutes are in an hour?", options: ["30", "45", "60", "100"], correctAnswer: "60", explanation: "An hour has 60 minutes.", skill: "vocabulary", difficulty: "easy" },
  { id: "t8", type: "fill-blank", question: "My birthday is ___ July.", correctAnswer: "in", explanation: "Use 'in' with months.", skill: "grammar", difficulty: "easy" },
  { id: "t9", type: "multiple-choice", question: "What is the first day of the week?", options: ["Monday", "Friday", "Sunday", "Saturday"], correctAnswer: "Sunday", explanation: "In many countries, Sunday is the first day.", skill: "vocabulary", difficulty: "easy" },
  { id: "t10", type: "multiple-choice", question: "What does 'noon' mean?", options: ["Midnight", "12:00 PM", "6:00 AM", "6:00 PM"], correctAnswer: "12:00 PM", explanation: "Noon is 12 o'clock in the daytime.", skill: "vocabulary", difficulty: "easy" },
  { id: "t11", type: "fill-blank", question: "School starts ___ Monday.", correctAnswer: "on", explanation: "Use 'on' with days of the week.", skill: "grammar", difficulty: "easy" },
  { id: "t12", type: "multiple-choice", question: "How many hours are in a day?", options: ["12", "20", "24", "30"], correctAnswer: "24", explanation: "A day has 24 hours.", skill: "vocabulary", difficulty: "easy" },
  { id: "t13", type: "multiple-choice", question: "Which sentence is correct?", options: ["I go to school in Monday.", "I go to school on Monday.", "I go to school at Monday.", "I go to school by Monday."], correctAnswer: "I go to school on Monday.", explanation: "Use 'on' with days of the week.", skill: "grammar", difficulty: "easy" },
  { id: "t14", type: "fill-blank", question: "It is half ___ three (3:30).", correctAnswer: "past", explanation: "Half past three = 3:30.", skill: "vocabulary", difficulty: "medium" },
  { id: "t15", type: "multiple-choice", question: "What is the last month of the year?", options: ["November", "December", "January", "October"], correctAnswer: "December", explanation: "December is month 12.", skill: "vocabulary", difficulty: "easy" },
  { id: "t16", type: "reorder", question: "Make a sentence:", options: ["is", "It", "to", "quarter", "five"], correctAnswer: ["It", "is", "quarter", "to", "five"], explanation: "Quarter to five = 4:45.", skill: "grammar", difficulty: "medium" },
  { id: "t17", type: "fill-blank", question: "We have lunch ___ noon.", correctAnswer: "at", explanation: "Use 'at' with noon and midnight.", skill: "grammar", difficulty: "easy" },
  { id: "t18", type: "multiple-choice", question: "What does 'AM' mean?", options: ["After midnight", "Before noon", "After noon", "At midnight"], correctAnswer: "Before noon", explanation: "AM = from midnight to noon.", skill: "vocabulary", difficulty: "medium" },
  { id: "t19", type: "multiple-choice", question: "Which is the weekend?", options: ["Monday and Tuesday", "Wednesday and Thursday", "Saturday and Sunday", "Friday and Monday"], correctAnswer: "Saturday and Sunday", explanation: "The weekend is Saturday and Sunday.", skill: "vocabulary", difficulty: "easy" },
  { id: "t20", type: "fill-blank", question: "I was born ___ 2015.", correctAnswer: "in", explanation: "Use 'in' with years.", skill: "grammar", difficulty: "easy" },
  { id: "t21", type: "multiple-choice", question: "What comes after February?", options: ["January", "March", "April", "December"], correctAnswer: "March", explanation: "The order is February, March, April...", skill: "vocabulary", difficulty: "easy" },
  { id: "t22", type: "fill-blank", question: "It's ten minutes ___ eight (7:50).", correctAnswer: "to", explanation: "Ten to eight = 7:50.", skill: "vocabulary", difficulty: "medium" },
  { id: "t23", type: "multiple-choice", question: "What does 'yesterday' mean?", options: ["The day after today", "The day before today", "Today", "Next week"], correctAnswer: "The day before today", explanation: "Yesterday is the day before today.", skill: "vocabulary", difficulty: "easy" },
  { id: "t24", type: "reorder", question: "Form a question:", options: ["do", "What", "wake up", "you", "time", "?"], correctAnswer: ["What", "time", "do", "you", "wake up", "?"], explanation: "What time do you + verb?", skill: "grammar", difficulty: "medium" },
  { id: "t25", type: "short-answer", question: "What is your favorite day of the week and why?", correctAnswer: "day week because", explanation: "Great job writing about time!", skill: "writing", difficulty: "easy" },
];

const generateFeelingQuestions = (): QuizQuestion[] => [
  { id: "fe1", type: "multiple-choice", question: "How do you feel when you get a present?", options: ["Sad", "Happy", "Angry", "Tired"], correctAnswer: "Happy", explanation: "Getting presents usually makes us happy!", skill: "vocabulary", difficulty: "easy" },
  { id: "fe2", type: "fill-blank", question: "She ___ (be) very excited about the trip.", correctAnswer: "is", explanation: "With 'she', use 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "fe3", type: "multiple-choice", question: "What is the opposite of 'happy'?", options: ["Glad", "Joyful", "Sad", "Excited"], correctAnswer: "Sad", explanation: "Happy and sad are opposites.", skill: "vocabulary", difficulty: "easy" },
  { id: "fe4", type: "fill-blank", question: "I ___ (feel) tired after running.", correctAnswer: "feel", explanation: "With 'I', use base form 'feel'.", skill: "grammar", difficulty: "easy" },
  { id: "fe5", type: "multiple-choice", question: "What does 'nervous' mean?", options: ["Very happy", "A bit scared/worried", "Very angry", "Very tired"], correctAnswer: "A bit scared/worried", explanation: "Nervous means anxious or worried.", skill: "vocabulary", difficulty: "easy" },
  { id: "fe6", type: "reorder", question: "Put the words in order:", options: ["are", "How", "feeling", "you", "?"], correctAnswer: ["How", "are", "you", "feeling", "?"], explanation: "How are you feeling? - asking about emotions.", skill: "grammar", difficulty: "easy" },
  { id: "fe7", type: "multiple-choice", question: "How might you feel before a test?", options: ["Bored", "Hungry", "Nervous", "Sleepy"], correctAnswer: "Nervous", explanation: "Many people feel nervous before tests.", skill: "vocabulary", difficulty: "easy" },
  { id: "fe8", type: "fill-blank", question: "He ___ (be) angry because he lost the game.", correctAnswer: "is", explanation: "With 'he', use 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "fe9", type: "multiple-choice", question: "What does 'surprised' mean?", options: ["Expected something", "Didn't expect something", "Felt tired", "Felt hungry"], correctAnswer: "Didn't expect something", explanation: "Surprised means something unexpected happened.", skill: "vocabulary", difficulty: "easy" },
  { id: "fe10", type: "multiple-choice", question: "Which word describes being very scared?", options: ["Thrilled", "Terrified", "Tired", "Thankful"], correctAnswer: "Terrified", explanation: "Terrified means extremely scared.", skill: "vocabulary", difficulty: "medium" },
  { id: "fe11", type: "fill-blank", question: "They ___ (be) bored during the long movie.", correctAnswer: "were", explanation: "Past tense with 'they' uses 'were'.", skill: "grammar", difficulty: "medium" },
  { id: "fe12", type: "multiple-choice", question: "What is another word for 'angry'?", options: ["Happy", "Sad", "Mad", "Glad"], correctAnswer: "Mad", explanation: "Mad and angry have similar meanings.", skill: "vocabulary", difficulty: "easy" },
  { id: "fe13", type: "multiple-choice", question: "Which sentence is correct?", options: ["I am very exciting.", "I am very excited.", "I am very excite.", "I am very excites."], correctAnswer: "I am very excited.", explanation: "Use '-ed' adjectives for feelings about something.", skill: "grammar", difficulty: "medium" },
  { id: "fe14", type: "fill-blank", question: "The movie ___ (be) so boring!", correctAnswer: "was", explanation: "Past tense singular uses 'was'.", skill: "grammar", difficulty: "easy" },
  { id: "fe15", type: "multiple-choice", question: "How do you feel after sleeping well?", options: ["Tired", "Refreshed", "Exhausted", "Sleepy"], correctAnswer: "Refreshed", explanation: "Good sleep makes us feel refreshed.", skill: "vocabulary", difficulty: "medium" },
  { id: "fe16", type: "reorder", question: "Make a sentence:", options: ["feel", "I", "today", "great"], correctAnswer: ["I", "feel", "great", "today"], explanation: "Subject + verb + adjective + time", skill: "grammar", difficulty: "easy" },
  { id: "fe17", type: "fill-blank", question: "She looks ___. Maybe she's sick.", correctAnswer: "pale", explanation: "Sick people often look pale (less color in face).", skill: "vocabulary", difficulty: "medium" },
  { id: "fe18", type: "multiple-choice", question: "What is the opposite of 'calm'?", options: ["Peaceful", "Relaxed", "Anxious", "Quiet"], correctAnswer: "Anxious", explanation: "Calm and anxious are opposites.", skill: "vocabulary", difficulty: "medium" },
  { id: "fe19", type: "multiple-choice", question: "How might you feel on your birthday?", options: ["Bored", "Excited", "Angry", "Scared"], correctAnswer: "Excited", explanation: "Birthdays usually make us excited!", skill: "vocabulary", difficulty: "easy" },
  { id: "fe20", type: "fill-blank", question: "We ___ (be) so happy when we won!", correctAnswer: "were", explanation: "Past tense with 'we' uses 'were'.", skill: "grammar", difficulty: "easy" },
  { id: "fe21", type: "multiple-choice", question: "What does 'confused' mean?", options: ["Understanding clearly", "Not understanding", "Feeling happy", "Feeling sad"], correctAnswer: "Not understanding", explanation: "Confused means you don't understand something.", skill: "vocabulary", difficulty: "easy" },
  { id: "fe22", type: "fill-blank", question: "He felt ___ after hearing the good news.", correctAnswer: "relieved", explanation: "Relieved means feeling better after worry goes away.", skill: "vocabulary", difficulty: "medium" },
  { id: "fe23", type: "multiple-choice", question: "Which word means 'very happy'?", options: ["Miserable", "Delighted", "Annoyed", "Upset"], correctAnswer: "Delighted", explanation: "Delighted means very pleased and happy.", skill: "vocabulary", difficulty: "medium" },
  { id: "fe24", type: "reorder", question: "Form a question:", options: ["wrong", "What", "is", "?"], correctAnswer: ["What", "is", "wrong", "?"], explanation: "What is wrong? - asking about problems.", skill: "grammar", difficulty: "easy" },
  { id: "fe25", type: "short-answer", question: "How do you feel today? Write a sentence.", correctAnswer: "feel", explanation: "Great job expressing your feelings!", skill: "writing", difficulty: "easy" },
];

const generateTravelQuestions = (): QuizQuestion[] => [
  { id: "tr1", type: "multiple-choice", question: "What do you use to fly to another country?", options: ["Car", "Boat", "Airplane", "Bicycle"], correctAnswer: "Airplane", explanation: "Airplanes fly people between countries.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr2", type: "fill-blank", question: "We ___ (go) to Paris last summer.", correctAnswer: "went", explanation: "'Went' is the past tense of 'go'.", skill: "grammar", difficulty: "easy" },
  { id: "tr3", type: "multiple-choice", question: "Where do trains stop?", options: ["Airport", "Station", "Port", "Highway"], correctAnswer: "Station", explanation: "Trains stop at train stations.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr4", type: "fill-blank", question: "She ___ (travel) to Japan next month.", correctAnswer: "is traveling", explanation: "Future plan: is + verb-ing.", skill: "grammar", difficulty: "medium" },
  { id: "tr5", type: "multiple-choice", question: "What do you pack clothes in?", options: ["Wallet", "Suitcase", "Passport", "Ticket"], correctAnswer: "Suitcase", explanation: "A suitcase holds your travel clothes.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr6", type: "reorder", question: "Put the words in order:", options: ["been", "to", "Have", "you", "London", "?"], correctAnswer: ["Have", "you", "been", "to", "London", "?"], explanation: "Have you been to...? - asking about travel experience.", skill: "grammar", difficulty: "medium" },
  { id: "tr7", type: "multiple-choice", question: "What document do you need to enter another country?", options: ["Driver's license", "Library card", "Passport", "Report card"], correctAnswer: "Passport", explanation: "A passport is ID for international travel.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr8", type: "fill-blank", question: "I have never ___ (be) to Africa.", correctAnswer: "been", explanation: "Present perfect: have + been.", skill: "grammar", difficulty: "medium" },
  { id: "tr9", type: "multiple-choice", question: "Where do you wait for your plane?", options: ["Train station", "Airport", "Bus stop", "Hotel"], correctAnswer: "Airport", explanation: "Airports are for airplane travel.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr10", type: "multiple-choice", question: "What is a 'tourist'?", options: ["A person who works", "A person who travels for fun", "A person who stays home", "A person who drives"], correctAnswer: "A person who travels for fun", explanation: "Tourists travel to visit new places.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr11", type: "fill-blank", question: "They ___ (arrive) at the hotel at 6 PM yesterday.", correctAnswer: "arrived", explanation: "Past tense: add -ed to regular verbs.", skill: "grammar", difficulty: "easy" },
  { id: "tr12", type: "multiple-choice", question: "Where do you stay when traveling?", options: ["School", "Office", "Hotel", "Library"], correctAnswer: "Hotel", explanation: "Hotels provide rooms for travelers.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr13", type: "multiple-choice", question: "Which sentence is correct?", options: ["I will to go to Spain.", "I will going to Spain.", "I will go to Spain.", "I going to Spain."], correctAnswer: "I will go to Spain.", explanation: "Will + base verb for future.", skill: "grammar", difficulty: "medium" },
  { id: "tr14", type: "fill-blank", question: "Have you ever ___ (visit) a castle?", correctAnswer: "visited", explanation: "Present perfect: have + past participle.", skill: "grammar", difficulty: "medium" },
  { id: "tr15", type: "multiple-choice", question: "What do you need to get on a plane?", options: ["Library card", "Boarding pass", "Credit card", "Bus pass"], correctAnswer: "Boarding pass", explanation: "A boarding pass lets you onto the plane.", skill: "vocabulary", difficulty: "medium" },
  { id: "tr16", type: "reorder", question: "Make a sentence:", options: ["going", "We", "to", "beach", "are", "the"], correctAnswer: ["We", "are", "going", "to", "the", "beach"], explanation: "We are going to + place.", skill: "grammar", difficulty: "easy" },
  { id: "tr17", type: "fill-blank", question: "The flight ___ (take) 3 hours.", correctAnswer: "takes", explanation: "General fact: singular takes -s.", skill: "grammar", difficulty: "easy" },
  { id: "tr18", type: "multiple-choice", question: "What is 'luggage'?", options: ["Food for travel", "Bags you take on a trip", "Travel ticket", "Hotel key"], correctAnswer: "Bags you take on a trip", explanation: "Luggage = suitcases and bags for travel.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr19", type: "multiple-choice", question: "What do you call a trip on a big ship?", options: ["Flight", "Road trip", "Cruise", "Hike"], correctAnswer: "Cruise", explanation: "A cruise is a vacation on a large ship.", skill: "vocabulary", difficulty: "medium" },
  { id: "tr20", type: "fill-blank", question: "She ___ (not/like) long flights.", correctAnswer: "doesn't like", explanation: "Negative with 'she': doesn't + base verb.", skill: "grammar", difficulty: "easy" },
  { id: "tr21", type: "multiple-choice", question: "What is a 'destination'?", options: ["Where you start", "Where you're going", "A type of vehicle", "A travel bag"], correctAnswer: "Where you're going", explanation: "Destination is where your trip ends.", skill: "vocabulary", difficulty: "medium" },
  { id: "tr22", type: "fill-blank", question: "I ___ (pack) my bags last night.", correctAnswer: "packed", explanation: "Past tense of regular verb pack.", skill: "grammar", difficulty: "easy" },
  { id: "tr23", type: "multiple-choice", question: "What helps you find your way in a new city?", options: ["Camera", "Map", "Suitcase", "Wallet"], correctAnswer: "Map", explanation: "Maps show directions and locations.", skill: "vocabulary", difficulty: "easy" },
  { id: "tr24", type: "reorder", question: "Form a question:", options: ["you", "Where", "go", "did", "?"], correctAnswer: ["Where", "did", "you", "go", "?"], explanation: "Where did you go? - past travel question.", skill: "grammar", difficulty: "easy" },
  { id: "tr25", type: "short-answer", question: "Where would you like to travel? Write a sentence.", correctAnswer: "travel go visit", explanation: "Great job writing about travel!", skill: "writing", difficulty: "easy" },
];

const generateJobQuestions = (): QuizQuestion[] => [
  { id: "j1", type: "multiple-choice", question: "Who helps sick people get better?", options: ["Teacher", "Chef", "Doctor", "Pilot"], correctAnswer: "Doctor", explanation: "Doctors help heal sick people.", skill: "vocabulary", difficulty: "easy" },
  { id: "j2", type: "fill-blank", question: "She ___ (work) at a hospital.", correctAnswer: "works", explanation: "With 'she', add -s to the verb.", skill: "grammar", difficulty: "easy" },
  { id: "j3", type: "multiple-choice", question: "Who puts out fires?", options: ["Police officer", "Firefighter", "Nurse", "Teacher"], correctAnswer: "Firefighter", explanation: "Firefighters put out fires and rescue people.", skill: "vocabulary", difficulty: "easy" },
  { id: "j4", type: "fill-blank", question: "I want to ___ (be) a pilot when I grow up.", correctAnswer: "be", explanation: "After 'want to', use base form.", skill: "grammar", difficulty: "easy" },
  { id: "j5", type: "multiple-choice", question: "Who cooks food in a restaurant?", options: ["Waiter", "Chef", "Manager", "Customer"], correctAnswer: "Chef", explanation: "Chefs prepare and cook food.", skill: "vocabulary", difficulty: "easy" },
  { id: "j6", type: "reorder", question: "Put the words in order:", options: ["want", "do", "you", "be", "What", "to", "?"], correctAnswer: ["What", "do", "you", "want", "to", "be", "?"], explanation: "What do you want to be? - asking about future job.", skill: "grammar", difficulty: "medium" },
  { id: "j7", type: "multiple-choice", question: "Who flies airplanes?", options: ["Driver", "Captain", "Pilot", "Engineer"], correctAnswer: "Pilot", explanation: "Pilots fly aircraft.", skill: "vocabulary", difficulty: "easy" },
  { id: "j8", type: "fill-blank", question: "My father ___ (be) a police officer.", correctAnswer: "is", explanation: "With 'father' (singular), use 'is'.", skill: "grammar", difficulty: "easy" },
  { id: "j9", type: "multiple-choice", question: "Who teaches students at school?", options: ["Doctor", "Chef", "Teacher", "Farmer"], correctAnswer: "Teacher", explanation: "Teachers help students learn.", skill: "vocabulary", difficulty: "easy" },
  { id: "j10", type: "multiple-choice", question: "Who grows food on a farm?", options: ["Baker", "Farmer", "Dentist", "Lawyer"], correctAnswer: "Farmer", explanation: "Farmers grow crops and raise animals.", skill: "vocabulary", difficulty: "easy" },
  { id: "j11", type: "fill-blank", question: "She ___ (want) to become a scientist.", correctAnswer: "wants", explanation: "With 'she', add -s.", skill: "grammar", difficulty: "easy" },
  { id: "j12", type: "multiple-choice", question: "Who takes care of your teeth?", options: ["Doctor", "Nurse", "Dentist", "Pharmacist"], correctAnswer: "Dentist", explanation: "Dentists care for teeth and gums.", skill: "vocabulary", difficulty: "easy" },
  { id: "j13", type: "multiple-choice", question: "Which sentence is correct?", options: ["He work at a bank.", "He works at a bank.", "He working at a bank.", "He is work at a bank."], correctAnswer: "He works at a bank.", explanation: "With 'he', use 'works' with -s.", skill: "grammar", difficulty: "easy" },
  { id: "j14", type: "fill-blank", question: "Nurses ___ (help) doctors in hospitals.", correctAnswer: "help", explanation: "Plural 'nurses' uses base form.", skill: "grammar", difficulty: "easy" },
  { id: "j15", type: "multiple-choice", question: "Who builds houses?", options: ["Architect", "Builder/Construction worker", "Painter", "Plumber"], correctAnswer: "Builder/Construction worker", explanation: "Builders construct buildings.", skill: "vocabulary", difficulty: "easy" },
  { id: "j16", type: "reorder", question: "Make a sentence:", options: ["as", "works", "My mom", "teacher", "a"], correctAnswer: ["My mom", "works", "as", "a", "teacher"], explanation: "Subject + works + as + article + job.", skill: "grammar", difficulty: "medium" },
  { id: "j17", type: "fill-blank", question: "A ___ delivers letters and packages.", correctAnswer: "mail carrier", explanation: "Mail carriers deliver mail to homes.", skill: "vocabulary", difficulty: "medium" },
  { id: "j18", type: "multiple-choice", question: "Who writes books?", options: ["Editor", "Author", "Librarian", "Publisher"], correctAnswer: "Author", explanation: "Authors write books and stories.", skill: "vocabulary", difficulty: "easy" },
  { id: "j19", type: "multiple-choice", question: "Where does a librarian work?", options: ["Hospital", "School", "Library", "Restaurant"], correctAnswer: "Library", explanation: "Librarians work in libraries.", skill: "vocabulary", difficulty: "easy" },
  { id: "j20", type: "fill-blank", question: "What ___ you want to be when you grow up?", correctAnswer: "do", explanation: "Questions with 'you' use 'do'.", skill: "grammar", difficulty: "easy" },
  { id: "j21", type: "multiple-choice", question: "Who takes pictures?", options: ["Artist", "Photographer", "Designer", "Writer"], correctAnswer: "Photographer", explanation: "Photographers take photos.", skill: "vocabulary", difficulty: "easy" },
  { id: "j22", type: "fill-blank", question: "He has been a doctor ___ 10 years.", correctAnswer: "for", explanation: "Use 'for' with a duration of time.", skill: "grammar", difficulty: "medium" },
  { id: "j23", type: "multiple-choice", question: "Who helps you in a store?", options: ["Cashier", "Cook", "Driver", "Teacher"], correctAnswer: "Cashier", explanation: "Cashiers help customers and take payments.", skill: "vocabulary", difficulty: "easy" },
  { id: "j24", type: "reorder", question: "Form a question:", options: ["What", "your", "job", "is", "?"], correctAnswer: ["What", "is", "your", "job", "?"], explanation: "What is your job? - asking about work.", skill: "grammar", difficulty: "easy" },
  { id: "j25", type: "short-answer", question: "What job would you like to have? Write a sentence.", correctAnswer: "job want", explanation: "Great job writing about careers!", skill: "writing", difficulty: "easy" },
];

// General questions generator for unmatched topics
const generateGeneralQuestions = (prompt: string): QuizQuestion[] => {
  const lowerPrompt = prompt.toLowerCase();
  const questions: QuizQuestion[] = [];
  
  // Create context-aware questions based on prompt keywords
  const words = lowerPrompt.split(/\s+/);
  
  // Add a variety of question types mixing all categories
  const allQuestions = [
    ...generateAnimalQuestions().slice(0, 5),
    ...generateFoodQuestions().slice(0, 5),
    ...generateSchoolQuestions().slice(0, 5),
    ...generateFamilyQuestions().slice(0, 5),
    ...generateWeatherQuestions().slice(0, 5),
  ];
  
  return allQuestions.sort(() => Math.random() - 0.5).slice(0, 25);
};

// Main question generator
const generateQuestions = (topic: string, customPrompt?: string): QuizQuestion[] => {
  // For custom topics, use the smart generator
  if (topic === "custom" && customPrompt) {
    return generateCustomQuestions(customPrompt);
  }
  
  // For preset topics
  const topicGenerators: Record<string, () => QuizQuestion[]> = {
    verbs: () => [
      { id: "v1", type: "multiple-choice", question: "What is the past tense of 'go'?", options: ["goed", "went", "gone", "going"], correctAnswer: "went", explanation: "The past tense of 'go' is 'went'. It's an irregular verb!", skill: "grammar", difficulty: "easy" },
      { id: "v2", type: "multiple-choice", question: "Which sentence uses the correct verb form?", options: ["She walk to school.", "She walks to school.", "She walking to school.", "She walked to school yesterday."], correctAnswer: "She walks to school.", explanation: "With 'she' (third person singular), we add -s to the verb in present tense.", skill: "grammar", difficulty: "easy" },
      { id: "v3", type: "fill-blank", question: "Complete: Yesterday, I ___ (eat) pizza for dinner.", correctAnswer: "ate", explanation: "'Ate' is the past tense of 'eat'. It's an irregular verb.", skill: "grammar", difficulty: "easy" },
      { id: "v4", type: "multiple-choice", question: "What is the past tense of 'run'?", options: ["runned", "ran", "running", "runs"], correctAnswer: "ran", explanation: "'Ran' is the past tense of 'run'. Another irregular verb!", skill: "grammar", difficulty: "easy" },
      { id: "v5", type: "fill-blank", question: "She ___ (play) soccer every Saturday.", correctAnswer: "plays", explanation: "For habits in present tense with 'she', we use 'plays' (add -s).", skill: "grammar", difficulty: "easy" },
      { id: "v6", type: "multiple-choice", question: "Which verb is in the present continuous?", options: ["I eat", "I ate", "I am eating", "I will eat"], correctAnswer: "I am eating", explanation: "Present continuous uses 'am/is/are + verb-ing' for actions happening now.", skill: "grammar", difficulty: "medium" },
      { id: "v7", type: "reorder", question: "Put the words in order:", options: ["now", "is", "She", "reading", "a book"], correctAnswer: ["She", "is", "reading", "a", "book", "now"], explanation: "Present continuous: Subject + is/am/are + verb-ing", skill: "grammar", difficulty: "medium" },
      { id: "v8", type: "multiple-choice", question: "What is the past tense of 'swim'?", options: ["swimmed", "swam", "swum", "swimming"], correctAnswer: "swam", explanation: "'Swam' is the simple past of 'swim'. 'Swum' is the past participle.", skill: "grammar", difficulty: "medium" },
      { id: "v9", type: "fill-blank", question: "They ___ (watch) TV when I arrived.", correctAnswer: "were watching", explanation: "Past continuous for an action in progress when another action happened.", skill: "grammar", difficulty: "medium" },
      { id: "v10", type: "multiple-choice", question: "Which sentence is in the future tense?", options: ["I went to school.", "I go to school.", "I will go to school.", "I am going to school."], correctAnswer: "I will go to school.", explanation: "'Will + verb' is used for future tense.", skill: "grammar", difficulty: "easy" },
      { id: "v11", type: "fill-blank", question: "He ___ (not/like) vegetables.", correctAnswer: "doesn't like", explanation: "For negative present tense with he/she/it, use 'doesn't + base verb'.", skill: "grammar", difficulty: "medium" },
      { id: "v12", type: "multiple-choice", question: "What is the past tense of 'write'?", options: ["writed", "wrote", "written", "writing"], correctAnswer: "wrote", explanation: "'Wrote' is the simple past of 'write'. 'Written' is the past participle.", skill: "grammar", difficulty: "medium" },
      { id: "v13", type: "reorder", question: "Make a negative sentence:", options: ["pizza", "like", "doesn't", "He"], correctAnswer: ["He", "doesn't", "like", "pizza"], explanation: "Negative present: Subject + doesn't/don't + base verb + object", skill: "grammar", difficulty: "easy" },
      { id: "v14", type: "multiple-choice", question: "Which is the correct past tense?", options: ["I did my homework.", "I doed my homework.", "I done my homework.", "I doing my homework."], correctAnswer: "I did my homework.", explanation: "'Did' is the past tense of 'do'. It's irregular!", skill: "grammar", difficulty: "easy" },
      { id: "v15", type: "fill-blank", question: "We ___ (be) at the park yesterday.", correctAnswer: "were", explanation: "'Were' is the past tense of 'are' for we/you/they.", skill: "grammar", difficulty: "easy" },
      { id: "v16", type: "multiple-choice", question: "What is the past tense of 'have'?", options: ["haved", "had", "has", "having"], correctAnswer: "had", explanation: "'Had' is the past tense of 'have'. Used for all subjects.", skill: "grammar", difficulty: "easy" },
      { id: "v17", type: "fill-blank", question: "The cat ___ (sleep) on my bed right now.", correctAnswer: "is sleeping", explanation: "Present continuous for actions happening at this moment.", skill: "grammar", difficulty: "medium" },
      { id: "v18", type: "multiple-choice", question: "Which verb form completes: 'She has ___ her homework.'", options: ["do", "did", "done", "doing"], correctAnswer: "done", explanation: "Present perfect uses 'has/have + past participle'. 'Done' is the past participle of 'do'.", skill: "grammar", difficulty: "hard" },
      { id: "v19", type: "reorder", question: "Form a question:", options: ["you", "Do", "like", "ice cream", "?"], correctAnswer: ["Do", "you", "like", "ice cream", "?"], explanation: "Questions in present: Do/Does + subject + base verb", skill: "grammar", difficulty: "easy" },
      { id: "v20", type: "multiple-choice", question: "What is the past tense of 'see'?", options: ["seed", "saw", "seen", "seeing"], correctAnswer: "saw", explanation: "'Saw' is the simple past of 'see'. 'Seen' is the past participle.", skill: "grammar", difficulty: "easy" },
      { id: "v21", type: "fill-blank", question: "I ___ (study) English for two years.", correctAnswer: "have studied", explanation: "Present perfect for actions that started in the past and continue.", skill: "grammar", difficulty: "hard" },
      { id: "v22", type: "multiple-choice", question: "Which sentence is correct?", options: ["He don't like pizza.", "He doesn't likes pizza.", "He doesn't like pizza.", "He not like pizza."], correctAnswer: "He doesn't like pizza.", explanation: "With he/she/it, use 'doesn't' + base verb (no -s on the main verb).", skill: "grammar", difficulty: "medium" },
      { id: "v23", type: "fill-blank", question: "They ___ (arrive) at 8 o'clock tomorrow.", correctAnswer: "will arrive", explanation: "Future tense with 'will + base verb'.", skill: "grammar", difficulty: "medium" },
      { id: "v24", type: "multiple-choice", question: "What is the past tense of 'buy'?", options: ["buyed", "bought", "buyed", "buying"], correctAnswer: "bought", explanation: "'Bought' is the irregular past tense of 'buy'.", skill: "grammar", difficulty: "medium" },
      { id: "v25", type: "fill-blank", question: "My mom ___ (cook) dinner every evening.", correctAnswer: "cooks", explanation: "Present simple with she/he/it adds -s to the verb.", skill: "grammar", difficulty: "easy" },
    ],
    vocabulary: generateFoodQuestions,
    grammar: generateSchoolQuestions,
    reading: generateWeatherQuestions,
  };
  
  const generator = topicGenerators[topic];
  if (generator) {
    const questions = typeof generator === 'function' ? generator() : generator;
    return (Array.isArray(questions) ? questions : []).sort(() => Math.random() - 0.5).slice(0, 25);
  }
  
  // Default fallback
  return generateGeneralQuestions(topic);
};

const PracticeQuiz_mod = ({ 
  title = "Practice Quiz",
  questions: providedQuestions,
  timed = false,
  timeLimit = 600, // 10 minutes for 25 questions
  onComplete,
  onBack
}: PracticeQuizProps) => {
  const { completeGame } = useRewards();
  const [mode, setMode] = useState<"select" | "quiz" | "complete">("select");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [reorderItems, setReorderItems] = useState<string[]>([]);
  const [selectedReorder, setSelectedReorder] = useState<string[]>([]);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);

  const currentQuestion = questions[currentIndex];

  // Timer effect
  useEffect(() => {
    if (mode !== "quiz" || !timed) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [mode, timed]);

  // Initialize reorder items when question changes
  useEffect(() => {
    if (currentQuestion?.type === "reorder" && currentQuestion.options) {
      setReorderItems([...currentQuestion.options].sort(() => Math.random() - 0.5));
      setSelectedReorder([]);
    }
  }, [currentIndex, currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartQuiz = async () => {
    if (!selectedTopic) return;
    
    setIsGenerating(true);
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedQuestions = generateQuestions(selectedTopic, customTopic);
    setQuestions(generatedQuestions);
    setIsGenerating(false);
    setMode("quiz");
    setTimeRemaining(timeLimit);
    
    toast.success(`🎯 ${generatedQuestions.length} questions ready! Good luck!`);
  };

  const checkAnswer = useCallback((answer: string | string[]) => {
    if (!currentQuestion) return false;
    
    const correct = Array.isArray(currentQuestion.correctAnswer)
      ? JSON.stringify(answer) === JSON.stringify(currentQuestion.correctAnswer)
      : typeof answer === "string" && 
        answer.toLowerCase().includes(
          (currentQuestion.correctAnswer as string).toLowerCase()
        );
    
    return correct;
  }, [currentQuestion]);

  const handleAnswer = (answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    const isCorrect = checkAnswer(answer);
    
    setCurrentFeedback({
      correct: isCorrect,
      explanation: currentQuestion.explanation,
    });
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setCurrentFeedback(null);
    setSelectedReorder([]);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    const correctCount = Object.entries(answers).filter(([id, answer]) => {
      const q = questions.find(q => q.id === id);
      if (!q) return false;
      return Array.isArray(q.correctAnswer)
        ? JSON.stringify(answer) === JSON.stringify(q.correctAnswer)
        : typeof answer === "string" && answer.toLowerCase().includes((q.correctAnswer as string).toLowerCase());
    }).length;

    const result = await completeGame("quiz", correctCount, questions.length);
    setTotalCoinsEarned(result.actualCoinsAdded);
    setMode("complete");
    
    toast.success(`+${result.actualCoinsAdded} coins earned!`);
    onComplete(correctCount, result.actualCoinsAdded);
  };

  const handleReorderSelect = (item: string) => {
    if (selectedReorder.includes(item)) {
      setSelectedReorder(prev => prev.filter(i => i !== item));
      setReorderItems(prev => [...prev, item]);
    } else {
      setSelectedReorder(prev => [...prev, item]);
      setReorderItems(prev => prev.filter(i => i !== item));
    }
  };

  const resetReorder = () => {
    if (currentQuestion?.options) {
      setReorderItems([...currentQuestion.options].sort(() => Math.random() - 0.5));
      setSelectedReorder([]);
    }
  };

  // Topic Selection Mode
  if (mode === "select") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Practice Quiz</h2>
            <p className="text-sm text-muted-foreground">What do you want to practice today?</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Tell me what you need!</span>
            </div>
            <p className="text-sm text-muted-foreground">Choose a topic or describe what you want to practice. I'll create 25 questions just for you!</p>
          </div>

          <div className="grid gap-2">
            {quizTopics.map(topic => (
              <motion.button
                key={topic.id}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTopic === topic.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
                onClick={() => setSelectedTopic(topic.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedTopic === topic.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}>
                    <topic.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{topic.label}</p>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                  {selectedTopic === topic.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {selectedTopic === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <Textarea
                placeholder="Describe what you want to practice... (e.g., 'past tense verbs', 'vocabulary about animals', 'reading comprehension')"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                💡 Be specific! The more details you give, the better questions I can create.
              </p>
            </motion.div>
          )}
        </div>

        <div className="p-4">
          <Button 
            className="w-full" 
            onClick={handleStartQuiz}
            disabled={!selectedTopic || (selectedTopic === "custom" && !customTopic.trim()) || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating your quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Start Quiz (25 Questions)
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Complete Screen
  if (mode === "complete") {
    const correctCount = Object.entries(answers).filter(([id, answer]) => {
      const q = questions.find(q => q.id === id);
      if (!q) return false;
      return Array.isArray(q.correctAnswer)
        ? JSON.stringify(answer) === JSON.stringify(q.correctAnswer)
        : typeof answer === "string" && answer.toLowerCase().includes((q.correctAnswer as string).toLowerCase());
    }).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-warning to-accent flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-4">
            You got {correctCount} out of {questions.length} correct ({percentage}%)
          </p>
          
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-8 h-8 ${
                  i < Math.ceil(percentage / 20) ? "text-warning fill-warning" : "text-muted"
                }`}
              />
            ))}
          </div>

          <div className="bg-gradient-to-br from-success/20 to-primary/20 rounded-xl p-3 mb-4">
            <p className="text-lg font-bold text-foreground">+{totalCoinsEarned} coins earned! 🪙</p>
          </div>

          {percentage < 80 && (
            <div className="bg-info/10 rounded-xl p-3 mb-4 text-left">
              <p className="text-sm font-medium text-foreground mb-1">💡 Keep practicing!</p>
              <p className="text-xs text-muted-foreground">
                Create flashcards for the topics you missed to remember them better!
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              Back to Menu
            </Button>
            <Button onClick={() => {
              setMode("select");
              setCurrentIndex(0);
              setAnswers({});
              setSelectedTopic(null);
              setCustomTopic("");
            }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Mode
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        {timed && (
          <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${
            timeRemaining < 60 ? "bg-destructive/20 text-destructive" : "bg-secondary"
          }`}>
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-0.5 mb-4">
        {questions.map((q, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${
              i < currentIndex
                ? answers[q.id] ? "bg-success" : "bg-destructive"
                : i === currentIndex
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-4 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentQuestion?.skill === "grammar" ? "bg-info/20 text-info" :
                  currentQuestion?.skill === "vocabulary" ? "bg-success/20 text-success" :
                  currentQuestion?.skill === "reading" ? "bg-warning/20 text-warning" :
                  "bg-accent/20 text-accent"
                }`}>
                  {currentQuestion?.skill}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentQuestion?.difficulty === "easy" ? "bg-success/20 text-success" :
                  currentQuestion?.difficulty === "medium" ? "bg-warning/20 text-warning" :
                  "bg-destructive/20 text-destructive"
                }`}>
                  {currentQuestion?.difficulty}
                </span>
              </div>
              <p className="text-lg font-medium text-foreground">{currentQuestion?.question}</p>
            </div>

            {/* Multiple Choice */}
            {currentQuestion?.type === "multiple-choice" && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${
                      showResult && option === currentQuestion.correctAnswer
                        ? "border-success bg-success/10"
                        : showResult && answers[currentQuestion.id] === option
                        ? "border-destructive bg-destructive/10"
                        : ""
                    }`}
                    disabled={showResult}
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-3 text-sm font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showResult && option === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                    {showResult && answers[currentQuestion.id] === option && option !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </Button>
                ))}
              </div>
            )}

            {/* Fill in the Blank */}
            {currentQuestion?.type === "fill-blank" && (
              <div className="space-y-3">
                <Input
                  placeholder="Type your answer..."
                  disabled={showResult}
                  className="text-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAnswer((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                {!showResult && (
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      if (input) handleAnswer(input.value);
                    }}
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
            )}

            {/* Reorder */}
            {currentQuestion?.type === "reorder" && (
              <div className="space-y-4">
                <div className="min-h-[60px] p-3 bg-secondary/30 rounded-xl border-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground mb-2">Your sentence:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReorder.map((word, i) => (
                      <Button
                        key={`selected-${i}`}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReorderSelect(word)}
                        disabled={showResult}
                      >
                        {word}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {reorderItems.map((word, i) => (
                    <Button
                      key={`item-${i}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorderSelect(word)}
                      disabled={showResult}
                    >
                      {word}
                    </Button>
                  ))}
                </div>

                {!showResult && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetReorder} className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                    <Button 
                      onClick={() => handleAnswer(selectedReorder)}
                      disabled={reorderItems.length > 0}
                      className="flex-1"
                    >
                      Check Order
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion?.type === "short-answer" && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your answer..."
                  disabled={showResult}
                  className="min-h-[100px]"
                />
                {!showResult && (
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      const textarea = (e.currentTarget.previousElementSibling as HTMLTextAreaElement);
                      if (textarea) handleAnswer(textarea.value);
                    }}
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {showResult && currentFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`rounded-2xl p-4 border ${
                    currentFeedback.correct
                      ? "bg-success/10 border-success/30"
                      : "bg-destructive/10 border-destructive/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {currentFeedback.correct ? (
                      <>
                        <Sparkles className="w-5 h-5 text-success" />
                        <span className="font-bold text-success">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-destructive" />
                        <span className="font-bold text-destructive">Not quite!</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentFeedback.explanation}</p>
                  {!currentFeedback.correct && currentQuestion && (
                    <p className="text-sm font-medium text-foreground mt-2">
                      Correct answer: {Array.isArray(currentQuestion.correctAnswer) 
                        ? currentQuestion.correctAnswer.join(" ") 
                        : currentQuestion.correctAnswer}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {showResult && (
        <div className="p-4">
          <Button className="w-full" onClick={handleNext}>
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-1" />
                See Results
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PracticeQuiz_mod;
