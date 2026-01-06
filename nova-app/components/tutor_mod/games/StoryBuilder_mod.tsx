import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Sparkles, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";

interface StoryPiece {
  id: string;
  text: string;
  type: 'starter' | 'connector' | 'detail' | 'ending';
  correctPosition?: number;
}

interface StoryBuilderProps {
  pieces: StoryPiece[];
  theme: string;
  targetStructure?: string[];
  onComplete: (score: number, coins: number) => void;
  onClose: () => void;
}

const pieceColors: Record<string, string> = {
  starter: 'bg-primary/20 border-primary/40',
  connector: 'bg-accent/20 border-accent/40',
  detail: 'bg-success/20 border-success/40',
  ending: 'bg-secondary/20 border-secondary/40',
};

const pieceEmojis: Record<string, string> = {
  starter: '🚀',
  connector: '🔗',
  detail: '✨',
  ending: '🎯',
};

const StoryBuilder_mod = ({ 
  pieces, 
  theme, 
  targetStructure = ['starter', 'detail', 'connector', 'detail', 'ending'],
  onComplete, 
  onClose 
}: StoryBuilderProps) => {
  const { addCoins } = useRewards();
  const [gameState, setGameState] = useState<'building' | 'review' | 'finished'>('building');
  const [selectedPieces, setSelectedPieces] = useState<StoryPiece[]>([]);
  const [availablePieces, setAvailablePieces] = useState<StoryPiece[]>(
    [...pieces].sort(() => Math.random() - 0.5)
  );
  const [feedback, setFeedback] = useState<{ correct: number; total: number; tips: string[] } | null>(null);
  const [coins, setCoins] = useState(0);

  // Add piece to story
  const addPiece = (piece: StoryPiece) => {
    setSelectedPieces([...selectedPieces, piece]);
    setAvailablePieces(availablePieces.filter(p => p.id !== piece.id));
  };

  // Remove piece from story
  const removePiece = (piece: StoryPiece) => {
    setSelectedPieces(selectedPieces.filter(p => p.id !== piece.id));
    setAvailablePieces([...availablePieces, piece]);
  };

  // Reset story
  const resetStory = () => {
    setSelectedPieces([]);
    setAvailablePieces([...pieces].sort(() => Math.random() - 0.5));
  };

  // Check story structure
  const checkStory = useCallback(async () => {
    const userStructure = selectedPieces.map(p => p.type);
    let correct = 0;
    const tips: string[] = [];

    // Check structure alignment
    for (let i = 0; i < Math.min(userStructure.length, targetStructure.length); i++) {
      if (userStructure[i] === targetStructure[i]) {
        correct++;
      }
    }

    // Generate tips
    if (!userStructure.includes('starter')) {
      tips.push('💡 Every story needs a good beginning (starter)');
    }
    if (!userStructure.includes('ending')) {
      tips.push('💡 Don\'t forget to close your story with an ending');
    }
    if (userStructure.filter(t => t === 'connector').length === 0) {
      tips.push('💡 Use connectors (however, then, because) to join ideas');
    }

    // Calculate coins
    const structureBonus = correct >= targetStructure.length - 1 ? 20 : 0;
    const lengthBonus = selectedPieces.length >= 4 ? 10 : 0;
    const earnedCoins = (correct * 5) + structureBonus + lengthBonus;

    setCoins(earnedCoins);
    setFeedback({ correct, total: targetStructure.length, tips });
    setGameState('review');
  }, [selectedPieces, targetStructure]);

  // Finish game
  const finishGame = async () => {
    const result = await addCoins(coins, 'story_builder');
    setGameState('finished');
    onComplete(coins, result.coinsAdded);
  };

  // Building view
  if (gameState === 'building') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={resetStory}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            📖 Story Builder
          </h2>
          <p className="text-muted-foreground">
            Theme: <span className="font-semibold text-primary">{theme}</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {Object.entries(pieceEmojis).map(([type, emoji]) => (
            <div key={type} className={`px-2 py-1 rounded-lg text-xs font-medium border ${pieceColors[type]}`}>
              {emoji} {type}
            </div>
          ))}
        </div>

        {/* Story area */}
        <div className="min-h-[120px] p-4 border-2 border-dashed border-border rounded-xl mb-4 bg-background/50">
          {selectedPieces.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              👇 Drag pieces here to create your story
            </p>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={selectedPieces} 
              onReorder={setSelectedPieces}
              className="space-y-2"
            >
              {selectedPieces.map((piece) => (
                <Reorder.Item
                  key={piece.id}
                  value={piece}
                  className={`p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing ${pieceColors[piece.type]}`}
                >
                  <div className="flex items-start gap-2">
                    <span>{pieceEmojis[piece.type]}</span>
                    <p className="flex-1 text-foreground">{piece.text}</p>
                    <button
                      onClick={() => removePiece(piece)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>

        {/* Available pieces */}
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Available pieces:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {availablePieces.map((piece) => (
              <motion.button
                key={piece.id}
                onClick={() => addPiece(piece)}
                className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${pieceColors[piece.type]}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-2">
                  <span>{pieceEmojis[piece.type]}</span>
                  <p className="text-foreground">{piece.text}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Check button */}
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={checkStory}
          disabled={selectedPieces.length < 3}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Review Story
        </Button>
      </motion.div>
    );
  }

  // Review view
  if (gameState === 'review') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center mb-6">
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.2, 1] }}
          >
            {feedback && feedback.correct >= feedback.total - 1 ? '🌟' : '📝'}
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {feedback && feedback.correct >= feedback.total - 1 
              ? 'Excellent story!' 
              : 'Good story!'}
          </h2>
        </div>

        {/* Story preview */}
        <div className="p-4 bg-muted/50 rounded-xl mb-4">
          <p className="text-foreground leading-relaxed">
            {selectedPieces.map(p => p.text).join(' ')}
          </p>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-success/20 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">Estructura</p>
            <p className="text-xl font-bold text-success">
              {feedback?.correct}/{feedback?.total}
            </p>
          </div>
          <div className="p-3 gradient-secondary rounded-xl text-center">
            <p className="text-sm text-secondary-foreground/80">Coins</p>
            <p className="text-xl font-bold text-secondary-foreground">+{coins}</p>
          </div>
        </div>

        {/* Tips */}
        {feedback && feedback.tips.length > 0 && (
          <div className="p-3 bg-warning/20 rounded-xl mb-4">
            <p className="font-medium text-foreground mb-2">Consejos:</p>
            {feedback.tips.map((tip, i) => (
              <p key={i} className="text-sm text-muted-foreground">{tip}</p>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setGameState('building')}>
            Editar
          </Button>
          <Button variant="default" className="flex-1" onClick={finishGame}>
            <Star className="w-5 h-5 mr-2" />
            Continuar
          </Button>
        </div>
      </motion.div>
    );
  }

  // Finished
  return (
    <motion.div
      className="p-6 bg-card rounded-3xl shadow-medium text-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <motion.div
        className="text-7xl mb-4"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        ✍️
      </motion.div>
      
      <h2 className="text-3xl font-bold text-foreground mb-2">¡Historia Completa!</h2>
      <p className="text-muted-foreground mb-6">
        Has ganado <span className="font-bold text-secondary">{coins}</span> coins por tu creatividad
      </p>

      <Button variant="default" onClick={onClose} size="lg">
        <Sparkles className="w-5 h-5 mr-2" />
        Continuar
      </Button>
    </motion.div>
  );
};

export default StoryBuilder_mod;
