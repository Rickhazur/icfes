import React, { useState } from 'react';
import {
    Sparkles,
    GraduationCap,
    FlaskConical,
    Brain,
    Calculator,
    BookOpen,
    Palette,
    ShieldCheck,
    Coins,
    UserCircle,
    Smartphone,
    Database,
    Bug,
    Wand2,
    Settings
} from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { toast } from 'sonner';
import { ViewState } from '../types';
import SmartTutorPrimary from './SmartTutorPrimary/PrimaryTutor';
import { ParentDashboard } from './Parent/ParentDashboard';
import { ArenaLobby } from './Arena/ArenaLobby';
import { MissionsLog } from './Missions/MissionsLog';
import { GuardianGuard } from './GuardianGuard';

interface LabDevProps {
    onNavigate: (view: ViewState) => void;
    gradeLevel: number;
    setGradeLevel: (grade: number) => void;
    language: 'es' | 'en';
    setLanguage: (lang: 'es' | 'en') => void;
}

const LabDev: React.FC<LabDevProps> = ({ onNavigate, gradeLevel, setGradeLevel, language, setLanguage }) => {
    const { addCoins } = useGamification();
    const [activeTab, setActiveTab] = useState<'simulators' | 'tools' | 'database'>('simulators');
    const [previewMode, setPreviewMode] = useState<ViewState>(ViewState.AI_CONSULTANT);
    const [guardEnabled, setGuardEnabled] = useState(false);

    console.log("LabDev Rendered. Mode:", previewMode);

    const coreFeatures = [
        { id: ViewState.AI_CONSULTANT, name: 'Socratic Tutor (Primary)', icon: Sparkles, color: 'text-amber-500' },
        { id: ViewState.MATH_TUTOR, name: 'Math Maestro', icon: Calculator, color: 'text-sky-500' },
        { id: ViewState.RESEARCH_CENTER, name: 'Research Center', icon: BookOpen, color: 'text-indigo-500' },
        { id: ViewState.BUDDY_LEARN, name: 'English Buddy', icon: Brain, color: 'text-emerald-500' },
        { id: ViewState.ARTS_TUTOR, name: 'Arts & Creative', icon: Palette, color: 'text-rose-500' },
        { id: ViewState.PARENT_DASHBOARD, name: 'Parent Hub (SESIÓN PADRES)', icon: ShieldCheck, color: 'text-violet-500' },
        { id: ViewState.ARENA, name: 'Arena & Games', icon: FlaskConical, color: 'text-fuchsia-500' },
        { id: ViewState.CURRICULUM, name: 'Mission Log', icon: Bug, color: 'text-orange-500' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-stone-50 font-poppins border-4 border-indigo-200 rounded-[2.5rem]">

            {/* COMPACT LAB HEADER */}
            <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <FlaskConical className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-xl font-black tracking-tight">LAB DEV <span className="text-indigo-400">2.0</span></h2>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button onClick={() => setActiveTab('simulators')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'simulators' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>Simuladores</button>
                    <button onClick={() => setActiveTab('tools')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'tools' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>Herramientas</button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* LAB SIDEBAR - ALWAYS VISIBLE */}
                <div className="w-72 bg-white border-r border-stone-200 overflow-y-auto p-4 space-y-6 shrink-0">
                    <div>
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Seleccionar Simulador</h3>
                        <div className="space-y-1.5">
                            {coreFeatures.map(feature => (
                                <button
                                    key={feature.id}
                                    onClick={() => setPreviewMode(feature.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${previewMode === feature.id
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'bg-white border-stone-100 text-stone-500 hover:bg-stone-50'
                                        }`}
                                >
                                    <feature.icon className={`w-4 h-4 ${previewMode === feature.id ? 'text-white' : feature.color}`} />
                                    {feature.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100">
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Configuración Global</h3>
                        <div className="space-y-3">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(g => (
                                    <button key={g} onClick={() => setGradeLevel(g)} className={`flex-1 h-8 rounded-lg text-xs font-black transition-all ${gradeLevel === g ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-400'}`}>{g}º</button>
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setLanguage('es')} className={`flex-1 h-8 rounded-lg text-[10px] font-bold ${language === 'es' ? 'bg-slate-900 text-white' : 'bg-stone-100 text-stone-400'}`}>ESP</button>
                                <button onClick={() => setLanguage('en')} className={`flex-1 h-8 rounded-lg text-[10px] font-bold ${language === 'en' ? 'bg-slate-900 text-white' : 'bg-stone-100 text-stone-400'}`}>ENG</button>
                            </div>

                            <button
                                onClick={() => setGuardEnabled(!guardEnabled)}
                                className={`w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${guardEnabled ? 'bg-red-500 border-red-500 text-white shadow-lg' : 'bg-white border-stone-200 text-stone-400'}`}
                            >
                                {guardEnabled ? '🛡️ GUARDIA ACTIVO' : '🛡️ ACTIVAR GUARDIA'}
                            </button>

                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        const alert = {
                                            id: Date.now(),
                                            text: "💡 ¡Dato Positivo! Mateo está muy enganchado con Ciencias. ¡Pregúntale qué aprendió sobre el agua!",
                                            type: 'PASSION',
                                            timestamp: new Date().toLocaleTimeString()
                                        };
                                        const existing = JSON.parse(localStorage.getItem('nova_alerts') || '[]');
                                        localStorage.setItem('nova_alerts', JSON.stringify([alert, ...existing]));
                                        toast.success("Alerta de Pasión enviada");
                                    }}
                                    className="w-full bg-emerald-50 border border-emerald-200 h-10 rounded-xl text-emerald-600 text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 mb-2"
                                >
                                    🟢 Gatillar Alerta de Pasión
                                </button>
                                <button
                                    onClick={() => {
                                        const alert = {
                                            id: Date.now(),
                                            text: "¡ATENCIÓN! Mateo muestra señales de frustración en Matemáticas.",
                                            type: 'FRUSTRATION',
                                            timestamp: new Date().toLocaleTimeString()
                                        };
                                        const existing = JSON.parse(localStorage.getItem('nova_alerts') || '[]');
                                        localStorage.setItem('nova_alerts', JSON.stringify([alert, ...existing]));
                                        toast.error("Alerta IA enviada al Panel de Padres");
                                    }}
                                    className="w-full bg-rose-50 border border-rose-200 h-10 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-tighter hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                                >
                                    🔴 Gatillar Alerta de Frustración
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PREVIEW CONTAINER */}
                <div className="flex-1 bg-stone-200/30 p-4 overflow-hidden flex flex-col">
                    <div className="bg-white rounded-[1.5rem] shadow-xl flex-1 overflow-auto relative border border-stone-200">
                        {/* Status Bar */}
                        <div className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md px-4 py-2 border-b border-stone-100 z-10 flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-600 uppercase">Live: {coreFeatures.find(f => f.id === previewMode)?.name}</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                            </div>
                        </div>

                        {/* Guard Simulator */}
                        {guardEnabled && <GuardianGuard studentName="Simulador Mateo" />}

                        {/* Renders */}
                        <div className="p-1">
                            {previewMode === ViewState.AI_CONSULTANT && <SmartTutorPrimary onNavigate={() => { }} gradeLevel={gradeLevel} setGradeLevel={setGradeLevel} />}
                            {previewMode === ViewState.PARENT_DASHBOARD && <ParentDashboard />}
                            {previewMode === ViewState.ARENA && <ArenaLobby language={language} />}
                            {previewMode === ViewState.CURRICULUM && <MissionsLog language={language} />}

                            {![ViewState.AI_CONSULTANT, ViewState.PARENT_DASHBOARD, ViewState.ARENA, ViewState.CURRICULUM].includes(previewMode) && (
                                <div className="p-20 text-center">
                                    <Wand2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-xl font-bold">Módulo Externo</h3>
                                    <p className="text-stone-400 text-sm mb-6">Esta interfaz requiere navegación completa.</p>
                                    <button onClick={() => onNavigate(previewMode)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Abrir Módulo</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabDev;

