import { motion } from "framer-motion";

interface TutorMascotProps {
  mood?: "happy" | "thinking" | "excited" | "encouraging";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const moodEmojis = {
  happy: "🦉",
  thinking: "🤔",
  excited: "🎉",
  encouraging: "💪",
};

const TutorMascot = ({ mood = "happy", size = "md", animate = true }: TutorMascotProps) => {
  const sizeClasses = {
    sm: "w-12 h-12 text-2xl",
    md: "w-20 h-20 text-4xl",
    lg: "w-28 h-28 text-6xl",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full gradient-primary flex items-center justify-center shadow-glow-primary`}
      animate={animate ? {
        y: [0, -8, 0],
        rotate: [0, 2, 0, -2, 0],
      } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.span
        animate={animate ? { scale: [1, 1.1, 1] } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {moodEmojis[mood]}
      </motion.span>
    </motion.div>
  );
};

export default TutorMascot;
