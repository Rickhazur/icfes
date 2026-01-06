import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, Zap, Trophy, Star, ArrowLeft, Volume2 } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";
import { generateGradeContextSentence } from "@/hooks/usePersonalizedContent_mod";

interface FlashWord {
  id: string;
  word: string;
  translation: string;
  image?: string;
  tags?: string[];
  example?: string;
}

interface FlashRaceProps {
  words?: FlashWord[];
  onComplete: (score: number, coins: number) => void;
  onClose: () => void;
  grade?: number;
  timeLimit?: number;
  personalizedContent?: PersonalizedContent;
}

// Speak function for pronunciation
const speakWord = (word: string, rate: number = 0.8) => {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
};

const FlashRace_mod = ({ 
  words: propWords, 
  onComplete, 
  onClose, 
  grade = 3,
  timeLimit = 60,
  personalizedContent 
}: FlashRaceProps) => {
  const { addCoins } = useRewards();

  // Generate dynamic words from personalized content
  const words = useMemo<FlashWord[]>(() => {
    if (personalizedContent && personalizedContent.vocabulary.length > 0) {
      return personalizedContent.vocabulary.slice(0, 15).map((v, idx) => ({
        id: `pv-${idx}`,
        word: v.word,
        translation: v.definition,
        tags: [v.category],
        example: v.example || generateGradeContextSentence(v.word, v.definition, personalizedContent.gradeLevel),
      }));
    }
    return propWords || [];
  }, [personalizedContent, propWords]);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentWord = words[currentIndex];

  // Generate options
  const generateOptions = useCallback((index: number) => {
    const correct = words[index].translation;
    const wrong = words
      .filter((_, i) => i !== index)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.translation);
    return [correct, ...wrong].sort(() => Math.random() - 0.5);
  }, [words]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setTimeLeft(timeLimit);
    setOptions(generateOptions(0));
  };

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      finishGame();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft]);

  // Handle answer
  const handleAnswer = async (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentWord.translation;
    setIsCorrect(correct);
    setShowFeedback(true);

    let earnedCoins = 0;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount(prev => prev + 1);
      
      // Fast answer bonus (if answered within 3 seconds)
      const speedBonus = timeLeft > timeLimit - 3 ? 5 : 0;
      // Streak bonus
      const streakBonus = newStreak >= 3 ? 5 : 0;
      earnedCoins = 10 + speedBonus + streakBonus;
      
      setScore(prev => prev + earnedCoins);
      setCoins(prev => prev + earnedCoins);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (currentIndex + 1 < words.length) {
        setCurrentIndex(prev => prev + 1);
        setOptions(generateOptions(currentIndex + 1));
      } else {
        finishGame();
      }
    }, 1000);
  };

  // Finish game
  const finishGame = async () => {
    setGameState('finished');
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Credit coins
    const result = await addCoins(coins, 'flashrace');
    onComplete(score, result.coinsAdded);
  };

  // Ready screen
  if (gameState === 'ready') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          🏎️
        </motion.div>
        <h2 className="text-3xl font-bold text-foreground mb-2">FlashRace</h2>
        <p className="text-muted-foreground mb-6">
          Choose the correct translation as fast as you can!
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-bold">{timeLimit}s</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl">
            <Star className="w-5 h-5 text-warning" />
            <span className="font-bold">{words.length} words</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="default" size="lg" onClick={startGame}>
            <Zap className="w-5 h-5 mr-2" />
            Start!
          </Button>
        </div>
      </motion.div>
    );
  }

  // Finished screen
  if (gameState === 'finished') {
    const percentage = Math.round((correctCount / words.length) * 100);
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;
    
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.6 }}
        >
          {stars >= 2 ? '🏆' : stars === 1 ? '🎉' : '💪'}
        </motion.div>
        
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {stars >= 2 ? 'Amazing!' : stars === 1 ? 'Well done!' : 'Keep practicing!'}
        </h2>
        
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Star 
                className={`w-10 h-10 ${i <= stars ? 'text-warning fill-warning' : 'text-muted'}`} 
              />
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">Correct</p>
            <p className="text-2xl font-bold text-success">{correctCount}/{words.length}</p>
          </div>
          <div className="p-4 gradient-secondary rounded-xl">
            <p className="text-sm text-secondary-foreground/80">Coins</p>
            <p className="text-2xl font-bold text-secondary-foreground">+{coins}</p>
          </div>
        </div>

        <Button variant="default" onClick={onClose} size="lg">
          <Trophy className="w-5 h-5 mr-2" />
          Continue
        </Button>
      </motion.div>
    );
  }

  // Playing screen
  return (
    <motion.div
      className="p-6 bg-card rounded-3xl shadow-medium"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
            timeLeft <= 10 ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-muted'
          }`}>
            <Timer className="w-4 h-4" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
          {streak >= 3 && (
            <motion.div
              className="flex items-center gap-1 px-3 py-2 gradient-secondary rounded-xl text-secondary-foreground"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Zap className="w-4 h-4" />
              <span className="font-bold">{streak}x</span>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-warning/20 rounded-xl">
          <Star className="w-4 h-4 text-warning" />
          <span className="font-bold text-foreground">{score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Word card with pronunciation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          className="p-8 gradient-primary rounded-2xl text-center mb-6 relative"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
        >
          <motion.button
            className="absolute top-3 right-3 p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
            onClick={() => speakWord(currentWord.word, grade <= 2 ? 0.7 : 0.85)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Listen to pronunciation"
          >
            <Volume2 className="w-5 h-5 text-primary-foreground" />
          </motion.button>
          <p className="text-4xl font-bold text-primary-foreground">
            {currentWord.word}
          </p>
          {currentWord.example && (
            <motion.p
              className="text-sm text-primary-foreground/70 mt-2 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              "{currentWord.example}"
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === currentWord.translation;
          
          let bgClass = "bg-muted hover:bg-muted/80";
          if (showFeedback) {
            if (isCorrectOption) bgClass = "bg-success text-success-foreground";
            else if (isSelected) bgClass = "bg-destructive text-destructive-foreground";
          }

          return (
            <motion.button
              key={option}
              className={`p-4 rounded-xl font-semibold text-lg transition-colors ${bgClass}`}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!showFeedback ? { scale: 1.02 } : {}}
              whileTap={!showFeedback ? { scale: 0.98 } : {}}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className={`mt-4 p-4 rounded-xl text-center font-semibold ${
              isCorrect 
                ? 'bg-success/20 text-success' 
                : 'bg-destructive/20 text-destructive'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {isCorrect 
              ? `🎉 Correct! +${10 + (streak >= 3 ? 5 : 0)}` 
              : `❌ It was: ${currentWord.translation}`
            }
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FlashRace_mod;
