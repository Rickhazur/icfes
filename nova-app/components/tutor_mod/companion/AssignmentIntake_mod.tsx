import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Camera, Sparkles, BookOpen, Clock, Target, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface AssignmentAnalysis {
  id: string;
  originalText: string;
  imageUrl?: string;
  skills: {
    grammar: number;
    vocabulary: number;
    reading: number;
    writing: number;
  };
  estimatedTime: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  grade: 1 | 2 | 3 | 4 | 5;
  topics: string[];
  suggestedActivities: string[];
}

interface AssignmentIntakeProps {
  grade: 1 | 2 | 3 | 4 | 5;
  onAnalysisComplete: (analysis: AssignmentAnalysis) => void;
  onClose: () => void;
}

const analyzeAssignment = (text: string, grade: number): AssignmentAnalysis => {
  const lower = text.toLowerCase();
  
  // Detect skills based on keywords
  const grammarKeywords = ["grammar", "verb", "tense", "sentence", "correct", "fix", "past", "present", "future", "singular", "plural"];
  const vocabKeywords = ["vocabulary", "words", "meaning", "define", "synonym", "antonym", "spelling"];
  const readingKeywords = ["read", "story", "passage", "comprehension", "understand", "main idea", "summary"];
  const writingKeywords = ["write", "essay", "paragraph", "describe", "explain", "compose", "letter", "story"];
  
  const countMatches = (keywords: string[]) => keywords.filter(k => lower.includes(k)).length;
  
  const skills = {
    grammar: Math.min(100, 30 + countMatches(grammarKeywords) * 15),
    vocabulary: Math.min(100, 25 + countMatches(vocabKeywords) * 15),
    reading: Math.min(100, 20 + countMatches(readingKeywords) * 15),
    writing: Math.min(100, 35 + countMatches(writingKeywords) * 15),
  };
  
  const wordCount = text.split(/\s+/).length;
  const difficulty = wordCount < 20 ? "easy" : wordCount < 50 ? "medium" : "hard";
  const estimatedTime = Math.max(15, Math.min(60, wordCount * 2));
  
  const topics: string[] = [];
  if (skills.grammar > 40) topics.push("Grammar Rules");
  if (skills.vocabulary > 40) topics.push("Vocabulary Building");
  if (skills.reading > 40) topics.push("Reading Comprehension");
  if (skills.writing > 40) topics.push("Writing Practice");
  
  return {
    id: `assignment_${Date.now()}`,
    originalText: text,
    skills,
    estimatedTime,
    difficulty,
    grade: grade as 1 | 2 | 3 | 4 | 5,
    topics: topics.length > 0 ? topics : ["General English Practice"],
    suggestedActivities: [
      "Practice vocabulary flashcards",
      "Complete grammar exercises",
      "Write practice sentences",
      "Take a mini-quiz",
    ],
  };
};

const AssignmentIntake_mod = ({ grade, onAnalysisComplete, onClose }: AssignmentIntakeProps) => {
  const [assignmentText, setAssignmentText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AssignmentAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max 5MB allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        toast.success("Image uploaded! Add details about the assignment.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!assignmentText.trim() && !uploadedImage) {
      toast.error("Please enter your assignment or upload an image");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = analyzeAssignment(assignmentText || "General practice assignment", grade);
    if (uploadedImage) {
      result.imageUrl = uploadedImage;
    }
    
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleStartPlan = () => {
    if (analysis) {
      onAnalysisComplete(analysis);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Assignment Helper</h2>
            <p className="text-sm text-muted-foreground">Tell me about your homework!</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {!analysis ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col gap-4"
          >
            <div className="bg-secondary/30 rounded-2xl p-4 border border-border">
              <label className="block text-sm font-medium text-foreground mb-2">
                📝 Describe your assignment or homework:
              </label>
              <Textarea
                value={assignmentText}
                onChange={(e) => setAssignmentText(e.target.value)}
                placeholder="Example: I need to write 5 sentences using past tense verbs about my weekend..."
                className="min-h-[120px] resize-none bg-background/50"
              />
            </div>

            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  fileInputRef.current?.setAttribute("capture", "environment");
                  fileInputRef.current?.click();
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>

            {uploadedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-secondary/30 rounded-xl p-2 border border-border"
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded assignment"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 w-8 h-8"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                  <span>Assignment image uploaded</span>
                </div>
              </motion.div>
            )}

            <div className="mt-auto">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!assignmentText.trim() && !uploadedImage)}
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                    </motion.div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze My Assignment
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col gap-4 overflow-y-auto"
          >
            <div className="bg-gradient-to-br from-success/20 to-primary/20 rounded-2xl p-4 border border-success/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-success" />
                <h3 className="font-bold text-foreground">Analysis Complete!</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-background/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    Estimated Time
                  </div>
                  <p className="font-bold text-foreground">{analysis.estimatedTime} minutes</p>
                </div>
                <div className="bg-background/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    Difficulty
                  </div>
                  <p className="font-bold text-foreground capitalize">{analysis.difficulty}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Skills Involved:</p>
                <div className="space-y-2">
                  {Object.entries(analysis.skills).map(([skill, value]) => (
                    <div key={skill} className="flex items-center gap-2">
                      <span className="text-sm capitalize w-20">{skill}</span>
                      <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Topics Detected:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-2xl p-4 border border-border">
              <h4 className="font-bold text-foreground mb-3">📚 Suggested Study Plan:</h4>
              <ul className="space-y-2">
                {analysis.suggestedActivities.map((activity, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAnalysis(null)}
              >
                Edit Assignment
              </Button>
              <Button className="flex-1" onClick={handleStartPlan}>
                Create Study Plan
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentIntake_mod;
