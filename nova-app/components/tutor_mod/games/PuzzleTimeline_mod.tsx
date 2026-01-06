import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, Star, ArrowLeft, CheckCircle, Sparkles, HelpCircle } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";

interface TimelineEvent {
  id: string;
  text: string;
  correctOrder: number;
}

interface ReadingPassage {
  id: string;
  title: string;
  text: string;
  events: TimelineEvent[];
  mainIdeaOptions?: string[];
  correctMainIdea?: string;
}

interface PuzzleTimelineProps {
  passage: ReadingPassage;
  onComplete: (score: number, coins: number) => void;
  onClose: () => void;
}

const PuzzleTimeline_mod = ({ passage, onComplete, onClose }: PuzzleTimelineProps) => {
  const { addCoins } = useRewards();
  const [gameState, setGameState] = useState<'reading' | 'ordering' | 'mainidea' | 'finished'>('reading');
  const [orderedEvents, setOrderedEvents] = useState<TimelineEvent[]>(
    [...passage.events].sort(() => Math.random() - 0.5)
  );
  const [selectedMainIdea, setSelectedMainIdea] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [orderResult, setOrderResult] = useState<{ correct: number; total: number } | null>(null);

  // Check order
  const checkOrder = useCallback(() => {
    let correct = 0;
    orderedEvents.forEach((event, index) => {
      if (event.correctOrder === index + 1) {
        correct++;
      }
    });

    const earnedCoins = correct * 10;
    setScore(prev => prev + earnedCoins);
    setCoins(prev => prev + earnedCoins);
    setOrderResult({ correct, total: passage.events.length });

    setTimeout(() => {
      if (passage.mainIdeaOptions && passage.correctMainIdea) {
        setGameState('mainidea');
      } else {
        finishGame();
      }
    }, 2000);
  }, [orderedEvents, passage]);

  // Check main idea
  const checkMainIdea = useCallback(async () => {
    if (!selectedMainIdea) return;

    const isCorrect = selectedMainIdea === passage.correctMainIdea;
    const earnedCoins = isCorrect ? 15 : 0;
    
    setScore(prev => prev + earnedCoins);
    setCoins(prev => prev + earnedCoins);

    setTimeout(() => {
      finishGame();
    }, 1500);
  }, [selectedMainIdea, passage]);

  // Finish game
  const finishGame = async () => {
    const result = await addCoins(coins, 'puzzle_timeline');
    setGameState('finished');
    onComplete(score, result.coinsAdded);
  };

  // Reading phase
  if (gameState === 'reading') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Lectura</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            🧩 Puzzle Timeline
          </h2>
          <p className="text-muted-foreground">
            Lee con atención y luego ordena los eventos
          </p>
        </div>

        {/* Passage */}
        <div className="p-5 bg-muted/30 rounded-xl mb-6 border border-border">
          <h3 className="font-bold text-lg text-foreground mb-3">{passage.title}</h3>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {passage.text}
          </p>
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={() => setGameState('ordering')}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          ¡Listo para ordenar!
        </Button>
      </motion.div>
    );
  }

  // Ordering phase
  if (gameState === 'ordering') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setGameState('reading')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ver texto
          </Button>
          <Button 
            variant="playful" 
            size="sm"
            onClick={() => setShowHint(!showHint)}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Pista
          </Button>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-foreground">
            Ordena los eventos cronológicamente
          </h3>
          <p className="text-sm text-muted-foreground">
            Arrastra para reordenar
          </p>
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              className="p-3 bg-warning/20 rounded-xl mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-sm text-warning-foreground">
                💡 Busca palabras como "first", "then", "finally" para ordenar los eventos
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <div className="relative mb-6">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/30" />

          <Reorder.Group
            axis="y"
            values={orderedEvents}
            onReorder={setOrderedEvents}
            className="space-y-3"
          >
            {orderedEvents.map((event, index) => (
              <Reorder.Item
                key={event.id}
                value={event}
                className="relative pl-14 cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold z-10"
                  whileHover={{ scale: 1.2 }}
                >
                  {index + 1}
                </motion.div>
                <div className="p-4 bg-muted/50 rounded-xl border-2 border-border hover:border-primary/50 transition-colors">
                  <p className="text-foreground">{event.text}</p>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Check button */}
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={checkOrder}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Verificar Orden
        </Button>

        {/* Result feedback */}
        <AnimatePresence>
          {orderResult && (
            <motion.div
              className={`mt-4 p-4 rounded-xl text-center ${
                orderResult.correct === orderResult.total 
                  ? 'bg-success/20 text-success' 
                  : 'bg-warning/20 text-warning-foreground'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {orderResult.correct === orderResult.total 
                ? `🎉 ¡Perfecto! Todos los eventos en orden correcto`
                : `✨ ${orderResult.correct}/${orderResult.total} eventos correctos`
              }
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Main idea phase
  if (gameState === 'mainidea') {
    return (
      <motion.div
        className="p-6 bg-card rounded-3xl shadow-medium"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-center mb-6">
          <motion.div
            className="text-5xl mb-3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            🎯
          </motion.div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            ¿Cuál es la idea principal?
          </h3>
          <p className="text-sm text-muted-foreground">
            Selecciona la mejor respuesta
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {passage.mainIdeaOptions?.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedMainIdea(option)}
              className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                selectedMainIdea === option
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/30 hover:border-primary/50'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-foreground">{option}</p>
            </motion.button>
          ))}
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={checkMainIdea}
          disabled={!selectedMainIdea}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Confirmar
        </Button>
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
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.6 }}
      >
        🏆
      </motion.div>
      
      <h2 className="text-3xl font-bold text-foreground mb-2">¡Lectura Completada!</h2>
      
      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.2 }}
          >
            <Star 
              className={`w-8 h-8 ${
                i <= (score >= 40 ? 3 : score >= 25 ? 2 : 1) 
                  ? 'text-warning fill-warning' 
                  : 'text-muted'
              }`} 
            />
          </motion.div>
        ))}
      </div>
      
      <div className="p-4 gradient-secondary rounded-xl mb-6 inline-block">
        <p className="text-sm text-secondary-foreground/80">Total coins</p>
        <p className="text-3xl font-bold text-secondary-foreground">+{coins}</p>
      </div>

      <Button variant="default" onClick={onClose} size="lg">
        <Sparkles className="w-5 h-5 mr-2" />
        Continuar
      </Button>
    </motion.div>
  );
};

export default PuzzleTimeline_mod;
