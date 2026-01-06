import React, { useState } from 'react';
import type { Grade, Language } from '../../types/research';
import { cn } from '../../lib/utils';
import { Search, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AvatarDisplay } from '../../../../Gamification/AvatarDisplay';
import { useGamification } from '../../../../../context/GamificationContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ResearchBrowserProps {
  language: Language;
  currentGrade: Grade;
  onGradeChange: (grade: Grade) => void;
  onSearchChange?: (query: string) => void; // New callback to communicate search context
}

const gradeLabels: Record<Grade, { es: string; en: string }> = {
  1: { es: '1° Grado', en: '1st Grade' },
  2: { es: '2° Grado', en: '2nd Grade' },
  3: { es: '3° Grado', en: '3rd Grade' },
  4: { es: '4° Grado', en: '4th Grade' },
  5: { es: '5° Grado', en: '5th Grade' },
};

// Topic suggestions by subject
const topicSuggestions: Record<string, string[]> = {
  es: [
    'Sistema solar', 'Dinosaurios', 'Volcanes', 'Océanos',
    'Civilización Maya', 'Antiguo Egipto', 'Animales en peligro',
    'El cuerpo humano', 'Plantas y fotosíntesis', 'Ríos del mundo'
  ],
  en: [
    'Solar system', 'Dinosaurs', 'Volcanoes', 'Oceans',
    'Mayan civilization', 'Ancient Egypt', 'Endangered animals',
    'Human body', 'Plants and photosynthesis', 'World rivers'
  ]
};

// Search configurations for safe sources
type SearchSource = {
  id: string;
  name: string;
  emoji: string;
  getUrl: (query: string) => string;
  description: Record<Language, string>;
};

const searchSources: (SearchSource & { color: string, badge: string })[] = [
  {
    id: 'kiddle',
    name: 'Kiddle',
    emoji: '🔍',
    getUrl: (query) => `https://www.kiddle.co/s.php?q=${encodeURIComponent(query)}`,
    description: { es: 'Buscador seguro', en: 'Safe search' },
    color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    badge: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'vikidia',
    name: 'Vikidia',
    emoji: '📚',
    getUrl: (query) => `https://es.vikidia.org/w/index.php?search=${encodeURIComponent(query)}`,
    description: { es: 'Enciclopedia', en: 'Encyclopedia' },
    color: 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100',
    badge: 'bg-pink-100 text-pink-700'
  },
  {
    id: 'natgeo',
    name: 'Nat Geo Kids',
    emoji: '🦁',
    getUrl: (query) => `https://kids.nationalgeographic.com/search?q=${encodeURIComponent(query)}`,
    description: { es: 'Naturaleza', en: 'Nature' },
    color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
    badge: 'bg-amber-100 text-amber-700'
  },
  {
    id: 'dkfindout',
    name: 'DK Find Out',
    emoji: '🔬',
    getUrl: (query) => `https://www.dkfindout.com/us/search/${encodeURIComponent(query)}/`,
    description: { es: 'Ciencia', en: 'Science' },
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 'britannica',
    name: 'Britannica',
    emoji: '🎓',
    getUrl: (query) => `https://kids.britannica.com/kids/search/articles?query=${encodeURIComponent(query)}`,
    description: { es: 'Académico', en: 'Academic' },
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100',
    badge: 'bg-cyan-100 text-cyan-700'
  }
];

