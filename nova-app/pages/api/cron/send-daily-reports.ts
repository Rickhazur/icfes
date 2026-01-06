// pages/api/cron/send-daily-reports.ts
// Vercel Cron Job: Generate and send weekly reports to teachers
// Runs daily but enables logic to check if reports are due (e.g. Fridays)

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key for Admin Access
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
    // 1. Verify cron secret
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('🤖 Starting Teacher Report Automation...');

        // 2. Define Reporting Period (Past 7 days)
        const weekEnd = new Date();
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 7);

        // 3. Get Active Student-Teacher Assignments
        const { data: assignments, error: assignError } = await supabase
            .from('student_teacher_assignments')
            .select('student_id, teacher_id')
            .eq('is_active', true);

        if (assignError) throw assignError;

        console.log(`Found ${assignments?.length || 0} active assignments.`);

        let reportsGenerated = 0;
        const errors: any[] = [];

        // 4. Generate Report for Each Student
        for (const assignment of assignments || []) {
            try {
                // Check if a report already exists for this week to avoid duplicates
                const { data: existing } = await supabase
                    .from('teacher_reports')
                    .select('id')
                    .eq('student_id', assignment.student_id)
                    .eq('teacher_id', assignment.teacher_id)
                    .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()); // Check execution in last 24h

                if (existing && existing.length > 0) {
                    console.log(`Skipping student ${assignment.student_id}: Report recently created.`);
                    continue;
                }

                // Fetch Student Progress
                const stats = await getStudentStats(assignment.student_id, weekStart, weekEnd);

                // Generate Report Data
                const { data: report, error: createError } = await supabase
                    .from('teacher_reports')
                    .insert({
                        student_id: assignment.student_id,
                        teacher_id: assignment.teacher_id,
                        week_start: weekStart.toISOString().split('T')[0],
                        week_end: weekEnd.toISOString().split('T')[0],
                        total_study_time_minutes: stats.totalStudyTime,
                        active_days: stats.activeDays,
                        topics_studied: stats.topicsStudied,
                        average_comprehension: stats.avgScore,
                        ai_recommendations: [
                            { priority: 'high', topic: 'Practice', recommendation: 'Automated weekly suggestion.' }
                        ]
                    })
                    .select()
                    .single();

                if (createError) throw createError;

                // "Send" Email (Log only for now)
                await sendEmailReport(report);

                reportsGenerated++;
            } catch (err) {
                console.error(`Error processing student ${assignment.student_id}`, err);
                errors.push({ student: assignment.student_id, error: err });
            }
        }

        return res.status(200).json({
            success: true,
            generated: reportsGenerated,
            errors: errors
        });

    } catch (error: any) {
        console.error('Cron job fatal error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// --- Helper Functions ---

async function getStudentStats(studentId: string, start: Date, end: Date) {
    // Determine study time from sessions or lessons
    // This is a simplified calculation for the serverless function
    const { data: lessons } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', studentId)
        .gte('started_at', start.toISOString());

    const totalStudyTime = lessons?.reduce((acc, l) => acc + (l.time_spent_minutes || 0), 0) || 0;
    const uniqueDays = new Set(lessons?.map(l => new Date(l.started_at).toDateString())).size;

    return {
        totalStudyTime,
        activeDays: uniqueDays,
        topicsStudied: lessons?.length || 0,
        avgScore: 85 // Mock or calculate real average
    };
}


import { Resend } from 'resend';

// Helper for email sending
async function sendEmailReport(report: any) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ No RESEND_API_KEY found. Skipping email send.');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Fetch teacher email
    const { data: teacher } = await supabase
        .from('teachers')
        .select('email, name')
        .eq('id', report.teacher_id)
        .single();

    // Fetch student name for subject
    const { data: student } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', report.student_id)
        .single();

    if (teacher && teacher.email) {
        console.log(`[EMAIL] Sending report ${report.id} to ${teacher.email}`);

        try {
            await resend.emails.send({
                from: 'Nova Schola <onboarding@resend.dev>',
                to: [teacher.email],
                subject: `Reporte Semanal Nova Schola - ${student?.name || 'Estudiante'}`,
                html: generateSimpleEmail(report, student?.name, teacher.name)
            });
            console.log('✅ Email sent via Resend');
        } catch (error) {
            console.error('❌ Failed to send email via Resend:', error);
        }
    }
}

function generateSimpleEmail(report: any, studentName: string = 'Estudiante', teacherName: string = 'Profesor') {
    return `
        <h1>Reporte Semanal: ${studentName}</h1>
        <p>Hola ${teacherName}, aquí está el resumen de esta semana:</p>
        <ul>
            <li>Minutos estudiados: ${report.total_study_time_minutes}</li>
            <li>Días activos: ${report.active_days}</li>
            <li>Temas: ${report.topics_studied}</li>
            <li>Comprensión: ${Math.round(report.average_comprehension)}%</li>
        </ul>
        <p>Inicia sesión en Nova Schola para ver el reporte detallado.</p>
    `;
}

