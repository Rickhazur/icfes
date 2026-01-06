import React from 'react';
import { BookOpen, LogOut, LayoutDashboard, FileText, CheckCircle } from 'lucide-react';

interface ICFESLayoutProps {
    children: React.ReactNode;
    onExit: () => void;
    currentView: string;
    onNavigate: (view: string) => void;
}

export const ICFESLayout: React.FC<ICFESLayoutProps> = ({
    children,
    onExit,
    currentView,
    onNavigate
}) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Heavy academic header */}
            <header className="bg-slate-900 text-white shadow-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Nova Schola <span className="text-blue-400 font-light">Prep</span></h1>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Módulo de Preparación Saber</p>
                        </div>
                    </div>

                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Volver a Nova Kids
                    </button>
                </div>
            </header>

            <div className="flex flex-1 container mx-auto px-6 py-8 gap-8">
                {/* Simple academic sidebar */}
                <aside className="w-64 shrink-0 space-y-2">
                    <nav className="space-y-1">
                        <NavButton
                            active={currentView === 'DASHBOARD'}
                            onClick={() => onNavigate('DASHBOARD')}
                            icon={LayoutDashboard}
                            label="Simulacros"
                        />
                        <NavButton
                            active={currentView === 'RESULTS'}
                            onClick={() => onNavigate('RESULTS')}
                            icon={CheckCircle}
                            label="Resultados"
                        />
                        <NavButton
                            active={currentView === 'STUDY'}
                            onClick={() => onNavigate('STUDY')}
                            icon={FileText}
                            label="Material de Repaso"
                        />
                    </nav>

                    <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <h3 className="text-sm font-bold text-blue-900 mb-2">Próximo Examen</h3>
                        <p className="text-xs text-blue-700 mb-1">Saber 3° / 5° / 9°</p>
                        <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2">
                            <div className="bg-blue-600 h-1.5 rounded-full w-3/4"></div>
                        </div>
                        <p className="text-[10px] text-blue-600 mt-1 text-right">Faltan 15 días</p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);
