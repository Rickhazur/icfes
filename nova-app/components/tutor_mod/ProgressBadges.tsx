import { motion } from "framer-motion";
import { Star, Trophy, Zap, BookOpen, Award } from "lucide-react";

interface ProgressBadgesProps {
  points: number;
  streak: number;
  badges: string[];
}

const badgeIcons: Record<string, JSX.Element> = {
  vocabulary: <BookOpen className="w-4 h-4" />,
  grammar: <Zap className="w-4 h-4" />,
  reading: <Star className="w-4 h-4" />,
  speaking: <Award className="w-4 h-4" />,
};

const ProgressBadges = ({ points, streak, badges }: ProgressBadgesProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border">
      {/* Points */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2 gradient-secondary rounded-xl text-secondary-foreground"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Star className="w-5 h-5 fill-current" />
        <span className="font-bold">{points}</span>
      </motion.div>

      {/* Streak */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2 gradient-success rounded-xl text-success-foreground"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap className="w-5 h-5 fill-current" />
        <span className="font-bold">{streak} days</span>
      </motion.div>

      {/* Badges */}
      <div className="flex items-center gap-2 ml-auto">
        {badges.slice(0, 4).map((badge, index) => (
          <motion.div
            key={badge}
            className="w-10 h-10 gradient-magic rounded-full flex items-center justify-center text-accent-foreground shadow-md"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            {badgeIcons[badge] || <Trophy className="w-4 h-4" />}
          </motion.div>
        ))}
        {badges.length > 4 && (
          <span className="text-sm font-medium text-muted-foreground">
            +{badges.length - 4}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBadges;
