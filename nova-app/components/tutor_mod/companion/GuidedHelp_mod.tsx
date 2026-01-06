import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, BookOpen, PenLine, CheckCircle2, HelpCircle, ChevronRight, ArrowLeft, Sparkles, MessageSquare, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";
import { generateGradeContextSentence } from "@/hooks/usePersonalizedContent_mod";

interface GuidedStep {
  id: string;
  title: string;
  explanation: string;
  example: string;
  starters: string[];
  tryItPrompt: string;
  vocabulary?: Array<{ word: string; definition: string; example: string }>;
}

interface GuidedHelpProps {
  topic: string;
  onComplete: (usedHints: boolean) => void;
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

const staticGuidedSteps: Record<string, GuidedStep[]> = {
  grammar: [
    {
      id: "1",
      title: "Understanding Subject-Verb Agreement",
      explanation: "The verb must match the subject in number. Singular subjects need singular verbs, and plural subjects need plural verbs.",
      example: "✓ She walks to school. (singular)\n✓ They walk to school. (plural)\n✗ She walk to school. (incorrect)",
      starters: ["The boy ___", "My friends ___", "He always ___"],
      tryItPrompt: "Write a sentence using 'she' with a verb in present tense:",
    },
    {
      id: "2",
      title: "Using Past Tense Correctly",
      explanation: "Past tense shows actions that already happened. Regular verbs add -ed. Irregular verbs change form.",
      example: "✓ I played yesterday. (regular: play → played)\n✓ She went home. (irregular: go → went)",
      starters: ["Yesterday, I ___", "Last week, we ___", "She ___ to the store."],
      tryItPrompt: "Write about something you did yesterday:",
    },
  ],
  vocabulary: [
    {
      id: "1",
      title: "Building Your Word Bank",
      explanation: "Learn new words by understanding their meaning, using them in sentences, and finding synonyms (words with similar meanings).",
      example: "Word: 'enormous'\nMeaning: very big\nSynonyms: huge, massive, giant\nSentence: The elephant was enormous!",
      starters: ["The ___ was very big.", "I saw a huge ___.", "It was enormous like a ___."],
      tryItPrompt: "Use the word 'enormous' in your own sentence:",
    },
  ],
  writing: [
    {
      id: "1",
      title: "Starting Your Paragraph",
      explanation: "Every paragraph needs a topic sentence that tells the main idea. Then add details to support it.",
      example: "Topic sentence: My favorite animal is the dolphin.\nDetail 1: Dolphins are very smart.\nDetail 2: They can jump high out of the water.\nDetail 3: They live in groups called pods.",
      starters: ["My favorite ___ is...", "I really enjoy ___...", "The best thing about ___ is..."],
      tryItPrompt: "Write a topic sentence about your favorite food:",
    },
  ],
  reading: [
    {
      id: "1",
      title: "Finding the Main Idea",
      explanation: "The main idea is what the text is mostly about. Ask yourself: 'What is this passage telling me?'",
      example: "Passage: 'Bees are very important. They help flowers grow by carrying pollen. Without bees, we would have fewer fruits and vegetables.'\n\nMain Idea: Bees are important because they help plants grow.",
      starters: ["This passage is about ___.", "The main idea is ___.", "The author wants us to know ___."],
      tryItPrompt: "Read a short text and write what you think the main idea is:",
    },
  ],
};

// Generate dynamic guided steps from personalized content
const generateDynamicSteps = (content: PersonalizedContent, topic: string): GuidedStep[] => {
  const vocab = content.vocabulary.slice(0, 5);
  const sentences = content.sentences.slice(0, 3);
  const gradeLevel = content.gradeLevel;

  const steps: GuidedStep[] = [];

  // Add vocabulary-focused step
  if (vocab.length > 0) {
    const vocabExamples = vocab.slice(0, 3).map(v => 
      `Word: "${v.word}"\nMeaning: ${v.definition}\nExample: ${v.example || generateGradeContextSentence(v.word, v.definition, gradeLevel)}`
    ).join("\n\n");

    steps.push({
      id: "dynamic-vocab",
      title: "Learning Key Vocabulary",
      explanation: "These words will help you in your studies. Learn each word, its meaning, and how to use it in a sentence.",
      example: vocabExamples,
      starters: vocab.slice(0, 3).map(v => `The ${v.word.toLowerCase()} ___`),
      tryItPrompt: `Use the word "${vocab[0]?.word}" in your own sentence:`,
      vocabulary: vocab.map(v => ({
        word: v.word,
        definition: v.definition,
        example: v.example || generateGradeContextSentence(v.word, v.definition, gradeLevel),
      })),
    });
  }

  // Add sentence practice step
  if (sentences.length > 0) {
    const sentenceExamples = sentences.slice(0, 2).map(s => 
      `Sentence: "${s.sentence}"\nGrammar focus: ${s.grammarPoint}`
    ).join("\n\n");

    steps.push({
      id: "dynamic-sentences",
      title: "Practicing Sentence Patterns",
      explanation: `Focus on ${sentences[0]?.grammarPoint || 'grammar patterns'} to improve your writing and speaking.`,
      example: sentenceExamples,
      starters: sentences.slice(0, 3).map(s => s.sentence.split(' ').slice(0, 3).join(' ') + ' ___'),
      tryItPrompt: "Write a similar sentence using the grammar pattern above:",
    });
  }

  return steps.length > 0 ? steps : staticGuidedSteps[topic.toLowerCase()] || staticGuidedSteps.grammar;
};

const GuidedHelp_mod = ({ topic, onComplete, onBack, personalizedContent }: GuidedHelpProps) => {
  // Generate steps from personalized content or use static steps
  const steps = useMemo(() => {
    if (personalizedContent && personalizedContent.vocabulary.length > 0) {
      return generateDynamicSteps(personalizedContent, topic);
    }
    return staticGuidedSteps[topic.toLowerCase()] || staticGuidedSteps.grammar;
  }, [personalizedContent, topic]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [usedHints, setUsedHints] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "hint"; message: string } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const step = steps[currentStep];

  const handleShowHint = () => {
    setShowHint(true);
    setUsedHints(true);
    toast.info("Hint revealed! Remember, trying on your own helps you learn better.");
  };

  const handleInsertStarter = (starter: string) => {
    setUserAnswer(prev => prev + (prev ? " " : "") + starter);
    toast.success("Starter added! Now complete the sentence.");
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      toast.error("Please write something first!");
      return;
    }

    const wordCount = userAnswer.trim().split(/\s+/).length;
    
    if (wordCount < 3) {
      setFeedback({
        type: "hint",
        message: "Try adding more words to make a complete sentence!",
      });
      return;
    }

    setFeedback({
      type: "success",
      message: "Great job! Your answer shows good understanding. Keep practicing!",
    });
    setCompletedSteps(prev => [...prev, step.id]);

    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setUserAnswer("");
        setShowHint(false);
        setFeedback(null);
      } else {
        onComplete(usedHints);
      }
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground capitalize">{topic} Help</h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`w-3 h-3 rounded-full ${
                completedSteps.includes(s.id)
                  ? "bg-success"
                  : i === currentStep
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Concept Explanation */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-4 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              <h3 className="font-bold text-foreground">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{step.explanation}</p>
          </div>

