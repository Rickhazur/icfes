import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Volume2, ArrowLeft, RotateCcw, 
  Trophy, Star, Coins, ThermometerSun, Sparkles,
  ChevronRight, Target, GraduationCap, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";

interface PronunciationItem {
  id: string;
  text: string;
  phonetic: string;
  tips: string;
  type: "word" | "sentence";
}

interface DifficultyLevel {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  words: PronunciationItem[];
  sentences: PronunciationItem[];
}

interface PronouncePlayProps {
  onComplete: (totalCoins: number, averageScore: number) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
}

type GamePhase = "listening" | "recording" | "result";

// Coin reward thresholds
const COIN_THRESHOLDS = [
  { min: 90, max: 100, coins: 10, label: "Perfect!", color: "text-success", emoji: "🏆" },
  { min: 75, max: 89, coins: 7, label: "Great!", color: "text-primary", emoji: "⭐" },
  { min: 50, max: 74, coins: 4, label: "Good try!", color: "text-warning", emoji: "👍" },
  { min: 0, max: 49, coins: 1, label: "Keep practicing!", color: "text-muted-foreground", emoji: "💪" },
];

// Generate pronunciation tips based on word
const generatePhoneticTip = (word: string): { phonetic: string; tips: string } => {
  const tips: Record<string, { phonetic: string; tips: string }> = {
    hypothesis: { phonetic: "/haɪˈpɒθəsɪs/", tips: "hy-POTH-uh-sis - stress the second syllable" },
    experiment: { phonetic: "/ɪkˈsperɪmənt/", tips: "ik-SPER-i-ment - clear 'x' sound" },
    observation: { phonetic: "/ˌɒbzəˈveɪʃn/", tips: "ob-zur-VAY-shun - stress the third syllable" },
    conclusion: { phonetic: "/kənˈkluːʒn/", tips: "kun-KLOO-zhun - long 'oo' sound" },
    total: { phonetic: "/ˈtəʊtl/", tips: "TOH-tul - stress the first syllable" },
    difference: { phonetic: "/ˈdɪfrəns/", tips: "DIF-er-ence - three syllables" },
    century: { phonetic: "/ˈsentʃəri/", tips: "SEN-chu-ree - soft 'c' like 's'" },
    paragraph: { phonetic: "/ˈpærəɡrɑːf/", tips: "PAR-uh-graf - three syllables" },
    laboratory: { phonetic: "/ləˈbɒrətri/", tips: "luh-BOR-uh-tree - stress second syllable" },
  };

  const lowerWord = word.toLowerCase();
  if (tips[lowerWord]) {
    return tips[lowerWord];
  }

  // Generate basic phonetic guidance
  const syllables = Math.max(1, Math.round(word.length / 3));
  return {
    phonetic: `/${word.toLowerCase()}/`,
    tips: `Say it slowly: ${word}. ${syllables} syllable${syllables > 1 ? 's' : ''}.`,
  };
};

// Generate sentence pronunciation tip
const generateSentenceTip = (sentence: string): { phonetic: string; tips: string } => {
  const words = sentence.split(' ').length;
  const stressWord = sentence.split(' ')[Math.floor(words / 2)];
  
  return {
    phonetic: `[${sentence.toLowerCase()}]`,
    tips: `Pause at commas. Stress "${stressWord}". ${sentence.endsWith('?') ? 'Raise voice at end.' : 'Lower voice at end.'}`,
  };
};

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Mock pronunciation scoring
const calculatePronunciationScore = async (
  text: string,
  accent: "british" | "american",
  recordingDuration: number
): Promise<{ score: number; feedback: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const baseScore = Math.floor(Math.random() * 40) + 60;
  const durationBonus = recordingDuration > 500 && recordingDuration < 5000 ? 5 : -10;
  const lengthFactor = text.length > 30 ? -5 : 0; // Sentences are slightly harder
  const finalScore = Math.min(100, Math.max(0, baseScore + durationBonus + lengthFactor));
  
  let feedback = "";
  if (finalScore >= 90) {
    feedback = "Excellent! Your pronunciation is outstanding! 🌟";
  } else if (finalScore >= 75) {
    feedback = "Great job! You're almost there, keep it up!";
  } else if (finalScore >= 50) {
    feedback = "Good effort! Listen to the example again and try once more.";
  } else {
    feedback = "Keep practicing! Focus on the tips and try again.";
  }
  
  return { score: finalScore, feedback };
};

