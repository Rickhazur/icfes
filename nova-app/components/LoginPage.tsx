import React, { useState } from 'react';
import { Brain, Smartphone, ShieldCheck, Eye, EyeOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerStudent } from '../services/supabase';
import { Toaster, toast } from 'sonner';
import { AvatarDisplay } from './Gamification/AvatarDisplay';

interface LoginPageProps {
    onLogin: (data: any, mode: 'STUDENT' | 'ADMIN' | 'PARENT') => void;
    onBack: () => void;
    defaultMode?: 'STUDENT' | 'ADMIN' | 'PARENT';
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack, defaultMode = 'STUDENT' }) => {
    const [mode, setMode] = useState<'STUDENT' | 'ADMIN' | 'PARENT'>(defaultMode);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        studentName: '',
        studentEmail: '',
        studentPassword: ''
    });
    const [language, setLanguage] = useState<'es' | 'en'>('es');
    const [loading, setLoading] = useState(false);

    const [savedAvatarId, setSavedAvatarId] = useState<string | null>(() => {
        return localStorage.getItem('nova_avatar_id');
    });

    const t = {
        es: {
            back: "Volver",
            student: "Estudiante",
            admin: "Administrativo",
            parent: "Padres",
            welcomeLogin: "Bienvenido de vuelta",
            welcomeRegister: "Crear Cuenta",
            subtitleLogin: mode === 'PARENT' ? "Supervisa el progreso de tu hijo" : "Accede a tu tutoría personalizada",
            subtitleRegister: mode === 'PARENT' ? "Crea tu cuenta de padre y la de tu hijo" : "Empieza tu viaje de aprendizaje",
            studentEmail: "Correo del Estudiante",
            email: "Correo electrónico",
            studentName: "Nombre del Estudiante",
            password: "Contraseña",
            loginButton: "Iniciar Sesión",
            registerButton: "Crear Cuenta",
            forgotPass: "¿Olvidaste tu contraseña?",
            noAccount: "¿No tienes cuenta?",
            hasAccount: "¿Ya tienes cuenta?",
            createAccount: "Crear cuenta",
            loginLink: "Inicia sesión",
            placeholderEmail: "nombre@ejemplo.com",
            placeholderName: "Juan Pérez",
            placeholderPass: "••••••••",
            parentName: "Nombre del Padre",
            parentEmail: "Correo del Padre",
            studentInfo: "Información del Estudiante",
            parentInfo: "Información del Padre"
        },
        en: {
            back: "Back",
            student: "Student",
            admin: "Admin",
            parent: "Parents",
            welcomeLogin: "Welcome Back",
            welcomeRegister: "Create Account",
            subtitleLogin: mode === 'PARENT' ? "Monitor your child's progress" : "Access your personalized tutoring",
            subtitleRegister: mode === 'PARENT' ? "Create your parent account and your child's account" : "Start your learning journey",
            studentEmail: "Student Email",
            email: "Email Address",
            studentName: "Student Name",
            password: "Password",
            loginButton: "Login",
            registerButton: "Create Account",
            forgotPass: "Forgot password?",
            noAccount: "Don't have an account?",
            hasAccount: "Already have an account?",
            createAccount: "Create account",
            loginLink: "Login",
            placeholderEmail: "name@example.com",
            placeholderName: "John Doe",
            placeholderPass: "••••••••",
            parentName: "Parent Name",
            parentEmail: "Parent Email",
            studentInfo: "Student Information",
            parentInfo: "Parent Information"
        }
    };

    const text = t[language];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegistering && mode === 'STUDENT') {
                const result = await registerStudent({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                });

                if (result.session) {
                    toast.success(language === 'es' ? "Cuenta creada exitosamente" : "Account created successfully");
                    onLogin(formData, mode);
                } else {
                    toast.message(
                        language === 'es' ? "Cuenta creada. Por favor verifica tu correo." : "Account created. Please verify your email.",
                        { description: language === 'es' ? "Hemos enviado un enlace de confirmación." : "We sent a confirmation link." }
                    );
                    setIsRegistering(false);
                }
            } else if (isRegistering && mode === 'PARENT') {
                if (!formData.name.trim() || !formData.studentName.trim() || !formData.studentEmail.trim()) {
                    toast.error(language === 'es' ? "Todos los campos son obligatorios" : "All fields are required");
                    setLoading(false);
                    return;
                }

                const { registerParentAndStudent } = await import('../services/supabase');
                const result = await registerParentAndStudent({
                    parentEmail: formData.email,
                    parentPassword: formData.password,
                    parentName: formData.name,
                    studentEmail: formData.studentEmail,
                    studentPassword: formData.studentPassword || formData.password,
                    studentName: formData.studentName
                });

                if (result.success) {
                    if (result.session) {
                        toast.success(language === 'es' ? "¡Cuentas creadas! Bienvenido." : "Accounts created! Welcome.");
                        onLogin({ email: formData.email, password: formData.password }, 'PARENT');
                    } else {
                        // Email confirmation is likely required
                        toast.message(
                            language === 'es' ? "Cuentas creadas exitosamente" : "Accounts created successfully",
                            {
                                description: language === 'es'
                                    ? "Por favor revisa el correo del Padre para confirmar la cuenta antes de iniciar sesión."
                                    : "Please check the Parent email to confirm the account before logging in."
                            }
                        );
                        setIsRegistering(false);
                    }
                } else {
                    toast.error(language === 'es' ? "Error al crear las cuentas" : "Error creating accounts");
                }
            } else {
                onLogin(formData, mode);
            }
        } catch (error: any) {
            console.error("Auth error:", error);

            // Mensajes de error específicos y amigables
            let msg = error.message || (language === 'es' ? "Error en autenticación" : "Authentication error");

            if (error.message?.includes('Anonymous sign-ins are disabled')) {
                msg = language === 'es'
                    ? "⚠️ Configuración de Supabase incompleta. Por favor contacta al administrador para habilitar el registro de usuarios."
                    : "⚠️ Supabase configuration incomplete. Please contact the administrator to enable user registration.";
            } else if (error.message?.includes('Email address') && error.message?.includes('invalid')) {
                msg = language === 'es'
                    ? "❌ El correo electrónico no es válido. Por favor usa un correo real (ej: @gmail.com)"
                    : "❌ The email address is invalid. Please use a real email (e.g., @gmail.com)";
            } else if (error.message?.includes('Email not confirmed')) {
                msg = language === 'es'
                    ? "📧 Tu correo no ha sido verificado. Revisa tu bandeja de entrada y spam."
                    : "📧 Your email has not been verified. Check your inbox and spam folder.";
            } else if (error.message?.includes('Invalid login credentials')) {
                msg = language === 'es'
                    ? "🔒 Correo o contraseña incorrectos. Inténtalo de nuevo."
                    : "🔒 Incorrect email or password. Try again.";
            } else if (error.message?.includes('User already registered')) {
                msg = language === 'es'
                    ? "👤 Este correo ya está registrado. Intenta iniciar sesión."
                    : "👤 This email is already registered. Try logging in.";
            }

            toast.error(msg, {
                duration: 6000,
                description: language === 'es'
                    ? "Si el problema persiste, contacta a soporte."
                    : "If the problem persists, contact support."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-50 flex flex-col lg:flex-row relative overflow-hidden font-poppins selection:bg-indigo-200 selection:text-indigo-900">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px]" />
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-6 left-6 z-50 text-stone-500 hover:text-indigo-600 transition-colors flex items-center gap-2 font-medium"
            >
                ← {text.back}
            </button>

            {/* Language Toggle (Top Right) */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')}
                    className="flex items-center gap-2 bg-white/80 border border-stone-200 rounded-full px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
                >
                    <Globe className="w-4 h-4" />
                    <span>{language === 'es' ? 'Español' : 'English'}</span>
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 lg:pl-20">
                <div className="max-w-md text-center lg:text-left">
                    {savedAvatarId ? (
                        <div className="mb-8 mx-auto lg:mx-0 animate-float flex justify-center lg:justify-start">
                            <AvatarDisplay avatarId={savedAvatarId} size="xl" showBackground={false} className="drop-shadow-2xl" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 mb-8 mx-auto lg:mx-0 animate-float">
                            <Brain className="w-12 h-12 text-white" />
                        </div>
                    )}

                    <h1 className="text-5xl font-bold text-stone-900 mb-2 tracking-tight">
                        Nova Schola
                    </h1>
                    <p className="text-xl text-indigo-600 font-medium mb-12">
                        {language === 'es' ? 'La Educación del Futuro' : 'The Future of Education'}
                    </p>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[480px]">

                    {/* Role Toggle Switch */}
                    <div className="bg-white p-1.5 rounded-full flex mb-8 border border-stone-200 shadow-sm">
                        <button
                            onClick={() => { setMode('STUDENT'); setIsRegistering(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'STUDENT'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <Smartphone className="w-4 h-4" />
                            {text.student}
                        </button>
                        <button
                            onClick={() => { setMode('ADMIN'); setIsRegistering(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'ADMIN'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            {text.admin}
                        </button>
                        <button
                            onClick={() => { setMode('PARENT'); setIsRegistering(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'PARENT'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <Brain className="w-4 h-4" />
                            {text.parent}
                        </button>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/80 backdrop-blur-xl border border-stone-200 rounded-3xl p-8 shadow-xl">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-2">
                                {isRegistering ? text.welcomeRegister : text.welcomeLogin}
                            </h2>
                            <p className="text-stone-500 text-sm">
                                {isRegistering ? text.subtitleRegister : text.subtitleLogin}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {isRegistering && mode === 'PARENT' && (
                                <div className="space-y-6">
                                    {/* Parent Info Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-bold text-stone-800 uppercase tracking-wider">{text.parentInfo}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentName}</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder={text.placeholderName}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentEmail}</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder={text.placeholderEmail}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.password} (Padre)</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    {/* Student Info Section */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                                            <Brain className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-bold text-stone-800 uppercase tracking-wider">{text.studentInfo}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.studentName}</label>
                                            <input
                                                type="text"
                                                value={formData.studentName}
                                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder={text.placeholderName}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.studentEmail}</label>
                                            <input
                                                type="email"
                                                value={formData.studentEmail}
                                                onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                                required
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder="estudiante@ejemplo.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.password} (Estudiante)</label>
                                            <input
                                                type="password"
                                                value={formData.studentPassword}
                                                onChange={(e) => setFormData({ ...formData, studentPassword: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Original Fields (Only if not dual register) */}
                            {(!isRegistering || mode !== 'PARENT') && (
                                <>
                                    {/* Student Name Key Field (Only Register Mode) */}
                                    {isRegistering && mode === 'STUDENT' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                                {text.studentName}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-stone-400"
                                                placeholder={text.placeholderName}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                            {mode === 'STUDENT' ? text.studentEmail : text.email}
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-stone-400"
                                            placeholder={text.placeholderEmail}
                                        />
                                    </div>

                                    {/* Removed guardianPhone section */}
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                    {text.password}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-stone-400"
                                        placeholder={text.placeholderPass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 text-base mt-2 disabled:opacity-50"
                            >
                                {loading ? '...' : (isRegistering ? text.registerButton : text.loginButton)}
                            </Button>

                            <div className="flex flex-col items-center gap-4 mt-6">
                                {!isRegistering && (
                                    <button type="button" className="text-sm text-stone-400 hover:text-indigo-600 transition-colors">
                                        {text.forgotPass}
                                    </button>
                                )}

                                {mode === 'STUDENT' && (
                                    <div className="flex items-center gap-1 text-sm text-stone-500">
                                        <span>{isRegistering ? text.hasAccount : text.noAccount}</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsRegistering(!isRegistering)}
                                            className="text-indigo-600 font-bold hover:underline"
                                        >
                                            {isRegistering ? text.loginLink : text.createAccount}
                                        </button>
                                    </div>
                                )}

                                {mode === 'PARENT' && !isRegistering && (
                                    <div className="flex items-center gap-1 text-sm text-stone-500">
                                        <span>{text.noAccount}</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsRegistering(true)}
                                            className="text-indigo-600 font-bold hover:underline"
                                        >
                                            {text.createAccount}
                                        </button>
                                    </div>
                                )}

                                {mode === 'PARENT' && isRegistering && (
                                    <div className="flex items-center gap-1 text-sm text-stone-500">
                                        <span>{text.hasAccount}</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsRegistering(false)}
                                            className="text-indigo-600 font-bold hover:underline"
                                        >
                                            {text.loginLink}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Toaster />
        </div >
    );
};

export default LoginPage;
