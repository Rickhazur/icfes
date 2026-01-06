
import React, { useEffect, useState } from 'react';
import { Search, Info, MoreVertical, Eye, Trash2, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { adminCreateUser, adminGetAllProfiles, adminUpdateUserStatus, adminUpdateUserPlan, adminDeleteUser } from '../../services/supabase';
import { useToast } from '@/components/ui/use-toast';

const PaymentsManagement: React.FC = () => {
    const { toast } = useToast();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: ''
    });

    const loadStudents = async () => {
        setLoading(true);
        const data = await adminGetAllProfiles();
        setStudents(data);
        setLoading(false);
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleEnrollClick = () => {
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await adminCreateUser(formData.email, formData.password, formData.name, formData.whatsapp);
            if (res.success) {
                if (res.isVerified) {
                    toast({ title: "Estudiante inscrito", description: "El usuario ha sido creado y está listo." });
                } else {
                    toast({
                        title: "Estudiante creado (Pendiente Verificación)",
                        description: "El usuario debe confirmar su correo antes de entrar. Para evitar esto, desactiva 'Confirm Email' en Supabase.",
                        variant: "default" // Changed from warning
                    });
                }
                setIsModalOpen(false);
                setFormData({ name: '', email: '', whatsapp: '', password: '' });
                loadStudents();
            } else {
                toast({ title: "Error", description: res.error || "No se pudo inscribir.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Ocurrió un error inesperado.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${name}? Esto desactivará su acceso.`)) {
            const success = await adminDeleteUser(id);
            if (success) {
                toast({ title: "Usuario desactivado", description: "El estudiante ya no podrá acceder." });
                loadStudents();
            } else {
                toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
            }
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const success = await adminUpdateUserStatus(id, newStatus);
        if (success) {
            toast({ title: "Estado actualizado", description: `El estudiante ahora está ${newStatus}` });
            loadStudents();
        } else {
            toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
        }
    };

    const handleUpdatePlan = async (id: string, newPlan: string) => {
        const success = await adminUpdateUserPlan(id, newPlan);
        if (success) {
            toast({ title: "Plan actualizado", description: `Plan cambiado a ${newPlan}` });
            loadStudents();
        } else {
            toast({ title: "Error", description: "No se pudo actualizar el plan.", variant: "destructive" });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans animate-fade-in text-stone-800 relative">

            {/* Enrollment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold text-stone-900 mb-6">Inscribir Nuevo Estudiante</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre Completo del Estudiante</label>
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Correo del Estudiante</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="estudiante@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">WhatsApp del Acudiente</label>
                                <input
                                    name="whatsapp"
                                    type="tel"
                                    required
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="+57 300 123 4567"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Contraseña Inicial</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
                                >
                                    Completar Inscripción
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">Panel de Administración</h1>
                <p className="text-stone-500">Gestiona estudiantes, programas y recompensas.</p>
            </div>

            {/* Stats Cards - Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <UserIcon />
                    </div>
                    <div>
                        <p className="text-stone-500 text-xs font-bold uppercase">Total Estudiantes</p>
                        <h3 className="text-3xl font-black text-stone-900">{students.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-stone-500 text-xs font-bold uppercase">Activos</p>
                        <h3 className="text-3xl font-black text-stone-900">{students.filter(s => s.status === 'Activo').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <CoinsIcon />
                    </div>
                    <div>
                        <p className="text-stone-500 text-xs font-bold uppercase">Coins en Circulación</p>
                        <h3 className="text-3xl font-black text-stone-900">{students.reduce((acc, s) => acc + (s.coins || 0), 0)}</h3>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-2 mb-6 border-b border-stone-200 pb-1">
                <button className="px-4 py-2 bg-stone-100 text-stone-900 font-bold rounded-lg text-sm">Estudiantes</button>
                <button className="px-4 py-2 text-stone-500 font-medium hover:bg-stone-50 rounded-lg text-sm">Programas</button>
                <button className="px-4 py-2 text-stone-500 font-medium hover:bg-stone-50 rounded-lg text-sm">Tienda y Premios</button>
                <button className="px-4 py-2 text-stone-500 font-medium hover:bg-stone-50 rounded-lg text-sm">Configuración</button>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Estudiantes</h2>
                    {loading && <span className="text-xs text-stone-400 animate-pulse">Cargando datos...</span>}
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                        <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-stone-50 rounded-xl border-none focus:ring-1 focus:ring-indigo-500 text-sm" />
                    </div>
                    <button
                        onClick={handleEnrollClick}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                    >
                        <UserPlus className="w-4 h-4 mr-1 inline" /> Inscribir
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-transparent">
                        <tr className="text-xs text-stone-500 font-bold uppercase border-b border-stone-50">
                            <th className="px-6 py-4">Estudiante</th>
                            <th className="px-6 py-4">Nivel</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Coins</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                        {students.map(s => (
                            <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                            {s.name ? s.name.substring(0, 2).toUpperCase() : 'NA'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-stone-700">{s.name}</span>
                                            <span className="text-xs text-stone-400">{s.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-xs text-stone-500">{s.level || 'Primaria'}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={s.plan || 'BASIC'}
                                        onChange={(e) => handleUpdatePlan(s.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-[10px] font-black uppercase text-white border-none cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 outline-none ${s.plan === 'PRO' ? 'bg-indigo-500' :
                                            s.plan === 'ELITE' ? 'bg-amber-500' : 'bg-slate-400'
                                            }`}
                                    >
                                        <option className="text-stone-800 bg-white" value="BASIC">Basic</option>
                                        <option className="text-stone-800 bg-white" value="PRO">Pro</option>
                                        <option className="text-stone-800 bg-white" value="ELITE">Elite</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-amber-500 font-bold text-sm flex items-center gap-1">
                                    <CoinsIcon className="w-3 h-3" /> {s.coins || 0}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={s.status || 'Activo'}
                                        onChange={(e) => handleUpdateStatus(s.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-[10px] font-bold text-white border-none cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-emerald-400 outline-none ${s.status === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'
                                            }`}
                                    >
                                        <option className="text-stone-800 bg-white" value="Activo">Activo</option>
                                        <option className="text-stone-800 bg-white" value="Inactivo">Inactivo</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-4 text-stone-400">
                                    <button className="hover:text-stone-800 flex items-center gap-1 text-xs font-bold text-stone-600">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id, s.name)}
                                        className="hover:text-rose-500 text-rose-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && !loading && (
                    <div className="p-8 text-center text-stone-400 text-sm">No hay estudiantes registrados o activos.</div>
                )}
            </div>

        </div>
    );
};

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const CoinsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7 .71-2.82 2.82" /></svg>
);

export default PaymentsManagement;
