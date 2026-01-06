import React from 'react';
import { ViewState } from '../../types';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Calendar,
    BarChart3,
    Zap,
    Settings,
    LogOut,
    Bell,
    Gift
} from 'lucide-react';

interface AdminSidebarProps {
    currentView: ViewState;
    onViewChange: (view: ViewState) => void;
    onLogout: () => void;
    userName?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange, onLogout, userName }) => {
    const menuItems = [
        { id: ViewState.DASHBOARD, label: 'Panel de Control', icon: LayoutDashboard },
        { id: ViewState.GUARDIANS, label: 'Gestión Estudiantes', icon: Users },
        { id: ViewState.PAYMENTS, label: 'Gestión de Pagos', icon: CreditCard },
        { id: ViewState.STORE, label: 'Tienda y Premios', icon: Gift }, // Added Store
        { id: ViewState.T_SESSIONS, label: 'Sesiones de Tutoría', icon: Calendar },
        { id: ViewState.METRICS, label: 'Analíticas', icon: BarChart3 },
        { id: ViewState.LAB_DEV, label: 'Lab Dev', icon: Zap }, // The requested feature
    ];

    return (
        <div className="w-64 bg-white h-screen border-r border-stone-200 flex flex-col font-sans shrink-0">

            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Settings className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-stone-800 tracking-tight text-lg">ADMINISTRACIÓN</span>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === item.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100">
                <div className="bg-stone-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {(userName || 'A').charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-stone-800 truncate">{userName || 'Administrator'}</p>
                        <p className="text-xs text-indigo-500">Super Admin</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 text-stone-400 hover:text-rose-500 transition-colors text-sm font-medium py-2"
                >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
            </div>

        </div>
    );
};

export default AdminSidebar;
