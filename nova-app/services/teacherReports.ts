/**
 * Teacher Reporting Service
 * Generates automated weekly progress reports for teachers
 */

import { supabase } from './supabase';

// ============================================
// TYPES
// ============================================

export interface WeeklyReportData {
    studentId: string;
    teacherId: string;
    weekStart: Date;
    weekEnd: Date;
}

export interface StudentProgress {
    totalStudyTime: number; // minutes
    activeDays: number;
    topicsStudied: number;
    avgComprehension: number;
    mathMetrics: SubjectMetrics;
    englishMetrics: SubjectMetrics;
    scienceMetrics: SubjectMetrics;
}

export interface SubjectMetrics {
    topicsCompleted: number;
    averageScore: number;
    timeSpent: number;
    topics: TopicProgress[];
}

export interface TopicProgress {
    name: string;
    score: number;
    attempts: number;
    lastAttempt: Date;
}

export interface Strength {
    topic: string;
    score: number;
    subject: string;
}

export interface Improvement {
    topic: string;
    score: number;
    recommendation: string;
    subject: string;
}

export interface AIRecommendation {
    priority: 'high' | 'medium' | 'low';
    topic: string;
    recommendation: string;
}

// ============================================
// MAIN FUNCTION: Generate Weekly Report
// ============================================

