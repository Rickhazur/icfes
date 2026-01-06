import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, BookOpen, Calculator, FlaskConical, Globe, AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { TutorReport, Challenge } from "@/types/tutor";

interface TutorReportsProps {
  reports: TutorReport[];
  gradeLevel: number;
  onSelectChallenge?: (challenge: Challenge) => void;
}

const getSubjectIcon = (subject: string) => {
  switch (subject.toLowerCase()) {
    case "math":
    case "mathematics":
      return Calculator;
    case "science":
      return FlaskConical;
    case "social studies":
    case "history":
      return Globe;
    default:
      return BookOpen;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "text-red-500 bg-red-100";
    case "medium":
      return "text-orange-500 bg-orange-100";
    default:
      return "text-yellow-500 bg-yellow-100";
  }
};

const TutorReports_mod = ({ reports, gradeLevel, onSelectChallenge }: TutorReportsProps) => {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<Challenge[]>([]);

  // Collect all high-priority challenges
  useEffect(() => {
    const allChallenges = reports.flatMap(r =>
      r.challenges.filter(c => c.severity === "high" || c.severity === "medium")
    );
    setSelectedChallenges(allChallenges.slice(0, 5));
  }, [reports]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getGradeLevelLabel = (grade: number) => {
    const ordinal = ["1st", "2nd", "3rd", "4th", "5th"];
    return ordinal[grade - 1] || `${grade}th`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 shadow-sm transform -rotate-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-black text-indigo-950 tracking-tight">Tutor Reports</h3>
        </div>
        <span className="text-sm bg-white border-2 border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-bold shadow-sm">
          {getGradeLevelLabel(gradeLevel)} Level
        </span>
      </div>

      {/* Priority Challenges Summary */}
      {selectedChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-white rounded-3xl border-2 border-indigo-100 shadow-[4px_4px_0px_0px_rgba(224,231,255,1)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Focus Areas for English</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedChallenges.map((challenge, idx) => {
              const colors = [
                "bg-orange-100 text-orange-700 border-orange-200",
                "bg-pink-100 text-pink-700 border-pink-200",
                "bg-cyan-100 text-cyan-700 border-cyan-200",
                "bg-purple-100 text-purple-700 border-purple-200"
              ];
              const colorClass = colors[idx % colors.length];

              return (
                <motion.button
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => onSelectChallenge?.(challenge)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border-2 cursor-pointer hover:scale-105 active:scale-95 transition-all ${colorClass}`}
                >
                  {challenge.area}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((report) => {
          const Icon = getSubjectIcon(report.subject);
          const isExpanded = expandedReport === report.id;

          return (
            <motion.div
              key={report.id}
              layout
              className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group"
            >
              {/* Report Header */}
              <button
                onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl drop-shadow-md filter">{report.emoji}</span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-800">{report.subject}</span>
                      <div className="bg-slate-100 p-1 rounded-full">
                        {getTrendIcon(report.trend)}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {report.source === "research-center" ? "Research Center" : "Math Tutor"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-800">{report.overallScore}%</span>
                    <Progress value={report.overallScore} className="w-24 h-2 bg-slate-100" />
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-100 transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'text-slate-400'}`}>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-3 space-y-3">
                      {/* Challenges */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Challenges Detected
                        </h4>
                        <div className="space-y-2">
                          {report.challenges.map((challenge) => (
                            <motion.div
                              key={challenge.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => onSelectChallenge?.(challenge)}
                              className="p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground">{challenge.area}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(challenge.severity)}`}>
                                  {challenge.severity}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{challenge.description}</p>
                              <p className="text-xs text-primary mt-1 font-medium">
                                🇬🇧 English Focus: {challenge.englishConnection}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          📝 Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {report.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        variant="playful"
                        size="sm"
                        className="w-full"
                        onClick={() => onSelectChallenge?.(report.challenges[0])}
                      >
                        Start Personalized Lesson
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No reports received yet</p>
          <p className="text-xs">Reports from other tutors will appear here</p>
        </div>
      )}
    </div>
  );
};

export default TutorReports_mod;
