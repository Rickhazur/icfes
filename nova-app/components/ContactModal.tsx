
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContactModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onOpenChange }) => {
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        school: '',
        role: '',
        message: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.email || !formData.school || !formData.role) {
                toast.error('Por favor completa todos los campos obligatorios.');
                setIsLoading(false);
                return;
            }

            // Construct email HTML
            const emailHtml = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #4f46e5;">Nueva Solicitud de Demo</h2>
                    <p><strong>Nombre:</strong> ${formData.name}</p>
                    <p><strong>Email:</strong> ${formData.email}</p>
                    <p><strong>Colegio:</strong> ${formData.school}</p>
                    <p><strong>Cargo:</strong> ${formData.role}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Mensaje:</strong></p>
                    <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">${formData.message || 'Sin mensaje'}</p>
                </div>
            `;

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'novaschola25@gmail.com',
                    subject: `Solicitud de Demo - ${formData.school}`,
                    html: emailHtml
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al enviar el mensaje.');
            }

            toast.success('¡Solicitud enviada!', {
                description: 'Nos pondremos en contacto contigo pronto.'
            });

            setFormData({ name: '', email: '', school: '', role: '', message: '' });
            onOpenChange(false);

        } catch (err: any) {
            console.error(err);
            toast.error('Error al enviar', {
                description: err.message || 'Intenta nuevamente más tarde.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {/* FORCE WHITE BACKGROUND AND ENSURE OPACITY */}
            <DialogContent className="bg-white sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-100">
                <DialogHeader className="mb-4">
                    {/* Darker title text */}
                    <DialogTitle className="text-2xl font-bold text-center text-gray-900">Solicita una Demo</DialogTitle>
                    <DialogDescription className="text-center text-gray-600 font-medium">
                        Transforma tu colegio con Nova Schola.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold uppercase text-gray-700">Nombre *</Label>
                            <Input
                                id="name"
                                placeholder="Tu nombre"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-black"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="role" className="text-xs font-bold uppercase text-gray-700">Cargo *</Label>
                            <Select onValueChange={(val) => handleChange('role', val)}>
                                <SelectTrigger className="h-10 bg-gray-50 border-gray-200 text-black">
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="Rector/Director">Rector / Director</SelectItem>
                                    <SelectItem value="Coordinador">Coordinador</SelectItem>
                                    <SelectItem value="Docente">Docente</SelectItem>
                                    <SelectItem value="Padre">Padre de Familia</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* School */}
                    <div className="space-y-1.5">
                        <Label htmlFor="school" className="text-xs font-bold uppercase text-gray-700">Colegio *</Label>
                        <Input
                            id="school"
                            placeholder="Nombre de la institución"
                            value={formData.school}
                            onChange={(e) => handleChange('school', e.target.value)}
                            className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-black"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-bold uppercase text-gray-700">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tucorreo@colegio.edu.co"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-black"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-xs font-bold uppercase text-gray-700">Mensaje</Label>
                        <Textarea
                            id="message"
                            placeholder="¿Qué necesidades tienen?"
                            value={formData.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                            className="min-h-[80px] resize-none bg-gray-50 border-gray-200 focus:bg-white text-black"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Solicitar Demo'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ContactModal;