export async function generateWeeklyReport(data: WeeklyReportData) {
    try {
        console.log(`📊 Generating report for student ${data.studentId}...`);

        // 1. Get student progress data
        const progress = await getStudentProgress(
            data.studentId,
            data.weekStart,
            data.weekEnd
        );

        // 2. Calculate metrics
        const metrics = calculateMetrics(progress);

        // 3. Identify strengths (top 3 topics with >85%)
        const strengths = identifyStrengths(metrics);

        // 4. Identify areas for improvement (topics with <60%)
        const improvements = await identifyImprovements(metrics);

        // 5. Generate AI recommendations
        const aiRecommendations = await generateAIRecommendations({
            strengths,
            improvements,
            studentId: data.studentId
        });

        // 6. Save report to database
        const { data: report, error } = await supabase
            .from('teacher_reports')
            .insert({
                student_id: data.studentId,
                teacher_id: data.teacherId,
                week_start: data.weekStart.toISOString().split('T')[0],
                week_end: data.weekEnd.toISOString().split('T')[0],
                total_study_time_minutes: metrics.totalStudyTime,
                active_days: metrics.activeDays,
                topics_studied: metrics.topicsStudied,
                average_comprehension: metrics.avgComprehension,
                math_metrics: metrics.mathMetrics,
                english_metrics: metrics.englishMetrics,
                science_metrics: metrics.scienceMetrics,
                strengths: strengths,
                areas_for_improvement: improvements,
                ai_recommendations: aiRecommendations
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ Report saved with ID: ${report.id}`);

        // 7. Send email to teacher
        await sendTeacherEmail(report);

        return report;
    } catch (error) {
        console.error('❌ Error generating report:', error);
        throw error;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get student progress data for the week
 */
async function getStudentProgress(
    studentId: string,
    weekStart: Date,
    weekEnd: Date
): Promise<StudentProgress> {
    // Get lesson progress for the week
    const { data: lessons, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', studentId)
        .gte('started_at', weekStart.toISOString())
        .lte('started_at', weekEnd.toISOString());

    if (error) throw error;

    if (!lessons || lessons.length === 0) {
        return {
            totalStudyTime: 0,
            activeDays: 0,
            topicsStudied: 0,
            avgComprehension: 0,
            mathMetrics: { topicsCompleted: 0, averageScore: 0, timeSpent: 0, topics: [] },
            englishMetrics: { topicsCompleted: 0, averageScore: 0, timeSpent: 0, topics: [] },
            scienceMetrics: { topicsCompleted: 0, averageScore: 0, timeSpent: 0, topics: [] }
        };
    }

    // Calculate total study time
    const totalStudyTime = lessons.reduce((sum, lesson) =>
        sum + (lesson.time_spent_minutes || 0), 0
    );

    // Calculate active days
    const uniqueDays = new Set(
        lessons.map(lesson => new Date(lesson.started_at).toDateString())
    );
    const activeDays = uniqueDays.size;

    // Calculate topics studied
    const topicsStudied = lessons.length;

    // Calculate average comprehension
    const avgComprehension = lessons.reduce((sum, lesson) =>
        sum + (lesson.score || 0), 0
    ) / lessons.length;

    // Group by subject
    const mathLessons = lessons.filter(l => l.subject === 'math');
    const englishLessons = lessons.filter(l => l.subject === 'english');
    const scienceLessons = lessons.filter(l => l.subject === 'science');

    return {
        totalStudyTime,
        activeDays,
        topicsStudied,
        avgComprehension,
        mathMetrics: calculateSubjectMetrics(mathLessons),
        englishMetrics: calculateSubjectMetrics(englishLessons),
        scienceMetrics: calculateSubjectMetrics(scienceLessons)
    };
}

/**
 * Calculate metrics for a specific subject
 */
function calculateSubjectMetrics(lessons: any[]): SubjectMetrics {
    if (lessons.length === 0) {
        return {
            topicsCompleted: 0,
            averageScore: 0,
            timeSpent: 0,
            topics: []
        };
    }

    const topicsCompleted = lessons.filter(l => l.status === 'completed').length;
    const averageScore = lessons.reduce((sum, l) => sum + (l.score || 0), 0) / lessons.length;
    const timeSpent = lessons.reduce((sum, l) => sum + (l.time_spent_minutes || 0), 0);

    const topics: TopicProgress[] = lessons.map(lesson => ({
        name: lesson.lesson_title || 'Unknown Topic',
        score: lesson.score || 0,
        attempts: 1,
        lastAttempt: new Date(lesson.started_at)
    }));

    return {
        topicsCompleted,
        averageScore,
        timeSpent,
        topics
    };
}

/**
 * Calculate overall metrics
 */
function calculateMetrics(progress: StudentProgress) {
    return {
        totalStudyTime: progress.totalStudyTime,
        activeDays: progress.activeDays,
        topicsStudied: progress.topicsStudied,
        avgComprehension: progress.avgComprehension,
        mathMetrics: progress.mathMetrics,
        englishMetrics: progress.englishMetrics,
        scienceMetrics: progress.scienceMetrics
    };
}

/**
 * Identify top 3 strengths (topics with >85% score)
 */
function identifyStrengths(metrics: StudentProgress): Strength[] {
    const allTopics: Strength[] = [];

    // Add math topics
    metrics.mathMetrics.topics.forEach(topic => {
        if (topic.score >= 85) {
            allTopics.push({
                topic: topic.name,
                score: topic.score,
                subject: 'Matemáticas'
            });
        }
    });

    // Add english topics
    metrics.englishMetrics.topics.forEach(topic => {
        if (topic.score >= 85) {
            allTopics.push({
                topic: topic.name,
                score: topic.score,
                subject: 'Inglés'
            });
        }
    });

    // Add science topics
    metrics.scienceMetrics.topics.forEach(topic => {
        if (topic.score >= 85) {
            allTopics.push({
                topic: topic.name,
                score: topic.score,
                subject: 'Ciencias'
            });
        }
    });

    // Sort by score and return top 3
    return allTopics
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

/**
 * Identify areas for improvement (topics with <60% score)
 */
async function identifyImprovements(metrics: StudentProgress): Promise<Improvement[]> {
    const allImprovements: Improvement[] = [];

    // Add math topics
    metrics.mathMetrics.topics.forEach(topic => {
        if (topic.score < 60) {
            allImprovements.push({
                topic: topic.name,
                score: topic.score,
                recommendation: `Sugerimos reforzar ${topic.name} con ejercicios adicionales.`,
                subject: 'Matemáticas'
            });
        }
    });

    // Add english topics
    metrics.englishMetrics.topics.forEach(topic => {
        if (topic.score < 60) {
            allImprovements.push({
                topic: topic.name,
                score: topic.score,
                recommendation: `Recomendamos practicar ${topic.name} con actividades interactivas.`,
                subject: 'Inglés'
            });
        }
    });

    // Add science topics
    metrics.scienceMetrics.topics.forEach(topic => {
        if (topic.score < 60) {
            allImprovements.push({
                topic: topic.name,
                score: topic.score,
                recommendation: `Es importante revisar ${topic.name} en clase.`,
                subject: 'Ciencias'
            });
        }
    });

    // Sort by score (lowest first) and return top 3
    return allImprovements
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);
}

/**
 * Generate AI recommendations using OpenAI
 */
async function generateAIRecommendations(data: {
    strengths: Strength[];
    improvements: Improvement[];
    studentId: string;
}): Promise<AIRecommendation[]> {
    // For MVP, return basic recommendations
    // In production, this would call OpenAI API

    const recommendations: AIRecommendation[] = [];

    if (data.improvements.length > 0) {
        recommendations.push({
            priority: 'high',
            topic: data.improvements[0].topic,
            recommendation: `Priorizar refuerzo en ${data.improvements[0].topic}. El estudiante muestra dificultad en este tema.`
        });
    }

    if (data.strengths.length > 0) {
        recommendations.push({
            priority: 'low',
            topic: data.strengths[0].topic,
            recommendation: `Aprovechar fortaleza en ${data.strengths[0].topic} para motivar al estudiante.`
        });
    }

    recommendations.push({
        priority: 'medium',
        topic: 'Consistencia',
        recommendation: 'Mantener rutina de estudio regular para mejores resultados.'
    });

    return recommendations;
}

/**
 * Send email to teacher with the report
 */
async function sendTeacherEmail(report: any) {
    try {
        // Get teacher and student info
        const { data: teacher } = await supabase
            .from('teachers')
            .select('name, email')
            .eq('id', report.teacher_id)
            .single();

        const { data: student } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', report.student_id)
            .single();

        if (!teacher || !student) {
            throw new Error('Teacher or student not found');
        }

        // Format email content
        const emailHTML = generateEmailHTML(report, student.name, teacher.name);
        const subject = `Reporte Semanal Nova Schola - ${student.name}`;

        console.log(`📧 Sending email to ${teacher.email}...`);

        // Send email via our new API route
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: teacher.email,
                subject: subject,
                html: emailHTML
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send email');
        }

        // Update report as sent
        await supabase
            .from('teacher_reports')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', report.id);

        console.log('✅ Email sent successfully');
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(report: any, studentName: string, teacherName: string): string {
    const strengths = report.strengths || [];
    const improvements = report.areas_for_improvement || [];

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .metric-card { background: #f8f9fa; padding: 20px; margin: 15px 0; 
                       border-radius: 8px; border-left: 4px solid #667eea; }
        .strength { color: #10b981; font-weight: bold; margin: 8px 0; }
        .improvement { color: #ef4444; font-weight: bold; margin: 8px 0; }
        .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
        h2 { color: #1f2937; margin-top: 0; }
        ul { padding-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">📊 Reporte Semanal Nova Schola</h1>
            <p style="margin: 10px 0 0 0;">Estudiante: ${studentName}</p>
            <p style="margin: 5px 0 0 0;">Semana: ${report.week_start} - ${report.week_end}</p>
        </div>
        
        <div class="metric-card">
            <h2>📈 Resumen General</h2>
            <ul>
                <li>⏱️ Tiempo de estudio: ${Math.round(report.total_study_time_minutes / 60)} horas ${report.total_study_time_minutes % 60} minutos</li>
                <li>📅 Días activos: ${report.active_days}/7</li>
                <li>📚 Temas practicados: ${report.topics_studied}</li>
                <li>🎯 Comprensión promedio: ${Math.round(report.average_comprehension)}%</li>
            </ul>
        </div>
        
        ${strengths.length > 0 ? `
        <div class="metric-card">
            <h2>✅ Áreas de Fortaleza</h2>
            ${strengths.map((s: Strength) => `
                <p class="strength">✓ ${s.subject}: ${s.topic} (${s.score}% de aciertos)</p>
            `).join('')}
        </div>
        ` : ''}
        
        ${improvements.length > 0 ? `
        <div class="metric-card">
            <h2>⚠️ Áreas que Necesitan Refuerzo</h2>
            ${improvements.map((i: Improvement) => `
                <p class="improvement">! ${i.subject}: ${i.topic} (${i.score}% de aciertos)</p>
                <p style="margin-left: 20px; color: #6b7280; font-size: 14px;">
                    💡 ${i.recommendation}
                </p>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="metric-card">
            <h2>🎯 Recomendaciones</h2>
            <p>Nova Schola continuará con ejercicios personalizados en las áreas identificadas. 
            Sugerimos reforzar los temas de mejora en clase para mejores resultados.</p>
        </div>
        
        <div class="footer">
            <p>Generado automáticamente por Nova Schola</p>
            <p>¿Preguntas? Responde este email o contacta a soporte@novaschola.com</p>
        </div>
    </div>
</body>
</html>
    `;
}

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * Generate reports for all students with assigned teachers
 */
export async function generateAllWeeklyReports() {
    const weekEnd = new Date();
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    console.log(`📊 Generating weekly reports for ${weekStart.toDateString()} - ${weekEnd.toDateString()}`);

    // Get all active assignments
    const { data: assignments, error } = await supabase
        .from('student_teacher_assignments')
        .select('student_id, teacher_id')
        .eq('is_active', true);

    if (error) {
        console.error('❌ Error fetching assignments:', error);
        return;
    }

    console.log(`Found ${assignments?.length || 0} assignments`);

    // Generate report for each assignment
    let successCount = 0;
    let errorCount = 0;

    for (const assignment of assignments || []) {
        try {
            await generateWeeklyReport({
                studentId: assignment.student_id,
                teacherId: assignment.teacher_id,
                weekStart,
                weekEnd
            });
            successCount++;
        } catch (error) {
            console.error(`❌ Error for student ${assignment.student_id}:`, error);
            errorCount++;
        }
    }

    console.log(`✅ Reports generated: ${successCount} successful, ${errorCount} errors`);
}
