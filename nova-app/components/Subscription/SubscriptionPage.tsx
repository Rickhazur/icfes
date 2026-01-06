import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Zap, Crown, Shield, Rocket, ArrowRight, MessageCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AvatarDisplay } from '../Gamification/AvatarDisplay';

interface SubscriptionPageProps {
    userName?: string;
    onClose?: () => void;
    currentPlan?: 'free' | 'standard' | 'premium';
}

const PLANS = [
    {
        id: 'explorer',
        name: 'Explorador',
        price: 49900,
        period: '/mes',
        description: 'La ayuda esencial para tareas puntuales.',
        icon: Rocket,
        color: 'blue',
        features: [
            'Tutor IA de Matemáticas y Ciencias',
            'Acceso Básico a la Arena',
            'Soporte para Tareas Escolares',
            'Voz Robótica (Navegador)',
            'Ayuda de Lunes a Viernes'
        ],
        notIncluded: [
            'Voz Humana (Lina)',
            'Mascotas Exclusivas',
            'Dashboard de Padres PRO',
            'Soporte Prioritario'
        ]
    },
    {
        id: 'adventurer',
        name: 'Aventurero',
        price: 89900,
        period: '/mes',
        description: 'El plan recomendado para familias comprometidas.',
        icon: Star,
        color: 'indigo',
        popular: true,
        features: [
            'Todo lo del Plan Explorador',
            'Voz Humana Premium (Lina)',
            'Dashboard de Padres PRO',
            'Reportes de Progreso Semanales',
            'Lobby Social con Amigos',
            '20 Interacciones de Voz/Día'
        ],
        notIncluded: [
            'Voz Humana ILIMITADA',
            'Mascotas Legendarias',
            'Acceso VIP a Eventos'
        ]
    },
    {
        id: 'legend',
        name: 'Leyenda',
        price: 149900,
        period: '/mes',
        description: 'La experiencia definitiva sin límites.',
        icon: Crown,
        color: 'amber',
        features: [
            'Todo lo del Plan Aventurero',
            'Voz Humana ILIMITADA',
            'Mascotas Legendarias (Dragones)',
            'Skins y Efectos Dorados',
            'Soporte Técnico VIP Prioritario',
            'Acceso Anticipado a Nuevos Juegos'
        ],
        notIncluded: []
    }
];

