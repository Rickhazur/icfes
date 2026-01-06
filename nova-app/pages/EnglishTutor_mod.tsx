import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "@/context/LearningContext";
import { Settings, BarChart3, X, Store, BookOpen, Brain, FileText, Gamepad2, Mic, Sparkles, Newspaper, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LinaAvatar, AvatarState } from "@/components/MathMaestro/tutor/LinaAvatar";
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';
import TutorMascot from "@/components/tutor_mod/TutorMascot";
import ProgressBadges from "@/components/tutor_mod/ProgressBadges";
import WeaknessDetector from "@/components/tutor_mod/WeaknessDetector";
import ChatInterface from "@/components/tutor_mod/ChatInterface";
import GamesHub_mod, { type GameType } from "@/components/tutor_mod/games/GamesHub_mod";
import FlashRace_mod from "@/components/tutor_mod/games/FlashRace_mod";
import GrammarQuest_mod from "@/components/tutor_mod/games/GrammarQuest_mod";
import StoryBuilder_mod from "@/components/tutor_mod/games/StoryBuilder_mod";
import PuzzleTimeline_mod from "@/components/tutor_mod/games/PuzzleTimeline_mod";
import NovaStore_mod from "@/components/tutor_mod/NovaStore_mod";
import AssignmentIntake_mod, { type AssignmentAnalysis } from "@/components/tutor_mod/companion/AssignmentIntake_mod";
import StudyPlanGenerator_mod, { type StudySession } from "@/components/tutor_mod/companion/StudyPlanGenerator_mod";
import GuidedHelp_mod from "@/components/tutor_mod/companion/GuidedHelp_mod";
import PracticeQuiz_mod from "@/components/tutor_mod/companion/PracticeQuiz_mod";
import FlashcardsSpaced_mod from "@/components/tutor_mod/companion/FlashcardsSpaced_mod";
import TeacherReport_mod from "@/components/tutor_mod/companion/TeacherReport_mod";
import PronouncePlay_mod from "@/components/tutor_mod/companion/PronouncePlay_mod";
import ARVocabulary_mod from "@/components/tutor_mod/companion/ARVocabulary_mod";
import DailyNews_mod from "@/components/tutor_mod/companion/DailyNews_mod";
import AvatarRewards_mod from "@/components/tutor_mod/companion/AvatarRewards_mod";
import TutorReports_mod from "@/components/tutor_mod/TutorReports_mod";
import { TutorReport } from "@/types/tutor";
import GradeLevelSelector_mod from "@/components/tutor_mod/GradeLevelSelector_mod";
import { useRewards } from "@/hooks/useRewards_mod";
import { usePersonalizedContent, generatePersonalizedFlashcards, generatePersonalizedQuizQuestions } from "@/hooks/usePersonalizedContent_mod";
import {
  sampleTutorReports,
  getOllieResponse,
  generatePersonalizedContent,
  gradeVocabulary
} from "@/lib/olliePersonality_mod";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "tutor" | "student";
  content: string;
  type?: "text" | "game-prompt" | "correction" | "praise" | "personalized";
  emoji?: string;
  metadata?: {
    focusArea?: string;
    gradeLevel?: number;
    source?: string;
  };
}

type ViewType = 'chat' | 'games' | 'store' | 'assignment' | 'studyplan' | 'guidedhelp' | 'quiz' | 'flashcards' | 'report' | 'pronunciation' | 'arvocab' | 'dailynews' | 'avatar' | 'tutorreports' | 'gradeselect' | GameType;

const sampleSubjects = [
  { subject: "Science", emoji: "🔬", score: 72, trend: "up" as const, weaknesses: ["Scientific vocabulary", "Past tense"] },
  { subject: "History", emoji: "📜", score: 58, trend: "down" as const, weaknesses: ["Connecting words", "Dates in English"] },
  { subject: "Math", emoji: "🔢", score: 85, trend: "stable" as const, weaknesses: ["Word problems"] },
  { subject: "Art", emoji: "🎨", score: 90, trend: "up" as const, weaknesses: [] },
];

