import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, RotateCcw, Star, Sparkles, Eye, Hand, Zap, Trophy } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";

interface ARVocabularyProps {
  onComplete: (score: number, coins: number) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
}

interface VocabObject {
  id: string;
  word: string;
  translation: string;
  category: string;
  emoji: string;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tip: string;
}

// Category emojis and colors for dynamic vocabulary
const categoryStyles: Record<string, { emoji: string; color: string }> = {
  science: { emoji: '🔬', color: 'from-teal-400 to-cyan-500' },
  math: { emoji: '🔢', color: 'from-blue-400 to-indigo-500' },
  history: { emoji: '📜', color: 'from-amber-400 to-orange-500' },
  writing: { emoji: '✏️', color: 'from-purple-400 to-violet-500' },
  sequence: { emoji: '📋', color: 'from-green-400 to-emerald-500' },
  general: { emoji: '📚', color: 'from-pink-400 to-rose-500' },
  adjectives: { emoji: '🌈', color: 'from-yellow-400 to-amber-500' },
  feelings: { emoji: '😊', color: 'from-rose-400 to-pink-500' },
  verbs: { emoji: '🏃', color: 'from-sky-400 to-blue-500' },
  nouns: { emoji: '🏠', color: 'from-slate-400 to-gray-500' },
};

