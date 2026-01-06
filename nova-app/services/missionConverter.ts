// services/missionConverter.ts
// Converts Google Classroom assignments to Nova missions

import { supabase } from './supabase';

interface GoogleAssignment {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    max_points?: number;
    work_type: string;
    google_classroom_courses?: { name: string };
}

interface NovaMission {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    xpReward: number;
    coinReward: number;
    isCompleted: boolean;
    progress: number;
    total: number;
    minGrade: number;
    maxGrade: number;
    dueDate?: string;
    source: 'google_classroom';
    sourceId: string;
}

// Map assignment type to subject/category
function detectSubject(assignment: GoogleAssignment): string {
    const title = assignment.title.toLowerCase();
    const courseName = assignment.google_classroom_courses?.name.toLowerCase() || '';

    if (title.includes('math') || courseName.includes('matemática') || courseName.includes('math')) {
        return 'Matemáticas';
    }
    if (title.includes('english') || courseName.includes('inglés') || courseName.includes('english')) {
        return 'Inglés';
    }
    if (title.includes('science') || courseName.includes('ciencia') || courseName.includes('science')) {
        return 'Ciencias';
    }
    if (title.includes('reading') || title.includes('lectura') || courseName.includes('lectura')) {
        return 'Lectura';
    }

    return assignment.google_classroom_courses?.name || 'General';
}

// Calculate rewards based on assignment complexity
function calculateRewards(assignment: GoogleAssignment): { xp: number; coins: number } {
    const baseXP = 50;
    const baseCoins = 10;

    // More points = more rewards
    const pointsMultiplier = assignment.max_points ? Math.min(assignment.max_points / 10, 3) : 1;

    // Different work types have different complexity
    const typeMultiplier = {
        'ASSIGNMENT': 1.5,
        'SHORT_ANSWER_QUESTION': 1.0,
        'MULTIPLE_CHOICE_QUESTION': 0.8
    }[assignment.work_type] || 1.0;

    return {
        xp: Math.round(baseXP * pointsMultiplier * typeMultiplier),
        coins: Math.round(baseCoins * pointsMultiplier * typeMultiplier)
    };
}

// Convert Google Classroom assignment to Nova mission
export function convertAssignmentToMission(assignment: GoogleAssignment, userGrade: number = 5): NovaMission {
    const subject = detectSubject(assignment);
    const rewards = calculateRewards(assignment);

    return {
        id: `gc_${assignment.id}`,
        title: `${subject}: ${assignment.title}`,
        titleEn: `${subject}: ${assignment.title}`,
        description: assignment.description || `Completa la tarea de ${subject}`,
        xpReward: rewards.xp,
        coinReward: rewards.coins,
        isCompleted: false,
        progress: 0,
        total: 1,
        minGrade: Math.max(1, userGrade - 1),
        maxGrade: Math.min(6, userGrade + 1),
        dueDate: assignment.due_date,
        source: 'google_classroom',
        sourceId: assignment.id
    };
}

// Batch convert assignments to missions
export function convertAssignmentsToMissions(assignments: GoogleAssignment[], userGrade: number = 5): NovaMission[] {
    return assignments.map(assignment => convertAssignmentToMission(assignment, userGrade));
}

// Save converted missions to database (if you have a missions table)
export async function saveMissionsToDatabase(userId: string, missions: NovaMission[]) {
    if (!supabase) throw new Error("Sistema desconectado.");

    // This assumes you have a missions table - adjust based on your schema
    const missionsToInsert = missions.map(mission => ({
        user_id: userId,
        mission_id: mission.id,
        title: mission.title,
        description: mission.description,
        xp_reward: mission.xpReward,
        coin_reward: mission.coinReward,
        is_completed: mission.isCompleted,
        progress: mission.progress,
        total: mission.total,
        due_date: mission.dueDate,
        source: mission.source,
        source_id: mission.sourceId
    }));

    // If you don't have a missions table yet, we'll create it
    // For now, just return the missions
    return missions;
}

// Mark assignment as synced to mission
export async function markAssignmentAsSynced(assignmentId: string, missionId: string) {
    if (!supabase) return;

    await supabase
        .from('google_classroom_assignments')
        .update({
            synced_to_mission: true,
            mission_id: missionId
        })
        .eq('google_assignment_id', assignmentId);
}
