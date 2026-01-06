import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Check, HelpCircle, Sparkles } from "lucide-react";

interface GrammarChallengeProps {
  sentences: {
    incorrect: string;
    correct: string;
    hint: string;
    rule: string;
  }[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

const GrammarChallenge = ({ sentences, onComplete, onClose }: GrammarChallengeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentSentence = sentences[currentIndex];
  const isFinished = currentIndex >= sentences.length;

  const handleSubmit = () => {
    const correct = userAnswer.toLowerCase().trim() === currentSentence.correct.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(score + 15);
    }

    setTimeout(() => {
      setShowResult(false);
      setUserAnswer("");
      setShowHint(false);
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete(score + (correct ? 15 : 0));
      }
    }, 2500);
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
          ⭐
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">¡Increíble!</h3>
        <p className="text-muted-foreground mb-4">
          Obtuviste <span className="font-bold text-primary">{score}</span> puntos en gramática
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
          <Pencil className="w-5 h-5 text-accent" />
          <span className="font-semibold text-foreground">Gramática</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {sentences.length}
        </span>
      </div>

      {/* Incorrect sentence */}
      <motion.div
        key={currentSentence.incorrect}
        className="p-4 bg-destructive/10 rounded-xl mb-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <p className="text-sm text-muted-foreground mb-1">Corrige esta oración:</p>
        <p className="text-lg font-medium text-destructive line-through decoration-2">
          {currentSentence.incorrect}
        </p>
      </motion.div>

      {/* Input */}
      <div className="mb-4">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Escribe la oración correcta..."
          className="w-full p-4 text-lg rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          disabled={showResult}
          onKeyDown={(e) => e.key === "Enter" && !showResult && userAnswer && handleSubmit()}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="playful"
          size="sm"
          onClick={() => setShowHint(!showHint)}
          disabled={showResult}
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          Pista
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={handleSubmit}
          disabled={!userAnswer || showResult}
        >
          <Check className="w-4 h-4 mr-1" />
          Verificar
        </Button>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && !showResult && (
          <motion.div
            className="mt-4 p-3 bg-warning/20 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-sm text-warning-foreground">
              💡 {currentSentence.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-success/20" : "bg-muted"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {isCorrect ? (
              <p className="text-success font-medium">🎉 ¡Perfecto! +15 puntos</p>
            ) : (
              <div>
                <p className="text-foreground font-medium mb-2">La respuesta correcta es:</p>
                <p className="text-success font-bold">{currentSentence.correct}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  📚 Regla: {currentSentence.rule}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GrammarChallenge;
