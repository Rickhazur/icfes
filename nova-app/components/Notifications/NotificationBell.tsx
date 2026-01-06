import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount
} from '../../services/notifications';
import { supabase } from '../../services/supabase';

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                await loadNotifications(user.id);
                await loadUnreadCount(user.id);
            }
        };
        init();

        // Real-time Subscription
        const channel = supabase && userId ? supabase
            .channel('notifications-bell')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    // Play sound or show toast
                    setUnreadCount(prev => prev + 1);
                    setNotifications(prev => [payload.new, ...prev]);
                }
            )
            .subscribe() : null;

        // Poll fallback (every 60s)
        const interval = setInterval(async () => {
            if (userId) {
                await loadUnreadCount(userId);
            }
        }, 60000);

        return () => {
            clearInterval(interval);
            if (channel) supabase?.removeChannel(channel);
        };
    }, [userId]);

    const loadNotifications = async (uid: string) => {
        const data = await getUserNotifications(uid, 10);
        setNotifications(data);
    };

    const loadUnreadCount = async (uid: string) => {
        const count = await getUnreadCount(uid);
        setUnreadCount(count);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId);
        if (userId) {
            await loadNotifications(userId);
            await loadUnreadCount(userId);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        await markAllNotificationsAsRead(userId);
        await loadNotifications(userId);
        await loadUnreadCount(userId);
    };

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            'new_assignment': '📚',
            'deadline_soon': '⏰',
            'mission_complete': '🎯',
            'reward_earned': '🏆'
        };
        return icons[type] || '🔔';
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell className="w-6 h-6 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-slate-800">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                    <p>No tienes notificaciones</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-800 text-sm">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    {new Date(notification.created_at).toLocaleDateString('es', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                                                >
                                                    <Check className="w-4 h-4 text-slate-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
