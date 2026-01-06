import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuardianGuardProps {
    studentName: string;
}

export const GuardianGuard: React.FC<GuardianGuardProps> = ({ studentName }) => {
    const [showAlert, setShowAlert] = useState(false);
    const [blockedUrl, setBlockedUrl] = useState('');

    useEffect(() => {
        // 1. Detect click on external links
        const handleExternalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.href && !anchor.href.includes(window.location.hostname) && !anchor.href.startsWith('mailto:')) {
                e.preventDefault();
                setBlockedUrl(anchor.href);
                setShowAlert(true);

                // Alert the parent immediately
                sendAlertToParent(`🛡️ SEÑAL DE ALERTA: ${studentName} intentó salir de la plataforma hacia: ${anchor.href}`);
            }
        };

        // 2. Detect Tab Switching (Blur)
        const handleBlur = () => {
            // Only alert if we're not already showing the modal (to avoid double alerts)
            if (!showAlert) {
                sendAlertToParent(`⚠️ DISTRACCIÓN DETECTADA: ${studentName} cambió de pestaña o minimizó el programa.`);
            }
        };

        // 3. Detect Tab/Window Closing
        const handleUnload = () => {
            sendAlertToParent(`🚪 FIN DE SESIÓN: ${studentName} cerró la aplicación o la pestaña del navegador.`);
        };

        document.addEventListener('click', handleExternalClick);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            document.removeEventListener('click', handleExternalClick);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [studentName, showAlert]);

    const sendAlertToParent = (message: string) => {
        const alerts = JSON.parse(localStorage.getItem('nova_alerts') || '[]');
        const newAlert = {
            id: Date.now(),
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: 'high'
        };
        localStorage.setItem('nova_alerts', JSON.stringify([newAlert, ...alerts]));
    };

    return (
        <AnimatePresence>
            {showAlert && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border-4 border-red-500"
                    >
                        <div className="bg-red-500 p-6 text-white text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Zona Protegida</h2>
                            <p className="text-red-100 font-bold opacity-90">Entorno de Aprendizaje Seguro</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-100">
                                <div className="p-2 bg-amber-100 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-amber-900 leading-tight">Acceso Restringido</p>
                                    <p className="text-sm text-amber-700">
                                        Has intentado salir de <b>Nova Schola</b>. Por seguridad, no permitimos visitas a sitios externos sin supervisión.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-xl text-center space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sitio Bloqueado:</p>
                                <p className="text-xs font-mono text-stone-500 truncate bg-white p-2 rounded border border-stone-200">
                                    {blockedUrl}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 italic">
                                <Lock className="w-5 h-5 text-indigo-500" />
                                <p className="text-xs text-indigo-700 font-medium">
                                    "Papá y Mamá han recibido un aviso sobre este intento para que puedan ayudarte."
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    onClick={() => setShowAlert(false)}
                                    className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-black shadow-lg shadow-red-200"
                                >
                                    VOLVER AL ESTUDIO
                                </Button>
                                <button
                                    onClick={() => setShowAlert(false)}
                                    className="text-stone-400 text-sm font-bold hover:text-stone-600 py-2"
                                >
                                    Reportar Error
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