const flashRaceWords = [
  { id: '1', word: 'Scientist', translation: 'Científico', tags: ['science'] },
  { id: '2', word: 'Experiment', translation: 'Experimento', tags: ['science'] },
  { id: '3', word: 'Discovery', translation: 'Descubrimiento', tags: ['science'] },
  { id: '4', word: 'Laboratory', translation: 'Laboratorio', tags: ['science'] },
  { id: '5', word: 'Hypothesis', translation: 'Hipótesis', tags: ['science'] },
];

const grammarChallenges = [
  { id: '1', type: 'correct' as const, question: 'She don\'t like experiments.', correctAnswer: 'She doesn\'t like experiments.', hint: 'Third person singular', rule: 'With he/she/it use doesn\'t', tags: ['third-person'] },
  { id: '2', type: 'complete' as const, question: 'The scientist ___ (discover) a cure yesterday.', options: ['discover', 'discovered', 'discovering', 'discovers'], correctAnswer: 'discovered', hint: 'Past action', rule: 'Use -ed for past tense', tags: ['past-tense'] },
  { id: '3', type: 'correct' as const, question: 'They was happy.', correctAnswer: 'They were happy.', hint: 'Plural subject', rule: 'They + were', tags: ['verb-agreement'] },
];

const storyPieces = [
  { id: '1', text: 'Once upon a time, a scientist worked in her lab.', type: 'starter' as const },
  { id: '2', text: 'However, she needed more equipment.', type: 'connector' as const },
  { id: '3', text: 'She discovered a new element!', type: 'detail' as const },
  { id: '4', text: 'Finally, she won the Nobel Prize.', type: 'ending' as const },
  { id: '5', text: 'The experiment was very complex.', type: 'detail' as const },
];

const readingPassage = {
  id: '1',
  title: 'The Water Cycle',
  text: 'First, the sun heats the water in oceans and lakes. Then, the water evaporates and rises into the sky. Next, it forms clouds. Finally, the water falls as rain.',
  events: [
    { id: '1', text: 'The sun heats the water', correctOrder: 1 },
    { id: '2', text: 'Water evaporates and rises', correctOrder: 2 },
    { id: '3', text: 'Clouds form in the sky', correctOrder: 3 },
    { id: '4', text: 'Rain falls to the ground', correctOrder: 4 },
  ],
  mainIdeaOptions: ['How rain is made', 'Why oceans are salty', 'How fish swim'],
  correctMainIdea: 'How rain is made',
};

