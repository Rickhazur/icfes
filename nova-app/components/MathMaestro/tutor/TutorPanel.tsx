import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { useGamification } from '../../../context/GamificationContext';
import { Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust path if needed or use relative
import { Language, Curriculum, GradeLevel, MathProblemType } from '../../../types/tutor';
import { generateSpeech, VOICE_IDS } from '../../../services/elevenlabs';
import { toast } from 'sonner';
import { MathSolver, MathStep, diagnoseMathError } from '../../../services/mathSolver';
import { isTopicAppropriateForGrade, getRemediationTopics, needsRemediation } from '../../../services/gradeCurriculum';
import { StudentProgress, sendWhatsAppReport, calculateAchievements, saveProgressToDatabase } from '../../../services/whatsappReports';
import { getCurrentWeekTopic, getStudentPreferences } from '../../../services/supabase';
import { LinaAvatar, AvatarState } from './LinaAvatar';
import confetti from 'canvas-confetti';
import { sfx } from '../../../services/soundEffects';
import { extractProblemData, verifyMathTopic } from '../../../services/openai';
import { getRandomQuote, getFirstName, formatQuote } from '../../../services/inspirationalQuotes';

interface TutorPanelProps {
  language: Language;
  curriculum: Curriculum;
  grade: GradeLevel;
  userName?: string;
  userId?: string;
  onInsertStarter: (starter: string) => void;
  onWriteToBoard?: (text: string) => void;
  whiteboardRef?: React.RefObject<any>;
}

export interface TutorPanelRef {
  triggerVoice: (text: string) => void;
}

export const TutorPanel = forwardRef<TutorPanelRef, TutorPanelProps>(({ language, curriculum, grade, userName, userId, onInsertStarter, whiteboardRef }, ref) => {
  // Simple State
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'active'>('idle');
  const { addCoins, addXP } = useGamification();
  const [detectedType, setDetectedType] = useState<MathProblemType | null>(null);
  const [studentPrefs, setStudentPrefs] = useState<{ learning_interests: string[]; favorite_animals: string[] } | null>(null);
  const [activeMission, setActiveMission] = useState<any>(null);

  // Initialize Welcome Message
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentTopic = await getCurrentWeekTopic(language);
        setWeekTopic(currentTopic);

        if (userId) {
          const prefs = await getStudentPreferences(userId);
          if (prefs) setStudentPrefs(prefs);
        }

        // Check for Active Mission from Arena
        const missionJson = localStorage.getItem('nova_mission_params');
        if (missionJson) {
          try {
            const mission = JSON.parse(missionJson);
            setActiveMission(mission);

            // Mission Intro Speech
            const intro = language === 'es'
              ? `¡Atención Cadete ${getFirstName(userName)}! Tu misión "${mission.title}" ha comenzado. Para completarla, necesitamos resolver problemas de ${mission.category === 'math' ? 'Matemáticas' : mission.category}. ¡Escribe tu primer problema en la pizarra!`
              : `Attention Cadet ${getFirstName(userName)}! Your mission "${mission.title}" has started. To complete it, we need to solve ${mission.category === 'math' ? 'Math' : mission.category} problems. Write your first problem on the board!`;

            // Clear param to avoid re-triggering on refresh? Maybe better to keep until solved.
            // localStorage.removeItem('nova_mission_params'); 

            // Small delay to allow audio init
            setTimeout(() => playExplanation(intro), 1000);
          } catch (err) {
            console.error("Error parsing mission params", err);
          }
        }
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchData();
  }, [language, userId]);

  const handleAvatarClick = () => {
    const firstName = getFirstName(userName);
    const quote = getRandomQuote(language);

    let welcome = language === 'es'
      ? `¡Hola ${firstName || 'Campeón'}! Soy Nova. `
      : `Hi ${firstName || 'Champion'}! I'm Nova. `;

    // Add inspirational quote
    welcome += formatQuote(quote, language) + ' ';

    // CHECK MEMORY
    const lastSession = localStorage.getItem('nova_last_session');
    if (lastSession) {
      try {
        const memory = JSON.parse(lastSession);
        const daysDiff = (new Date().getTime() - new Date(memory.date).getTime()) / (1000 * 3600 * 24);

        // If recently struggled (less than 3 days ago)
        if (daysDiff < 3 && memory.strugglingTopics && memory.strugglingTopics.length > 0) {
          const topic = memory.strugglingTopics[0];
          welcome += language === 'es'
            ? ` ¿Estás listo para dominar ${topic} hoy? ¡La última vez estuviste muy cerca!`
            : ` Are you ready to master ${topic} today? You were so close last time!`;
          playExplanation(welcome);
          return;
        }
      } catch (e) { console.error("Memory parsing error", e); }
    }

    // Personalization injection
    if (studentPrefs && studentPrefs.learning_interests.length > 0) {
      const randomInterest = studentPrefs.learning_interests[Math.floor(Math.random() * studentPrefs.learning_interests.length)];
      welcome += language === 'es'
        ? `¡Hoy me siento con mucha energía para hablar de ${randomInterest}! `
        : `I'm feeling very energetic to talk about ${randomInterest} today! `;
    }

    if (weekTopic) {
      welcome += language === 'es'
        ? `Esta semana estamos aprendiendo sobre ${weekTopic.topic_name}. ¿Quieres que te ayude con eso usando ejemplos de lo que más te gusta?`
        : `This week we're learning about ${weekTopic.topic_name}. Would you like me to help you with that using examples of what you like most?`;
    } else {
      welcome += language === 'es'
        ? `¿Qué ejercicio tienes para hoy?`
        : `What exercise do you have for today?`;
    }

    playExplanation(welcome);
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SOLVER STATE
  const [solverSteps, setSolverSteps] = useState<MathStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [problemData, setProblemData] = useState<{ n1: number, n2: number, type: MathProblemType } | null>(null);

  // AVATAR STATE
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [weekTopic, setWeekTopic] = useState<{ topic_name: string; mapped_topic: string; description: string } | null>(null);
  const [dailyQuote, setDailyQuote] = useState<{ text: string; author?: string } | null>(null);

  // Initialize daily quote
  useEffect(() => {
    const quote = getRandomQuote(language);
    setDailyQuote(quote);
  }, [language]);

  // Auto-advance explanations for fluidity
  useEffect(() => {
    if (!isSpeaking && status === 'active' && solverSteps[currentStepIndex]) {
      const step = solverSteps[currentStepIndex];
      // Only auto-advance if it's an explanation and NOT the last step
      if (step.type === 'explanation' && currentStepIndex < solverSteps.length - 1) {
        const timer = setTimeout(() => {
          handleNextStep();
        }, 2000); // 2 second natural pause
        return () => clearTimeout(timer);
      }
    }
  }, [isSpeaking, currentStepIndex, status, solverSteps]);

  // Sync avatar with speaking state
  useEffect(() => {
    if (isSpeaking) {
      setAvatarState('speaking');
    } else if (status === 'analyzing') {
      setAvatarState('thinking');
    } else {
      if (avatarState !== 'celebrating') {
        setAvatarState('idle');
      }
    }
  }, [isSpeaking, status]);

  // ADAPTIVE LEARNING STATE
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [remediationMode, setRemediationMode] = useState(false);
  const [allowedTopics, setAllowedTopics] = useState<string[]>([]);

  // PROGRESS TRACKING STATE
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [topicsPracticed, setTopicsPracticed] = useState<Set<string>>(new Set());
  const [totalQuestionsAttempted, setTotalQuestionsAttempted] = useState(0);
  const [totalQuestionsCorrect, setTotalQuestionsCorrect] = useState(0);
  const [strugglingTopicsSet, setStrugglingTopicsSet] = useState<Set<string>>(new Set());

  // Play explanation simple
  const playExplanation = async (text: string) => {
    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // STOP ROBOTIC VOICE to prevent overlap
    window.speechSynthesis.cancel();

    // Pre-process text to read symbols correctly
    let processedText = text;

    // Helper to process fractions
    const processFractions = (txt: string, lang: Language) => {
      return txt.replace(/(\d+)\/(\d+)/g, (match, num, den) => {
        const n = parseInt(num);
        const d = parseInt(den);

        if (lang === 'es') {
          // Special cases
          if (d === 2) return n === 1 ? 'un medio' : `${n} medios`;
          if (d === 3) return n === 1 ? 'un tercio' : `${n} tercios`;
          if (d === 4) return n === 1 ? 'un cuarto' : `${n} cuartos`;

          const ordinals: Record<number, string> = {
            5: 'quintos', 6: 'sextos', 7: 'séptimos', 8: 'octavos', 9: 'novenos', 10: 'décimos'
          };
          if (ordinals[d]) return `${n} ${ordinals[d]}`;
          return `${n} sobre ${d}`;
        } else {
          // English
          if (d === 2) return n === 1 ? 'one half' : `${n} halves`;
          if (d === 4) return n === 1 ? 'one quarter' : `${n} quarters`;

          const ordinals: Record<number, string> = {
            3: 'thirds', 5: 'fifths', 6: 'sixths', 7: 'sevenths',
            8: 'eighths', 9: 'ninths', 10: 'tenths'
          };
          if (ordinals[d]) return `${n} ${ordinals[d]}`;
          return `${n} over ${d}`;
        }
      });
    };

    processedText = processFractions(processedText, language);

    if (language === 'es') {
      processedText = processedText
        .replace(/\+/g, ' más ')
        .replace(/-/g, ' menos ')
        .replace(/×/g, ' por ').replace(/\*/g, ' por ')
        .replace(/÷/g, ' entre ') // Only replace standalone division symbol
        // Note: we already processed a/b fractions, but loose / might still act as division
        .replace(/(?<!\d)\/(?!\d)/g, ' entre ')
        .replace(/=/g, ' igual a ')
        .replace(/≠/g, ' no es igual a ')
        .replace(/</g, ' menor que ')
        .replace(/>/g, ' mayor que ')
        .replace(/≤/g, ' menor o igual que ')
        .replace(/≥/g, ' mayor o igual que ')
        .replace(/%/g, ' por ciento ')
        .replace(/°/g, ' grados ');
    } else {
      processedText = processedText
        .replace(/\+/g, ' plus ')
        .replace(/-/g, ' minus ')
        .replace(/×/g, ' times ').replace(/\*/g, ' times ')
        .replace(/÷/g, ' divided by ')
        .replace(/(?<!\d)\/(?!\d)/g, ' divided by ')
        .replace(/=/g, ' equals ')
        .replace(/≠/g, ' does not equal ')
        .replace(/</g, ' less than ')
        .replace(/>/g, ' greater than ')
        .replace(/≤/g, ' less than or equal to ')
        .replace(/≥/g, ' greater than or equal to ')
        .replace(/%/g, ' percent ')
        .replace(/°/g, ' degrees ');
    }

    // Set thinking state while generating
    setAvatarState('thinking');

    try {
      // 🛡️ DAILY VOICE LIMIT CHECK 🛡️
      const today = new Date().toDateString();
      const usageKey = 'nova_voice_usage';
      const usageData = JSON.parse(localStorage.getItem(usageKey) || '{}');

      // Reset if new day
      if (usageData.date !== today) {
        usageData.date = today;
        usageData.count = 0;
      }

      // TODO: Get real plan from user context. Defaulting to STANDARD for Pilot.
      const currentPlan = 'standard';
      const planLimits = { free: 0, standard: 100, premium: -1 }; // Increased limit to ensure Luna speaks
      const voiceLimit = planLimits[currentPlan];
      const isUnlimited = voiceLimit === -1;

      let buffer: ArrayBuffer | null = null;

      if (isUnlimited || usageData.count < voiceLimit) {
        // Use Premium Voice (Lina/Rachelle)
        buffer = await generateSpeech(processedText, language);

        // Only increment if successful
        if (buffer) {
          usageData.count++;
          localStorage.setItem(usageKey, JSON.stringify(usageData));

          // Warn if close to limit
          if (!isUnlimited && usageData.count === voiceLimit) {
            toast.info(language === 'es' ? "⚡ Energía de voz agotada por hoy. Usando voz básica." : "⚡ Voice energy depleted for today. Using basic voice.");
          }
        }
      } else {
        // Limit reached, intentional fallback to null (Trigger Browser Voice)
        console.log("⚡ Daily Voice Limit Reached. Switching to Eco Mode.");
        buffer = null;
      }

      // If generateSpeech returns null (e.g., due to an internal error or policy OR LIMIT),
      // we immediately fall back to browser speech.
      if (!buffer) {
        if (!isUnlimited && usageData.count < voiceLimit) {
          console.warn("⚠️ [ElevenLabs] API Failed. Switching to Browser Voice.");
        }
        throw new Error('BROWSER_FALLBACK'); // Throw a specific error to be caught below
      }

      const blob = new Blob([buffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onplay = () => {
        setIsSpeaking(true);
        // Ensure state is forced to speaking even if effect tries to override
        setAvatarState('speaking');
      };

      const safelyPlay = async () => {
        try {
          await audio.play();
        } catch (e) {
          console.error("Audio playback interrupted", e);
          setIsSpeaking(false);
        }
      };

      safelyPlay();

      // Only clean up on ended
      audio.onended = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
      };

      audioRef.current = audio;
    } catch (error: any) {
      console.error("Audio Error Details:", error);

      // Fallback to browser speech properly
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = language === 'es' ? 'es-ES' : 'en-US';

      utterance.onstart = () => {
        setIsSpeaking(true);
        setAvatarState('speaking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
        audioRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setAvatarState('idle');
      }

      // Try to use a better browser voice if possible (Google/Microsoft)
      const voices = window.speechSynthesis.getVoices();
      const betterVoice = voices.find(v => v.lang.includes(utterance.lang) && !v.name.includes('Sable'));
      if (betterVoice) utterance.voice = betterVoice;

      window.speechSynthesis.speak(utterance);

      // Notify user about fallback
      toast.error(language === 'es' ? "Problema con ElevenLabs, usando voz local" : "ElevenLabs issue, using local voice");
    }
  };

  // Add a manual audio unlock/test function
  const testAudio = () => {
    try {
      const audio = new Audio();
      // Try resolving strict browser policies
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      context.resume().then(() => {
        const osc = context.createOscillator();
        osc.connect(context.destination);
        osc.start();
        osc.stop(context.currentTime + 0.1);
        toast.success("🔊 Sistema de audio iniciado");
      });
    } catch (e: any) {
      toast.error("No se pudo iniciar el audio: " + e.message);
    }
  };

  // Step 1: Brain - Enhanced Recognition for Full Curriculum
  const detectProblemType = (text: string): MathProblemType | 'word_problem' | 'general' => {
    const lower = text.toLowerCase();

    // Word Problem Detection (Long text with numbers)
    if (text.split(' ').length > 5 && text.match(/\d+/)) {
      return 'word_problem';
    }

    // Fractions
    if (lower.includes('fracc') || lower.includes('/') && lower.match(/\d+\/\d+/)) {
      if (lower.includes('sum') || lower.includes('más') || lower.includes('+')) return 'fraction_addition';
      if (lower.includes('rest') || lower.includes('menos') || lower.includes('-')) return 'fraction_subtraction';
      return 'fractions';
    }

    // Decimals
    if (lower.includes('decimal') || lower.match(/\d+\.\d+/)) {
      if (lower.includes('sum') || lower.includes('más')) return 'decimal_addition';
      if (lower.includes('rest') || lower.includes('menos')) return 'decimal_subtraction';
      return 'decimals';
    }

    // Geometry
    if (lower.includes('área') || lower.includes('area')) return 'area';
    if (lower.includes('perímetro') || lower.includes('perimeter')) return 'perimeter';
    if (lower.includes('geo') || lower.includes('figur') || lower.includes('angul') || lower.includes('shape')) return 'geometry';

    // Basic Operations
    if (lower.includes('divi') || lower.includes('cociente') || lower.includes('/')) return 'division';
    if (lower.includes('multi') || lower.includes('por') || lower.includes('x') || lower.includes('*')) return 'multiplication';
    if (lower.includes('suma') || lower.includes('más') || lower.includes('adici') || lower.includes('+')) return 'addition';
    if (lower.includes('resta') || lower.includes('menos') || lower.includes('diferencia') || lower.includes('-')) return 'subtraction';

    return 'general';
  };

  // Helper: Get Name
  const getName = () => userName ? userName.split(' ')[0] : (language === 'es' ? 'Amigo' : 'Friend');

  // Helper: Send Progress Report to Parents via WhatsApp
  const sendProgressReport = async (parentPhone?: string) => {
    if (!parentPhone || !userName) {
      console.log('⚠️ No parent phone or student name available for report');
      return;
    }

    const timeSpent = Math.round((new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60));
    const accuracyRate = totalQuestionsAttempted > 0
      ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100)
      : 0;

    const progress: StudentProgress = {
      studentId: `student_${Date.now()}`, // TODO: Get from auth
      studentName: userName,
      grade: grade,
      sessionDate: new Date(),
      topicsPracticed: Array.from(topicsPracticed),
      questionsAttempted: totalQuestionsAttempted,
      questionsCorrect: totalQuestionsCorrect,
      questionsIncorrect: totalQuestionsAttempted - totalQuestionsCorrect,
      accuracyRate: accuracyRate,
      strugglingTopics: Array.from(strugglingTopicsSet),
      remediationSuggested: remediationMode,
      remediationTopics: remediationMode && detectedType ? getRemediationTopics(grade, detectedType) : [],
      timeSpent: timeSpent,
      achievements: calculateAchievements({
        studentId: '',
        studentName: userName,
        grade,
        sessionDate: new Date(),
        topicsPracticed: Array.from(topicsPracticed),
        questionsAttempted: totalQuestionsAttempted,
        questionsCorrect: totalQuestionsCorrect,
        questionsIncorrect: totalQuestionsAttempted - totalQuestionsCorrect,
        accuracyRate,
        strugglingTopics: Array.from(strugglingTopicsSet),
        remediationSuggested: remediationMode,
        remediationTopics: [],
        timeSpent,
        achievements: []
      }, language)
    };

    // Save to database
    await saveProgressToDatabase(progress);

    // Send WhatsApp report
    const sent = await sendWhatsAppReport({
      parentName: 'Parent', // TODO: Get from database
      parentPhone: parentPhone,
      studentId: progress.studentId,
      language: language,
      reportFrequency: 'session'
    }, progress);

    if (sent) {
      toast.success(language === 'es' ? '📱 Reporte enviado a los padres' : '📱 Report sent to parents');
    }
  };

  useImperativeHandle(ref, () => ({
    triggerVoice: (text: string) => {
      // 🧱 HARD PAYWALL CHECK 🧱
      const currentPlan: 'free' | 'standard' | 'premium' = 'standard'; // TODO: Get from Context. If 'free', applying limits.
      // For Testing: Change to 'free' to test the wall.

      const usageKey = 'nova_lifetime_questions';
      let lifetimeCount = parseInt(localStorage.getItem(usageKey) || '0');
      const LIMIT = 5;

      if (currentPlan === 'free' && lifetimeCount >= LIMIT) {
        // PAYWALL TRIGGERED
        const msg = language === 'es'
          ? "¡Wow, eres muy curioso! 🌟 Se me acabó la energía de prueba. Pide a tus papás que activen tu cuenta para seguir aprendiendo juntos."
          : "Wow, you are so curious! 🌟 My trial energy ran out. Ask your parents to activate your account to keep learning together.";
        playExplanation(msg);
        toast.error("🔒 Trial Limit Reached");
        return; // STOP INTERACTION
      }

      // Increment Usage (Only counts meaningful interactions)
      localStorage.setItem(usageKey, (lifetimeCount + 1).toString());


      // IF WAITING FOR ANSWER (Socratic Mode)
      if (status === 'active' && solverSteps.length > 0) {
        const currentStep = solverSteps[currentStepIndex];

        if (currentStep.type === 'question' && currentStep.expectedAnswer !== undefined) {
          // Extract number from answer
          const nums = text.match(/\d+/g);
          // Also check for "zero/cero" words if expected is 0
          const hasZeroWord = text.toLowerCase().includes('cero') || text.toLowerCase().includes('zero') || text.toLowerCase().includes('no');

          let value = nums ? parseInt(nums[0]) : null;
          if (value === null && hasZeroWord && currentStep.expectedAnswer === 0) value = 0;

          // Check for Keywords (String Match)
          if (currentStep.expectedKeywords && currentStep.expectedKeywords.length > 0) {
            const lowerText = text.toLowerCase();
            const hasKeyword = currentStep.expectedKeywords.some(k => lowerText.includes(k.toLowerCase()));

            if (hasKeyword) {
              // CORRECT Keyword
              setIncorrectAttempts(0);
              playExplanation(language === 'es' ? "¡Correcto!" : "Correct!");
              sfx.playSuccess();
              setAvatarState('celebrating');
              setTimeout(() => setAvatarState('idle'), 2000);
              handleNextStep();
              return;
            } else {
              // Fallthrough to standard logic or mark incorrect if answer is also missing
              if (currentStep.expectedAnswer === undefined) {
                // Only keywords expected
                sfx.playError();
                const newAttempts = incorrectAttempts + 1;
                setIncorrectAttempts(newAttempts);
                const hints = currentStep.failureHints?.[language === 'es' ? 'es' : 'en'] || [];
                const hintIndex = Math.min(newAttempts - 1, hints.length - 1);
                const hint = hints[hintIndex] || (language === 'es' ? "Intenta de nuevo." : "Try again.");
                playExplanation(hint);
                return;
              }
            }
          }

          if (value !== null) {
            if (value === currentStep.expectedAnswer) {
              // CORRECT - Reset incorrect attempts & Track progress
              setIncorrectAttempts(0);
              setTotalQuestionsAttempted(prev => prev + 1);
              setTotalQuestionsCorrect(prev => prev + 1);

              playExplanation(language === 'es' ? "¡Correcto!" : "Correct!");
              toast.success("Correct Answer!");

              // WOW Effect: Confetti & Celebration & Sound
              sfx.playSuccess();
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
              setAvatarState('celebrating');
              setTimeout(() => setAvatarState('idle'), 3000); // Celebrate for 3s

              addCoins(10, language === 'es' ? '¡Respuesta correcta!' : 'Correct Answer!');
              addXP(20);
              handleNextStep(); // Auto-advance
              return;
            } else {
              // INCORRECT - Track attempts
              sfx.playError();
              const newAttempts = incorrectAttempts + 1;
              setIncorrectAttempts(newAttempts);

              const hints = currentStep.failureHints?.[language === 'es' ? 'es' : 'en'] || [];
              const hintIndex = Math.min(newAttempts - 1, hints.length - 1);
              let hint = hints[hintIndex] || (language === 'es' ? "Intenta de nuevo." : "Try again.");

              // INTELLIGENT DIAGNOSIS
              if (problemData && currentStep.expectedAnswer !== undefined) {
                const diagnostic = diagnoseMathError(
                  currentStep.expectedAnswer,
                  value,
                  problemData.type as any,
                  problemData.n1,
                  problemData.n2,
                  language === 'es' ? 'es' : 'en'
                );
                if (diagnostic) hint = diagnostic;
              }

              playExplanation(language === 'es' ? `No es ${value}. ${hint}` : `It's not ${value}. ${hint}`);

              // Check if remediation is needed
              if (needsRemediation(newAttempts) && detectedType) {
                const remediationTopics = getRemediationTopics(grade, detectedType);
                if (remediationTopics.length > 0) {
                  setRemediationMode(true);
                  setTimeout(() => {
                    const suggestion = language === 'es'
                      ? `Veo que necesitas práctica. Te sugiero repasar: ${remediationTopics.join(', ')}.`
                      : `I see you need practice. I suggest reviewing: ${remediationTopics.join(', ')}.`;
                    playExplanation(suggestion);
                    toast.info(language === 'es' ? "Modo de refuerzo activado" : "Remediation mode activated");
                  }, 2000);
                }
              }

              return;
            }
          }
        }
      }

      const type = detectProblemType(text);
      console.log('🧠 Detected:', type);

      // CHECK GRADE-LEVEL APPROPRIATENESS
      if (type !== 'general' && !remediationMode) {
        const isAppropriate = isTopicAppropriateForGrade(type, grade);

        if (!isAppropriate) {
          const message = language === 'es'
            ? `${type} es un tema para grados más avanzados. ¿Quieres intentar algo de tu nivel?`
            : `${type} is a topic for higher grades. Would you like to try something at your level?`;
          playExplanation(message);
          toast.warning(language === 'es' ? "Tema avanzado" : "Advanced topic");
          return;
        }
      }

      // EXTRACT NUMBERS
      const numbers = text.match(/\d+/g)?.map(Number);
      const hasNumbers = numbers && numbers.length >= 2;

      let response = '';

      // Simple Logic: Acknowledge the topic
      if (type === 'general') {
        if (['hola', 'hi'].some(w => text.toLowerCase().includes(w))) {
          // Age-appropriate greetings
          if (grade <= 2) {
            // 1st-2nd Grade: Very playful and affectionate
            const topicMention = weekTopic ? (language === 'es'
              ? ` Veo que esta semana deberías estar viendo ${weekTopic.topic_name}. ¿Es así?`
              : ` I see this week you should be learning ${weekTopic.topic_name}. Is that right?`) : '';
            response = language === 'es'
              ? `¡Hola mi pequeño genio ${getName()}! 🌟 ¡Qué alegría verte hoy!${topicMention} Vamos a jugar y aprender cosas mágicas.`
              : `Hello my little genius ${getName()}! 🌟 So happy to see you today!${topicMention} Let's play and learn magical things.`;
          } else if (grade <= 4) {
            // 3rd-4th Grade: Encouraging and team-oriented
            const topicMention = weekTopic ? (language === 'es'
              ? ` Según tu plan escolar, esta semana toca ${weekTopic.topic_name}. ¿Vamos con eso o prefieres otra cosa?`
              : ` According to your school plan, this week is ${weekTopic.topic_name}. Shall we work on that or something else?`) : '';
            response = language === 'es'
              ? `¡Hola campeón/a ${getName()}! 🚀 ¡Listo para una nueva misión!${topicMention}`
              : `Hello champion ${getName()}! 🚀 Ready for a new mission!${topicMention}`;
          } else {
            // 5th-6th Grade: Respectful but friendly (Partner)
            const topicMention = weekTopic ? (language === 'es'
              ? ` Vi que esta semana deberías estar en ${weekTopic.topic_name}. ¿Confirmado?`
              : ` I saw this week you should be on ${weekTopic.topic_name}. Confirmed?`) : '';
            response = language === 'es'
              ? `¡Hola ${getName()}! 👋 Un gusto verte.${topicMention} ¿Con qué empezamos?`
              : `Hi ${getName()}! 👋 Great to see you.${topicMention} Where shall we start?`;
          }
        } else {
          // MATH SHIELD: Async check for off-topic content
          setAvatarState('thinking');
          // MATH SHIELD: Async check for off-topic content
          setAvatarState('thinking');
          verifyMathTopic(text, language, studentPrefs?.learning_interests).then(shield => {
            if (shield.is_math) {
              const fallback = language === 'es'
                ? "¡Aquí estoy contigo! Dime los números y la operación, y lo resolveremos juntos."
                : "I'm right here with you! Tell me the numbers and the operation, and we'll solve it together.";
              playExplanation(fallback);
            } else {
              // Polite Deflection
              const deflection = shield.message || (language === 'es' ? "Mejor hablemos de matemáticas." : "Let's stick to math.");
              playExplanation(deflection);
              toast.info("Nova: 🛡️ " + deflection);
            }
          });
          return; // Prevent default flow
        }
        setStatus('idle');
        setDetectedType(null);
      } else {
        const topics: Record<string, string> = {
          division: language === 'es' ? 'División' : 'Division',
          multiplication: language === 'es' ? 'Multiplicación' : 'Multiplication',
          addition: language === 'es' ? 'Suma' : 'Addition',
          subtraction: language === 'es' ? 'Resta' : 'Subtraction',
          geometry: language === 'es' ? 'Geometría' : 'Geometry',
          fractions: language === 'es' ? 'Fracciones' : 'Fractions',
          fraction_addition: language === 'es' ? 'Suma de Fracciones' : 'Fraction Addition',
          word_problem: language === 'es' ? 'Problema Escrito' : 'Word Problem',
        };

        const topicName = topics[type] || type;

        // STEP 2 & 3: Handle Numbers
        if (hasNumbers && whiteboardRef?.current) {
          const n1 = numbers[0];
          const n2 = numbers[1];
          const style = (curriculum === 'ib-pyp' || curriculum === 'common-core') ? 'ib' : 'colombia';

          // Clear board to prepare for the specific problem visualization
          whiteboardRef.current.clear();
          setDetectedType(type as any);
          setStatus('active');
          setProblemData({ n1, n2, type: type as any });

          // 1. Draw Structure
          setTimeout(() => {
            if (type === 'division') {
              whiteboardRef.current?.drawDivision(n1, n2, style);
            } else if (type === 'multiplication') {
              whiteboardRef.current?.drawMultiplication(n1, n2);
            } else if (type === 'addition') {
              if (grade <= 2) {
                // Number Bond: Part + Part = Whole (?)
                whiteboardRef.current?.drawNumberBond(null, n1, n2);
              } else {
                whiteboardRef.current?.drawAddition(n1, n2);
              }
            } else if (type === 'subtraction') {
              if (grade <= 2) {
                // Number Bond: Whole - Part = Part (?)
                whiteboardRef.current?.drawNumberBond(n1, n2, null);
              } else {
                whiteboardRef.current?.drawSubtraction(n1, n2);
              }
            } else if (type === 'fractions') {
              // n1=numerator, n2=denominator. drawBarModel(total, selected)
              whiteboardRef.current?.drawBarModel(parseInt(String(n2)), parseInt(String(n1)), 'Modelo de Barra');
            } else if (type === 'word_problem' as any) {
              whiteboardRef.current?.addText(language === 'es' ? "Detectando datos..." : "Detecting data...");
            } else {
              // Fallback for others: Write text
              whiteboardRef.current?.addText(text);
            }
          }, 500);

          // 2. Generate Solver Steps
          let steps: MathStep[] = [];
          if (type === 'division') {
            steps = MathSolver.solveDivision(n1, n2, style);
          } else if (type === 'multiplication') {
            steps = MathSolver.solveMultiplication(n1, n2, 'standard');
          } else if (type === 'addition') {
            steps = MathSolver.solveAddition(n1, n2);
          } else if (type === 'subtraction') {
            steps = MathSolver.solveSubtraction(n1, n2);
          } else if (type === 'word_problem' as any) {
            // ASYNC SEMANTIC EXTRACTION WITH PERSONALIZATION
            extractProblemData(text, language, studentPrefs?.learning_interests, studentPrefs?.favorite_animals).then((data) => {
              if (data) {
                const contextSteps: MathStep[] = [
                  { id: 201, type: 'explanation', text: { es: `El problema trata sobre ${data.subject || 'alguien'} y ${data.object || 'cosas'}.`, en: `The problem is about ${data.subject || 'someone'} and ${data.object || 'things'}.` } } as any,
                  { id: 202, type: 'explanation', text: { es: `Para resolverlo, haremos una ${data.type}.`, en: `To solve it, we will do a ${data.type}.` } } as any
                ];

                // Add personalization step if metaphor exists
                if (data.personalized_metaphor) {
                  contextSteps.unshift({
                    id: 200,
                    type: 'explanation',
                    text: { es: data.personalized_metaphor, en: data.personalized_metaphor }
                  } as any);
                }

                setSolverSteps(contextSteps);
                setCurrentStepIndex(0);

                // Trigger rich visual update
                if (whiteboardRef.current) {
                  whiteboardRef.current.clear();
                  const num1 = data.numbers?.[0] || 0;
                  const num2 = data.numbers?.[1] || 10;
                  whiteboardRef.current.drawBarModel(Math.max(num1, num2), Math.min(num1, num2), data.object || 'Datos');
                }

                // Speak the result (starting with metaphor)
                playExplanation(data.personalized_metaphor || (language === 'es'
                  ? `¡Ah! Es una historia sobre ${data.object || 'algo'}. Vamos a organizarlo en la pizarra.`
                  : `Ah! It's a story about ${data.object || 'something'}. Let's organize it on the board.`));
              }
            });

            steps = [
              { id: 100, type: 'explanation', text: { es: `Analizando el problema...`, en: `Analyzing the problem...` } } as any,
              { id: 101, type: 'explanation', text: { es: `Un momento...`, en: `One moment...` } } as any
            ];
          } else {
            // Generic Socratic Flow for Unsupported Types
            steps = [
              {
                id: 901,
                type: 'explanation',
                text: {
                  es: `Veo que quieres practicar ${topicName}. Usemos el método socrático.`,
                  en: `I see you want to practice ${topicName}. Let's use the Socratic method.`
                }
              } as any,
              {
                id: 902,
                type: 'question',
                text: {
                  es: `Primero, para asegurarnos de que estamos en la misma página, ¿qué operación crees que debemos usar aquí? (Suma, Resta, División, etc.)`,
                  en: `First, to make sure we are on the same page, what operation do you think we should use here? (Addition, Subtraction, Division, etc.)`
                },
                expectedKeywords: [topicName, type, 'sum', 'rest', 'div', 'mul', 'add', 'sub'], // Broad match
                failureHints: {
                  es: [`Piensa en lo que identificamos: ${topicName}.`, `¿Es una ${topicName}?`],
                  en: [`Think about what we identified: ${topicName}.`, `Is it ${topicName}?`]
                }
              } as any,
              {
                id: 903,
                type: 'explanation',
                text: {
                  es: `¡Exacto! Es una operación de ${topicName}. Ahora miremos los datos.`,
                  en: `Exactly! It is a ${topicName} operation. Now let's look at the data.`
                }
              } as any,
              {
                id: 9035, // Intermediate step for visualization
                type: 'action',
                text: {
                  es: "Déjame dibujar algo para que lo visualicemos mejor...",
                  en: "Let me draw something so we can visualize it better..."
                },
                boardDraw: { type: 'highlight', value: 0 } // Triggers a visual update
              } as any,
              {
                id: 904,
                type: 'question',
                expectedAnswer: n1,
                text: {
                  es: `Tenemos el número ${n1}. ¿Cuál es el segundo número con el que vamos a trabajar?`,
                  en: `We have the number ${n1}. What is the second number we are going to work with?`
                },
                failureHints: { es: [`Busca el otro número en tu texto.`, `Es ${n2}.`], en: [`Look for the other number in your text.`, `It's ${n2}.`] }
              } as any,
              {
                id: 905,
                type: 'explanation',
                text: {
                  es: `Muy bien. Tenemos ${n1} y ${n2}.`,
                  en: `Very good. We have ${n1} and ${n2}.`
                }
              } as any,
              {
                id: 906,
                type: 'question',
                text: {
                  es: `Ahora, si aplicamos la ${topicName}, ¿cuál crees que será el resultado? Intenta calcularlo.`,
                  en: `Now, if we apply ${topicName}, what do you think the result will be? Try to calculate it.`
                },
                expectedAnswer: 0, // Placeholder
                // We relax the check here or we let the user say anything
                failureHints: { es: ["Tómate tu tiempo.", "Usa papel si necesitas."], en: ["Take your time.", "Use paper if you need."] }
              } as any
            ];
          }

          setSolverSteps(steps);
          setCurrentStepIndex(0);

          // 3. Announce Start & First Step Immediately
          // Construct proper reading of the problem
          let problemRead = `${n1} ${language === 'es' ? 'entre' : 'divided by'} ${n2}`;

          if ((type as string).includes('fraction')) {
            // Use the fraction processor we wrote earlier? 
            // We can re-use it if we extract it, or just do a simple replacement here on the specific found numbers if convenient, 
            // but processedText already handled it!
            // The issue is `intro` overwrote it with hardcoded 'entre'.
            // Let's use `processedText` but it might be too long.
            // Let's rely on our knowledge of n1, n2 to say it right.
            // Actually, `processedText` contains the full text converted.
            // If the user typed "3/5", processedText is "tres quintos".
            // We should just use that!
            problemRead = text; // Use the raw text for fractions for now, assuming it's well-formed
          } else if (type === 'word_problem' as any) {
            problemRead = language === 'es' ? 'un problema de análisis' : 'an analysis problem';
          } else if (type === 'division') {
            problemRead = `${n1} ${language === 'es' ? 'entre' : 'divided by'} ${n2}`;
          } else if (type === 'multiplication') {
            problemRead = `${n1} ${language === 'es' ? 'por' : 'times'} ${n2}`;
          } else if (type === 'addition') {
            problemRead = `${n1} ${language === 'es' ? 'más' : 'plus'} ${n2}`;
          } else if (type === 'subtraction') {
            problemRead = `${n1} ${language === 'es' ? 'menos' : 'minus'} ${n2}`;
          }

          const intro = language === 'es'
            ? `Perfecto. ${problemRead}. Empecemos.`
            : `Perfect. ${problemRead}. Let's start.`;

          const firstStepText = steps.length > 0 ? steps[0].text[language === 'es' ? 'es' : 'en'] : '';

          // Combine intro and first step to avoid silence gap
          response = `${intro} ${firstStepText}`;

        } else {
          response = language === 'es'
            ? `Entendido, ${topicName}. ¿Cuáles son los números?`
            : `Got it, ${topicName}. What are the numbers?`;
        }
      }

      // Check for Nano Banana - Proactive or Manual
      const isVisualTopic = ['fractions', 'geometry', 'division', 'word_problem'].includes(detectedType || '');
      const isManualRequest = text.toLowerCase().includes('nano') || text.toLowerCase().includes('banana') || text.toLowerCase().includes('imag') || text.toLowerCase().includes('foto');

      if ((isVisualTopic && hasNumbers) || isManualRequest) {
        // Trigger seamlessly without stopping flow
        setTimeout(() => handleNanoBananaGen(text, detectedType || 'math', isManualRequest), 1000);

        // If it was manual, return to avoid double speech (we'll handle it in gen), otherwise let normal flow continue
        if (isManualRequest) return;
      }

      playExplanation(response);
    }
  }));

  const handleNanoBananaGen = async (prompt: string, context: string, isManual: boolean) => {
    setAvatarState('thinking');
    if (isManual) {
      toast.info(language === 'es' ? "🍌 Generando visualización..." : "🍌 Generating visualization...");
      playExplanation(language === 'es' ? "Claro, déjame crear una imagen para esto." : "Sure, let me create an image for this.");
    }

    // Simulate generation delay - Async so it pops up while tutor might be explaining steps
    setTimeout(() => {
      // Trigger the image upload to whiteboard (simulated)
      if (whiteboardRef?.current) {
        // Use a placeholder or reliable math image based on context
        let imgUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600"; // General Math

        if (context === 'fractions' || prompt.includes('fracc')) imgUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600"; // Pizza
        if (prompt.includes('manzana')) imgUrl = "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600";
        if (context === 'geometry') imgUrl = "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600"; // Geometry shapes
        if (context === 'division') imgUrl = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=600"; // Sharing/Division concept

        whiteboardRef.current.drawImage(imgUrl);
        toast.success(language === 'es' ? "🍌 Nano Banana: ¡Ayuda visual lista!" : "🍌 Nano Banana: Visual aid ready!");

        // If it was a proactive auto-generation, maybe explicitly mention it if not speaking?
        // But better to just let it appear as a magic helper.
      }
      setAvatarState('idle');
    }, 3000);
  };

  // Helper to handle Next Step
  const handleNextStep = () => {
    if (currentStepIndex < solverSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const step = solverSteps[nextIndex];

      playExplanation(step.text[language === 'es' ? 'es' : 'en']);

      // Visualize Action
      if (step.type === 'action' && step.boardDraw && whiteboardRef?.current) {
        const { type, value, index } = step.boardDraw;

        if (type === 'writeQuotient' && value !== undefined) {
          whiteboardRef.current.writeQuotient(value, index || 0);
          toast.success(language === 'es' ? "¡Cociente anotado!" : "Quotient noted!");
        } else if (type === 'writeProduct' && value !== undefined) {
          whiteboardRef.current.writeProduct(value);
          toast.success(language === 'es' ? "¡Producto anotado!" : "Product noted!");
        } else if (type === 'writeRemainder' && value !== undefined) {
          whiteboardRef.current.writeRemainder(value);
          toast.success(language === 'es' ? "¡Residuo anotado!" : "Remainder noted!");
        } else if (type === 'highlight' && value !== undefined) {
          // Example mapping: 0 = highlight question, 1 = highlight number 1, etc.
          // For now, simpler: highlight a generic center region or pass explicit coords if we update solver
          whiteboardRef.current.highlightRegion(100, 100, 200, 100);
          toast.info(language === 'es' ? "👀 ¡Mira aquí!" : "👀 Look here!");
        } else if (type === 'writeAnswer' && value !== undefined) {
          whiteboardRef.current.writeAnswer(value);
          toast.success(language === 'es' ? "¡Respuesta anotada!" : "Answer noted!");
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

      <div className="p-4 flex items-center justify-between bg-white/80 border-b border-slate-100">
        <div className="flex items-center gap-3">

          <div
            className="relative -mt-2 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleAvatarClick}
          > {/* Negative margin to let avatar pop out */}
            <LinaAvatar state={avatarState} size={80} />
          </div>
          <span className="font-fredoka font-bold text-slate-700 text-lg flex items-center gap-2">
            {language === 'es' ? 'Nova Tutor (v9.0 - WhatsApp)' : "Nova Tutor (v9.0 - WhatsApp)"}
          </span>
        </div>

        {detectedType && (
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-200">
            {detectedType}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* IDLE STATE */}
        {!detectedType && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-2 shadow-lg">
              <span className="text-4xl">👋</span>
            </div>
            <div className="space-y-2">
              <p className="text-slate-700 font-bold text-lg">
                {language === 'es'
                  ? `¡Hola ${getFirstName(userName) || 'Campeón'}!`
                  : `Hi ${getFirstName(userName) || 'Champion'}!`}
              </p>
              <p className="text-slate-500 font-medium text-sm">
                {language === 'es' ? 'Dime qué operación quieres practicar.' : "Tell me what operation you want to practice."}
              </p>
            </div>

            {/* Inspirational Quote Card */}
            {dailyQuote && (
              <div className="relative max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-lg">✨</span>
                  </div>
                  <div className="text-sm text-slate-600 italic leading-relaxed mb-3">
                    "{dailyQuote.text}"
                  </div>
                  {dailyQuote.author && (
                    <div className="text-xs text-indigo-600 font-bold text-right">
                      - {dailyQuote.author}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-400 mt-4">
              {language === 'es'
                ? '💡 Haz clic en mi avatar para comenzar'
                : '💡 Click on my avatar to start'}
            </div>
          </div>
        )}

        {/* ACTIVE SOLVER STATE */}
        {status === 'active' && solverSteps.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Current Step Display */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">
                {language === 'es' ? `PASO ${currentStepIndex + 1}` : `STEP ${currentStepIndex + 1}`}
              </h4>
              <p className="text-slate-700 text-lg font-medium leading-relaxed">
                {solverSteps[currentStepIndex].text[language === 'es' ? 'es' : 'en']}
              </p>
            </div>

            {/* VISUAL ANSWER PROMPT */}
            {solverSteps[currentStepIndex].type === 'question' && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-sm text-blue-600 font-bold mb-2 animate-bounce">
                  {language === 'es' ? '🎙️ ¡Dímelo o Escríbelo!' : '🎙️ Say it or Type it!'}
                </p>
              </div>
            )}

            {/* Next Navigation (If Explanation) */}
            {solverSteps[currentStepIndex].type !== 'question' && (
              <Button onClick={handleNextStep} className="w-full h-12 rounded-xl text-lg font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-lg">
                {language === 'es' ? 'Siguiente' : 'Next'} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Decorative Input Area Placeholder (Actual input is external) */}
      <div className="p-4 bg-white/30 border-t border-slate-100/50"></div>

      {/* Audio Test Button - Troubleshooting */}
      <div className="absolute top-2 right-2 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={testAudio}
          className="text-[10px] bg-white/50 backdrop-blur text-stone-400 hover:text-indigo-600 border border-stone-200"
        >
          🔊 Test Audio
        </Button>
      </div>
    </div>
  );
});
