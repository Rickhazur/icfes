import React, { useEffect, useState } from 'react';
import { Gauge, TrendingUp, Award, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const OracleScore: React.FC = () => {
    // Mock simulation of "Predictive Score" based on recent activity
    // In real implementation, this would query supabase
    const [score, setScore] = useState(320);
    const [history, setHistory] = useState([
        { day: 'Lun', score: 280 },
        { day: 'Mar', score: 295 },
        { day: 'Mié', score: 310 },
        { day: 'Jue', score: 315 },
        { day: 'Vie', score: 320 },
    ]);

    // Animate score slightly to feel "alive"
    useEffect(() => {
        const interval = setInterval(() => {
            setScore(prev => Math.min(500, Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getScoreColor = (s: number) => {
        if (s >= 400) return 'text-purple-600 bg-purple-50 border-purple-200';
        if (s >= 350) return 'text-green-600 bg-green-50 border-green-200';
        if (s >= 300) return 'text-blue-600 bg-blue-50 border-blue-200';
        return 'text-orange-600 bg-orange-50 border-orange-200';
    };

    const getMessage = (s: number) => {
        if (s >= 350) return "¡Estás en rango de Beca Generación E! Mantén el ritmo.";
        if (s >= 300) return "Vas bien para universidades públicas. Faltan 30 pts para matrícula cero.";
        return "Necesitas reforzar Matemáticas para subir a rango competitivo.";
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Puntaje Oráculo
                    </h3>
                    <p className="text-sm text-slate-500">Predicción basada en tu rendimiento actual</p>
                </div>
                <div className="group relative">
                    <Info className="w-5 h-5 text-slate-400 cursor-help" />
                    <div className="absolute right-0 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        Este puntaje predice cuánto sacarías hoy en el ICFES real usando IA sobre tus respuestas recientes.
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Big Display */}
                <div className="relative text-center">
                    <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center ${getScoreColor(score)} transition-colors duration-1000`}>
                        <div>
                            <span className="text-5xl font-extrabold tracking-tighter block">{score}</span>
                            <span className="text-xs uppercase font-bold text-slate-400">Puntaje Global</span>
                        </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2">
                        <span className="text-xs font-bold text-orange-500 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                            <TrendingUp className="w-3 h-3" /> Tendencia +5%
                        </span>
                    </div>
                </div>

                {/* Context & Chart */}
                <div className="flex-1 w-full">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                        <p className="text-sm font-medium text-slate-700">
                            💡 {getMessage(score)}
                        </p>
                    </div>
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip />
                                <Area type="monotone" dataKey="score" stroke="#8884d8" fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
