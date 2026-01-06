import { useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabularyWordProps {
  word: string;
  definition: string;
  example: string;
  gradeLevel?: number;
  showExample?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "card" | "inline" | "compact";
}

// Generate grade-appropriate example sentences
export const generateContextSentence = (word: string, definition: string, gradeLevel: number): string => {
  const templates: Record<number, (w: string, d: string) => string[]> = {
    1: (w, d) => [
      `The ${w.toLowerCase()} is fun!`,
      `I see a ${w.toLowerCase()}.`,
      `Look at the ${w.toLowerCase()}!`,
      `I like the ${w.toLowerCase()}.`,
    ],
    2: (w, d) => [
      `The ${w.toLowerCase()} is very important.`,
      `We learned about ${w.toLowerCase()} today.`,
      `Can you find the ${w.toLowerCase()}?`,
      `This ${w.toLowerCase()} is amazing!`,
    ],
    3: (w, d) => [
      `The ${w.toLowerCase()} helps us understand better.`,
      `We use ${w.toLowerCase()} in our project.`,
      `I discovered a new ${w.toLowerCase()} in class.`,
      `The teacher explained the ${w.toLowerCase()} to us.`,
    ],
    4: (w, d) => [
      `Understanding ${w.toLowerCase()} is essential for success.`,
      `The ${w.toLowerCase()} plays an important role in our study.`,
      `Scientists use ${w.toLowerCase()} to solve problems.`,
      `We analyzed the ${w.toLowerCase()} during our experiment.`,
    ],
    5: (w, d) => [
      `The concept of ${w.toLowerCase()} is fundamental to our research.`,
      `By applying ${w.toLowerCase()}, we can achieve better results.`,
      `The ${w.toLowerCase()} demonstrates the principle we studied.`,
      `Experts consider ${w.toLowerCase()} to be crucial for advancement.`,
    ],
  };

  const gradeTemplates = templates[gradeLevel] || templates[3];
  const sentences = gradeTemplates(word, definition);
  return sentences[Math.floor(Math.random() * sentences.length)];
};

const VocabularyWord = ({
  word,
  definition,
  example,
  gradeLevel = 3,
  showExample = true,
  size = "md",
  variant = "card",
}: VocabularyWordProps) => {
  const speakWord = useCallback(() => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = gradeLevel <= 2 ? 0.7 : gradeLevel <= 4 ? 0.8 : 0.9;
    speechSynthesis.speak(utterance);
  }, [word, gradeLevel]);

  const speakSentence = useCallback(() => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(example);
    utterance.lang = "en-US";
    utterance.rate = gradeLevel <= 2 ? 0.7 : gradeLevel <= 4 ? 0.8 : 0.9;
    speechSynthesis.speak(utterance);
  }, [example, gradeLevel]);

  const sizeClasses = {
    sm: { word: "text-sm", def: "text-xs", example: "text-xs", icon: "w-3 h-3", padding: "p-2" },
    md: { word: "text-base", def: "text-sm", example: "text-sm", icon: "w-4 h-4", padding: "p-3" },
    lg: { word: "text-lg", def: "text-base", example: "text-base", icon: "w-5 h-5", padding: "p-4" },
  };

  const classes = sizeClasses[size];

  if (variant === "compact") {
    return (
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.02 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20"
          onClick={speakWord}
        >
          <Volume2 className={classes.icon + " text-primary"} />
        </Button>
        <span className={`font-semibold text-foreground ${classes.word}`}>{word}</span>
        <span className={`text-muted-foreground ${classes.def}`}>- {definition}</span>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
      <motion.span
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
        onClick={speakWord}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Volume2 className="w-3 h-3 text-primary" />
        <span className="font-medium text-foreground">{word}</span>
      </motion.span>
    );
  }

  return (
    <motion.div
      className={`bg-card border border-border rounded-xl ${classes.padding} hover:border-primary/50 transition-colors`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <motion.button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            onClick={speakWord}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Listen to word"
          >
            <Volume2 className={classes.icon + " text-primary"} />
          </motion.button>
          <h4 className={`font-bold text-foreground ${classes.word}`}>{word}</h4>
        </div>
      </div>

      <p className={`text-muted-foreground mb-2 ${classes.def}`}>{definition}</p>

      {showExample && example && (
        <motion.div
          className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
          onClick={speakSentence}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Volume2 className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className={`text-muted-foreground italic ${classes.example}`}>"{example}"</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VocabularyWord;
