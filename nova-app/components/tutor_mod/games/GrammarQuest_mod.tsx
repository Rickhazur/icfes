import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Map, Star, Trophy, Zap, ArrowLeft, HelpCircle, Check, Sparkles } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";

interface GrammarChallenge {
  id: string;
  type: 'correct' | 'complete' | 'order';
  question: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
  rule: string;
  tags?: string[];
}

interface GrammarQuestProps {
  challenges: GrammarChallenge[];
  onComplete: (score: number, coins: number) => void;
  onClose: () => void;
  levelName?: string;
}

const levelEmojis = ['🏝️', '🌲', '🏔️', '🌋', '🏰'];
const levelNames = ['Starter Island', 'Magic Forest', 'Wisdom Mountain', 'Speed Volcano', 'Final Castle'];

const GrammarQuest_mod = ({ 
  challenges, 
  onComplete, 
  onClose,
  levelName = 'Level 1'
}: GrammarQuestProps) => {
  const { addCoins } = useRewards();
  const [gameState, setGameState] = useState<'map' | 'challenge' | 'finished'>('map');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [usedHints, setUsedHints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<boolean[]>(new Array(5).fill(false));
  const [levelStars, setLevelStars] = useState<number[]>(new Array(5).fill(0));

  const challengesPerLevel = Math.ceil(challenges.length / 5);
  const levelChallenges = challenges.slice(
    currentLevel * challengesPerLevel,
    (currentLevel + 1) * challengesPerLevel
  );
  const challenge = levelChallenges[currentChallenge];

  // Start a level
  const startLevel = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    setCurrentChallenge(0);
    setScore(0);
    setCoins(0);
    setUsedHints(0);
    setStreak(0);
    setGameState('challenge');
  };

  // Handle text input answer
  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    
    const correct = userAnswer.toLowerCase().trim() === challenge.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);

    let earnedCoins = 0;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Calculate coins
      earnedCoins = showHint ? 5 : 10; // Less if used hint
      const streakBonus = newStreak >= 3 ? 5 : 0;
      earnedCoins += streakBonus;
      
      setScore(prev => prev + earnedCoins);
      setCoins(prev => prev + earnedCoins);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowResult(false);
      setShowHint(false);
      setUserAnswer('');
      
      if (currentChallenge + 1 < levelChallenges.length) {
        setCurrentChallenge(prev => prev + 1);
      } else {
        finishLevel();
      }
    }, 2500);
  };

  // Handle option selection
  const handleOptionSelect = async (option: string) => {
    if (showResult) return;
    
    setUserAnswer(option);
    const correct = option === challenge.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    let earnedCoins = 0;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      earnedCoins = showHint ? 5 : 10;
      const streakBonus = newStreak >= 3 ? 5 : 0;
      earnedCoins += streakBonus;
      
      setScore(prev => prev + earnedCoins);
      setCoins(prev => prev + earnedCoins);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowResult(false);
      setShowHint(false);
      setUserAnswer('');
      
      if (currentChallenge + 1 < levelChallenges.length) {
        setCurrentChallenge(prev => prev + 1);
      } else {
        finishLevel();
      }
    }, 2000);
  };

  // Finish level
  const finishLevel = async () => {
    const correctAnswers = Math.floor(score / 10);
    const percentage = (correctAnswers / levelChallenges.length) * 100;
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;
    
    // Update level completion
    const newCompleted = [...completedLevels];
    newCompleted[currentLevel] = true;
    setCompletedLevels(newCompleted);
    
    const newStars = [...levelStars];
    newStars[currentLevel] = Math.max(newStars[currentLevel], stars);
    setLevelStars(newStars);

    // Credit coins
    const result = await addCoins(coins, `grammar_quest_level_${currentLevel + 1}`);
    
    // Check if all levels complete
    if (newCompleted.every(c => c)) {
      setGameState('finished');
      onComplete(score, result.coinsAdded);
    } else {
      setGameState('map');
    }
  };

  // Use hint
  const useHint = () => {
    setShowHint(true);
    setUsedHints(prev => prev + 1);
  };

  // Map view
  if (gameState === 'map') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 gradient-secondary rounded-xl text-secondary-foreground">
            <Star className="w-5 h-5" />
            <span className="font-bold">{coins} coins</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">🗺️ Grammar Quest</h2>
          <p className="text-muted-foreground">Complete levels to earn stars and coins!</p>
        </div>

        {/* Map path */}
        <div className="relative py-8">
          {/* Path line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2" />
          
          {/* Levels */}
          <div className="space-y-6 relative">
            {levelNames.map((name, index) => {
              const isUnlocked = index === 0 || completedLevels[index - 1];
              const isCompleted = completedLevels[index];
              const stars = levelStars[index];
              
              return (
                <motion.div
                  key={index}
                  className={`flex items-center gap-4 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex-1" />
                  
                  <motion.button
                    onClick={() => isUnlocked && startLevel(index)}
                    className={`relative z-10 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-medium transition-all ${
                      isUnlocked 
                        ? isCompleted 
                          ? 'gradient-success cursor-pointer' 
                          : 'gradient-primary cursor-pointer hover:scale-105'
                        : 'bg-muted cursor-not-allowed opacity-60'
                    }`}
                    whileHover={isUnlocked ? { scale: 1.05 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  >
                    <span className="text-3xl">{levelEmojis[index]}</span>
                    <span className="text-xs font-bold text-primary-foreground mt-1">
                      {index + 1}
                    </span>
                    
                    {/* Stars */}
                    {isCompleted && (
                      <div className="absolute -bottom-2 flex gap-0.5">
                        {[1, 2, 3].map(s => (
                          <Star 
                            key={s} 
                            className={`w-4 h-4 ${s <= stars ? 'text-warning fill-warning' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                  
                  <div className="flex-1 text-center">
                    <p className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {name}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // Challenge view
  if (gameState === 'challenge') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{levelEmojis[currentLevel]}</span>
            <span className="font-semibold text-foreground">{levelNames[currentLevel]}</span>
          </div>
          <div className="flex items-center gap-2">
            {streak >= 3 && (
              <motion.div
                className="flex items-center gap-1 px-2 py-1 gradient-secondary rounded-lg text-secondary-foreground text-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Zap className="w-3 h-3" />
                {streak}x
              </motion.div>
            )}
            <span className="text-sm text-muted-foreground">
              {currentChallenge + 1}/{levelChallenges.length}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full gradient-primary"
            animate={{ width: `${((currentChallenge + 1) / levelChallenges.length) * 100}%` }}
          />
        </div>

        {/* Challenge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={challenge.id}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
          >
            <div className="p-4 bg-destructive/10 rounded-xl mb-4">
              <p className="text-sm text-muted-foreground mb-1">
                {challenge.type === 'correct' ? 'Fix this sentence:' : 
                 challenge.type === 'complete' ? 'Complete the sentence:' :
                 'Order the words:'}
              </p>
              <p className="text-lg font-medium text-foreground">
                {challenge.question}
              </p>
            </div>

            {/* Answer input or options */}
            {challenge.options ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {challenge.options.map((option, index) => {
                  const isSelected = userAnswer === option;
                  const isCorrectOption = option === challenge.correctAnswer;
                  
                  let bgClass = "bg-muted hover:bg-muted/80";
                  if (showResult) {
                    if (isCorrectOption) bgClass = "bg-success text-success-foreground";
                    else if (isSelected) bgClass = "bg-destructive text-destructive-foreground";
                  }

                  return (
                    <motion.button
                      key={option}
                      className={`p-4 rounded-xl font-medium transition-colors ${bgClass}`}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showResult}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-4 text-lg rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  disabled={showResult}
                  onKeyDown={(e) => e.key === 'Enter' && !showResult && handleSubmit()}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="playful"
                size="sm"
                onClick={useHint}
                disabled={showHint || showResult}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Hint
              </Button>
              {!challenge.options && (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!userAnswer || showResult}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Check
                </Button>
              )}
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && !showResult && (
                <motion.div
                  className="mt-4 p-3 bg-warning/20 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-sm text-warning-foreground">💡 {challenge.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-success/20' : 'bg-muted'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {isCorrect ? (
                    <p className="text-success font-medium">🎉 Perfect! +{showHint ? 5 : 10} coins</p>
                  ) : (
                    <div>
                      <p className="text-foreground font-medium mb-1">Correct answer:</p>
                      <p className="text-success font-bold">{challenge.correctAnswer}</p>
                      <p className="text-sm text-muted-foreground mt-2">📚 {challenge.rule}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  // Finished (all levels complete)
  return (
    <motion.div
      className="p-6 bg-card rounded-3xl shadow-medium text-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <motion.div
        className="text-8xl mb-4"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.6 }}
      >
        👑
      </motion.div>
      
      <h2 className="text-3xl font-bold text-foreground mb-2">Grammar Master!</h2>
      <p className="text-muted-foreground mb-6">You completed all Grammar Quest levels</p>
      
      <div className="flex justify-center gap-2 mb-6">
        {levelStars.map((stars, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-2xl">{levelEmojis[i]}</span>
            <div className="flex">
              {[1, 2, 3].map(s => (
                <Star 
                  key={s} 
                  className={`w-3 h-3 ${s <= stars ? 'text-warning fill-warning' : 'text-muted'}`} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="default" onClick={onClose} size="lg">
        <Sparkles className="w-5 h-5 mr-2" />
        Celebrate!
      </Button>
    </motion.div>
  );
};

export default GrammarQuest_mod;
