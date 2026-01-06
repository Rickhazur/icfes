// pages/api/cron/sync-classroom.ts
// Vercel Cron Job: Sync Google Classroom for all connected users

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side key
);

export default async function handler(req: any, res: any) {
    // Verify cron secret to prevent unauthorized access
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Get all users with Google Classroom tokens
        const { data: tokens, error } = await supabase
            .from('google_classroom_tokens')
            .select('user_id, access_token, refresh_token, expires_at');

        if (error) throw error;

        let syncedCount = 0;
        const errors: any[] = [];

        for (const token of tokens || []) {
            try {
                // Check if token expired
                let accessToken = token.access_token;
                if (new Date(token.expires_at) < new Date()) {
                    // Refresh token
                    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            refresh_token: token.refresh_token,
                            client_id: process.env.VITE_GOOGLE_CLIENT_ID!,
                            client_secret: process.env.VITE_GOOGLE_CLIENT_SECRET!,
                            grant_type: 'refresh_token'
                        })
                    });

                    const newTokens = await refreshResponse.json();
                    accessToken = newTokens.access_token;

                    // Update token in database
                    await supabase
                        .from('google_classroom_tokens')
                        .update({
                            access_token: newTokens.access_token,
                            expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
                        })
                        .eq('user_id', token.user_id);
                }

                // Fetch courses
                const coursesResponse = await fetch(
                    'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE',
                    { headers: { 'Authorization': `Bearer ${accessToken}` } }
                );
                const coursesData = await coursesResponse.json();
                const courses = coursesData.courses || [];

                // Sync courses
                const coursesToInsert = courses.map((course: any) => ({
                    user_id: token.user_id,
                    google_course_id: course.id,
                    name: course.name,
                    section: course.section,
                    description: course.descriptionHeading,
                    teacher_name: course.ownerId,
                    is_active: course.courseState === 'ACTIVE'
                }));

                await supabase
                    .from('google_classroom_courses')
                    .upsert(coursesToInsert, { onConflict: 'user_id,google_course_id' });

                // Fetch and sync assignments
                for (const course of courses) {
                    const workResponse = await fetch(
                        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
                        { headers: { 'Authorization': `Bearer ${accessToken}` } }
                    );
                    const workData = await workResponse.json();
                    const assignments = workData.courseWork || [];

                    // Get course mapping
                    const { data: courseMapping } = await supabase
                        .from('google_classroom_courses')
                        .select('id')
                        .eq('google_course_id', course.id)
                        .eq('user_id', token.user_id)
                        .single();

                    const assignmentsToInsert = assignments.map((assignment: any) => ({
                        user_id: token.user_id,
                        course_id: courseMapping?.id,
                        google_assignment_id: assignment.id,
                        title: assignment.title,
                        description: assignment.description,
                        due_date: assignment.dueDate ? new Date(
                            assignment.dueDate.year,
                            assignment.dueDate.month - 1,
                            assignment.dueDate.day
                        ).toISOString() : null,
                        max_points: assignment.maxPoints,
                        state: assignment.state,
                        work_type: assignment.workType,
                        updated_at: new Date().toISOString()
                    }));

                    await supabase
                        .from('google_classroom_assignments')
                        .upsert(assignmentsToInsert, { onConflict: 'user_id,google_assignment_id' });
                }

                syncedCount++;
            } catch (userError) {
                console.error(`Error syncing user ${token.user_id}:`, userError);
                errors.push({ user_id: token.user_id, error: userError });
            }
        }

        return res.status(200).json({
            success: true,
            synced: syncedCount,
            total: tokens?.length || 0,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error: any) {
        console.error('Cron job error:', error);
        return res.status(500).json({ error: error.message });
    }
}