export function SubscriptionPage({ userName = 'Campeón', onClose, currentPlan = 'free' }: SubscriptionPageProps) {
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleSelectPlan = (plan: any) => {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("¡Copiado al portapapeles!");
    };

    const handleWhatsAppRedirect = () => {
        if (!selectedPlan) return;

        const message = `Hola Nova Schola! 🌟\n\nQuiero activar el *Plan ${selectedPlan.name}* para mi hijo/a *${userName}*.\n\nPrecio: $${selectedPlan.price.toLocaleString('es-CO')}\n\nAdjunto mi comprobante de pago aquí:`;
        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = "573166267846";
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        setShowPaymentModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-fredoka">
                        Elige tu Poder <span className="text-indigo-600">Premium</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Desbloquea el potencial completo de Nova Schola. Sin contratos forzosos, cancela cuando quieras.
                    </p>
                    {currentPlan === 'free' && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-1 text-sm animate-pulse">
                            Actualmente estás en el Modo de Prueba
                        </Badge>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {PLANS.map((plan) => (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -10 }}
                            className="relative"
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-0 right-0 flex justify-center z-10">
                                    <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-1.5 text-sm font-bold shadow-lg border-none uppercase tracking-widest">
                                        Más Popular
                                    </Badge>
                                </div>
                            )}

                            <Card className={cn(
                                "rounded-[2.5rem] overflow-hidden border transition-all duration-300 relative",
                                plan.popular ? "shadow-2xl border-indigo-200 ring-4 ring-indigo-50" : "shadow-xl border-slate-100 hover:border-slate-300",
                                plan.id === 'legend' ? "bg-slate-900 text-white" : "bg-white"
                            )}>
                                {/* Decorative BG for Legend */}
                                {plan.id === 'legend' && (
                                    <>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
                                    </>
                                )}

                                <CardHeader className="text-center pb-2 relative z-10">
                                    <div className={cn(
                                        "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-lg",
                                        plan.id === 'explorer' ? "bg-blue-100 text-blue-600" :
                                            plan.id === 'adventurer' ? "bg-indigo-100 text-indigo-600" :
                                                "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    )}>
                                        <plan.icon className="w-8 h-8" />
                                    </div>
                                    <CardTitle className={cn("text-2xl font-black font-fredoka", plan.id === 'legend' ? "text-white" : "text-slate-900")}>
                                        {plan.name}
                                    </CardTitle>
                                    <p className={cn("text-sm font-medium h-10", plan.id === 'legend' ? "text-slate-400" : "text-slate-500")}>
                                        {plan.description}
                                    </p>
                                </CardHeader>

                                <CardContent className="space-y-8 relative z-10">
                                    <div className="text-center">
                                        <span className={cn("text-4xl font-black", plan.id === 'legend' ? "text-white" : "text-slate-900")}>
                                            ${plan.price.toLocaleString('es-CO')}
                                        </span>
                                        <span className={cn("text-sm", plan.id === 'legend' ? "text-slate-500" : "text-slate-400")}>
                                            {plan.period}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3 text-left">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                    plan.id === 'legend' ? "bg-emerald-500/20 text-emerald-400" :
                                                        plan.popular ? "bg-indigo-100 text-indigo-600" : "bg-blue-50 text-blue-500"
                                                )}>
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </div>
                                                <span className={cn("text-sm font-medium leading-tight", plan.id === 'legend' ? "text-slate-300" : "text-slate-600")}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}

                                        {plan.notIncluded.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3 text-left opacity-40">
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 text-slate-400">
                                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                                </div>
                                                <span className={cn("text-sm text-slate-500 leading-tight")}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 relative z-10">
                                    <Button
                                        className={cn(
                                            "w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all transform hover:scale-[1.02]",
                                            plan.id === 'legend'
                                                ? "bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black border-none"
                                                : plan.popular
                                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    : "bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-500 shadow-none"
                                        )}
                                        onClick={() => handleSelectPlan(plan)}
                                    >
                                        Elegir {plan.name}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center text-slate-400 text-sm">
                    <p>Todos los precios están en Pesos Colombianos (COP). Pagos seguros vía Bancolombia/Nequi.</p>
                    <p>¿Necesitas ayuda? <button className="text-indigo-500 underline hover:text-indigo-700 font-bold">Contactar Soporte</button></p>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl bg-white">
                    <DialogHeader className="text-center space-y-4">
                        <div className={cn(
                            "w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl",
                            selectedPlan?.id === 'legend' ? "bg-amber-100 text-amber-500" : "bg-indigo-100 text-indigo-500"
                        )}>
                            {selectedPlan?.icon && React.createElement(selectedPlan.icon, { className: "w-10 h-10" })}
                        </div>
                        <DialogTitle className="text-2xl font-black text-slate-800">
                            Activar Plan {selectedPlan?.name}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-base">
                            Estás a un paso de darle superpoderes educativos a {userName}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 my-6">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600" />

                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                            <p className="text-4xl font-black text-slate-900">${selectedPlan?.price.toLocaleString('es-CO')}</p>

                            <div className="space-y-3 pt-2">
                                <p className="text-xs font-bold text-slate-500">Transfiere a:</p>

                                {/* Nequi */}
                                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                                    <div className="text-left">
                                        <p className="font-black text-indigo-900">316 626 7846</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Nequi</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => copyToClipboard('3166267846')}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Bancolombia */}
                                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                                    <div className="text-left">
                                        <p className="font-black text-indigo-900">634-524461-99</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Ahorros Bancolombia - Ricardo Torres</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => copyToClipboard('63452446199')}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-xs text-slate-400 px-4">
                            Una vez realizada la transferencia, envíanos el comprobante por WhatsApp para activar tu cuenta inmediatamente.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#1da851] text-white text-lg font-bold shadow-lg shadow-green-200 gap-2"
                            onClick={handleWhatsAppRedirect}
                        >
                            <MessageCircle className="w-5 h-5 fill-current" />
                            Enviar Comprobante
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default SubscriptionPage;
