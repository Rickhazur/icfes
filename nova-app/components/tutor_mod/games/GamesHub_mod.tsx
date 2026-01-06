import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Map, BookOpen, Clock, Store, Mic } from "lucide-react";

export type GameType = 'flashrace' | 'grammarquest' | 'storybuilder' | 'puzzletimeline' | 'pronounceplay' | 'vocabulary' | 'grammar';

interface Game {
  id: GameType;
  name: string;
  description: string;
  emoji: string;
  color: string;
  difficulty: string;
}

const games: Game[] = [
  {
    id: 'flashrace',
    name: 'FlashRace',
    description: 'Speed and vocabulary! Choose the correct translation as fast as you can.',
    emoji: '🏎️',
    color: 'gradient-primary',
    difficulty: 'Easy',
  },
  {
    id: 'grammarquest',
    name: 'Grammar Quest',
    description: 'A level-based adventure fixing grammar and earning stars.',
    emoji: '🗺️',
    color: 'gradient-magic',
    difficulty: 'Medium',
  },
  {
    id: 'storybuilder',
    name: 'Story Builder',
    description: 'Build stories by dragging and ordering pieces. Be creative!',
    emoji: '📖',
    color: 'gradient-success',
    difficulty: 'Medium',
  },
  {
    id: 'puzzletimeline',
    name: 'Puzzle Timeline',
    description: 'Read a text and order the events. Fun reading comprehension!',
    emoji: '🧩',
    color: 'gradient-secondary',
    difficulty: 'Medium',
  },
  {
    id: 'pronounceplay',
    name: 'PronouncePlay',
    description: 'Practice pronunciation! Earn coins based on how well you speak.',
    emoji: '🎤',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    difficulty: 'All Levels',
  },
];

interface GamesHubProps {
  onSelectGame: (gameId: GameType) => void;
  onClose: () => void;
  onOpenStore: () => void;
  balance: number;
}

const GamesHub_mod = ({ onSelectGame, onClose, onOpenStore, balance }: GamesHubProps) => {
  return (
    <motion.div
      className="p-6 bg-card rounded-3xl shadow-medium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button variant="playful" size="sm" onClick={onOpenStore}>
          <Store className="w-4 h-4 mr-2" />
          Store ({balance})
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">🎮 Games Center</h2>
        <p className="text-muted-foreground">
          Pick a game and earn coins while learning English!
        </p>
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map((game, index) => (
          <motion.button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`p-5 rounded-2xl text-left transition-all hover:scale-[1.02] ${game.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-4xl">{game.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-primary-foreground mb-1">
                  {game.name}
                </h3>
                <p className="text-sm text-primary-foreground/80 mb-2">
                  {game.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-background/20 rounded-full text-xs font-medium text-primary-foreground">
                    {game.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick play tips */}
      <div className="mt-6 p-4 bg-muted/50 rounded-xl">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>Tip:</strong> Play every day to keep your streak and earn bonus coins
        </p>
      </div>
    </motion.div>
  );
};

export default GamesHub_mod;
