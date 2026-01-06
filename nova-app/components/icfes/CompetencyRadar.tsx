import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Zap } from 'lucide-react';

export const CompetencyRadar: React.FC = () => {
    // Mock Data - In the future, this will be aggregated from Supabase 'icfes_questions' execution history
    const data = [
        { subject: 'Interpretativa', A: 120, fullMark: 150 },
        { subject: 'Argumentativa', A: 98, fullMark: 150 },
        { subject: 'Propositiva', A: 86, fullMark: 150 },
        { subject: 'Indagación', A: 99, fullMark: 150 },
        { subject: 'Cuantitativo', A: 85, fullMark: 150 },
        { subject: 'Inglés-Lexical', A: 65, fullMark: 150 },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Radar de Competencias
                </h3>
                <p className="text-sm text-slate-500">Mira más allá de las notas. Así piensa tu cerebro.</p>
            </div>

            <div className="flex-1 min-h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar
                            name="Mi Nivel"
                            dataKey="A"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="#818cf8"
                            fillOpacity={0.5}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#4338ca', fontWeight: 'bold' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                <div className="absolute bottom-0 right-0 p-3 bg-indigo-50 rounded-lg border border-indigo-100 max-w-[200px] shadow-sm">
                    <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-orange-500 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-indigo-900">Insight Socrático:</p>
                            <p className="text-xs text-indigo-700 italic">"Eres fuerte interpretando, pero te cuesta proponer soluciones nuevas."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