          {/* Vocabulary with Pronunciation */}
          {step.vocabulary && step.vocabulary.length > 0 && (
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground">Key Vocabulary</h4>
                <span className="text-xs text-muted-foreground">(tap to hear)</span>
              </div>
              <div className="space-y-2">
                {step.vocabulary.map((v, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-2 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => speakText(v.word, 0.8)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <motion.button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); speakText(v.word, 0.8); }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Volume2 className="w-4 h-4 text-primary" />
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{v.word}</p>
                      <p className="text-xs text-muted-foreground">{v.definition}</p>
                      <motion.p
                        className="text-xs text-muted-foreground italic mt-1 cursor-pointer hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); speakText(v.example, 0.8); }}
                      >
                        📢 "{v.example}"
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Example */}
          <div className="bg-secondary/30 rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-info" />
              <h4 className="font-bold text-foreground">Example</h4>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
              {step.example}
            </pre>
          </div>

          {/* Sentence Starters */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-success" />
              <h4 className="font-bold text-foreground">Sentence Starters</h4>
              <span className="text-xs text-muted-foreground">(click to add)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {step.starters.map((starter, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertStarter(starter)}
                  className="text-xs"
                >
                  {starter}
                </Button>
              ))}
            </div>
          </div>

          {/* Try It Section */}
          <div className="bg-card rounded-2xl p-4 border border-primary">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PenLine className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground">Try It!</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowHint}
                disabled={showHint}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Need a hint?
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{step.tryItPrompt}</p>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-warning/10 rounded-xl p-3 mb-3 border border-warning/30"
                >
                  <p className="text-sm text-warning-foreground">
                    💡 <strong>Hint:</strong> Use one of the sentence starters above and add your own words to complete it!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[80px] mb-3"
            />

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-xl p-3 mb-3 ${
                    feedback.type === "success"
                      ? "bg-success/10 border border-success/30"
                      : "bg-warning/10 border border-warning/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {feedback.type === "success" ? (
                      <Sparkles className="w-5 h-5 text-success" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-warning" />
                    )}
                    <p className="text-sm">{feedback.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setUserAnswer("")}
              >
                Clear
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Check Answer
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {currentStep < steps.length - 1 && completedSteps.includes(step.id) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Button
            className="w-full"
            onClick={() => {
              setCurrentStep(prev => prev + 1);
              setUserAnswer("");
              setShowHint(false);
              setFeedback(null);
            }}
          >
            Next Step
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default GuidedHelp_mod;
