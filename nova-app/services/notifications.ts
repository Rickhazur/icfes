// services/notifications.ts
// Notification system for new assignments and deadlines

import { supabase } from './supabase';

export interface Notification {
    id: string;
    user_id: string;
    type: 'new_assignment' | 'deadline_soon' | 'mission_complete' | 'reward_earned' | 'parent_mission' | 'wave' | 'challenge';
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

// Create notification
export async function createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    link?: string
) {
    if (!supabase) return;

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            message,
            link,
            is_read: false
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create notification:', error);
        return null;
    }

    return data;
}

// Get user notifications
export async function getUserNotifications(userId: string, limit = 20) {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }

    return data || [];
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
    if (!supabase) return;

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
    if (!supabase) return;

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<number> {
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Failed to get unread count:', error);
        return 0;
    }

    return count || 0;
}

// Notify about new assignments
export async function notifyNewAssignments(userId: string, assignmentCount: number) {
    return createNotification(
        userId,
        'new_assignment',
        '📚 Nuevas Tareas',
        `Tienes ${assignmentCount} nueva${assignmentCount > 1 ? 's' : ''} tarea${assignmentCount > 1 ? 's' : ''} de Google Classroom`,
        '/missions'
    );
}

// Notify about upcoming deadline
export async function notifyDeadlineSoon(userId: string, assignmentTitle: string, dueDate: Date) {
    const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return createNotification(
        userId,
        'deadline_soon',
        '⏰ Fecha Límite Próxima',
        `"${assignmentTitle}" vence en ${daysLeft} día${daysLeft > 1 ? 's' : ''}`,
        '/missions'
    );
}

// Check for upcoming deadlines (run daily)
export async function checkUpcomingDeadlines() {
    if (!supabase) return;

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: assignments } = await supabase
        .from('google_classroom_assignments')
        .select('user_id, title, due_date')
        .eq('state', 'PUBLISHED')
        .lte('due_date', threeDaysFromNow.toISOString())
        .gte('due_date', new Date().toISOString());

    for (const assignment of assignments || []) {
        await notifyDeadlineSoon(
            assignment.user_id,
            assignment.title,
            new Date(assignment.due_date)
        );
    }
}
// Notify about new parent mission
export async function notifyNewParentMission(userId: string, missionTitle: string) {
    return createNotification(
        userId,
        'parent_mission',
        '👨‍👩‍👧‍👦 Nueva Misión de tus Padres',
        `¡Tus padres te han asignado una nueva misión: "${missionTitle}"!`,
        '/task-control'
    );
}
// Notify about Arena interactions
export async function notifyArenaInteraction(targetUserId: string, senderName: string, type: 'wave' | 'challenge') {
    const title = type === 'wave' ? '👋 ¡Alguien te saludó!' : '⚔️ ¡Desafío en la Arena!';
    const message = type === 'wave'
        ? `${senderName} te ha enviado un saludo en la Arena.`
        : `${senderName} te ha desafiado a una misión en la Arena.`;

    return createNotification(
        targetUserId,
        type,
        title,
        message,
        '/arena'
    );
}
