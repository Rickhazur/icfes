
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Zap, Crown, Flame, Swords, Timer, ArrowRight, X, Shield, Star, Medal } from 'lucide-react';

const SunIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const PiIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;

// --- MOCK DATA ---
const LEADERBOARD = [
  { id: 1, name: "Sofía", level: 1, xp: 0, avatar: "🦄", streak: 0, status: 'online' },
  { id: 2, name: "Tú", level: 1, xp: 0, avatar: "🦁", streak: 0, status: 'online' },
  { id: 3, name: "Mateo", level: 1, xp: 0, avatar: "🦖", streak: 0, status: 'offline' },
  { id: 4, name: "Valen", level: 1, xp: 0, avatar: "🎨", streak: 0, status: 'online' },
  { id: 5, name: "Juan", level: 1, xp: 0, avatar: "⚽", streak: 0, status: 'offline' },
];

const ACHIEVEMENTS = [
  { id: 1, name: "Madrugador", desc: "Jugar antes de 8AM", icon: <SunIcon />, earned: false },
  { id: 2, name: "Genio Mate", desc: "90% en Quizzes", icon: <PiIcon />, earned: false },
  { id: 3, name: "Súper Racha", desc: "5 días seguidos", icon: <Flame className="w-4 h-4 text-orange-500" />, earned: false },
];

// ... DuelArena ... (Keep logic, update styling if needed, but the dark mode overlay is fine for a game modal)

const SocialHub: React.FC = () => {


  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">


      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border-4 border-black shadow-comic">
        <div>
          <h2 className="text-3xl font-black text-black flex items-center gap-3">
            <Trophy className="w-10 h-10 text-kid-yellow fill-black" />
            Arena de Juegos
          </h2>
          <p className="text-slate-500 font-bold mt-1">Juega con tus amigos y gana trofeos.</p>
        </div>
        <div className="bg-kid-blue text-black px-6 py-3 rounded-2xl border-4 border-black shadow-comic flex items-center gap-3 transform -rotate-2">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-black opacity-80">Nivel</span>
            <span className="font-black text-xl leading-none">1 (Explorador)</span>
          </div>
          <div className="w-1 h-8 bg-black/20"></div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase font-black opacity-80">Puntos</span>
            <span className="font-black text-xl leading-none">0 XP</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-comic border-4 border-black overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-4 bg-kid-yellow border-b-4 border-black"></div>

            <div className="p-6 mt-4 flex justify-between items-center">
              <h3 className="font-black text-2xl text-black flex items-center gap-2">
                <Crown className="w-6 h-6 text-kid-yellow fill-black" /> Top Amigos
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">En Vivo</span>
            </div>
            <div className="p-4 space-y-3">
              {LEADERBOARD.map((student, idx) => (
                <div key={student.id} className={`flex items-center gap-4 p-4 rounded-2xl border-4 transition-all ${student.id === 2 ? 'bg-kid-green border-black shadow-comic transform -translate-y-1' : 'bg-white border-slate-100 hover:border-black hover:bg-slate-50'}`}>
                  <div className="w-8 font-black text-xl text-slate-400 text-center">{idx + 1}</div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-black">
                      {student.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${student.status === 'online' ? 'bg-green-400' : 'bg-slate-300'}`}></div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-black text-lg ${student.id === 2 ? 'text-black' : 'text-slate-700'}`}>
                      {student.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-black"><Zap className="w-3 h-3 fill-kid-yellow text-black" /> {student.xp} XP</span>
                      <span>•</span>
                      <span className="text-kid-purple">Nivel {student.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-center">
                      <Flame className={`w-5 h-5 ${student.streak > 3 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-300'}`} />
                      <span className="text-[10px] font-black text-slate-400">{student.streak} días</span>
                    </div>
                    {student.id !== 2 && (
                      <button
                        onClick={() => console.log("Retar a", student.name)}
                        className="bg-kid-pink border-2 border-black hover:bg-pink-400 text-black px-4 py-2 rounded-xl text-xs font-black transition-all shadow-comic hover:translate-y-[-2px]"
                      >
                        Retar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Challenge Banner */}
          <div className="bg-kid-purple rounded-[2rem] p-8 text-black shadow-comic border-4 border-black relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 text-white opacity-20 transform rotate-12 group-hover:scale-110 transition-transform"><Trophy size={150} /></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <div className="inline-block bg-black text-kid-yellow px-4 py-1 rounded-full text-xs font-black mb-3 border-2 border-white/20 transform -rotate-2">
                  EVENTO SEMANAL
                </div>
                <h3 className="text-3xl font-black text-white mb-2 leading-none">Maratón de Sumas</h3>
                <p className="text-white font-bold max-w-md text-sm opacity-90">¡Resuelve sumas rápidas y gana 500 XP!</p>
              </div>
            </div>
            <div className="mt-6 w-full bg-black/40 rounded-full h-4 border-2 border-black/20 p-1">
              <div className="bg-kid-yellow h-FULL rounded-full border border-black" style={{ width: '0%', height: '100%' }}></div>
            </div>
            <div className="flex justify-between text-xs mt-2 font-black text-white uppercase tracking-wider">
              <span>Tu progreso</span>
              <span>0 / 50 Puntos</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Profile & Badges */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border-4 border-black shadow-comic text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-kid-blue/20"></div>
            <div className="w-28 h-28 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-5xl shadow-comic border-4 border-black relative z-10">
              🦁
            </div>
            <h3 className="text-2xl font-black text-black relative z-10">Tú</h3>
            <p className="text-slate-500 font-bold text-sm mb-6 relative z-10">Grado 3 • Explorador</p>

            <div className="grid grid-cols-2 gap-3 mb-2 relative z-10">
              <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
                <span className="block text-2xl font-black text-black">0</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Victorias</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
                <span className="block text-2xl font-black text-black">-%</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Precisión</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border-4 border-black shadow-comic">
            <h3 className="font-black text-xl text-black mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Medal className="w-6 h-6 text-black fill-kid-orange" /> Mis Trofeos
            </h3>
            <div className="space-y-3">
              {ACHIEVEMENTS.map(ach => (
                <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${ach.earned ? 'bg-kid-yellow border-black shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <div className={`p-2 rounded-xl border-2 ${ach.earned ? 'bg-white border-black text-black' : 'bg-white border-slate-300 text-slate-300'}`}>
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${ach.earned ? 'text-black' : 'text-slate-500'}`}>{ach.name}</h4>
                    <p className="text-xs font-bold text-slate-400">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialHub;
