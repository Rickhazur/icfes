
import React from 'react';
import { LayoutDashboard, Calendar, BookOpen, Bot, BarChart3, GraduationCap, UserCheck, HeartHandshake, CircleHelp, Users, Trophy, Brain, Map, Layers, Compass, ShoppingBag, LogOut, Settings as SettingsIcon, EyeOff, Receipt, FolderOpen, WifiOff, Zap, Cloud, Activity, Globe, PenTool, Search } from 'lucide-react';
import { ViewState, Language, UserLevel } from '../types';
import { AvatarDisplay } from './Gamification/AvatarDisplay';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onStartTour?: () => void;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
  isSimulationMode?: boolean;
  onExitSimulation?: () => void;
  restrictedMode?: boolean;
  studentMenuConfig?: string[];
  isMock?: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  userLevel?: UserLevel;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onStartTour,
  onLogout,
  userName = "Usuario",
  userRole,
  isSimulationMode = false,
  onExitSimulation,
  restrictedMode = false,
  studentMenuConfig,
  isMock = false,
  language,
  setLanguage,
  userLevel = 'primary'
}): React.ReactElement => {

  const t = {
    es: {
      dashboard: 'Mi Base',
      curriculum: 'Misiones',
      repository: 'Mis Tareas',
      flashcards: 'Tarjetas Mágicas',
      social: 'Arena de Juegos',
      rewards: 'Tienda de Premios',
      progress: userRole === 'ADMIN' ? 'Panel Profe' : 'Salón de la Fama',
      consultant: 'Mi Amigo Robot',
      metrics: 'Mis Poderes',
      settings: 'Mi Perfil',
      tour: 'Ayuda',
      logout: 'Salir',
      exitSim: 'Salir Broma',
      connection: 'CONECTADO',
      remedial: 'Entrenamiento Especial',
      whiteboard: 'Pizarra Mágica',
      mathTutor: 'Profe de Mate',
      research: 'Centro de Investigación',
      buddyLearn: 'Amigo de Inglés',
      parentDashboard: 'Panel de Padres',
    },
    en: {
      dashboard: 'My Base',
      curriculum: 'Missions',
      repository: 'My Homework',
      flashcards: 'Magic Cards',
      social: 'Game Arena',
      rewards: 'Prize Store',
      progress: userRole === 'ADMIN' ? 'Teacher Panel' : 'Hall of Fame',
      consultant: 'Robot Friend',
      metrics: 'My Powers',
      settings: 'My Profile',
      tour: 'Help',
      logout: 'Exit',
      exitSim: 'Exit Prank',
      connection: 'ONLINE',
      remedial: 'Special Training',
      whiteboard: 'Magic Board',
      mathTutor: 'Math Tutor',
      research: 'Research Center',
      buddyLearn: 'English Buddy',
      parentDashboard: 'Parent Panel',
    }
  };

  const labels = t[language as keyof typeof t];

  // Simplified Nav Items for Kids
  const allNavItems = [
    { id: ViewState.DASHBOARD, label: labels.dashboard, icon: HeartHandshake }, // Need to change icons maybe, stick to existing checks
    { id: ViewState.CURRICULUM, label: labels.curriculum, icon: Map },
    { id: ViewState.AI_CONSULTANT, label: labels.consultant, icon: Bot },
    { id: ViewState.ARENA, label: labels.social, icon: Trophy },
    { id: ViewState.REWARDS, label: labels.rewards, icon: ShoppingBag },
    { id: ViewState.WHITEBOARD, label: labels.whiteboard, icon: PenTool },
    { id: ViewState.MATH_TUTOR, label: labels.mathTutor, icon: Brain },
    { id: ViewState.RESEARCH_CENTER, label: labels.research, icon: Search },
    { id: ViewState.FLASHCARDS, label: labels.flashcards, icon: Layers },
    { id: ViewState.BUDDY_LEARN, label: labels.buddyLearn, icon: Globe },
    { id: ViewState.REPOSITORY, label: labels.repository, icon: FolderOpen },
    { id: ViewState.PROGRESS, label: labels.progress, icon: UserCheck },
  ];

  if (userRole === 'ADMIN') {
    allNavItems.push({ id: ViewState.LAB_DEV, label: 'Lab Dev', icon: Zap });
  }

  // Removing Admin-specific extra links for now to simplify, or re-add if needed.
  // Assuming Admin uses same view but sees more data in components.

  let navItems = allNavItems;

  // Active States - Super Colorful
  const itemActive = 'bg-kid-yellow text-black border-2 border-black shadow-comic transform -translate-y-1 font-black';
  const itemInactive = 'text-slate-500 hover:bg-white/50 hover:text-black hover:border-2 hover:border-black/10 transition-all font-bold';

  if (restrictedMode) {
    navItems = allNavItems.filter(item =>
      item.id === ViewState.CURRICULUM ||
      item.id === ViewState.REPOSITORY ||
      item.id === ViewState.REWARDS ||
      item.id === ViewState.PROGRESS
    );
  } else if (userRole === 'STUDENT' && studentMenuConfig && studentMenuConfig.length > 0) {
    navItems = allNavItems.filter(item => studentMenuConfig.includes(item.id));
  } else if (userRole === 'PARENT') {
    // Only parents get access to Parent Dashboard
    navItems = [
      { id: ViewState.PARENT_DASHBOARD, label: (labels as any).parentDashboard, icon: HeartHandshake },
      { id: ViewState.PROGRESS, label: labels.progress, icon: UserCheck },
      { id: ViewState.CURRICULUM, label: labels.curriculum, icon: Map }
    ];
  }

  const handleHomeClick = (): void => {
    if (restrictedMode) return;
    onViewChange(ViewState.DASHBOARD);
  };

  return (
    <aside className={`w-64 bg-white border-r-4 border-black h-screen sticky top-0 flex flex-col z-10 hidden md:flex font-sans transition-colors duration-300 shadow-comic-lg shrink-0`}>
      <div
        className={`p-6 flex items-center space-x-3 border-b-4 border-black/10 ${restrictedMode ? 'cursor-default' : 'cursor-pointer hover:bg-yellow-50'} transition-colors shrink-0`}
        onClick={handleHomeClick}
        title={restrictedMode ? labels.remedial : "Nova Kids"}
      >
        <div className={`p-2 rounded-2xl border-2 border-black shadow-comic ${restrictedMode ? 'bg-kid-pink' : 'bg-kid-blue'}`}>
          <Brain className={`text-white w-8 h-8`} />
        </div>
        <div>
          <h1 className="font-black text-xl text-black leading-tight tracking-tight">NOVA <span className="text-kid-pink">KIDS</span><br />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${restrictedMode ? 'text-rose-500' : 'text-kid-purple'}`}>
              {restrictedMode ? labels.remedial : 'Super Learning'}
            </span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl group mb-2 ${isActive
                ? itemActive
                : itemInactive
                }`}
            >
              <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-black'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        <div className="my-4 border-t-2 border-dashed border-slate-200"></div>


        {/* Upgrade Plan Button - Only for Students */}
        {userRole === 'STUDENT' && (
          <button
            onClick={() => onViewChange(ViewState.SUBSCRIPTION)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl mb-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black shadow-lg shadow-orange-200 border-2 border-black transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm">{language === 'es' ? 'MEJORAR PLAN' : 'UPGRADE PLAN'}</span>
          </button>
        )}

        <button
          onClick={() => onViewChange(ViewState.SETTINGS)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl group mb-2 ${currentView === ViewState.SETTINGS
            ? itemActive
            : itemInactive
            }`}
        >
          <SettingsIcon className={`w-6 h-6 transition-colors ${currentView === ViewState.SETTINGS ? 'text-black' : 'text-slate-400 group-hover:text-black'}`} />
          <span className="text-sm">{labels.settings}</span>
        </button>

      </nav>

      <div className="p-4 border-t-4 border-black/10 space-y-3 bg-slate-50 shrink-0">

        {/* Language Toggle */}
        <div className="flex bg-white rounded-xl border-2 border-black p-1 shadow-comic">
          <button
            onClick={() => setLanguage('es')}
            className={`flex-1 flex items-center justify-center gap-1 text-xs font-black py-2 rounded-lg transition-colors ${language === 'es' ? 'bg-kid-yellow text-black border-2 border-black' : 'text-slate-400 hover:text-black'}`}
          >
            ES
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 flex items-center justify-center gap-1 text-xs font-black py-2 rounded-lg transition-colors ${language === 'en' ? 'bg-kid-yellow text-black border-2 border-black' : 'text-slate-400 hover:text-black'}`}
          >
            EN
          </button>
        </div>

        <button
          onClick={isSimulationMode && onExitSimulation ? onExitSimulation : onLogout}
          className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group font-black shadow-comic mb-2 border-2 border-black ${isSimulationMode
            ? 'text-black bg-orange-400 hover:bg-orange-300'
            : 'text-white bg-kid-pink hover:bg-pink-400'
            }`}
        >
          {isSimulationMode ? <EyeOff className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
          <span className="text-xs tracking-wide uppercase">{isSimulationMode ? labels.exitSim : labels.logout}</span>
        </button>

        <div className={`p-3 rounded-2xl border-2 border-black shadow-comic flex items-center gap-3 bg-white`}>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
            {/* Dynamic Avatar */}
            <AvatarDisplay size="sm" showBackground={true} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className={`text-xs font-black truncate w-28 text-black`} title={userName}>{userName}</span>
            <span className={`text-[10px] uppercase tracking-wide font-bold text-kid-purple`}>
              {userRole === 'ADMIN' ? 'Profe' : userRole === 'PARENT' ? 'Padre/Acudiente' : 'Estudiante'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
