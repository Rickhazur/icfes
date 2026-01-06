
import React from 'react';
import { ViewState, Language } from '../types';
import {
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  Palette,
  ArrowRight,
  Star,
  Trophy,
  Play,
  Search,
  Rocket,
  BookOpen,
  Bot
} from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from './Notifications/NotificationBell';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface DashboardProps {
  onNavigate?: (view: ViewState) => void;
  language: Language;
  userName?: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  tags: string[];
  level: string;
  viewState?: ViewState;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, language, userName }) => {
  const { coins, xp } = useGamification();

  const speakGreeting = () => {
    const greeting = language === 'es'
      ? `¡Hola ${userName}! Soy Nova, tu asistente de aprendizaje. ¿Qué misión vamos a conquistar hoy?`
      : `Hi ${userName}! I'm Nova, your learning assistant. Which mission are we conquering today?`;

    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);

    toast.success("Nova te saluda 🤖", {
      description: greeting,
      icon: <Rocket className="w-5 h-5 text-indigo-500" />
    });
  };

  const subjects: Subject[] = [
    {
      id: 'mission-control',
      name: language === 'es' ? 'Centro de Mando' : 'Mission Control',
      description: language === 'es'
        ? 'Tu base central para misiones y tareas escolares.'
        : 'Your central hub for school missions and tasks.',
      icon: <Rocket className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-indigo-900',
      bgGradient: 'from-indigo-600 to-violet-600',
      tags: ['Tareas', 'Misiones', 'Progreso'],
      level: language === 'es' ? 'Central' : 'Core',
      viewState: ViewState.TASK_CONTROL
    },
    {
      id: 'math',
      name: language === 'es' ? 'Matemáticas' : 'Mathematics',
      description: language === 'es'
        ? 'Números, formas, medidas y resolución de problemas divertidos'
        : 'Numbers, shapes, measures and fun problem solving',
      icon: <Calculator className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-elite-blue',
      bgGradient: 'from-blue-500 to-cyan-400',
      tags: ['Aritmética', 'Geometría', 'Lógica'],
      level: language === 'es' ? 'Primaria' : 'Primary',
      viewState: ViewState.MATH_TUTOR
    },
    {
      id: 'science',
      name: language === 'es' ? 'Ciencias Naturales' : 'Natural Sciences',
      description: language === 'es'
        ? 'Explora la naturaleza, los seres vivos, la materia y el universo'
        : 'Explore nature, living things, matter and the universe',
      icon: <FlaskConical className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-elite-green',
      bgGradient: 'from-emerald-500 to-teal-400',
      tags: ['Seres Vivos', 'Planeta Tierra', 'Energía'],
      level: language === 'es' ? 'Primaria' : 'Primary',
      viewState: ViewState.RESEARCH_CENTER
    },
    {
      id: 'humanities',
      name: language === 'es' ? 'Sociales y Comunidad' : 'Social Studies',
      description: language === 'es'
        ? 'Conoce nuestra historia, geografía y cómo vivimos en comunidad'
        : 'Learn about our history, geography and how we live together',
      icon: <Globe2 className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-elite-orange',
      bgGradient: 'from-orange-500 to-amber-400',
      tags: ['Historia', 'Geografía', 'Comunidad'],
      level: language === 'es' ? 'Primaria' : 'Primary',
      viewState: ViewState.RESEARCH_CENTER
    },
    {
      id: 'languages',
      name: language === 'es' ? 'Lenguaje y Comunicación' : 'Language & Communication',
      description: language === 'es'
        ? 'Lectura, escritura, cuentos mágicos y nuevos idiomas'
        : 'Reading, writing, magic stories and new languages',
      icon: <Languages className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-elite-purple',
      bgGradient: 'from-purple-500 to-pink-400',
      tags: ['Español', 'Inglés', 'Cuentos'],
      level: language === 'es' ? 'Primaria' : 'Primary',
      viewState: ViewState.BUDDY_LEARN
    },
    {
      id: 'arts',
      name: language === 'es' ? 'Artes y Creatividad' : 'Arts & Creativity',
      description: language === 'es'
        ? 'Pintura, música, expresión corporal y creatividad sin límites'
        : 'Painting, music, body expression and limitless creativity',
      icon: <Palette className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-elite-pink',
      bgGradient: 'from-pink-500 to-rose-400',
      tags: ['Dibujo', 'Música', 'Expresión'],
      level: language === 'es' ? 'Primaria' : 'Primary',
      viewState: ViewState.ARTS_TUTOR
    },
    {
      id: 'investigation',
      name: language === 'es' ? 'Laboratorio de Investigación' : 'Research Lab',
      description: language === 'es'
        ? 'Usa a Nova para investigar cualquier tema y crear reportes geniales'
        : 'Use Nova to research any topic and create amazing reports',
      icon: <Search className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-indigo-600',
      bgGradient: 'from-indigo-600 to-blue-500',
      tags: ['AI Researcher', 'Reportes', 'Citas'],
      level: language === 'es' ? 'Especial' : 'Special',
      viewState: ViewState.RESEARCH_CENTER
    },
    {
      id: 'google-classroom',
      name: language === 'es' ? 'Google Classroom Sync' : 'Google Classroom Sync',
      description: language === 'es'
        ? 'Sincroniza tus tareas escolares y conviértelas en misiones'
        : 'Sync your school tasks and convert them to missions',
      icon: <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />,
      color: 'bg-blue-600',
      bgGradient: 'from-blue-600 to-cyan-500',
      tags: ['Tareas', 'Sync', 'Misiones'],
      level: language === 'es' ? 'Especial' : 'Special',
      viewState: ViewState.GOOGLE_CLASSROOM
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 font-poppins animate-fade-in px-4 sm:px-6 lg:px-8">

      {/* Welcome Header with Nova Buddy */}
      <div className="mb-16 flex flex-col md:flex-row items-center md:items-center justify-between gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

        <div className="flex flex-col md:flex-row items-center gap-8 z-10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={speakGreeting}
            className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2rem] shadow-xl flex items-center justify-center relative group overflow-hidden"
          >
            <Rocket className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white animate-bounce" />
          </motion.button>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 font-fredoka tracking-tight text-wrap">
              {language === 'es' ? '¡Hola,' : 'Hello,'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                {userName || (language === 'es' ? 'Explorador' : 'Explorer')}!
              </span>
            </h1>
            <p className="text-xl text-slate-500 font-medium">
              {language === 'es'
                ? '¿Qué quieres descubrir hoy? Nova está listo para ayudarte.'
                : 'What do you want to discover today? Nova is ready to help.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10">
          <NotificationBell />
          <Button
            onClick={() => onNavigate?.(ViewState.TASK_CONTROL)}
            className="hidden md:flex bg-slate-900 hover:bg-indigo-600 text-white font-black px-6 py-6 rounded-2xl shadow-lg transition-all"
          >
            {language === 'es' ? 'VER MISIÓN' : 'VIEW MISSION'}
          </Button>
        </div>
      </div>

      {/* Stats / Motivation Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-600 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Racha</p>
            <p className="text-xl font-bold text-slate-800">5 Días</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 shadow-inner">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Puntos XP</p>
            <p className="text-xl font-bold text-slate-800">{xp}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-600 shadow-inner">
            <span className="text-2xl filter drop-shadow-sm">🪙</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monedas</p>
            <p className="text-xl font-bold text-slate-800">{coins}</p>
          </div>
        </div>
        {/* Placeholder for 4th stat or decorative */}
        <div className="hidden md:flex bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-5 shadow-lg shadow-indigo-200 text-white items-center justify-between">
          <div>
            <p className="text-xs font-medium text-indigo-100 mb-1">Nivel Actual</p>
            <p className="text-lg font-bold">Explorador Novato</p>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Rocket className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <h2 className="text-2xl font-bold text-slate-800 mb-8 pl-2 border-l-4 border-indigo-500">
        {language === 'es' ? 'Tus Módulos de Aprendizaje' : 'Your Learning Modules'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full"
          >
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${subject.bgGradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

            {/* Top decorative line */}
            <div className={`h-2 w-full bg-gradient-to-r ${subject.bgGradient} opacity-80`} />

            <div className="p-8 flex flex-col flex-1 relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${subject.bgGradient} flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {React.cloneElement(subject.icon as React.ReactElement, { className: "w-10 h-10 text-white drop-shadow-md" })}
                </div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                  {subject.level}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                {subject.name}
              </h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                {subject.description}
              </p>

              {/* Divider */}
              <div className="mt-auto mb-6 h-px w-full bg-slate-100 group-hover:bg-indigo-50 transition-colors" />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {subject.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-md bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wide border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 group-hover:text-indigo-600 transition-all">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action */}
              <Button
                onClick={() => subject.viewState && onNavigate?.(subject.viewState)}
                className={`w-full h-14 rounded-2xl text-lg font-bold text-white shadow-lg transition-all
                  bg-gradient-to-r ${subject.bgGradient} 
                  hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20
                  active:scale-[0.98]
                `}
              >
                {language === 'es' ? 'Comenzar Aventura' : 'Start Adventure'}
                <div className="bg-white/20 rounded-full p-1 ml-3 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
