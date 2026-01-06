import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SubjectAnalysis {
  subject: string;
  emoji: string;
  score: number;
  trend: "up" | "down" | "stable";
  weaknesses: string[];
}

interface WeaknessDetectorProps {
  subjects: SubjectAnalysis[];
  onSelectSubject?: (subject: string) => void;
}

const trendIcons = {
  up: <TrendingUp className="w-4 h-4 text-success" />,
  down: <TrendingDown className="w-4 h-4 text-destructive" />,
  stable: <Minus className="w-4 h-4 text-muted-foreground" />,
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-warning";
  return "bg-destructive";
};

const WeaknessDetector = ({ subjects, onSelectSubject }: WeaknessDetectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        📊 Análisis por Materia
      </h3>
      
      <div className="grid gap-3">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.subject}
            className="p-4 bg-card rounded-2xl shadow-soft border border-border cursor-pointer hover:border-primary/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectSubject?.(subject.subject)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{subject.emoji}</span>
                <span className="font-semibold text-foreground">{subject.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                {trendIcons[subject.trend]}
                <span className="font-bold text-foreground">{subject.score}%</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                className={`h-full ${getScoreColor(subject.score)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${subject.score}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
            
            {/* Weaknesses */}
            {subject.weaknesses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subject.weaknesses.map((weakness) => (
                  <span
                    key={weakness}
                    className="px-3 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full"
                  >
                    {weakness}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WeaknessDetector;
