import React from 'react';
import { Users, Clock, TrendingUp, CheckCircle, Lock, Monitor, CreditCard, RefreshCw } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto font-sans animate-fade-in text-stone-800">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Panel de Control</h1>
                    <p className="text-stone-500">Monitorea el progreso de los estudiantes</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-600 shadow-sm hover:bg-stone-50">
                        <Clock className="w-4 h-4" /> Alertas
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-stone-800">
                        Configuración
                    </button>
                </div>
            </div>

            {/* Stats Row - Matching Screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Estudiantes */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">2</h3>
                        <p className="text-xs text-stone-500 font-medium">Estudiantes</p>
                    </div>
                </div>

                {/* Tiempo */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">12.5h</h3>
                        <p className="text-xs text-stone-500 font-medium">Tiempo esta semana</p>
                    </div>
                </div>

                {/* Mejora */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">+15%</h3>
                        <p className="text-xs text-stone-500 font-medium">Mejora promedio</p>
                    </div>
                </div>

                {/* Tareas */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">28</h3>
                        <p className="text-xs text-stone-500 font-medium">Tareas completadas</p>
                    </div>
                </div>
            </div>

            {/* Pro Section - Locked content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 min-h-[200px] flex flex-col justify-center">
                    <div className="h-4 w-3/4 bg-stone-200 rounded mb-4 mx-auto opacity-50"></div>
                    <div className="h-4 w-1/2 bg-stone-200 rounded mx-auto opacity-50"></div>
                </div>

                {/* Function Exclusive Pro Card 1 */}
                <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-indigo-500">
                        <Lock className="w-5 h-5" />
                    </div>
                    <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-2">Plan PRO</span>
                    <h3 className="font-bold text-stone-900 mb-2">Función exclusiva de PRO</h3>
                    <p className="text-xs text-stone-500 max-w-[200px] mb-6">Actualiza tu plan para desbloquear esta característica y muchas más.</p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200">
                        Actualizar a PRO
                    </button>
                </div>

                {/* Function Exclusive Pro Card 2 */}
                <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-indigo-500">
                        <Lock className="w-5 h-5" />
                    </div>
                    <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-2">Plan PRO</span>
                    <h3 className="font-bold text-stone-900 mb-2">Función exclusiva de PRO</h3>
                    <p className="text-xs text-stone-500 max-w-[200px] mb-6">Actualiza tu plan para desbloquear esta característica y muchas más.</p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200">
                        Actualizar a PRO
                    </button>
                </div>
            </div>

            {/* Payment Management Table */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-stone-900">Gestión de Pagos</h3>
                            <p className="text-xs text-stone-500">Administra suscripciones y estados de pago</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-stone-500 flex items-center gap-1 hover:text-stone-800">
                        <RefreshCw className="w-3 h-3" /> Actualizar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100">
                                <th className="pb-4 pl-4">Estudiante</th>
                                <th className="pb-4">Plan</th>
                                <th className="pb-4">Estado Prueba</th>
                                <th className="pb-4">Pagado</th>
                                <th className="pb-4">Tokens</th>
                                <th className="pb-4 text-right pr-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="group hover:bg-stone-50 transition-colors">
                                <td className="py-2 pl-4">
                                    <div className="flex flex-col py-2">
                                        <span className="font-bold text-stone-700">Jaime Torres</span>
                                        <span className="text-[10px] text-stone-400">Actualizado: 29 dic 11:58</span>
                                    </div>
                                </td>
                                <td className="py-2">
                                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 w-fit">
                                        Pro <Monitor className="w-3 h-3" />
                                    </span>
                                </td>
                                <td className="py-2">
                                    <span className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                        <Clock className="w-3 h-3" /> 2 días
                                    </span>
                                </td>
                                <td className="py-2">
                                    <div className="w-4 h-4 rounded-full bg-stone-100 border border-stone-200"></div>
                                </td>
                                <td className="py-2 font-mono text-stone-500 text-xs">0/200</td>
                                <td className="py-2 pr-4 text-right">
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                        Activar Suscripción
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;