const getCoinsForScore = (score: number): { coins: number; label: string; color: string; emoji: string } => {
  const threshold = COIN_THRESHOLDS.find(t => score >= t.min && score <= t.max);
  return threshold || COIN_THRESHOLDS[COIN_THRESHOLDS.length - 1];
};

const PronouncePlay_mod = ({ onComplete, onBack, personalizedContent }: PronouncePlayProps) => {
  const { addCoins, balance } = useRewards();
  
  // Generate dynamic difficulty levels from personalized content
  const difficultyLevels = useMemo<DifficultyLevel[]>(() => {
    if (!personalizedContent || personalizedContent.vocabulary.length === 0) {
      // Fallback with basic items
      return [
        {
          id: "beginner",
          name: "Beginner",
          emoji: "🌱",
          color: "text-success",
          bgColor: "bg-success/20",
          words: [
            { id: "fb1", text: "hello", phonetic: "/həˈləʊ/", tips: "huh-LOH - friendly greeting", type: "word" as const },
            { id: "fb2", text: "learn", phonetic: "/lɜːn/", tips: "LURN - rhymes with turn", type: "word" as const },
          ],
          sentences: [
            { id: "fbs1", text: "Hello, how are you?", phonetic: "/həˈləʊ haʊ ɑːr juː/", tips: "Pause after Hello", type: "sentence" as const },
          ],
        },
      ];
    }

    const easyVocab = personalizedContent.vocabulary.filter(v => v.difficulty === 'easy');
    const mediumVocab = personalizedContent.vocabulary.filter(v => v.difficulty === 'medium');
    const hardVocab = personalizedContent.vocabulary.filter(v => v.difficulty === 'hard');
    
    const easySentences = personalizedContent.sentences.filter(s => s.difficulty === 'easy');
    const mediumSentences = personalizedContent.sentences.filter(s => s.difficulty === 'medium');
    const hardSentences = personalizedContent.sentences.filter(s => s.difficulty === 'hard');

    const createWords = (vocab: typeof easyVocab): PronunciationItem[] => 
      vocab.map((v, idx) => {
        const { phonetic, tips } = generatePhoneticTip(v.word);
        return {
          id: `pw-${idx}-${v.word}`,
          text: v.word,
          phonetic,
          tips,
          type: "word" as const,
        };
      });

    const createSentences = (sentences: typeof easySentences): PronunciationItem[] =>
      sentences.map((s, idx) => {
        const { phonetic, tips } = generateSentenceTip(s.sentence);
        return {
          id: `ps-${idx}`,
          text: s.sentence,
          phonetic,
          tips,
          type: "sentence" as const,
        };
      });

    return [
      {
        id: "beginner",
        name: "Beginner",
        emoji: "🌱",
        color: "text-success",
        bgColor: "bg-success/20",
        words: createWords(easyVocab.length > 0 ? easyVocab : personalizedContent.vocabulary.slice(0, 5)),
        sentences: createSentences(easySentences.length > 0 ? easySentences : personalizedContent.sentences.slice(0, 3)),
      },
      {
        id: "intermediate",
        name: "Intermediate",
        emoji: "🌿",
        color: "text-warning",
        bgColor: "bg-warning/20",
        words: createWords(mediumVocab.length > 0 ? mediumVocab : personalizedContent.vocabulary.slice(0, 5)),
        sentences: createSentences(mediumSentences.length > 0 ? mediumSentences : personalizedContent.sentences.slice(0, 3)),
      },
      {
        id: "advanced",
        name: "Advanced",
        emoji: "🌳",
        color: "text-destructive",
        bgColor: "bg-destructive/20",
        words: createWords(hardVocab.length > 0 ? hardVocab : personalizedContent.vocabulary.slice(0, 5)),
        sentences: createSentences(hardSentences.length > 0 ? hardSentences : personalizedContent.sentences.slice(0, 3)),
      },
    ];
  }, [personalizedContent]);
  
  // Level and mode selection
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);
  const [practiceMode, setPracticeMode] = useState<"words" | "sentences" | null>(null);
  
  // Practice state
  const [practiceItems, setPracticeItems] = useState<PronunciationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accent, setAccent] = useState<"british" | "american">("american");
  const [gamePhase, setGamePhase] = useState<GamePhase>("listening");
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Results state
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState("");
  const [coinsEarnedThisItem, setCoinsEarnedThisItem] = useState(0);
  const [thermometerFill, setThermometerFill] = useState(0);
  
  // Session stats
  const [sessionStats, setSessionStats] = useState({ totalCoins: 0, attempts: 0, scores: [] as number[] });
  const [showResults, setShowResults] = useState(false);
  
  const recordingStartTime = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const currentItem = practiceItems[currentIndex];

  // Animate thermometer fill
  useEffect(() => {
    if (lastScore !== null) {
      const timer = setTimeout(() => setThermometerFill(lastScore), 100);
      return () => clearTimeout(timer);
    }
  }, [lastScore]);

  // Start practice with selected level and mode
  const startPractice = (level: DifficultyLevel, mode: "words" | "sentences") => {
    setSelectedLevel(level);
    setPracticeMode(mode);
    const items = mode === "words" ? level.words : level.sentences;
    setPracticeItems(shuffleArray(items).slice(0, 10)); // 10 random items
    setCurrentIndex(0);
    setGamePhase("listening");
  };

  // Play the current item audio
  const playItemAudio = useCallback(() => {
    if (!currentItem) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(currentItem.text);
    utterance.lang = accent === "british" ? "en-GB" : "en-US";
    utterance.rate = currentItem.type === "sentence" ? 0.85 : 0.8;
    
    utterance.onend = () => {
      setIsPlaying(false);
      // Auto-transition to recording phase after speaking
      setTimeout(() => setGamePhase("recording"), 500);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [currentItem, accent]);

  // Auto-play when entering listening phase
  useEffect(() => {
    if (gamePhase === "listening" && currentItem && !isPlaying) {
      const timer = setTimeout(() => playItemAudio(), 800);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentItem, playItemAudio, isPlaying]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      recordingStartTime.current = Date.now();
      setIsRecording(true);
      
      mediaRecorder.start();
      
      // Auto-stop after 8 seconds for sentences, 5 for words
      const maxDuration = currentItem?.type === "sentence" ? 8000 : 5000;
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, maxDuration);
    } catch (err) {
      toast.error("Could not access microphone. Please allow microphone access.");
    }
  }, [currentItem]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !currentItem) return;
    
    const recordingDuration = Date.now() - recordingStartTime.current;
    
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setIsProcessing(true);
    
    // Calculate pronunciation score
    const result = await calculatePronunciationScore(currentItem.text, accent, recordingDuration);
    
    setLastScore(result.score);
    setLastFeedback(result.feedback);
    setGamePhase("result");
    
    // Calculate and credit coins
    const coinResult = getCoinsForScore(result.score);
    setCoinsEarnedThisItem(coinResult.coins);
    
    const creditResult = await addCoins(coinResult.coins, "pronunciation_practice");
    
    setSessionStats(prev => ({
      totalCoins: prev.totalCoins + (creditResult.coinsAdded || 0),
      attempts: prev.attempts + 1,
      scores: [...prev.scores, result.score],
    }));
    
    setIsProcessing(false);
    
    toast.success(`+${creditResult.coinsAdded} coins! ${coinResult.emoji}`, { duration: 2000 });
  }, [currentItem, accent, addCoins]);

  const handleNext = () => {
    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setLastScore(null);
      setThermometerFill(0);
      setCoinsEarnedThisItem(0);
      setGamePhase("listening");
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setLastScore(null);
    setThermometerFill(0);
    setCoinsEarnedThisItem(0);
    setGamePhase("listening");
  };

  // Level selection screen
  if (!selectedLevel || !practiceMode) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Pronunciation Practice</h2>
            <p className="text-sm text-muted-foreground">Choose your level and what to practice</p>
          </div>
          <div className="flex items-center gap-2 bg-warning/20 px-3 py-1.5 rounded-full">
            <Coins className="w-4 h-4 text-warning" />
            <span className="font-bold text-foreground">{balance}</span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {difficultyLevels.map((level) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${level.bgColor} rounded-2xl p-4 border-2 border-border`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{level.emoji}</span>
                <div>
                  <h3 className={`text-lg font-bold ${level.color}`}>{level.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {level.words.length} words • {level.sentences.length} sentences
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => startPractice(level, "words")}
                >
                  <span className="text-lg">📝</span>
                  <span className="font-medium">Words</span>
                  <span className="text-xs text-muted-foreground">Single words</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => startPractice(level, "sentences")}
                >
                  <span className="text-lg">💬</span>
                  <span className="font-medium">Sentences</span>
                  <span className="text-xs text-muted-foreground">Full phrases</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            🎯 Earn coins based on pronunciation accuracy!
          </p>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const averageScore = sessionStats.scores.length > 0 
      ? Math.round(sessionStats.scores.reduce((a, b) => a + b, 0) / sessionStats.scores.length)
      : 0;

    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">Practice Complete!</h2>
          <p className="text-muted-foreground mb-4">
            {selectedLevel.emoji} {selectedLevel.name} • {practiceMode === "words" ? "Words" : "Sentences"}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-warning/20 to-accent/20 rounded-xl p-4">
              <Coins className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{sessionStats.totalCoins}</p>
              <p className="text-sm text-muted-foreground">Coins Earned</p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-info/20 rounded-xl p-4">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
            </div>
          </div>

          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-8 h-8 ${
                  i < Math.ceil(averageScore / 20) ? "text-warning fill-warning" : "text-muted"
                }`}
              />
            ))}
          </div>

          <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6">
            <p className="text-success font-medium">
              Your coins have been added! 🎉
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total balance: {balance} coins
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => {
              setSelectedLevel(null);
              setPracticeMode(null);
              setShowResults(false);
              setSessionStats({ totalCoins: 0, attempts: 0, scores: [] });
            }}>
              Practice More
            </Button>
            <Button onClick={() => onComplete(sessionStats.totalCoins, averageScore)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Finish
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const coinInfo = lastScore !== null ? getCoinsForScore(lastScore) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => {
          setSelectedLevel(null);
          setPracticeMode(null);
        }}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {selectedLevel.emoji} {selectedLevel.name} {practiceMode === "words" ? "Words" : "Sentences"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {practiceItems.length}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-warning/20 px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-warning" />
          <span className="font-bold text-foreground">{balance}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-4">
        {practiceItems.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i < currentIndex ? "bg-success" : i === currentIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Accent selector */}
      <div className="flex gap-2 justify-center mb-4">
        <Button
          variant={accent === "british" ? "default" : "outline"}
          size="sm"
          onClick={() => setAccent("british")}
          className="gap-2"
        >
          🇬🇧 British
        </Button>
        <Button
          variant={accent === "american" ? "default" : "outline"}
          size="sm"
          onClick={() => setAccent("american")}
          className="gap-2"
        >
          🇺🇸 American
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Current item card */}
        <motion.div
          key={currentItem?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${selectedLevel.bgColor} rounded-3xl p-6 border-2 border-primary/30 mb-4`}
        >
          <div className="text-center">
            {/* Phase indicator */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
              gamePhase === "listening" ? "bg-primary/20 text-primary" :
              gamePhase === "recording" ? "bg-destructive/20 text-destructive" :
              "bg-success/20 text-success"
            }`}>
              {gamePhase === "listening" && (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="font-medium">Listen carefully...</span>
                </>
              )}
              {gamePhase === "recording" && (
                <>
                  <Mic className="w-4 h-4" />
                  <span className="font-medium">Your turn! Say it now</span>
                </>
              )}
              {gamePhase === "result" && (
                <>
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Result</span>
                </>
              )}
            </div>
            
            <h3 className={`font-bold text-foreground mb-2 ${
              currentItem?.type === "sentence" ? "text-2xl leading-relaxed" : "text-4xl"
            }`}>
              {currentItem?.text}
            </h3>
            <p className="text-lg text-muted-foreground font-mono mb-4">{currentItem?.phonetic}</p>
            
            {/* Listen button (for replay) */}
            {gamePhase !== "listening" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 mb-4"
                onClick={playItemAudio}
                disabled={isPlaying}
              >
                <Volume2 className="w-4 h-4" />
                {isPlaying ? "Playing..." : "Listen again"}
              </Button>
            )}
            
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-sm text-muted-foreground">
                💡 <span className="text-foreground font-medium">Tip:</span> {currentItem?.tips}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recording controls */}
        {gamePhase === "recording" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 mb-4"
          >
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing pronunciation...</p>
              </div>
            ) : (
              <>
                <motion.button
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? "bg-destructive shadow-lg shadow-destructive/50 scale-110" 
                      : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  animate={isRecording ? { scale: [1.1, 1.15, 1.1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {isRecording ? (
                    <MicOff className="w-10 h-10 text-destructive-foreground" />
                  ) : (
                    <Mic className="w-10 h-10 text-primary-foreground" />
                  )}
                </motion.button>
                
                <p className="text-sm text-muted-foreground text-center">
                  {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Result display */}
        <AnimatePresence>
          {gamePhase === "result" && lastScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4"
            >
              <div className="bg-gradient-to-br from-secondary/50 to-muted/50 rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-4">
                  {/* Thermometer */}
                  <div className="relative w-12 h-32">
                    <div className="absolute inset-x-1 bottom-2 top-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`absolute inset-x-0 bottom-0 rounded-full ${
                          lastScore >= 90 ? "bg-gradient-to-t from-success to-success/70" :
                          lastScore >= 75 ? "bg-gradient-to-t from-primary to-primary/70" :
                          lastScore >= 50 ? "bg-gradient-to-t from-warning to-warning/70" :
                          "bg-gradient-to-t from-destructive to-destructive/70"
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: `${thermometerFill}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <ThermometerSun className={`absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-6 ${coinInfo?.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-3xl font-bold ${coinInfo?.color}`}>{lastScore}%</span>
                      <span className="text-2xl">{coinInfo?.emoji}</span>
                    </div>
                    <p className={`font-semibold ${coinInfo?.color} mb-1`}>{coinInfo?.label}</p>
                    <p className="text-sm text-muted-foreground mb-3">{lastFeedback}</p>
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="inline-flex items-center gap-2 bg-warning/20 px-4 py-2 rounded-full"
                    >
                      <Coins className="w-5 h-5 text-warning" />
                      <span className="font-bold text-warning">+{coinsEarnedThisItem} coins!</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleRetry}>
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button className="flex-1 gap-2" onClick={handleNext}>
                  {currentIndex < practiceItems.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      Finish
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listening phase animation */}
        {gamePhase === "listening" && isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-8"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-primary rounded-full"
                  animate={{ height: [16, 32, 16] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Session progress */}
      <div className="mt-4 p-3 bg-secondary/30 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Session coins:</span>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-warning" />
            <span className="font-bold text-foreground">{sessionStats.totalCoins}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronouncePlay_mod;
