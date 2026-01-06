import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GradeLevelSelectorProps {
  currentGrade: number;
  onSelectGrade: (grade: number) => void;
  studentName: string;
}

const gradeInfo = [
  { grade: 1, label: "1st Grade", age: "6-7 years", emoji: "🌱", color: "from-green-400 to-emerald-500", description: "Basic words & simple sentences" },
  { grade: 2, label: "2nd Grade", age: "7-8 years", emoji: "🌿", color: "from-teal-400 to-cyan-500", description: "Short stories & questions" },
  { grade: 3, label: "3rd Grade", age: "8-9 years", emoji: "🌳", color: "from-blue-400 to-indigo-500", description: "Paragraphs & verb tenses" },
  { grade: 4, label: "4th Grade", age: "9-10 years", emoji: "🌲", color: "from-purple-400 to-violet-500", description: "Essays & complex grammar" },
  { grade: 5, label: "5th Grade", age: "10-11 years", emoji: "🎓", color: "from-pink-400 to-rose-500", description: "Advanced reading & writing" },
];

const GradeLevelSelector_mod = ({ currentGrade, onSelectGrade, studentName }: GradeLevelSelectorProps) => {
  const [hoveredGrade, setHoveredGrade] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Select Your Grade</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Hi {studentName}! Choose your grade level so I can help you better 🦉
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {gradeInfo.map((info, idx) => {
          const isSelected = currentGrade === info.grade;
          const isHovered = hoveredGrade === info.grade;

          return (
            <motion.button
              key={info.grade}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredGrade(info.grade)}
              onMouseLeave={() => setHoveredGrade(null)}
              onClick={() => onSelectGrade(info.grade)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Star className="w-4 h-4 text-primary-foreground fill-current" />
                </motion.div>
              )}

              <motion.div
                animate={{ 
                  scale: isHovered || isSelected ? 1.2 : 1,
                  rotate: isHovered ? [0, -10, 10, 0] : 0
                }}
                className="text-3xl mb-2"
              >
                {info.emoji}
              </motion.div>

              <div className="font-bold text-foreground">{info.label}</div>
              <div className="text-xs text-muted-foreground">{info.age}</div>

              {(isHovered || isSelected) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 pt-2 border-t border-border"
                >
                  <p className="text-xs text-primary font-medium">{info.description}</p>
                </motion.div>
              )}

              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${info.color.split(" ")[0].replace("from-", "")}20, ${info.color.split(" ")[1].replace("to-", "")}20)`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1"
      >
        <Sparkles className="w-3 h-3" />
        Lessons and vocabulary will adapt to your grade level
        <Sparkles className="w-3 h-3" />
      </motion.div>
    </div>
  );
};

export default GradeLevelSelector_mod;
