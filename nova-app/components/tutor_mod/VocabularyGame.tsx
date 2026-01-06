import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shuffle, Check, X, Sparkles } from "lucide-react";

interface VocabularyGameProps {
  words: { word: string; translation: string; hint?: string }[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

const VocabularyGame = ({ words, onComplete, onClose }: VocabularyGameProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentWord = words[currentIndex];
  const isFinished = currentIndex >= words.length;

  // Generate random options including the correct answer
  useState(() => {
    if (words.length > 0) {
      const correctAnswer = words[0].translation;
      const wrongAnswers = words
        .filter((_, i) => i !== 0)
        .map((w) => w.translation)
        .slice(0, 3);
      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    }
  });

  const generateOptions = (index: number) => {
    const correctAnswer = words[index].translation;
    const wrongAnswers = words
      .filter((_, i) => i !== index)
      .map((w) => w.translation)
      .slice(0, 3);
    return [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentWord.translation;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(score + 10);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      if (currentIndex + 1 < words.length) {
        setCurrentIndex(currentIndex + 1);
        setOptions(generateOptions(currentIndex + 1));
      } else {
        onComplete(score + (correct ? 10 : 0));
      }
    }, 1500);
  };

  if (isFinished) {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          🎉
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">¡Excelente!</h3>
        <p className="text-muted-foreground mb-4">
          Obtuviste <span className="font-bold text-primary">{score}</span> puntos
        </p>
        <Button onClick={onClose} variant="default">
          <Sparkles className="w-5 h-5 mr-2" />
          Continuar
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-card rounded-3xl shadow-medium"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Vocabulario</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Word to translate */}
      <motion.div
        key={currentWord.word}
        className="p-6 gradient-primary rounded-2xl text-center mb-6"
        initial={{ rotateY: -90 }}
        animate={{ rotateY: 0 }}
        transition={{ type: "spring" }}
      >
        <p className="text-3xl font-bold text-primary-foreground mb-2">
          {currentWord.word}
        </p>
        {currentWord.hint && (
          <p className="text-sm text-primary-foreground/80">
            💡 Pista: {currentWord.hint}
          </p>
        )}
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === currentWord.translation;
          
          let bgColor = "bg-muted hover:bg-muted/80";
          if (showResult) {
            if (isCorrectAnswer) bgColor = "bg-success text-success-foreground";
            else if (isSelected) bgColor = "bg-destructive text-destructive-foreground";
          }

          return (
            <motion.button
              key={option}
              className={`p-4 rounded-xl font-medium transition-colors ${bgColor}`}
              onClick={() => !showResult && handleAnswer(option)}
              disabled={showResult}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!showResult ? { scale: 1.03 } : {}}
              whileTap={!showResult ? { scale: 0.97 } : {}}
            >
              {option}
              {showResult && isSelected && (
                <motion.span
                  className="ml-2 inline-block"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {isCorrect ? <Check className="w-4 h-4 inline" /> : <X className="w-4 h-4 inline" />}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className={`mt-4 p-3 rounded-xl text-center ${isCorrect ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {isCorrect ? "🎉 ¡Correcto! +10 puntos" : `❌ La respuesta correcta era: ${currentWord.translation}`}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VocabularyGame;
