import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Filter, MoreHorizontal, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { getAllStudents, updateStudentLevel, deleteStudentProfile, registerStudent } from '../../services/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    // Filtered students
    const filteredStudents = students.filter(s =>
    (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        const data = await getAllStudents();
        setStudents(data);
        setLoading(false);
    };

    const handleDelete = async (uid: string, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${name}? Esta acción no se puede deshacer.`)) {
            const success = await deleteStudentProfile(uid);
            if (success) {
                toast.success('Estudiante eliminado correctamente');
                loadStudents();
            } else {
                toast.error('Error al eliminar estudiante');
            }
        }
    };

    const handleUpdateLevel = async (uid: string, currentLevel: string) => {
        const newLevel = prompt('Ingrese el nuevo nivel/curso:', currentLevel || 'primary');
        if (newLevel && newLevel !== currentLevel) {
            const success = await updateStudentLevel(uid, newLevel);
            if (success) {
                toast.success('Nivel actualizado');
                loadStudents();
            } else {
                toast.error('Error al actualizar nivel');
            }
        }
    };

    // --- REGISTER MODAL COMPONENT ---
    const RegisterModal = () => {
        const [formData, setFormData] = useState({
            name: '',
            email: '',
            password: '',
            guardianPhone: ''
        });
        const [regLoading, setRegLoading] = useState(false);

        const handleRegister = async (e: React.FormEvent) => {
            e.preventDefault();
            setRegLoading(true);

            try {
                // Warning: This uses client-side auth which signs in the new user
                const result = await registerStudent({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    guardianPhone: formData.guardianPhone
                });

                if (result.success) {
                    toast.success('Estudiante registrado exitosamente (Nota: La sesión actual puede haber cambiado)');
                    setIsRegistering(false);
                    loadStudents();
                    // Ideally check if session changed and prompt re-login if needed
                    // For now, we assume the admin might need to switch back or we just refresh lists if session persists (unlikely)
                    window.location.reload(); // Force reload to handle session state cleanly
                }
            } catch (error: any) {
                toast.error('Error al registrar: ' + error.message);
            } finally {
                setRegLoading(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold text-stone-900 mb-4">Inscribir Nuevo Estudiante</h2>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">Nombre Completo</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">Correo Electrónico</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                                placeholder="estudiante@escuela.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">Contraseña</label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">Celular Acudiente (Opcional)</label>
                            <input
                                type="tel"
                                value={formData.guardianPhone}
                                onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                                placeholder="Para notificaciones WhatsApp"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsRegistering(false)}>Cancelar</Button>
                            <Button type="submit" disabled={regLoading}>
                                {regLoading ? 'Registrando...' : 'Inscribir Estudiante'}
                            </Button>
                        </div>
                        <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mt-2">
                            ⚠️ Nota: Al registrar un nuevo usuario, la sesión de administrador actual se cerrará automáticamente por seguridad de Supabase.
                        </p>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans animate-fade-in text-stone-800">
            {isRegistering && <RegisterModal />}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">Gestión de Estudiantes</h1>
                <p className="text-stone-500">Administra matrículas, niveles y accesos</p>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar estudiante..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button onClick={loadStudents} className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100">
                        Recargar
                    </button>
                    <button onClick={() => setIsRegistering(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                        <UserPlus className="w-4 h-4" /> Inscribir Estudiante
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-stone-400">Cargando estudiantes...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-stone-400">No se encontraron estudiantes</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50">
                                <tr className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Estudiante</th>
                                    <th className="px-6 py-4">Curso/Nivel</th>
                                    <th className="px-6 py-4">Contacto Acudiente</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                    {(student.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-stone-900">{student.name}</div>
                                                    <div className="text-xs text-stone-400">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleUpdateLevel(student.id, student.level)}
                                                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold transition-colors flex items-center gap-2"
                                                title="Clic para cambiar curso"
                                            >
                                                {student.level || 'Sin asignar'}
                                                <Edit2 className="w-3 h-3 opacity-50" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-stone-600">
                                                {student.guardian_phone ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                        <CheckCircle className="w-3 h-3" /> {student.guardian_phone}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-400 italic text-xs">No registrado</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(student.id, student.name)}
                                                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Eliminar Estudiante"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManagement;
