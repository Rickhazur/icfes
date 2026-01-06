import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Target, BookOpen, CheckCircle2, PlayCircle, ChevronRight, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AssignmentAnalysis } from "./AssignmentIntake_mod";

export interface StudySession {
  id: string;
  day: number;
  title: string;
  objectives: string[];
  activities: {
    type: "flashcards" | "practice" | "quiz" | "writing" | "reading";
    title: string;
    duration: number;
    completed: boolean;
  }[];
  estimatedTime: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  assignmentId: string;
  title: string;
  sessions: StudySession[];
  createdAt: number;
  progress: number;
}

interface StudyPlanGeneratorProps {
  analysis: AssignmentAnalysis;
  onStartSession: (session: StudySession, planId: string) => void;
  onBack: () => void;
}

const generateStudyPlan = (analysis: AssignmentAnalysis): StudyPlan => {
  const sessions: StudySession[] = [];
  const totalTime = analysis.estimatedTime;
  const numSessions = totalTime <= 20 ? 2 : totalTime <= 40 ? 3 : 4;
  const timePerSession = Math.ceil(totalTime / numSessions);

  const activities = {
    grammar: [
      { type: "flashcards" as const, title: "Grammar Rules Flashcards", duration: 5 },
      { type: "practice" as const, title: "Sentence Correction Practice", duration: 8 },
      { type: "quiz" as const, title: "Grammar Mini-Quiz", duration: 5 },
    ],
    vocabulary: [
      { type: "flashcards" as const, title: "Vocabulary Flashcards", duration: 5 },
      { type: "practice" as const, title: "Word Matching Game", duration: 6 },
      { type: "quiz" as const, title: "Vocabulary Quiz", duration: 5 },
    ],
    reading: [
      { type: "reading" as const, title: "Practice Reading Passage", duration: 8 },
      { type: "practice" as const, title: "Comprehension Questions", duration: 7 },
      { type: "quiz" as const, title: "Reading Quiz", duration: 5 },
    ],
    writing: [
      { type: "flashcards" as const, title: "Writing Starters Flashcards", duration: 4 },
      { type: "practice" as const, title: "Sentence Building Practice", duration: 10 },
      { type: "writing" as const, title: "Writing Exercise", duration: 10 },
    ],
  };

  const topSkills = Object.entries(analysis.skills)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([skill]) => skill);

  for (let i = 0; i < numSessions; i++) {
    const skillFocus = topSkills[i % topSkills.length] as keyof typeof activities;
    const sessionActivities = activities[skillFocus].map(a => ({ ...a, completed: false }));

    sessions.push({
      id: `session_${i + 1}`,
      day: i + 1,
      title: `Session ${i + 1}: ${skillFocus.charAt(0).toUpperCase() + skillFocus.slice(1)} Focus`,
      objectives: [
        `Practice ${skillFocus} skills`,
        `Review key concepts`,
        `Complete practice exercises`,
      ],
      activities: sessionActivities,
      estimatedTime: timePerSession,
      completed: false,
    });
  }

  return {
    id: `plan_${Date.now()}`,
    assignmentId: analysis.id,
    title: `Study Plan for ${analysis.topics[0] || "English Practice"}`,
    sessions,
    createdAt: Date.now(),
    progress: 0,
  };
};

const StudyPlanGenerator_mod = ({ analysis, onStartSession, onBack }: StudyPlanGeneratorProps) => {
  const [plan] = useState<StudyPlan>(() => generateStudyPlan(analysis));
  const [expandedSession, setExpandedSession] = useState<string | null>(plan.sessions[0]?.id || null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "flashcards": return "🃏";
      case "practice": return "✏️";
      case "quiz": return "📝";
      case "writing": return "✍️";
      case "reading": return "📖";
      default: return "📚";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{plan.title}</h2>
          <p className="text-sm text-muted-foreground">
            {plan.sessions.length} sessions • ~{analysis.estimatedTime} min total
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-4 mb-4 border border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Your Study Schedule</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-warning" />
            <span>{plan.progress}% complete</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {plan.sessions.map((session, i) => (
            <div
              key={session.id}
              className={`flex-1 h-2 rounded-full ${
                session.completed ? "bg-success" : i === 0 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {plan.sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-card rounded-2xl border overflow-hidden ${
              expandedSession === session.id ? "border-primary" : "border-border"
            }`}
          >
            <button
              onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                session.completed 
                  ? "bg-success text-success-foreground" 
                  : index === 0 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
              }`}>
                {session.completed ? <CheckCircle2 className="w-5 h-5" /> : session.day}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{session.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{session.estimatedTime} min</span>
                  <span>•</span>
                  <span>{session.activities.length} activities</span>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                expandedSession === session.id ? "rotate-90" : ""
              }`} />
            </button>

            {expandedSession === session.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      Objectives:
                    </p>
                    <ul className="space-y-1">
                      {session.objectives.map((obj, i) => (
                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Activities:
                    </p>
                    <div className="space-y-2">
                      {session.activities.map((activity, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-2 rounded-xl ${
                            activity.completed ? "bg-success/10" : "bg-secondary/30"
                          }`}
                        >
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.duration} min</p>
                          </div>
                          {activity.completed && <CheckCircle2 className="w-4 h-4 text-success" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => onStartSession(session, plan.id)}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {session.completed ? "Review Session" : "Start Session"}
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlanGenerator_mod;
