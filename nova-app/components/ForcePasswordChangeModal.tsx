
import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { updateUserPassword, markPasswordChanged } from '../services/supabase';

interface ForcePasswordChangeModalProps {
    userId: string;
    onSuccess: () => void;
    language: 'es' | 'en' | 'bilingual';
}

const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({
    userId,
    onSuccess,
    language
}) => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isSpanish = language === 'es' || language === 'bilingual';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass.length < 6) {
            setError(isSpanish ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
            return;
        }
        if (newPass !== confirmPass) {
            setError(isSpanish ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Update Password in Auth
            await updateUserPassword(newPass);

            // 2. Mark as changed in Profile
            await markPasswordChanged(userId);

            onSuccess();
        } catch (err: any) {
            setError(err.message || (isSpanish ? 'Error al actualizar.' : 'Update failed.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border-4 border-indigo-500">

                {/* Header */}
                <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-indigo-400">
                        <ShieldCheck className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">
                        {isSpanish ? '¡Seguridad Primero!' : 'Security First!'}
                    </h2>
                    <p className="text-indigo-100 font-medium">
                        {isSpanish ? 'Tu profesor creó esta cuenta para ti. Por favor, crea una contraseña secreta.' : 'Your teacher created this account. Please create a secret password.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 ml-2 mb-1 uppercase tracking-wider">
                                {isSpanish ? 'Nueva Contraseña' : 'New Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 outline-none"
                                    placeholder="******"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-500 ml-2 mb-1 uppercase tracking-wider">
                                {isSpanish ? 'Confirmar Contraseña' : 'Confirm Password'}
                            </label>
                            <div className="relative">
                                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 outline-none"
                                    placeholder="******"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 font-bold text-sm animate-pulse">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {isSpanish ? 'Guardando...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                {isSpanish ? 'Guardar mi clave' : 'Save my password'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;
