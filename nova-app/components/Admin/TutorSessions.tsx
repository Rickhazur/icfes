import React from 'react';
import { RefreshCw, Trash2, Clock, MessageSquare, Eye, PlayCircle, CheckCircle2 } from 'lucide-react';

const TutorSessions: React.FC = () => {
    // Mock data matching Image 3
    const sessions = [
        { id: 1, date: '29 dic 2025, 10:57', student: 'Jaime Torres', level: 'Secundaria', topic: 'Matemáticas - Fracciones', status: 'En curso', duration: 'En curso', messages: 2 },
        { id: 2, date: '29 dic 2025, 10:50', student: 'Jaime Torres', level: 'Secundaria', topic: 'Matemáticas - Fracciones', status: 'En curso', duration: 'En curso', messages: 6 },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans animate-fade-in text-stone-800">

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 mb-2">Sesiones de Tutor IA</h1>
                    <p className="text-stone-500">Historial de todas las conversaciones con estudiantes.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-600 hover:bg-stone-50">
                        <RefreshCw className="w-4 h-4" /> Actualizar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-100">
                        <Trash2 className="w-4 h-4" /> Borrar historial
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-stone-500 font-bold uppercase">Total Sesiones</p>
                        <h3 className="text-2xl font-black text-stone-900">2</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-stone-500 font-bold uppercase">Activas</p>
                        <h3 className="text-2xl font-black text-stone-900">2</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                        <UsersIcon />
                    </div>
                    <div>
                        <p className="text-xs text-stone-500 font-bold uppercase">Estudiantes Únicos</p>
                        <h3 className="text-2xl font-black text-stone-900">1</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-white">
                        <tr className="text-xs text-stone-400 font-bold uppercase border-b border-stone-100">
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Estudiante</th>
                            <th className="px-6 py-4">Edad / Nivel</th>
                            <th className="px-6 py-4">Tema / Habilidad</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Duración</th>
                            <th className="px-6 py-4">Mensajes</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                        {sessions.map(s => (
                            <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-stone-600">
                                    {s.date}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-stone-800 text-sm">{s.student}</span>
                                        <span className="text-[10px] text-stone-400">c642039c...</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-indigo-500">{s.level}</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    {s.topic}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-stone-500">
                                    {s.duration}
                                </td>
                                <td className="px-6 py-4 font-bold text-sm">
                                    {s.messages}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-xs font-bold flex items-center justify-end gap-1 text-stone-900 hover:text-indigo-600">
                                        <Eye className="w-3 h-3" /> Ver detalle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);


export default TutorSessions;