const ARVocabulary_mod = ({ onComplete, onBack, personalizedContent }: ARVocabularyProps) => {
  const { addCoins } = useRewards();
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [currentObjects, setCurrentObjects] = useState<VocabObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<VocabObject | null>(null);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [totalCoins, setTotalCoins] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Generate dynamic vocabulary from personalized content
  const vocabularyObjects = useMemo<VocabObject[]>(() => {
    if (!personalizedContent || personalizedContent.vocabulary.length === 0) {
      // Fallback basic vocabulary if no personalized content
      return [
        { id: 'f1', word: 'Learn', translation: 'To gain knowledge', category: 'general', emoji: '📖', color: 'from-blue-400 to-indigo-500', difficulty: 'beginner', tip: 'We learn new things every day!' },
        { id: 'f2', word: 'Practice', translation: 'To repeat to improve', category: 'general', emoji: '🎯', color: 'from-green-400 to-emerald-500', difficulty: 'beginner', tip: 'Practice makes perfect!' },
      ];
    }

    return personalizedContent.vocabulary.map((v, idx) => {
      const style = categoryStyles[v.category] || categoryStyles.general;
      const difficultyMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
        easy: 'beginner',
        medium: 'intermediate',
        hard: 'advanced',
      };

      return {
        id: `pv-${idx}`,
        word: v.word,
        translation: v.definition,
        category: v.category.charAt(0).toUpperCase() + v.category.slice(1),
        emoji: style.emoji,
        color: style.color,
        difficulty: difficultyMap[v.difficulty] || 'beginner',
        tip: v.example,
      };
    });
  }, [personalizedContent]);

  const categories = useMemo(() => 
    [...new Set(vocabularyObjects.map(o => o.category))],
    [vocabularyObjects]
  );

  const speakWord = useCallback((word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, []);

  const getFilteredObjects = useCallback(() => {
    let filtered = vocabularyObjects;
    if (difficulty) {
      filtered = filtered.filter(o => o.difficulty === difficulty);
    }
    if (category) {
      filtered = filtered.filter(o => o.category === category);
    }
    return filtered.sort(() => Math.random() - 0.5).slice(0, 6);
  }, [difficulty, category, vocabularyObjects]);

  useEffect(() => {
    if (difficulty || category) {
      setCurrentObjects(getFilteredObjects());
    }
  }, [difficulty, category, getFilteredObjects]);

  const handleObjectClick = (obj: VocabObject) => {
    setSelectedObject(obj);
    setShowTip(false);
    speakWord(obj.word);
  };

  const handleLearnWord = () => {
    if (!selectedObject || learnedWords.has(selectedObject.id)) return;
    
    const coinReward = selectedObject.difficulty === 'beginner' ? 3 : selectedObject.difficulty === 'intermediate' ? 5 : 8;
    
    setLearnedWords(prev => new Set([...prev, selectedObject.id]));
    setTotalCoins(prev => prev + coinReward);
    addCoins(coinReward, 'AR Vocabulary');
    
    toast.success(`+${coinReward} coins! "${selectedObject.word}" learned!`);
  };

  const handleRefresh = () => {
    setCurrentObjects(getFilteredObjects());
    setSelectedObject(null);
  };

  const handleFinish = () => {
    onComplete(learnedWords.size * 10, totalCoins);
  };

  if (!difficulty) {
    return (
      <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AR Vocabulary Explorer
            </h2>
            <p className="text-muted-foreground">Touch virtual objects to learn words!</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.div 
            className="text-8xl"
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌍
          </motion.div>
          
          <h3 className="text-xl font-bold text-foreground">Choose Your Level</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <motion.button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  level === 'beginner' ? 'bg-green-100 border-green-400 hover:bg-green-200' :
                  level === 'intermediate' ? 'bg-amber-100 border-amber-400 hover:bg-amber-200' :
                  'bg-red-100 border-red-400 hover:bg-red-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-4xl mb-2">
                  {level === 'beginner' ? '🌱' : level === 'intermediate' ? '🌿' : '🌳'}
                </div>
                <div className="font-bold capitalize text-foreground">{level}</div>
                <div className="text-sm text-muted-foreground">
                  {level === 'beginner' ? '3 coins/word' : level === 'intermediate' ? '5 coins/word' : '8 coins/word'}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!category) {
    return (
      <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setDifficulty(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Choose a Category</h2>
            <p className="text-muted-foreground capitalize">{difficulty} level selected</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catObjects = vocabularyObjects.filter(o => o.category === cat && o.difficulty === difficulty);
            if (catObjects.length === 0) return null;
            
            return (
              <motion.button
                key={cat}
                onClick={() => setCategory(cat)}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/30 hover:border-primary/50 transition-all"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-4xl mb-2">{catObjects[0]?.emoji}</div>
                <div className="font-bold text-foreground">{cat}</div>
                <div className="text-sm text-muted-foreground">{catObjects.length} objects</div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setCategory(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{category}</h2>
            <p className="text-sm text-muted-foreground">{learnedWords.size} words learned</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/20 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{totalCoins}</span>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 3D AR Space */}
      <div className="flex-1 relative bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 rounded-3xl overflow-hidden border border-white/10 min-h-[300px]">
        {/* Grid floor effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'top'
          }} />
        </div>

        {/* Floating Objects */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-md max-h-96">
            {currentObjects.map((obj, index) => {
              const angle = (index / currentObjects.length) * Math.PI * 2;
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius * 0.5;
              const isLearned = learnedWords.has(obj.id);
              const isSelected = selectedObject?.id === obj.id;

              return (
                <motion.div
                  key={obj.id}
                  className={`absolute cursor-pointer`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotateY: isRotating && isSelected ? [0, 360] : 0,
                  }}
                  transition={{
                    y: { duration: 2, repeat: Infinity, delay: index * 0.2 },
                    rotateY: { duration: 1 }
                  }}
                  onClick={() => handleObjectClick(obj)}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${obj.color} shadow-lg ${
                    isSelected ? 'ring-4 ring-white shadow-2xl' : ''
                  } ${isLearned ? 'opacity-50' : ''}`}>
                    <span className="text-4xl">{obj.emoji}</span>
                    {isLearned && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Hand pointer hint */}
        <motion.div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-white/60 text-sm"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Hand className="w-5 h-5" />
          Tap objects to explore!
        </motion.div>
      </div>

      {/* Selected Object Panel */}
      <AnimatePresence>
        {selectedObject && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="mt-4 p-4 bg-card rounded-2xl border border-border shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedObject.color}`}>
                <span className="text-5xl">{selectedObject.emoji}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-foreground">{selectedObject.word}</h3>
                  <Button variant="ghost" size="icon" onClick={() => speakWord(selectedObject.word)}>
                    <Volume2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsRotating(!isRotating)}>
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-lg text-muted-foreground">{selectedObject.translation}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedObject.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    selectedObject.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedObject.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedObject.category}</span>
                </div>

                {showTip && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-primary bg-primary/10 p-2 rounded-lg"
                  >
                    💡 {selectedObject.tip}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowTip(!showTip)}
              >
                <Zap className="w-4 h-4 mr-1" />
                {showTip ? 'Hide' : 'Show'} Tip
              </Button>
              
              {learnedWords.has(selectedObject.id) ? (
                <Button variant="secondary" className="flex-1" disabled>
                  ✓ Learned!
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  onClick={handleLearnWord}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Learn (+{selectedObject.difficulty === 'beginner' ? 3 : selectedObject.difficulty === 'intermediate' ? 5 : 8} coins)
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Button */}
      {learnedWords.size >= 3 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Button 
            variant="default" 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            onClick={handleFinish}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Finish Session ({learnedWords.size} words, {totalCoins} coins)
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ARVocabulary_mod;
