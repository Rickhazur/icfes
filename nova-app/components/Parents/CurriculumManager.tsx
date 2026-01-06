import React, { useState, useEffect } from 'react';
import { Calendar, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCurriculumPlans, supabase } from '../../services/supabase';

interface Topic {
    id: string;
    week_number: number;
    topic_name: string;
    mapped_internal_topic: string;
    start_date: string | null;
    status: string;
}

export const CurriculumManager = ({ studentId }: { studentId: string }) => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedDate, setEditedDate] = useState('');

    useEffect(() => {
        loadTopics();
    }, [studentId]);

    const loadTopics = async () => {
        try {
            const plans = await getCurriculumPlans(studentId);
            if (plans.length > 0 && plans[0].curriculum_topics) {
                setTopics(plans[0].curriculum_topics);
            }
        } catch (e) {
            console.error('Failed to load topics:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDate = async (topicId: string) => {
        if (!supabase || !editedDate) return;

        try {
            const { error } = await supabase
                .from('curriculum_topics')
                .update({ start_date: editedDate })
                .eq('id', topicId);

            if (error) throw error;

            toast.success('Fecha actualizada');
            setEditingId(null);
            loadTopics();
        } catch (e: any) {
            toast.error('Error al actualizar: ' + e.message);
        }
    };

    const handlePostpone = async (topicId: string) => {
        if (!supabase) return;

        try {
            const topic = topics.find(t => t.id === topicId);
            if (!topic?.start_date) return;

            const currentDate = new Date(topic.start_date);
            currentDate.setDate(currentDate.getDate() + 7); // Postpone 1 week
            const newDate = currentDate.toISOString().split('T')[0];

            const { error } = await supabase
                .from('curriculum_topics')
                .update({ start_date: newDate })
                .eq('id', topicId);

            if (error) throw error;

            toast.success('Tema pospuesto 1 semana');
            loadTopics();
        } catch (e: any) {
            toast.error('Error: ' + e.message);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Cargando plan...</div>;
    }

    if (topics.length === 0) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No hay plan cargado aún.</p>
                <p className="text-sm text-slate-500 mt-2">Sube un plan escolar primero en "Nova Sync".</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestionar Plan Escolar</h2>
                <p className="text-slate-600">Ajusta las fechas si el colegio cambia el cronograma.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {topics.map((topic) => (
                        <div key={topic.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            Semana {topic.week_number}
                                        </span>
                                        <h3 className="font-semibold text-slate-800">{topic.topic_name}</h3>
                                    </div>

                                    {editingId === topic.id ? (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <input
                                                type="date"
                                                value={editedDate}
                                                onChange={(e) => setEditedDate(e.target.value)}
                                                className="border border-slate-300 rounded px-2 py-1 text-sm"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateDate(topic.id)}
                                                className="h-7"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingId(null)}
                                                className="h-7"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {topic.start_date
                                                    ? new Date(topic.start_date).toLocaleDateString('es', {
                                                        day: 'numeric',
                                                        month: 'long'
                                                    })
                                                    : 'Sin fecha'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {editingId !== topic.id && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingId(topic.id);
                                                setEditedDate(topic.start_date || '');
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handlePostpone(topic.id)}
                                        >
                                            Posponer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
