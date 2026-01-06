import React, { useState, useEffect } from 'react';
import { Send, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from '../../hooks/use-toast';
import { generateReportPDF, submitReportToClassroom, getAvailableAssignments } from '../../../../../services/reportSubmission';
import { refreshAccessToken } from '../../../../../services/googleClassroom';
import { supabase, getGoogleTokens } from '../../../../../services/supabase';
import { recordQuestCompletion } from '../../../../../services/learningProgress';
import { useGamification } from '../../../../../context/GamificationContext';
import type { Language } from '../../types/research';

interface ReportSubmissionDialogProps {
    reportTitle: string;
    reportContent: string;
    studentName: string;
    grade: number;
    sources: Array<{ title: string; url: string; author?: string }>;
    language: Language;
    disabled?: boolean;
}

export function ReportSubmissionDialog({
    reportTitle,
    reportContent,
    studentName,
    grade,
    sources,
    language,
    disabled
}: ReportSubmissionDialogProps) {
    const { addXP, addCoins } = useGamification();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<string>('');
    const [assignments, setAssignments] = useState<Array<{
        id: string;
        courseId: string;
        courseWorkId: string;
        title: string;
        courseName: string;
    }>>([]);
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            loadAssignments();
        }
    }, [isOpen]);

    const loadAssignments = async () => {
        if (!supabase) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            // Get Google tokens
            const tokens = await getGoogleTokens(user.id);
            if (!tokens) {
                toast({
                    title: language === 'es' ? 'No conectado' : 'Not connected',
                    description: language === 'es'
                        ? 'Debes conectar tu cuenta de Google Classroom primero.'
                        : 'You need to connect your Google Classroom account first.',
                    variant: 'destructive'
                });
                return;
            }

            // Check if token expired and refresh if needed
            let accessToken = tokens.access_token;
            if (new Date(tokens.expires_at) < new Date()) {
                const newTokens = await refreshAccessToken(tokens.refresh_token);
                accessToken = newTokens.access_token;
            }

            // Fetch available assignments
            const availableAssignments = await getAvailableAssignments(accessToken, user.id);
            setAssignments(availableAssignments.map((a, idx) => ({
                id: `${a.courseId}_${a.courseWorkId}`,
                courseId: a.courseId,
                courseWorkId: a.courseWorkId,
                title: a.title,
                courseName: a.courseName
            })));

        } catch (error) {
            console.error('Error loading assignments:', error);
            toast({
                title: language === 'es' ? 'Error' : 'Error',
                description: language === 'es'
                    ? 'No se pudieron cargar las tareas.'
                    : 'Could not load assignments.',
                variant: 'destructive'
            });
        }
    };

    const handleSubmit = async () => {
        if (!selectedAssignment || !userId) return;

        setIsSubmitting(true);

        try {
            // Generate PDF
            const pdfBlob = await generateReportPDF({
                title: reportTitle || (language === 'es' ? 'Reporte de Investigación' : 'Research Report'),
                studentName,
                grade,
                content: reportContent,
                sources,
                language,
                date: new Date()
            });

            // Get tokens
            const tokens = await getGoogleTokens(userId);
            if (!tokens) throw new Error('No Google tokens found');

            let accessToken = tokens.access_token;
            if (new Date(tokens.expires_at) < new Date()) {
                const newTokens = await refreshAccessToken(tokens.refresh_token);
                accessToken = newTokens.access_token;
            }

            // Find selected assignment details
            const assignment = assignments.find(a => a.id === selectedAssignment);
            if (!assignment) throw new Error('Assignment not found');

            // Submit to Google Classroom
            const success = await submitReportToClassroom(
                accessToken,
                assignment.courseId,
                assignment.courseWorkId,
                pdfBlob,
                reportTitle || (language === 'es' ? 'Reporte de Investigación' : 'Research Report')
            );

            if (success) {
                // Award XP and Coins
                addXP(100);
                addCoins(50, language === 'es' ? '¡Gran reporte de investigación!' : 'Great research report!');

                // Record detailed learning progress
                await recordQuestCompletion(userId, `research_${assignment.courseWorkId}`, {
                    title: reportTitle || (language === 'es' ? 'Reporte de Investigación' : 'Research Report'),
                    category: 'science', // Research is mostly science/socials
                    difficulty: grade >= 4 ? 'hard' : grade >= 3 ? 'medium' : 'easy',
                    wasCorrect: true,
                    coinsEarned: 50,
                    xpEarned: 100
                });

                toast({
                    title: language === 'es' ? '¡Enviado!' : 'Submitted!',
                    description: language === 'es'
                        ? 'Tu reporte ha sido enviado a Google Classroom exitosamente.'
                        : 'Your report has been submitted to Google Classroom successfully.',
                });
                setIsOpen(false);
            } else {
                throw new Error('Submission failed');
            }

        } catch (error) {
            console.error('Error submitting report:', error);
            toast({
                title: language === 'es' ? 'Error' : 'Error',
                description: language === 'es'
                    ? 'Hubo un problema al enviar tu reporte. Intenta de nuevo.'
                    : 'There was a problem submitting your report. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = reportContent.trim().length >= 100; // Minimum 100 characters

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={disabled || !canSubmit}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg disabled:opacity-50"
                >
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Enviar a Classroom' : 'Submit to Classroom'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        {language === 'es' ? 'Enviar Reporte' : 'Submit Report'}
                    </DialogTitle>
                    <DialogDescription>
                        {language === 'es'
                            ? 'Selecciona la tarea de Google Classroom a la que quieres enviar este reporte.'
                            : 'Select the Google Classroom assignment you want to submit this report to.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Report Preview */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h4 className="font-semibold text-sm text-slate-700 mb-2">
                            {language === 'es' ? 'Vista Previa' : 'Preview'}
                        </h4>
                        <div className="space-y-1 text-xs text-slate-600">
                            <p><strong>{language === 'es' ? 'Título:' : 'Title:'}</strong> {reportTitle || (language === 'es' ? 'Sin título' : 'Untitled')}</p>
                            <p><strong>{language === 'es' ? 'Palabras:' : 'Words:'}</strong> {reportContent.split(/\s+/).filter(w => w.length > 0).length}</p>
                            <p><strong>{language === 'es' ? 'Fuentes:' : 'Sources:'}</strong> {sources.length}</p>
                        </div>
                    </div>

                    {/* Assignment Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {language === 'es' ? 'Seleccionar Tarea' : 'Select Assignment'}
                        </label>
                        {assignments.length === 0 ? (
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                <AlertCircle className="w-4 h-4" />
                                {language === 'es'
                                    ? 'No hay tareas pendientes. Sincroniza tu Google Classroom primero.'
                                    : 'No pending assignments. Sync your Google Classroom first.'}
                            </div>
                        ) : (
                            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                                <SelectTrigger>
                                    <SelectValue placeholder={language === 'es' ? 'Elegir tarea...' : 'Choose assignment...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignments.map((assignment) => (
                                        <SelectItem key={assignment.id} value={assignment.id}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{assignment.title}</span>
                                                <span className="text-xs text-slate-500">{assignment.courseName}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedAssignment || isSubmitting || assignments.length === 0}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {language === 'es' ? 'Enviando...' : 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {language === 'es' ? 'Enviar Reporte' : 'Submit Report'}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
