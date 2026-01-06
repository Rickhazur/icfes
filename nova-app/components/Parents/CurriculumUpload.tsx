import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadCurriculumPlan, processCurriculumPlan, supabase } from '../../services/supabase';

export const CurriculumUpload = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type.startsWith('image/'))) {
            setFile(droppedFile);
        } else {
            toast.error('Please upload a PDF or Image file.');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file || !userId) {
            toast.error('Por favor inicia sesión primero');
            return;
        }

        setIsUploading(true);
        try {
            const planData = await uploadCurriculumPlan(userId, file, {
                title: `Plan ${new Date().toLocaleDateString('es')}`,
                schoolName: '',
                gradeLevel: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: ''
            });

            setUploadComplete(true);
            toast.success('¡Plan subido! Analizando temas con IA...');

            // Trigger AI processing in background
            processCurriculumPlan(planData.id, planData.original_file_url, 'es')
                .then(() => {
                    toast.success('✅ Temas extraídos exitosamente');
                })
                .catch((err) => {
                    console.error('Processing error:', err);
                    toast.error('Error al analizar el documento');
                });
        } catch (e: any) {
            console.error('Upload error:', e);
            toast.error(e.message || 'Error al subir. Intenta de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Nova Sync: Conexión Escolar</h1>
                <p className="text-slate-600">
                    Sube una foto o PDF del plan bimestral, cronograma de temas o boletín que envió el colegio.
                    Nova se sincronizará automáticamente para enseñar exactamente lo que tu hijo está viendo en clases esta semana.
                </p>
            </div>

            {!uploadComplete ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
border - 2 border - dashed rounded - xl p - 12 text - center transition - all cursor - pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
`}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {!file ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700">Sube el Plan Escolar</h3>
                                    <p className="text-slate-500 mt-1">Soporta PDF, JPG, PNG (Boletines, Temarios)</p>
                                </div>
                                <Button variant="outline" className="mt-2">Seleccionar Archivo</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">{file.name}</h3>
                                    <p className="text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Cambiar</Button>
                                    <Button onClick={(e) => { e.stopPropagation(); handleUpload(); }} disabled={isUploading}>
                                        {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Subir y Analizar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Success State - Analysis Preview Placeholder */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-green-800">¡Plan Recibido!</h3>
                            <p className="text-green-700">Estamos analizando el documento con IA para extraer los temas. Esto tomará unos segundos.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 opacity-75 grayscale animate-pulse">
                        <h3 className="text-lg font-semibold mb-4">Vista Previa del Plan (Simulación)</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 p-4 border rounded-lg">
                                    <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0" />
                                    <div className="space-y-2 w-full">
                                        <div className="h-4 bg-slate-200 rounded w-1/4" />
                                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => setUploadComplete(false)}>Subir otro</Button>
                    </div>
                </div>
            )}
        </div>
    );
};
