import React from 'react';
import { Play, Clock, BarChart3, ChevronRight, Database } from 'lucide-react';
import { OracleScore } from './OracleScore';
import { CompetencyRadar } from './CompetencyRadar';

export const ICFESDashboard: React.FC<{ onStartSim: () => void; onOpenIngest?: () => void }> = ({ onStartSim, onOpenIngest }) => {
    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Panel de Entrenamiento</h2>
                <p className="text-slate-500">Prepárate para las pruebas Saber con simulacros adaptativos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <OracleScore />
                </div>
                <div className="lg:col-span-1 h-full">
                    <CompetencyRadar />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Start Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Play className="w-8 h-8 text-white" />
                        </div>
                        <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded">Recomendado</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Simulacro Rápido</h3>
                    <p className="text-blue-100 text-sm mb-6">Sesión de 20 preguntas cubriendo Matemáticas y Lenguaje. Ideal para práctica diaria.</p>
                    <button className="w-full bg-white text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                        Iniciar Ahora <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Stats Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-6 h-6 text-slate-400" />
                        <h3 className="font-bold text-slate-700">Tu Progreso</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Matemáticas</span>
                                <span className="font-bold text-slate-900">75%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Lectura Crítica</span>
                                <span className="font-bold text-slate-900">60%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-3/5"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Ciencias Naturales</span>
                                <span className="font-bold text-slate-900">40%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-2/5"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Tool for Data Ingestion */}
            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-400" />
                        Base de Datos (Admin)
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Cargar nuevas preguntas desde PDFs.</p>
                </div>
                <button
                    onClick={onOpenIngest}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Abrir Ingestor
                </button>
            </div>

            <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    Historial Reciente
                </h3>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Prueba</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Puntaje</th>
                                <th className="px-6 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="px-6 py-4 font-medium text-slate-900">Simulacro Matemáticas #3</td>
                                <td className="px-6 py-4 text-slate-500">Hoy, 10:30 AM</td>
                                <td className="px-6 py-4 font-bold text-green-600">85/100</td>
                                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Completado</span></td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-slate-900">Lectura Crítica - Nivel 2</td>
                                <td className="px-6 py-4 text-slate-500">Ayer</td>
                                <td className="px-6 py-4 font-bold text-amber-600">65/100</td>
                                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Completado</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
