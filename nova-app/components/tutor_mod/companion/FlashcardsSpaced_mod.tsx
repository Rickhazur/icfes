import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, CheckCircle2, XCircle, ArrowLeft, Star, RotateCcw, Sparkles, Brain, Plus, Save, Lightbulb, Edit3, Trash2, BookOpen, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";
import { generateGradeContextSentence } from "@/hooks/usePersonalizedContent_mod";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: number;
  correctCount: number;
  incorrectCount: number;
  nextReview?: number;
  createdByStudent?: boolean;
  example?: string;
  imageUrl?: string;
}

interface FlashcardsProps {
  cards?: Flashcard[];
  onComplete: (masteredCount: number) => void;
  onBack: () => void;
  onSaveToRepository?: (cards: Flashcard[]) => void;
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

const SPACED_INTERVALS = {
  new: 0,
  learning: 1,
  review: 24,
  mastered: 72,
};

// AI-powered feedback for flashcard creation
const getFlashcardFeedback = (front: string, back: string, category: string): { isValid: boolean; suggestions: string[]; encouragement: string } => {
  const suggestions: string[] = [];
  let isValid = true;
  let encouragement = "";

  // Check front (question) quality
  if (front.length < 10) {
    suggestions.push("💡 Try making your question more specific. Instead of 'Cat?', try 'What animal says meow?'");
    isValid = false;
  }

  if (!front.includes("?") && !front.toLowerCase().includes("what") && !front.toLowerCase().includes("how") && !front.toLowerCase().includes("complete")) {
    suggestions.push("💡 Good flashcard questions often start with 'What', 'How', or 'Complete:' to make them clearer.");
  }

  // Check back (answer) quality
  if (back.length < 2) {
    suggestions.push("💡 Your answer seems too short. Try adding more detail to help you remember!");
    isValid = false;
  }

  if (back.length > 100) {
    suggestions.push("💡 Great detail! But shorter answers are easier to remember. Try keeping it under 50 characters.");
  }

  // Category-specific suggestions
  if (category === "grammar" && !back.toLowerCase().includes("verb") && !back.toLowerCase().includes("noun") && !back.toLowerCase().includes("tense") && back.length < 20) {
    suggestions.push("💡 For grammar cards, include the rule or pattern. Example: 'went (past tense of go)'");
  }

  if (category === "vocabulary" && !back.includes(",") && back.split(" ").length === 1) {
    suggestions.push("💡 For vocabulary, try adding a synonym or example sentence to help you remember!");
  }

  // Encouragement messages
  if (isValid && suggestions.length === 0) {
    const encouragements = [
      "🌟 Excellent flashcard! You're becoming a learning expert!",
      "🎉 Perfect! This will really help you remember!",
      "⭐ Great job! Your flashcard is clear and helpful!",
      "🚀 Awesome work! You're building a powerful study tool!",
    ];
    encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  } else if (isValid) {
    encouragement = "👍 Good start! Consider the suggestions to make it even better.";
  }

  return { isValid, suggestions, encouragement };
};

const FlashcardsSpaced_mod = ({ cards, onComplete, onBack, onSaveToRepository, personalizedContent }: FlashcardsProps) => {
  // Generate dynamic cards from personalized content
  const dynamicCards = useMemo<Flashcard[]>(() => {
    if (personalizedContent && personalizedContent.vocabulary.length > 0) {
      return personalizedContent.vocabulary.map((v, idx) => ({
        id: `pc-${idx}`,
        front: `What does "${v.word}" mean?`,
        back: v.definition,
        category: v.category,
        difficulty: v.difficulty,
        correctCount: 0,
        incorrectCount: 0,
        example: v.example || generateGradeContextSentence(v.word, v.definition, personalizedContent.gradeLevel),
        imageUrl: v.imageUrl,
      }));
    }
    return [];
  }, [personalizedContent]);

  const initialCards = cards && cards.length > 0 ? cards : dynamicCards;

  const [deck, setDeck] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("flashcard_deck_mod");
    if (saved) {
      return JSON.parse(saved);
    }
    return initialCards;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, reviewed: 0 });
  const [showComplete, setShowComplete] = useState(false);
  const [mode, setMode] = useState<"review" | "create" | "manage">("review");

  // Create flashcard state
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newCategory, setNewCategory] = useState<"grammar" | "vocabulary">("vocabulary");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [feedback, setFeedback] = useState<{ isValid: boolean; suggestions: string[]; encouragement: string } | null>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const dueCards = deck.filter(card => {
    if (!card.nextReview) return true;
    return card.nextReview <= Date.now();
  });

  const currentCard = dueCards[currentIndex];

  useEffect(() => {
    localStorage.setItem("flashcard_deck_mod", JSON.stringify(deck));
  }, [deck]);

  // Handle automatic pronunciation
  useEffect(() => {
    if (isFlipped && currentCard) {
      speakText(currentCard.back);
    } else if (!isFlipped && currentCard) {
      speakText(currentCard.front);
    }
  }, [isFlipped, currentCard]);

  // Validate flashcard as user types
  useEffect(() => {
    if (newFront.length > 3 || newBack.length > 1) {
      const fb = getFlashcardFeedback(newFront, newBack, newCategory);
      setFeedback(fb);
    } else {
      setFeedback(null);
    }
  }, [newFront, newBack, newCategory]);

  const calculateNextReview = (card: Flashcard, correct: boolean): number => {
    const now = Date.now();
    const totalAttempts = card.correctCount + card.incorrectCount + 1;
    const successRate = (card.correctCount + (correct ? 1 : 0)) / totalAttempts;

    let intervalHours: number;
    if (successRate >= 0.8 && totalAttempts >= 3) {
      intervalHours = SPACED_INTERVALS.mastered;
    } else if (successRate >= 0.5) {
      intervalHours = SPACED_INTERVALS.review;
    } else {
      intervalHours = SPACED_INTERVALS.learning;
    }

    if (!correct) {
      intervalHours = SPACED_INTERVALS.learning;
    }

    return now + intervalHours * 60 * 60 * 1000;
  };

  const handleResponse = useCallback((correct: boolean) => {
    if (!currentCard) return;

    const updatedCard: Flashcard = {
      ...currentCard,
      lastReviewed: Date.now(),
      correctCount: correct ? currentCard.correctCount + 1 : currentCard.correctCount,
      incorrectCount: correct ? currentCard.incorrectCount : currentCard.incorrectCount + 1,
      nextReview: calculateNextReview(currentCard, correct),
    };

    setDeck(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      reviewed: prev.reviewed + 1,
    }));

    toast(correct ? "Got it! 🎉" : "Keep practicing! 💪", { duration: 1000 });

    setIsFlipped(false);

    if (currentIndex < dueCards.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setShowComplete(true);
    }
  }, [currentCard, currentIndex, dueCards.length]);

  const getMasteryLevel = (card: Flashcard): { level: string; color: string; stars: number } => {
    const total = card.correctCount + card.incorrectCount;
    if (total === 0) return { level: "New", color: "text-muted-foreground", stars: 0 };
    const rate = card.correctCount / total;
    if (rate >= 0.8 && total >= 3) return { level: "Mastered", color: "text-success", stars: 3 };
    if (rate >= 0.5) return { level: "Learning", color: "text-warning", stars: 2 };
    return { level: "Needs Practice", color: "text-destructive", stars: 1 };
  };

  const handleReset = () => {
    setDeck(prev => prev.map(c => ({ ...c, correctCount: 0, incorrectCount: 0, nextReview: undefined, lastReviewed: undefined })));
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0, reviewed: 0 });
    setShowComplete(false);
    toast.success("Progress reset!");
  };

  const handleCreateCard = () => {
    if (!feedback?.isValid) {
      toast.error("Please fix the issues before saving!");
      return;
    }

    const newCard: Flashcard = {
      id: `student-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      correctCount: 0,
      incorrectCount: 0,
      createdByStudent: true,
    };

    setDeck(prev => [...prev, newCard]);
    setNewFront("");
    setNewBack("");
    setFeedback(null);

    toast.success("🎉 Flashcard created! Keep building your study deck!");

    if (onSaveToRepository) {
      onSaveToRepository([...deck, newCard]);
    }
  };

  const handleUpdateCard = () => {
    if (!editingCard || !feedback?.isValid) return;

    setDeck(prev => prev.map(c =>
      c.id === editingCard.id
        ? { ...c, front: newFront, back: newBack, category: newCategory, difficulty: newDifficulty }
        : c
    ));

    setEditingCard(null);
    setNewFront("");
    setNewBack("");
    setFeedback(null);
    toast.success("Flashcard updated!");
  };

  const handleDeleteCard = (cardId: string) => {
    setDeck(prev => prev.filter(c => c.id !== cardId));
    toast.success("Flashcard deleted!");
  };

  const startEditing = (card: Flashcard) => {
    setEditingCard(card);
    setNewFront(card.front);
    setNewBack(card.back);
    setNewCategory(card.category as "grammar" | "vocabulary");
    setNewDifficulty(card.difficulty);
    setMode("create");
  };

  const handleSaveToRepository = () => {
    if (onSaveToRepository) {
      onSaveToRepository(deck);
      toast.success("📚 Flashcards saved to your repository!");
    } else {
      localStorage.setItem("flashcard_repository_mod", JSON.stringify(deck));
      toast.success("📚 Flashcards saved to your study collection!");
    }
  };

  // Create Mode
  if (mode === "create") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => { setMode("review"); setEditingCard(null); setNewFront(""); setNewBack(""); }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{editingCard ? "Edit Flashcard" : "Create Flashcard"}</h2>
            <p className="text-sm text-muted-foreground">Build your own study cards!</p>
          </div>
          <Lightbulb className="w-6 h-6 text-warning" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Tips for Great Flashcards</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ask clear questions (What, How, Complete...)</li>
              <li>• Keep answers short but complete</li>
              <li>• Add examples to help you remember</li>
              <li>• I'll help you improve as you type! 🤖</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Question (Front)</label>
              <Textarea
                placeholder="e.g., What is the past tense of 'run'?"
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Answer (Back)</label>
              <Textarea
                placeholder="e.g., ran"
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                <div className="flex gap-2">
                  <Button
                    variant={newCategory === "vocabulary" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewCategory("vocabulary")}
                    className="flex-1"
                  >
                    Vocabulary
                  </Button>
                  <Button
                    variant={newCategory === "grammar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewCategory("grammar")}
                    className="flex-1"
                  >
                    Grammar
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Difficulty</label>
                <div className="flex gap-1">
                  {(["easy", "medium", "hard"] as const).map(diff => (
                    <Button
                      key={diff}
                      variant={newDifficulty === diff ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewDifficulty(diff)}
                      className="flex-1 capitalize"
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl p-4 border ${feedback.isValid && feedback.suggestions.length === 0
                  ? "bg-success/10 border-success/30"
                  : feedback.isValid
                    ? "bg-warning/10 border-warning/30"
                    : "bg-info/10 border-info/30"
                  }`}
              >
                {feedback.encouragement && (
                  <p className="font-medium text-foreground mb-2">{feedback.encouragement}</p>
                )}
                {feedback.suggestions.length > 0 && (
                  <ul className="space-y-1">
                    {feedback.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{s}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 space-y-2">
          <Button
            className="w-full"
            onClick={editingCard ? handleUpdateCard : handleCreateCard}
            disabled={!feedback?.isValid}
          >
            <Save className="w-4 h-4 mr-2" />
            {editingCard ? "Update Flashcard" : "Save Flashcard"}
          </Button>
          {!editingCard && (
            <p className="text-xs text-center text-muted-foreground">
              You have {deck.filter(c => c.createdByStudent).length} custom cards
            </p>
          )}
        </div>
      </div>
    );
  }

  // Manage Mode
  if (mode === "manage") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setMode("review")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">My Flashcards</h2>
            <p className="text-sm text-muted-foreground">{deck.length} cards total</p>
          </div>
          <Button size="sm" onClick={handleSaveToRepository}>
            <Save className="w-4 h-4 mr-1" />
            Save All
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {deck.map(card => {
            const mastery = getMasteryLevel(card);
            return (
              <motion.div
                key={card.id}
                className="bg-secondary/30 rounded-xl p-3 border border-border"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{card.front}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.back}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${mastery.color}`}>{mastery.level}</span>
                      {card.createdByStudent && (
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Your card</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditing(card)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    {card.createdByStudent && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCard(card.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Complete Screen
  if (showComplete || dueCards.length === 0) {
    const masteredCount = deck.filter(c => {
      const total = c.correctCount + c.incorrectCount;
      return total >= 3 && c.correctCount / total >= 0.8;
    }).length;

    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center mx-auto mb-4">
            <Brain className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {dueCards.length === 0 ? "All Caught Up!" : "Session Complete!"}
          </h2>

          {sessionStats.reviewed > 0 && (
            <div className="bg-secondary/30 rounded-2xl p-4 mb-4 text-left">
              <p className="text-sm text-muted-foreground mb-2">This session:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>{sessionStats.correct} correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span>{sessionStats.incorrect} to review</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-muted-foreground mb-2">
            {masteredCount} of {deck.length} cards mastered
          </p>

          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-3 mb-4">
            <p className="text-sm font-medium text-foreground">💡 Pro Tip</p>
            <p className="text-xs text-muted-foreground">Create your own flashcards to learn faster! Studies show you remember better when you make your own cards.</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {deck.slice(0, 12).map(card => {
              const mastery = getMasteryLevel(card);
              return (
                <div
                  key={card.id}
                  className={`w-3 h-3 rounded-full ${mastery.stars === 3 ? "bg-success" :
                    mastery.stars === 2 ? "bg-warning" :
                      mastery.stars === 1 ? "bg-destructive" :
                        "bg-muted"
                    }`}
                  title={`${card.front.substring(0, 20)}... - ${mastery.level}`}
                />
              );
            })}
            {deck.length > 12 && <span className="text-xs text-muted-foreground">+{deck.length - 12}</span>}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" onClick={() => setMode("create")}>
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
            <Button onClick={() => onComplete(masteredCount)}>
              <Sparkles className="w-4 h-4 mr-1" />
              Finish
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const getCategoryStyles = (category: string, flipped: boolean) => {
    const cat = category.toLowerCase();
    const isGrammar = cat.includes('grammar');
    const isVocab = cat.includes('vocabulary') || cat.includes('vocab');
    const isScience = cat.includes('science');

    if (flipped) {
      if (isGrammar) return "bg-gradient-to-br from-indigo-500 to-blue-600 border-indigo-400 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)]";
      if (isVocab) return "bg-gradient-to-br from-pink-500 to-rose-600 border-pink-400 text-white shadow-[0_10px_20px_rgba(244,63,94,0.3)]";
      if (isScience) return "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]";
      return "bg-gradient-to-br from-orange-500 to-amber-600 border-orange-400 text-white shadow-[0_10px_20px_rgba(245,158,11,0.3)]";
    }

    if (isGrammar) return "bg-white border-4 border-indigo-400 text-indigo-900";
    if (isVocab) return "bg-white border-4 border-pink-400 text-pink-900";
    if (isScience) return "bg-white border-4 border-emerald-400 text-emerald-900";
    return "bg-white border-4 border-orange-400 text-orange-900";
  };

  const mastery = getMasteryLevel(currentCard);

  // Review Mode
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Flashcard Review</h2>
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {dueCards.length} due
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setMode("create")} title="Create flashcard">
            <Plus className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMode("manage")} title="Manage cards">
            <BookOpen className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {dueCards.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full ${i < currentIndex ? "bg-success" : i === currentIndex ? "bg-primary" : "bg-muted"
              }`}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md aspect-[4/3] cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
          whileHover={{ rotate: [-0.1, 0.1, -0.1, 0], transition: { duration: 0.5, repeat: Infinity } }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? "back" : "front"}
              initial={{ rotateY: isFlipped ? -180 : 180, opacity: 0, scale: 0.8 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={cn(
                "w-full h-full rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden",
                getCategoryStyles(currentCard.category, isFlipped)
              )}
            >
              {/* Decorative background patterns */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white"></div>
                <div className="absolute top-1/2 left-10 w-6 h-6 rounded-full bg-white opacity-50"></div>
                <div className="absolute top-20 right-20 w-8 h-8 rotate-45 bg-white opacity-30"></div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>

              <div className="flex items-center gap-2 mb-6 z-10">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                  isFlipped ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                )}>
                  {currentCard.category}
                </span>
                <div className="flex items-center bg-black/5 px-3 py-1.5 rounded-full">
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} className={cn(
                      "w-4 h-4",
                      i < mastery.stars
                        ? (isFlipped ? "text-yellow-300 fill-yellow-300" : "text-yellow-400 fill-yellow-400")
                        : "text-gray-300"
                    )} />
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
                {!isFlipped && currentCard.imageUrl && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-32 mb-4 rounded-2xl overflow-hidden border-4 border-white shadow-lg"
                  >
                    <img
                      src={currentCard.imageUrl}
                      alt={currentCard.front}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}

                <h3 className={cn(
                  "text-2xl font-black leading-tight",
                  isFlipped ? "text-white" : "text-gray-900"
                )}>
                  {isFlipped ? currentCard.back : currentCard.front}
                </h3>

                {isFlipped && currentCard.example && (
                  <div className="mt-4 p-3 bg-white/10 rounded-2xl backdrop-blur-sm text-center">
                    <p className="text-white/90 italic text-sm max-w-[280px]">
                      "{currentCard.example}"
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3 z-10">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                  isFlipped ? "bg-white/20" : "bg-gray-100"
                )}>
                  <Volume2 className={cn("w-5 h-5", isFlipped ? "text-white" : "text-gray-600")} />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest opacity-60",
                  isFlipped ? "text-white" : "text-gray-500"
                )}>
                  {isFlipped ? "Listen & Repeat" : "Tap to flip"}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="p-4 space-y-3">
        {!isFlipped ? (
          <Button className="w-full" onClick={() => setIsFlipped(true)}>
            <Repeat className="w-4 h-4 mr-2" />
            Show Answer
          </Button>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">How did you do?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-destructive/50 hover:bg-destructive/10"
                onClick={() => handleResponse(false)}
              >
                <XCircle className="w-4 h-4 mr-2 text-destructive" />
                Needs Work
              </Button>
              <Button
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => handleResponse(true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Got It!
              </Button>
            </div>
          </>
        )}

        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={mastery.color}>{mastery.level}</span>
          <span>
            {currentCard.correctCount} correct / {currentCard.incorrectCount} incorrect
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsSpaced_mod;