export function ResearchBrowser({ language, currentGrade, onGradeChange, onSearchChange }: ResearchBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true); // Default open for better visibility
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { addXP } = useGamification();

  const handleSearch = (sourceId: string) => {
    if (!searchQuery.trim()) return;

    const source = searchSources.find(s => s.id === sourceId);
    if (source) {
      window.open(source.getUrl(searchQuery), '_blank', 'noopener,noreferrer');
      setShowSuggestions(false);

      // Award XP for curiosity
      addXP(2);

      // Notify parent about search context
      if (onSearchChange) {
        onSearchChange(searchQuery);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);

    // Update search context when suggestion is clicked
    if (onSearchChange) {
      onSearchChange(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch('kiddle');
    }
  };

  const filteredSuggestions = topicSuggestions[language].filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "rounded-3xl transition-all duration-500 overflow-hidden relative",
      isExpanded
        ? "bg-[#0a0f29] border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.1)] p-8"
        : "bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-cyan-500/50 hover:border-cyan-400 p-4 shadow-[0_0_20px_rgba(34,211,238,0.15)] group"
    )}>
      {/* Futuristic Background Grid - Only visible when expanded */}
      {isExpanded && (
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      )}

      {/* Floating Orbs - Only visible when expanded */}
      {isExpanded && (
        <>
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-violet-600/20 rounded-full blur-[80px]" />
        </>
      )}

      <div
        className="flex items-center justify-between cursor-pointer group relative z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
            isExpanded
              ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              : "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-slate-900"
          )}>
            {isExpanded ? <Sparkles className="w-6 h-6 animate-pulse" /> : <Search className="w-6 h-6" />}
          </div>
          <div>
            <h4 className={cn(
              "font-fredoka font-bold text-xl transition-colors tracking-wide",
              isExpanded ? "text-white drop-shadow-[0_2px_10px_rgba(34,211,238,0.5)]" : "text-white group-hover:text-cyan-300 drop-shadow-md"
            )}>
              {language === 'es' ? 'LABORATORIO DE INVESTIGACIÓN' : 'RESEARCH LAB'}
            </h4>
            {isExpanded && (
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-cyan-300/80 font-mono tracking-wider">
                  {language === 'es' ? 'SISTEMA SEGURO ACTIVO' : 'SECURE SYSTEM ONLINE'}
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-xl transition-all duration-300 font-bold tracking-wider",
            isExpanded
              ? "text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-200 border border-cyan-500/30"
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-400 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          )}
        >
          {isExpanded
            ? (language === 'es' ? 'MINIMIZAR _' : 'MINIMIZE _')
            : (language === 'es' ? 'ABRIR TERMINAL >' : 'OPEN TERMINAL >')
          }
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-8 mt-8 animate-in fade-in slide-in-from-top-4 relative z-10">

          {/* Main Interactive Zone */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Grade Selector - Holographic Style */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-2xl border min-w-fit shadow-lg backdrop-blur-md transition-all duration-300 pr-6",
              currentGrade === 1 && "bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-blue-500/50 shadow-blue-500/20",
              currentGrade === 2 && "bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 border-emerald-500/50 shadow-emerald-500/20",
              currentGrade === 3 && "bg-gradient-to-r from-yellow-900/80 to-yellow-800/80 border-yellow-500/50 shadow-yellow-500/20",
              currentGrade === 4 && "bg-gradient-to-r from-orange-900/80 to-orange-800/80 border-orange-500/50 shadow-orange-500/20",
              currentGrade === 5 && "bg-gradient-to-r from-purple-900/80 to-purple-800/80 border-purple-500/50 shadow-purple-500/20",
            )}>
              <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden shadow-inner bg-black/20 flex-shrink-0">
                {/* @ts-ignore */}
                <AvatarDisplay size="sm" />
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider mb-0.5",
                  currentGrade === 1 && "text-blue-300",
                  currentGrade === 2 && "text-emerald-300",
                  currentGrade === 3 && "text-yellow-300",
                  currentGrade === 4 && "text-orange-300",
                  currentGrade === 5 && "text-purple-300",
                )}>
                  {language === 'es' ? 'NIVEL DE ACCESO' : 'ACCESS LEVEL'}
                </span>
                <Select
                  value={String(currentGrade)}
                  onValueChange={(v) => onGradeChange(Number(v) as Grade)}
                >
                  <SelectTrigger className="border-0 bg-transparent h-7 p-0 focus:ring-0 text-white font-bold w-[120px] hover:text-white/90 transition-colors text-lg shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                    {([1, 2, 3, 4, 5] as Grade[]).map((g) => (
                      <SelectItem key={g} value={String(g)} className="focus:bg-slate-800 focus:text-cyan-300 cursor-pointer">
                        {gradeLabels[g][language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Holographic Search Bar */}
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 rounded-2xl opacity-20 group-focus-within:opacity-100 blur transition-opacity duration-500" />
              <div className="relative bg-slate-900 rounded-2xl border border-cyan-500/30 flex items-center overflow-hidden">
                <div className="pl-4 text-cyan-500">
                  <Search className="w-5 h-5" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0 || true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleKeyDown}
                  placeholder={language === 'es'
                    ? 'Ingresa parámetros de búsqueda...'
                    : 'Enter search parameters...'
                  }
                  className="w-full h-14 border-0 bg-transparent px-4 font-mono text-cyan-100 placeholder:text-cyan-700/50 focus:ring-0 focus-visible:ring-0 md:text-lg"
                />
              </div>

              {/* Suggestions Dropdown - Tech Style */}
              {showSuggestions && (
                <div className="absolute z-20 w-full mt-2 bg-[#0F172A]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                  <div className="px-3 py-2 text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1 border-b border-cyan-900/50 pb-2">
                    {language === 'es' ? 'DETECTADO EN LA RED:' : 'NETWORK DETECTED:'}
                  </div>
                  {(searchQuery.length > 0 ? filteredSuggestions : topicSuggestions[language]).slice(0, 5).map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm rounded-xl hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 font-medium transition-all flex items-center gap-3 group/item border border-transparent hover:border-cyan-500/20"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="text-cyan-800 group-hover/item:text-cyan-400 transition-colors">⚡</span>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Source Module Grid */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-cyan-300/60 uppercase tracking-widest pl-1">
              {language === 'es' ? 'SELECCIONAR FUENTE DE DATOS:' : 'SELECT DATA SOURCE:'}
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {searchSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleSearch(source.id)}
                  disabled={!searchQuery.trim()}
                  className={cn(
                    "relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 gap-3 group hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
                    !searchQuery.trim()
                      ? "bg-slate-900/40 border-slate-800 opacity-40 grayscale cursor-not-allowed"
                      : "bg-slate-900/60 border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    source.id === 'kiddle' ? 'bg-gradient-to-br from-blue-500/10 to-transparent' :
                      source.id === 'vikidia' ? 'bg-gradient-to-br from-pink-500/10 to-transparent' :
                        'bg-gradient-to-br from-cyan-500/10 to-transparent'
                  )} />

                  <div className="text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {source.emoji}
                  </div>
                  <span className="font-bold text-xs text-slate-300 relative z-10 group-hover:text-white tracking-wide">
                    {source.name}
                  </span>

                  {/* Tech Decor Corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/30 rounded-tl-lg" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/30 rounded-br-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Assistant Message */}
          <div className="bg-slate-900/50 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-sm">
            <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                {language === 'es' ? 'PROTOCOLO DE MISIÓN' : 'MISSION PROTOCOL'}
                <span className="h-px flex-1 bg-indigo-500/20" />
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {language === 'es'
                  ? '1. Inicia escaneo de tema arriba. 2. Accede a bases de datos verificadas. 3. Extrae inteligencia clave. 4. Procesa los datos abajo con el asistente IA.'
                  : '1. Initiate subject scan above. 2. Access verified databases. 3. Extract key intelligence. 4. Process data below with AI assistant.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