const EnglishTutor_mod = () => {
  const { balance, refreshBalance } = useRewards();
  const { language, setLanguage } = useLearning();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [studentProgress, setStudentProgress] = useState({ points: 0, streak: 5, badges: ["vocabulary", "grammar", "reading"] });
  const [currentAnalysis, setCurrentAnalysis] = useState<AssignmentAnalysis | null>(null);
  const [helpTopic, setHelpTopic] = useState("grammar");
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');

  // Sync avatar state with typing
  useEffect(() => {
    if (isTyping) {
      setAvatarState('speaking');
    } else {
      if (avatarState !== 'celebrating') {
        setAvatarState('idle');
      }
    }
  }, [isTyping, avatarState]);


  // Personalized learning state
  const [studentName, setStudentName] = useState("Student");
  const [gradeLevel, setGradeLevel] = useState<number>(3);
  const { reports: tutorReports } = useLearning();
  const [showReports, setShowReports] = useState(false);

  // Use personalized content hook
  const personalizedContent = usePersonalizedContent(tutorReports, gradeLevel);

  // Generate personalized flashcards from tutor reports
  const personalizedFlashcards = useMemo(() =>
    generatePersonalizedFlashcards(personalizedContent),
    [personalizedContent]
  );

  // Generate personalized quiz questions
  const personalizedQuizQuestions = useMemo(() =>
    generatePersonalizedQuizQuestions(personalizedContent, 10),
    [personalizedContent]
  );

  // Generate personalized flash race words from vocabulary
  const personalizedFlashRaceWords = useMemo(() =>
    personalizedContent.vocabulary.slice(0, 10).map((v, idx) => ({
      id: `pv-${idx}`,
      word: v.word,
      translation: v.definition,
      tags: [v.category],
    })),
    [personalizedContent]
  );

  // Initialize with personalized greeting
  useEffect(() => {
    const savedName = localStorage.getItem("englishTutor_studentName");
    const savedGrade = localStorage.getItem("englishTutor_gradeLevel");

    if (savedName) setStudentName(savedName);
    if (savedGrade) setGradeLevel(parseInt(savedGrade));

    const grade = savedGrade ? parseInt(savedGrade) : 3;
    const name = savedName || "Student";

    const greeting = getOllieResponse(grade, "greeting");
    const gradeContent = gradeVocabulary[grade];

    const initialMessages: Message[] = [
      {
        id: "1",
        role: "tutor",
        content: `${greeting} I'm Ollie, your personal English Companion! I've received reports from the Research Center and Math Tutor about your learning journey.`,
        type: "text",
        emoji: "🦉"
      },
      {
        id: "2",
        role: "tutor",
        content: `As a ${getGradeLevelLabel(grade)} grader, I'll help you with ${gradeContent?.grammarFocus[0] || "English skills"}. I notice you might need help with word problems and scientific vocabulary. Let's work together! 🌟`,
        type: "personalized",
        emoji: "📚",
        metadata: { gradeLevel: grade }
      }
    ];
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    refreshBalance();
    const saved = localStorage.getItem("englishTutorProgress_mod");
    if (saved) setStudentProgress(JSON.parse(saved));
  }, [refreshBalance]);

  useEffect(() => {
    setStudentProgress(prev => ({ ...prev, points: balance }));
  }, [balance]);

  const getGradeLevelLabel = (grade: number) => {
    const ordinal = ["1st", "2nd", "3rd", "4th", "5th"];
    return ordinal[grade - 1] || `${grade}th`;
  };

  const handleGradeSelect = (grade: number) => {
    setGradeLevel(grade);
    localStorage.setItem("englishTutor_gradeLevel", grade.toString());

    const gradeContent = gradeVocabulary[grade];
    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: `Perfect! I've updated your lessons for ${getGradeLevelLabel(grade)} grade. We'll focus on ${gradeContent?.grammarFocus.slice(0, 2).join(" and ")}. Let's make English fun! 🎉`,
      type: "praise",
      emoji: "🦉",
      metadata: { gradeLevel: grade }
    };
    setMessages(prev => [...prev, msg]);
    setActiveView('chat');
    toast.success(`Grade level set to ${getGradeLevelLabel(grade)}`);
  };

  const handleSelectChallenge = (challenge: { area: string; englishConnection: string }) => {
    const content = generatePersonalizedContent(tutorReports, gradeLevel, challenge.area);

    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: `Let's work on "${challenge.englishConnection}"! ${content.exercise} This will help you in your other subjects too. Ready to start? 🎯`,
      type: "personalized",
      emoji: "📚",
      metadata: { focusArea: challenge.area, gradeLevel }
    };
    setMessages(prev => [...prev, msg]);
    setShowReports(false);
    setActiveView('chat');
  };

  const handleGameComplete = useCallback((score: number, coins: number) => {
    refreshBalance();
    sfx.playSuccess();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF']
    });
    setAvatarState('celebrating');
    setTimeout(() => setAvatarState('idle'), 4000);
    const encouragement = getOllieResponse(gradeLevel, "encouragement");
    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: `${encouragement} You earned ${coins} coins! Your balance: ${balance + coins}. Want to play another game or visit the store?`,
      type: "praise",
      emoji: "🏆",
    };
    setMessages(prev => [...prev, msg]);
    setActiveView('chat');
    toast.success(`+${coins} coins added`);
  }, [balance, refreshBalance, gradeLevel]);

  const handleSendMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "student", content, type: "text" }]);
    setIsTyping(true);

    setTimeout(() => {
      const lower = content.toLowerCase();
      let response = "";
      let type: Message["type"] = "text";
      let metadata: Message["metadata"] = { gradeLevel };

      // Check if message relates to any tutor report challenges
      const relatedChallenge = tutorReports
        .flatMap(r => r.challenges)
        .find(c =>
          lower.includes(c.area.toLowerCase()) ||
          lower.includes(c.englishConnection.toLowerCase())
        );

      if (relatedChallenge) {
        const personalizedContent = generatePersonalizedContent(tutorReports, gradeLevel, relatedChallenge.area);
        response = `Great question! ${personalizedContent.exercise} Let's practice with these words: ${personalizedContent.vocabulary.slice(0, 4).join(", ")}. 📚`;
        type = "personalized";
        metadata = { ...metadata, focusArea: relatedChallenge.area };
      } else if (lower.includes("homework") || lower.includes("assignment") || lower.includes("help")) {
        setActiveView('assignment');
        response = "Let's work on your assignment together! 📚";
      } else if (lower.includes("game") || lower.includes("play")) {
        setActiveView('games');
        response = "Let's play some learning games! 🎮";
      } else if (lower.includes("store") || lower.includes("shop")) {
        setActiveView('store');
        response = "Opening the Nova Store! 🏪";
      } else if (lower.includes("quiz") || lower.includes("test")) {
        setActiveView('quiz');
        response = "Time for a practice quiz! 📝";
      } else if (lower.includes("flashcard") || lower.includes("review")) {
        setActiveView('flashcards');
        response = "Let's review with flashcards! 🃏";
      } else if (lower.includes("report") || lower.includes("progress")) {
        setActiveView('report');
        response = "Let's check your progress! 📊";
      } else if (lower.includes("grade") || lower.includes("level")) {
        setActiveView('gradeselect');
        response = "Let's update your grade level! 🎓";
      } else if (lower.includes("tutor") || lower.includes("challenges") || lower.includes("difficulties")) {
        setShowReports(true);
        response = "Here are the reports from your other tutors. Let's see what we can work on! 📋";
      } else {
        // Grade-appropriate default response
        const gradeContent = gradeVocabulary[gradeLevel];
        response = `I can help with ${gradeContent?.grammarFocus[0] || "English"}! Would you like to practice vocabulary, play a game, or work on your homework? Just let me know! 🦉`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: response,
        type,
        emoji: "🦉",
        metadata
      }]);
      setIsTyping(false);
    }, 1000);
  }, [gradeLevel, tutorReports]);

  const handleAnalysisComplete = (analysis: AssignmentAnalysis) => {
    setCurrentAnalysis(analysis);
    setActiveView('studyplan');
  };

  const handleStartSession = (session: StudySession) => {
    if (session.activities[0]?.type === "flashcards") {
      setActiveView('flashcards');
    } else if (session.activities[0]?.type === "quiz") {
      setActiveView('quiz');
    } else {
      setHelpTopic(session.title.includes("Grammar") ? "grammar" : session.title.includes("Vocabulary") ? "vocabulary" : "writing");
      setActiveView('guidedhelp');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'games':
        return <GamesHub_mod onSelectGame={setActiveView} onClose={() => setActiveView('chat')} onOpenStore={() => setActiveView('store')} balance={balance} />;
      case 'store':
        return <NovaStore_mod onClose={() => setActiveView('chat')} />;
      case 'flashrace':
        // Use personalized vocabulary for flash race
        return <FlashRace_mod words={personalizedFlashRaceWords.length > 0 ? personalizedFlashRaceWords : flashRaceWords} onComplete={handleGameComplete} onClose={() => setActiveView('games')} personalizedContent={personalizedContent} />;
      case 'grammarquest':
        return <GrammarQuest_mod challenges={grammarChallenges} onComplete={handleGameComplete} onClose={() => setActiveView('games')} />;
      case 'storybuilder':
        return <StoryBuilder_mod pieces={storyPieces} theme="Science Discovery" onComplete={handleGameComplete} onClose={() => setActiveView('games')} />;
      case 'puzzletimeline':
        return <PuzzleTimeline_mod passage={readingPassage} onComplete={handleGameComplete} onClose={() => setActiveView('games')} />;
      case 'pronounceplay':
        return <PronouncePlay_mod onComplete={handleGameComplete} onBack={() => setActiveView('games')} personalizedContent={personalizedContent} />;
      case 'pronunciation':
        return <PronouncePlay_mod onComplete={handleGameComplete} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} />;
      case 'arvocab':
        return <ARVocabulary_mod onComplete={handleGameComplete} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} />;
      case 'dailynews':
        return <DailyNews_mod onComplete={handleGameComplete} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} />;
      case 'avatar':
        return <AvatarRewards_mod onBack={() => setActiveView('chat')} />;
      case 'assignment':
        return <AssignmentIntake_mod grade={gradeLevel as 1 | 2 | 3 | 4 | 5} onAnalysisComplete={handleAnalysisComplete} onClose={() => setActiveView('chat')} />;
      case 'studyplan':
        return currentAnalysis ? (
          <StudyPlanGenerator_mod analysis={currentAnalysis} onStartSession={(session) => handleStartSession(session)} onBack={() => setActiveView('assignment')} />
        ) : null;
      case 'guidedhelp':
        return <GuidedHelp_mod topic={helpTopic} onComplete={() => handleGameComplete(100, 10)} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} />;
      case 'quiz':
        return <PracticeQuiz_mod onComplete={handleGameComplete} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} />;
      case 'flashcards':
        return <FlashcardsSpaced_mod cards={personalizedFlashcards} onComplete={(masteredCount) => handleGameComplete(masteredCount * 10, masteredCount * 2)} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} />;
      case 'report':
        return <TeacherReport_mod onBack={() => setActiveView('chat')} studentName={studentName} grade={gradeLevel} />;
      case 'gradeselect':
        return (
          <div className="p-4">
            <GradeLevelSelector_mod
              currentGrade={gradeLevel}
              onSelectGrade={handleGradeSelect}
              studentName={studentName}
            />
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setActiveView('chat')}>
              Back to Chat
            </Button>
          </div>
        );
      case 'tutorreports':
        return (
          <div className="p-4 overflow-y-auto">
            <TutorReports_mod
              reports={tutorReports}
              gradeLevel={gradeLevel}
              onSelectChallenge={handleSelectChallenge}
            />
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setActiveView('chat')}>
              Back to Chat
            </Button>
          </div>
        );
      default:
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onStartGame={() => setActiveView('games')}
            onOpenReports={() => setShowReports(true)}
            isTyping={isTyping}
            studentName={studentName}
            gradeLevel={gradeLevel}
            activeReports={tutorReports}
          />
        );
    }
  };

  return (
    <div className="min-h-screen gradient-sky flex flex-col">
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative -mt-2">
              <LinaAvatar state={avatarState} size={70} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {language === 'es' ? 'Compañero de Inglés' : 'English Companion'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {getGradeLevelLabel(gradeLevel)} {language === 'es' ? 'Grado' : 'Grade'} • {language === 'es' ? 'Personalizado para' : 'Personalized for'} {studentName} 🌟
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveView('gradeselect')}>
              <GraduationCap className="w-4 h-4 mr-1" />
              {getGradeLevelLabel(gradeLevel)}
            </Button>

            {/* Language Toggle */}
            <div className="flex items-center bg-muted rounded-full p-1 mx-2">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all",
                  language === 'en' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all",
                  language === 'es' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                ES
              </button>
            </div>

            <Button variant="playful" size="sm" onClick={() => setActiveView('store')}>
              <Store className="w-4 h-4 mr-1" />
              <span className="font-bold">{balance}</span>
            </Button>
            <Button variant="playful" size="sm" onClick={() => setShowAnalysis(!showAnalysis)}>
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 max-w-7xl mx-auto w-full">
        <ProgressBadges {...studentProgress} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 max-w-7xl mx-auto w-full">
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide pt-2">
          {[
            { id: 'tutorreports', label: language === 'es' ? 'Reportes Tutor' : 'Tutor Reports', icon: FileText, color: 'sky' },
            { id: 'assignment', label: language === 'es' ? 'Ayuda Tarea' : 'Homework Help', icon: FileText, color: 'orange' },
            { id: 'quiz', label: language === 'es' ? 'Prueba' : 'Practice Quiz', icon: Brain, color: 'indigo' },
            { id: 'flashcards', label: language === 'es' ? 'Tarjetas' : 'Flashcards', icon: BookOpen, color: 'pink' },
            { id: 'games', label: language === 'es' ? 'Juegos' : 'Games', icon: Gamepad2, color: 'green' },
            { id: 'pronunciation', label: language === 'es' ? 'Pronunciación' : 'Pronunciation', icon: Mic, color: 'rose' },
            { id: 'arvocab', label: language === 'es' ? 'Vocab AR' : 'AR Vocab', icon: Sparkles, color: 'yellow' },
            { id: 'dailynews', label: language === 'es' ? 'Noticias' : 'Daily News', icon: Newspaper, color: 'teal' },
            { id: 'avatar', label: language === 'es' ? 'Mi Avatar' : 'My Avatar', icon: User, color: 'violet' },
            { id: 'report', label: language === 'es' ? 'Reporte Gral' : 'Overall Report', icon: BarChart3, color: 'amber' }
          ].map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(action.id as ViewType)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 min-w-[100px] rounded-3xl transition-all comic-shadow",
                "bg-white border-b-4",
                action.color === 'sky' && "border-sky-400 text-sky-600",
                action.color === 'orange' && "border-orange-400 text-orange-600",
                action.color === 'indigo' && "border-indigo-400 text-indigo-600",
                action.color === 'pink' && "border-pink-400 text-pink-600",
                action.color === 'green' && "border-green-400 text-green-600",
                action.color === 'rose' && "border-rose-400 text-rose-600",
                action.color === 'yellow' && "border-yellow-400 text-yellow-600",
                action.color === 'teal' && "border-teal-400 text-teal-600",
                action.color === 'violet' && "border-violet-400 text-violet-600",
                action.color === 'amber' && "border-amber-400 text-amber-600",
                activeView === action.id && "bg-gray-50 -translate-y-1 shadow-none border-b-2 mt-0.5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                action.color === 'sky' && "bg-sky-100 text-sky-500",
                action.color === 'orange' && "bg-orange-100 text-orange-500",
                action.color === 'indigo' && "bg-indigo-100 text-indigo-500",
                action.color === 'pink' && "bg-pink-100 text-pink-500",
                action.color === 'green' && "bg-green-100 text-green-500",
                action.color === 'rose' && "bg-rose-100 text-rose-500",
                action.color === 'yellow' && "bg-yellow-100 text-yellow-500",
                action.color === 'teal' && "bg-teal-100 text-teal-500",
                action.color === 'violet' && "bg-violet-100 text-violet-500",
                action.color === 'amber' && "bg-amber-100 text-amber-500"
              )}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-tight whitespace-nowrap">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full gap-4 p-4 overflow-hidden">
        {/* Tutor Reports Side Panel */}
        <AnimatePresence>
          {showReports && (
            <motion.div
              className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setShowReports(false)} />
              <div className="relative h-full bg-card p-4 rounded-2xl shadow-medium overflow-y-auto max-h-[80vh] lg:max-h-full m-4 lg:m-0">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setShowReports(false)}>
                  <X className="w-5 h-5" />
                </Button>
                <TutorReports_mod
                  reports={tutorReports}
                  gradeLevel={gradeLevel}
                  onSelectChallenge={handleSelectChallenge}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAnalysis && !showReports && (
            <motion.div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-80" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setShowAnalysis(false)} />
              <div className="relative h-full bg-card p-4 rounded-2xl shadow-medium overflow-y-auto max-h-[80vh] lg:max-h-full m-4 lg:m-0">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 lg:hidden" onClick={() => setShowAnalysis(false)}><X className="w-5 h-5" /></Button>
                <WeaknessDetector subjects={sampleSubjects} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 bg-card rounded-3xl shadow-medium overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} className="flex-1 flex flex-col min-h-0 p-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EnglishTutor_mod;
