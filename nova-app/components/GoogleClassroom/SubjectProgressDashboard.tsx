import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Calendar, Award } from 'lucide-react';
import { getGoogleClassroomAssignments, supabase } from '../../services/supabase';

interface SubjectProgress {
    subject: string;
    total: number;
    completed: number;
    pending: number;
    percentage: number;
    avgScore?: number;
}

export const SubjectProgressDashboard = () => {
    const [progress, setProgress] = useState<SubjectProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                await loadProgress(user.id);
            }
        };
        init();
    }, []);

    const loadProgress = async (uid: string) => {
        setLoading(true);
        try {
            const assignments = await getGoogleClassroomAssignments(uid);

            // Group by subject
            const subjectMap = new Map<string, any[]>();

            assignments.forEach((assignment: any) => {
                const courseName = assignment.google_classroom_courses?.name || 'General';
                const subject = detectSubject(courseName, assignment.title);

                if (!subjectMap.has(subject)) {
                    subjectMap.set(subject, []);
                }
                subjectMap.get(subject)!.push(assignment);
            });

            // Calculate progress for each subject
            const progressData: SubjectProgress[] = Array.from(subjectMap.entries()).map(([subject, items]) => {
                const completed = items.filter(a => a.synced_to_mission).length;
                const total = items.length;
                const pending = total - completed;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                return {
                    subject,
                    total,
                    completed,
                    pending,
                    percentage
                };
            });

            setProgress(progressData.sort((a, b) => b.total - a.total));
        } catch (e) {
            console.error('Failed to load progress:', e);
        } finally {
            setLoading(false);
        }
    };

    const detectSubject = (courseName: string, title: string): string => {
        const text = `${courseName} ${title}`.toLowerCase();

        if (text.includes('math') || text.includes('matemática')) return 'Matemáticas';
        if (text.includes('english') || text.includes('inglés')) return 'Inglés';
        if (text.includes('science') || text.includes('ciencia')) return 'Ciencias';
        if (text.includes('social') || text.includes('historia')) return 'Sociales';
        if (text.includes('art') || text.includes('arte')) return 'Arte';
        if (text.includes('physical') || text.includes('educación física')) return 'Ed. Física';

        return courseName;
    };

    const getSubjectColor = (subject: string): string => {
        const colors: Record<string, string> = {
            'Matemáticas': 'blue',
            'Inglés': 'purple',
            'Ciencias': 'green',
            'Sociales': 'orange',
            'Arte': 'pink',
            'Ed. Física': 'red'
        };
        return colors[subject] || 'slate';
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-slate-500 mt-4">Cargando progreso...</p>
            </div>
        );
    }

    if (progress.length === 0) {
        return (
            <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No hay datos de progreso aún.</p>
                <p className="text-sm text-slate-500 mt-2">Sincroniza Google Classroom para ver tu progreso.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Progreso por Materia</h2>
                <p className="text-slate-600">Tu desempeño en cada asignatura</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {progress.map((subject) => {
                    const color = getSubjectColor(subject.subject);

                    return (
                        <div
                            key={subject.subject}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800">{subject.subject}</h3>
                                <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
                                    <BookOpen className={`w-5 h-5 text-${color}-600`} />
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-slate-600 mb-2">
                                    <span>Progreso</span>
                                    <span className="font-semibold">{subject.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${subject.percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-50 rounded-lg p-2">
                                    <div className="text-2xl font-bold text-slate-800">{subject.total}</div>
                                    <div className="text-xs text-slate-500">Total</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-2">
                                    <div className="text-2xl font-bold text-green-600">{subject.completed}</div>
                                    <div className="text-xs text-green-600">Hechas</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-2">
                                    <div className="text-2xl font-bold text-orange-600">{subject.pending}</div>
                                    <div className="text-xs text-orange-600">Pendientes</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Overall Stats */}
            <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8" />
                    <h3 className="text-xl font-bold">Resumen General</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-3xl font-bold">{progress.reduce((sum, s) => sum + s.total, 0)}</div>
                        <div className="text-blue-100 text-sm">Tareas Totales</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{progress.reduce((sum, s) => sum + s.completed, 0)}</div>
                        <div className="text-blue-100 text-sm">Completadas</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{progress.length}</div>
                        <div className="text-blue-100 text-sm">Materias</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">
                            {Math.round(
                                progress.reduce((sum, s) => sum + s.percentage, 0) / progress.length
                            )}%
                        </div>
                        <div className="text-blue-100 text-sm">Promedio</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
