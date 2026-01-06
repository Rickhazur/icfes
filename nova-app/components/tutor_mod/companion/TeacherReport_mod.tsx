import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, Award, Calendar, BookOpen, Target, Users, Download, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SkillProgress {
  skill: string;
  current: number;
  previous: number;
  sessions: number;
}

interface RecentActivity {
  id: string;
  type: "quiz" | "flashcard" | "practice" | "assignment";
  title: string;
  score?: number;
  date: number;
  duration: number;
}

interface TeacherReportProps {
  studentName?: string;
  grade?: number;
  onBack: () => void;
}

const mockSkillProgress: SkillProgress[] = [
  { skill: "Grammar", current: 78, previous: 65, sessions: 12 },
  { skill: "Vocabulary", current: 85, previous: 80, sessions: 18 },
  { skill: "Reading", current: 72, previous: 68, sessions: 8 },
  { skill: "Writing", current: 65, previous: 58, sessions: 6 },
];

const mockRecentActivity: RecentActivity[] = [
  { id: "1", type: "quiz", title: "Grammar Mini-Quiz", score: 85, date: Date.now() - 3600000, duration: 12 },
  { id: "2", type: "flashcard", title: "Vocabulary Review", score: 90, date: Date.now() - 86400000, duration: 8 },
  { id: "3", type: "practice", title: "Past Tense Practice", score: 75, date: Date.now() - 172800000, duration: 15 },
  { id: "4", type: "assignment", title: "Writing Assignment Help", date: Date.now() - 259200000, duration: 25 },
];

const TeacherReport_mod = ({ studentName = "Student", grade = 3, onBack }: TeacherReportProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "activity">("overview");

  const totalSessions = mockSkillProgress.reduce((sum, s) => sum + s.sessions, 0);
  const averageScore = Math.round(mockSkillProgress.reduce((sum, s) => sum + s.current, 0) / mockSkillProgress.length);
  const totalImprovement = mockSkillProgress.reduce((sum, s) => sum + (s.current - s.previous), 0);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz": return "📝";
      case "flashcard": return "🃏";
      case "practice": return "✏️";
      case "assignment": return "📚";
      default: return "📖";
    }
  };

  const handleExport = () => {
    // Mock export functionality
    const reportData = {
      student: studentName,
      grade,
      date: new Date().toISOString(),
      skills: mockSkillProgress,
      recentActivity: mockRecentActivity,
      summary: {
        totalSessions,
        averageScore,
        totalImprovement,
      },
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-report-${studentName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Progress Report</h2>
          <p className="text-sm text-muted-foreground">
            {studentName} • Grade {grade}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "skills", label: "Skills", icon: Target },
          { id: "activity", label: "Activity", icon: Calendar },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex-1"
          >
            <tab.icon className="w-4 h-4 mr-1" />
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {activeTab === "overview" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-4 border border-primary/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Sessions</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                <p className="text-xs text-muted-foreground">this month</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-success/20 to-primary/20 rounded-2xl p-4 border border-success/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Average</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
                <p className="text-xs text-muted-foreground">mastery level</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-warning/20 to-accent/20 rounded-2xl p-4 border border-warning/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  <span className="text-sm text-muted-foreground">Growth</span>
                </div>
                <p className="text-2xl font-bold text-foreground">+{totalImprovement}%</p>
                <p className="text-xs text-muted-foreground">improvement</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-info/20 to-primary/20 rounded-2xl p-4 border border-info/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-info" />
                  <span className="text-sm text-muted-foreground">Streak</span>
                </div>
                <p className="text-2xl font-bold text-foreground">5 days</p>
                <p className="text-xs text-muted-foreground">current streak</p>
              </motion.div>
            </div>

            {/* Quick Skills Overview */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Skill Mastery
              </h3>
              <div className="space-y-3">
                {mockSkillProgress.map((skill, i) => (
                  <div key={skill.skill} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{skill.skill}</span>
                      <span className="text-muted-foreground">{skill.current}%</span>
                    </div>
                    <Progress value={skill.current} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-4 border border-accent/30">
              <h3 className="font-bold text-foreground mb-3">💡 Recommendations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span className="text-muted-foreground">Continue vocabulary flashcard practice - showing great progress!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span className="text-muted-foreground">Focus on writing exercises - more practice needed for sentence structure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info">•</span>
                  <span className="text-muted-foreground">Try the Grammar Quest game to reinforce past tense rules.</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {activeTab === "skills" && (
          <div className="space-y-4">
            {mockSkillProgress.map((skill, i) => {
              const improvement = skill.current - skill.previous;
              return (
                <motion.div
                  key={skill.skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-4 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-foreground">{skill.skill}</h4>
                    <div className={`flex items-center gap-1 text-sm ${
                      improvement > 0 ? "text-success" : improvement < 0 ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {improvement > 0 && <TrendingUp className="w-4 h-4" />}
                      {improvement > 0 ? "+" : ""}{improvement}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Current Level</span>
                      <span className="font-medium text-foreground">{skill.current}%</span>
                    </div>
                    <Progress value={skill.current} className="h-3" />
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Previous: {skill.previous}%</span>
                      <span>{skill.sessions} sessions</span>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.ceil(skill.current / 20)
                            ? "text-warning fill-warning"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {/* Curriculum Alignment */}
            <div className="bg-secondary/30 rounded-2xl p-4 border border-border">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Curriculum Alignment
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Progress aligned with IB PYP and Colombian Primary Standards for Grade {grade}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">IB PYP Language</span>
                  <span className="text-success">On Track</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Colombian Standards</span>
                  <span className="text-success">Meeting Expectations</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            {mockRecentActivity.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{activity.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(activity.date)}</span>
                    <span>•</span>
                    <span>{formatDuration(activity.duration)}</span>
                  </div>
                </div>
                {activity.score !== undefined && (
                  <div className={`text-lg font-bold ${
                    activity.score >= 80 ? "text-success" :
                    activity.score >= 60 ? "text-warning" :
                    "text-destructive"
                  }`}>
                    {activity.score}%
                  </div>
                )}
              </motion.div>
            ))}

            <div className="text-center py-4">
              <Button variant="outline" size="sm">
                Load More Activity
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherReport_mod;
