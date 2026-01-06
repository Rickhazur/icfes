import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Calculator, PlayCircle, Timer, PenTool, Trash2, Volume2, Mic2, Waves, Sparkles, Loader2, MousePointer2
} from 'lucide-react';
import { Subject, ClassSession, Language } from '../types';
import { OpenAITutorSession } from '../services/openai';
import { generateSpeech } from '../services/elevenlabs';

// --- HELPERS ---
function sanitizeSvgCode(rawSvg: string): string {
  if (!rawSvg) return '';
  let cleaned = rawSvg.replace(/```(svg|xml)?/gi, '').replace(/```/g, '').trim();
  const svgMatch = cleaned.match(/<svg[\s\S]*<\/svg>/i);

  if (!svgMatch) return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><text x="400" y="300" text-anchor="middle" font-size="20" fill="#94a3b8">Generando ejercicio...</text></svg>`;

  let final = svgMatch[0];

  // Cleanup dims
  final = final.replace(/width="[^"]*"/gi, '');
  final = final.replace(/height="[^"]*"/gi, '');

  if (!final.includes('viewBox')) {
    final = final.replace('<svg', '<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet"');
  } else {
    final = final.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
  }

  if (!final.includes('stroke')) {
    final = final.replace(/<path|<line|<circle|<rect/g, (m) => `${m} stroke="#1e293b" stroke-width="2" fill="none"`);
  }

  return final;
}

interface LiveClassroomProps {
  session: ClassSession;
  studentName: string;
  onExit: () => void;
  language: Language;
}

const LiveClassroom: React.FC<LiveClassroomProps & { subjectId?: string }> = ({ session, studentName, onExit, language, subjectId }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [board, setBoard] = useState({ title: 'Pizarra Nova', svg: '' });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [color, setColor] = useState('#2563eb');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const sessionRef = useRef<OpenAITutorSession | null>(null);
  const recognitionRef = useRef<any>(null);

  // Resize Canvas
  const resize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    canvasRef.current.width = containerRef.current.clientWidth;
    canvasRef.current.height = containerRef.current.clientHeight;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize, status]);

  // Timer
  useEffect(() => {
    if (status === 'connected') {
      const int = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
      return () => clearInterval(int);
    }
  }, [status]);

  // Audio & Speech Logic
  const playAudio = async (text: string) => {
    try {
      setIsSpeaking(true);
      const audioBuffer = await generateSpeech(text);
      if (!audioBuffer) return;

      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        startListening(); // Auto-listen after speaking
      };

      await audio.play();
    } catch (e) {
      console.error("Audio Playback Error:", e);
      setIsSpeaking(false);
      startListening();
    }
  };

  const startListening = () => {
    // Small delay to ensure audio is fully clear
    setTimeout(() => {
      if (!recognitionRef.current) return;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Already started or error - ignore
        console.log("Listening already active or failed", e);
      }
    }, 500);
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const initSession = async () => {
    setStatus('connecting');
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || (process as any).env?.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      alert("Falta la API Key de OpenAI");
      setStatus('idle');
      return;
    }

    // Init Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'en' ? 'en-US' : 'es-ES';
      // We want continuous results? No, turn-based.
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        console.log("🎤 User said:", text);
        setIsListening(false);
        if (text.trim()) {
          sessionRef.current?.sendMessage(text);
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        // Do nothing on end, wait for manual or system trigger
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
    }

    // SYSTEM PROMPT SELECTION
    let sysPrompt = '';

    if (subjectId === 'language') {
      sysPrompt = `Role: You are an expert Language Arts Tutor and Writing Coach for elementary students.
        Goal: Transform the student's writing to be more engaging, structured, and grammatically correct.
        Student: ${studentName}. Topic: ${session.topic}.
        Language: ${language === 'en' ? 'English' : 'Spanish'}.

        Instructions:
        1.  **Transform:** When the student sends text, reformulate it to show a "Better Version".
        2.  **Structure & Hooks:** Show improvements in structure (intro, middle, end) and tricks to hook the reader (questions, exciting adjectives).
        3.  **Tone:** Encouraging, constructive, and fun.
        4.  **Feedback:** Explain *why* the change makes it better.

        Example:
        Student: "The dog ran."
        Nova: "Good! Let's make it exciting: 'The dog sprinted like a rocket!' 🚀. Trick: Use strong verbs!"`;
    } else {
      // Default to Math/Science (Socratic)
      sysPrompt = `Role: You are Nova, an expert Math/Science Tutor for elementary students (Grades 1-5).
        Goal: Help students understand concepts deeply, not just get the answer.
        Student: ${studentName}. Topic: ${session.topic}.
        Language: ${language === 'en' ? 'English' : 'Spanish'}.

        Methodology:
        1.  **Socratic Method:** NEVER give the answer immediately. Ask guiding questions.
        2.  **Visual Diagrams:** ALWAYS use 'updateWhiteboard' to create a visual representation.
        3.  **Real-World Context:** Connect to real-world scenarios (candy, space, toys).
        4.  **Error Handling:** Identify specific error types and explain the logic fix.

        Tone: Encouraging, patient, and fun. Use emojis.`;
    }

    const aiSession = new OpenAITutorSession(apiKey, sysPrompt);

    aiSession.onMessage = (event) => {
      if (event.type === 'text' && event.text) {
        playAudio(event.text);
      } else if (event.type === 'function_call' && event.function?.name === 'updateWhiteboard') {
        const args = event.function.args;
        setBoard({ title: args.topic, svg: sanitizeSvgCode(args.svg_code) });
      }
    };

    sessionRef.current = aiSession;
    await aiSession.connect();
    setStatus('connected');
  };

  // Drawing
  const draw = (e: any) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = { x, y };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-[3rem] shadow-comic-lg border-4 border-black overflow-hidden relative font-sans">

      {/* HUD Superior */}
      <div className="p-4 bg-kid-navy text-white flex justify-between items-center shrink-0 z-40 border-b-4 border-black">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-kid-yellow rounded-2xl flex items-center justify-center font-black shadow-comic text-xl text-black border-2 border-black">N</div>
          <div>
            <h2 className="font-black text-lg tracking-tight text-white">{session.title}</h2>
            <p className="text-[11px] text-kid-blue font-black uppercase tracking-[0.2em] bg-white/10 px-2 rounded-md inline-block">{session.topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${isSpeaking ? 'bg-kid-green border-black shadow-comic text-black' : 'bg-white/10 border-white/20 opacity-50'}`}>
            {isSpeaking ? <Waves className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
            <span className="text-xs font-black uppercase tracking-widest">
              {isSpeaking ? 'Hablando' : 'Silencio'}
            </span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${isListening ? 'bg-kid-pink border-black shadow-comic text-white' : 'bg-white/10 border-white/20 opacity-50'}`}>
            <Mic2 className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-black uppercase tracking-widest">
              {isListening ? 'Te Escucho' : 'Mic Off'}
            </span>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl text-sm font-black text-black border-2 border-black shadow-comic flex items-center gap-2">
            <Timer className="w-4 h-4 text-kid-purple" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-white">
        {status !== 'connected' ? (
          <div className="text-center space-y-12 animate-fade-in z-20 p-8">
            <div className="relative">
              <div className="w-36 h-36 bg-indigo-50 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl border border-indigo-100">
                <Sparkles className={`w-16 h-16 ${status === 'connecting' ? 'text-indigo-500 animate-spin' : 'text-indigo-600'}`} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-stone-800 tracking-tighter uppercase">Aula de Nivelación</h3>
              <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Powered by ElevenLabs & OpenAI GPT-4o</p>
            </div>
            <button
              onClick={initSession}
              disabled={status === 'connecting'}
              className="px-20 py-6 rounded-[2.5rem] text-white font-black text-2xl bg-indigo-600 shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-4 mx-auto"
            >
              {status === 'connecting' ? 'CONECTANDO...' : 'INICIAR TUTORÍA'}
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col p-6 animate-fade-in gap-6 bg-stone-50">

            {/* Controles Pizarra */}
            <div className="flex justify-between items-center bg-white/95 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-stone-200 shadow-2xl z-20 mx-auto w-full max-w-4xl">
              <div className="flex items-center gap-6 px-4">
                <div className="flex gap-3">
                  {['#2563eb', '#dc2626', '#16a34a', '#0f172a'].map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`w-11 h-11 rounded-2xl transition-all ${color === c ? 'ring-4 ring-indigo-100 scale-110 shadow-lg border-2 border-white' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="w-px h-10 bg-stone-200"></div>
                <button onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 9999, 9999)} className="p-4 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                  <Trash2 className="w-7 h-7" />
                </button>
              </div>

              {/* Botón Manual de Micrófono */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-lg flex items-center gap-2 ${isListening ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}
              >
                {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic2 className="w-4 h-4" />}
                {isListening ? 'Escuchando...' : 'Hablar'}
              </button>

              <div className="flex items-center gap-4 pr-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Ejercicio</p>
                  <h4 className="text-sm font-bold text-stone-800">{board.title}</h4>
                </div>
              </div>
            </div>

            {/* ÁREA DE PIZARRA RESPONSIVA */}
            <div ref={containerRef} className="flex-1 bg-white rounded-[4rem] border-[16px] border-stone-200 relative overflow-hidden shadow-2xl ring-1 ring-stone-300">
              <div
                dangerouslySetInnerHTML={{ __html: board.svg }}
                className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-12"
                style={{ zIndex: 1 }}
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-10 cursor-crosshair touch-none"
                onMouseDown={e => { isDrawing.current = true; const r = canvasRef.current!.getBoundingClientRect(); lastPos.current = { x: e.clientX - r.left, y: e.clientY - r.top }; }}
                onMouseMove={draw}
                onMouseUp={() => isDrawing.current = false}
                onTouchStart={e => { isDrawing.current = true; const r = canvasRef.current!.getBoundingClientRect(); lastPos.current = { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }; }}
                onTouchMove={draw}
                onTouchEnd={() => isDrawing.current = false}
              />
            </div>

            <button onClick={onExit} className="self-center px-24 py-6 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[2.5rem] shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-sm z-20">Finalizar Sesión</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DATA ---
const tutoringCurriculumData: Subject[] = [
  {
    id: 'math',
    name: 'Aventuras Matemáticas',
    icon: <Calculator className="w-6 h-6" />,
    description: 'Juegos de números y lógica divertida.',
    colorTheme: 'kid-blue',
    tracks: [{
      id: 'track-1',
      name: 'Explorador Numérico',
      overview: 'Misiones básicas.',
      modules: [{
        id: 1,
        name: 'Misión 1: Sumas y Restas',
        level: 'Primaria',
        focus: 'Operaciones básicas.',
        classes: [{ id: 101, title: 'El Tesoro Perdido', duration: '20 min', topic: 'Sumas Divertidas', blueprint: { hook: '', development: '', practice: '', closure: '', differentiation: '' }, isRemedial: false }]
      }]
    }]
  },
  {
    id: 'science',
    name: 'Exploradores de Ciencia',
    icon: <Waves className="w-6 h-6" />,
    description: 'Descubre los secretos del universo.',
    colorTheme: 'kid-green',
    tracks: [{
      id: 'track-2',
      name: 'Pequeños Científicos',
      overview: 'Experimentos caseros.',
      modules: [{
        id: 2,
        name: 'Misión 1: El Espacio',
        level: 'Primaria',
        focus: 'Planetas y Estrellas.',
        classes: [{ id: 201, title: 'Viaje a Marte', duration: '20 min', topic: 'Sistema Solar', blueprint: { hook: '', development: '', practice: '', closure: '', differentiation: '' }, isRemedial: false }]
      }]
    }]
  },
  {
    id: 'language',
    name: 'Aventuras de Lenguaje',
    icon: <PenTool className="w-6 h-6" />,
    description: 'Mejora tu escritura y lectura.',
    colorTheme: 'kid-pink',
    tracks: [{
      id: 'track-3',
      name: 'Pequeños Escritores',
      overview: 'Historias y Cuentos.',
      modules: [{
        id: 3,
        name: 'Misión 1: Historias Mágicas',
        level: 'Primaria',
        focus: 'Escritura Creativa.',
        classes: [{ id: 301, title: 'Mi Primer Cuento', duration: '20 min', topic: 'Escribiendo Historias', blueprint: { hook: '', development: '', practice: '', closure: '', differentiation: '' }, isRemedial: false }]
      }]
    }]
  }
];

interface CurriculumProps {
  userName: string;
  language: Language;
  remedialSubject?: Subject;
  userRole?: string;
  onLogInfraction?: (type: any, description: string) => void;
  onLogout?: () => void;
  guardianPhone?: string;
  uploadedHomework?: any[];
  userId?: string;
}

const Curriculum: React.FC<CurriculumProps> = ({ userName, language, remedialSubject, userRole, onLogInfraction, onLogout, guardianPhone, uploadedHomework, userId }) => {
  const [active, setActive] = useState<{ session: ClassSession, subjectId: string } | null>(null);
  const all = remedialSubject ? [remedialSubject, ...tutoringCurriculumData] : tutoringCurriculumData;

  if (active) return <LiveClassroom session={active.session} studentName={userName} onExit={() => setActive(null)} language={language} subjectId={active.subjectId} />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <h2 className="text-3xl font-black text-stone-800 tracking-tight">{language === 'en' ? 'Smart Tutoring' : 'Tutoría Inteligente'}</h2>
      <div className="grid grid-cols-1 gap-6">
        {all.map(sub => (
          <div key={sub.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-stone-50 flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">{sub.icon}</div>
              <div><h3 className="text-xl font-bold text-stone-800">{sub.name}</h3><p className="text-stone-500 text-sm">{sub.description}</p></div>
            </div>
            <div className="p-4 space-y-2">
              {sub.tracks[0].modules[0].classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <PlayCircle className="w-5 h-5 text-indigo-500" />
                    <div><p className="font-bold text-stone-700 text-sm">{cls.topic}</p><p className="text-[10px] text-stone-400">{cls.duration}</p></div>
                  </div>
                  <button onClick={() => setActive({ session: cls, subjectId: sub.id })} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-transform">Iniciar Clase</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Curriculum;
