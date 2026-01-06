import { useEffect } from 'react';
import { supabase } from '@/services/supabase';

export function usePresence(
    userId: string | undefined,
    userName: string | undefined,
    currentView: string,
    avatarId?: string,
    accessories?: Record<string, string>,
    grade?: number
) {
    useEffect(() => {
        if (!userId || !supabase) return;

        const updatePresence = async () => {
            if (!supabase) return;
            const { error } = await supabase
                .from('players_presence')
                .upsert({
                    user_id: userId,
                    user_name: userName,
                    current_view: currentView,
                    last_seen: new Date().toISOString(),
                    avatar_id: avatarId,
                    equipped_accessories: accessories,
                    grade: grade
                });

            if (error) console.error('Error updating presence:', error);
        };

        // Initial update
        updatePresence();

        // Update every 30 seconds
        const interval = setInterval(updatePresence, 30000);

        // Cleanup: Ideally we'd remove or mark as offline, but for simplicity let's just clear interval
        return () => clearInterval(interval);
    }, [userId, userName, currentView]);
}
