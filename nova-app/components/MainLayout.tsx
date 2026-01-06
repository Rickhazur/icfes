import React from 'react';
import { useLearning } from '@/context/LearningContext';
import { useGamification } from '@/context/GamificationContext';
import { ViewState } from '@/types';
import Sidebar from '@/components/Sidebar';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import GuardiansManagement from '@/components/Admin/GuardiansManagement';
import PaymentsManagement from '@/components/Admin/PaymentsManagement';
import TutorSessions from '@/components/Admin/TutorSessions';
import NovaStore from '@/components/Admin/NovaStore';
import Dashboard from '@/components/Dashboard';
import SmartTutorPrimary from '@/components/SmartTutorPrimary/PrimaryTutor';
import MathTutor from '@/pages/MathTutor';
import ResearchCenter from '@/components/report-buddy-main1/src/pages/Index';
import ArtsTutor from '@/components/Arts/ArtsTutor';
import EnglishTutor_mod from '@/pages/EnglishTutor_mod';
import LabDev from '@/components/LabDev';
import { PrizeStore } from '@/components/Store/PrizeStore';
import { MissionsLog } from '@/components/Missions/MissionsLog';
import { TaskControlCenter } from '@/components/Missions/TaskControlCenter';
import { AvatarSelector } from '@/components/Gamification/AvatarSelector';
import { useAvatar } from '@/context/AvatarContext';
import { ArenaLobby } from '@/components/Arena/ArenaLobby';
import { ParentDashboard } from '@/components/Parent/ParentDashboard';
import { GuardianGuard } from '@/components/GuardianGuard';
import ForcePasswordChangeModal from '@/components/ForcePasswordChangeModal';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { GoogleClassroomSync } from '@/components/GoogleClassroom/GoogleClassroomSync';
import { SubjectProgressDashboard } from '@/components/GoogleClassroom/SubjectProgressDashboard';
import { HallOfFame } from '@/components/Gamification/HallOfFame';
import Progress from '@/components/Progress';
import Flashcards from '@/components/Flashcards';
import { SubscriptionPage } from '@/components/Subscription/SubscriptionPage';

interface MainLayoutProps {
    isAuthenticated: boolean;
    userRole: 'STUDENT' | 'ADMIN' | 'PARENT';
    defaultMode?: 'STUDENT' | 'ADMIN' | 'PARENT';
    currentView: ViewState;
    setCurrentView: (view: ViewState) => void;
    handleLogout: () => void;
    userName: string;
    userId: string;
    mustChangePassword: boolean;
    setMustChangePassword: (val: boolean) => void;
    gradeLevel: number;
    setGradeLevel: (grade: number) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    isAuthenticated,
    userRole,
    currentView,
    setCurrentView,
    handleLogout,
    userName,
    userId,
    mustChangePassword,
    setMustChangePassword,
    gradeLevel,
    setGradeLevel
}) => {
    const { language, setLanguage } = useLearning();
    const { currentAvatar, isLoading } = useAvatar();

    // Map bilingual to 'es' for components that don't support it yet
    const effectiveLanguage = language === 'bilingual' ? 'es' : language;

    // Prevent premature Avatar Selection while loading profile
    if (isAuthenticated && userRole === 'STUDENT') {
        // Only show loader if we don't have a cached avatar yet
        if (isLoading && !currentAvatar) {
            return (
                <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Cargando perfil de estudiante...</p>
                </div>
            );
        }

        // If we finished loading and still have no avatar, force selection
        if (!isLoading && !currentAvatar) {
            return <AvatarSelector />;
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {isAuthenticated && userRole === 'STUDENT' && (
                <GuardianGuard studentName={userName} />
            )}

            {isAuthenticated && mustChangePassword && (
                <ForcePasswordChangeModal
                    userId={userId}
                    onSuccess={() => setMustChangePassword(false)}
                    language={language}
                />
            )}

            {userRole === 'ADMIN' ? (
                <AdminSidebar
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    onLogout={handleLogout}
                    userName={userName}
                />
            ) : (
                <Sidebar
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    onLogout={handleLogout}
                    userName={userName}
                    userRole={userRole}
                    language={language}
                    setLanguage={setLanguage}
                />
            )}

            <main className="flex-1 p-6 overflow-auto">
                {currentView !== ViewState.MATH_TUTOR && currentView !== ViewState.RESEARCH_CENTER && currentView !== ViewState.BUDDY_LEARN && (
                    <h1 className="text-2xl font-bold mb-4">Bienvenido, {userName}</h1>
                )}

                {/* Routing Logic */}
                {currentView === ViewState.DASHBOARD && (
                    userRole === 'ADMIN' ? <AdminDashboard /> : <Dashboard onNavigate={setCurrentView} language={language} userName={userName} />
                )}

                {currentView === ViewState.AI_CONSULTANT && <SmartTutorPrimary onNavigate={setCurrentView} gradeLevel={gradeLevel} setGradeLevel={setGradeLevel} />}
                {currentView === ViewState.MATH_TUTOR && <MathTutor gradeLevel={gradeLevel} userName={userName} userId={userId} />}
                {currentView === ViewState.RESEARCH_CENTER && <ResearchCenter gradeLevel={gradeLevel} />}
                {currentView === ViewState.ARTS_TUTOR && <ArtsTutor gradeLevel={gradeLevel} />}
                {currentView === ViewState.BUDDY_LEARN && <EnglishTutor_mod />}
                {currentView === ViewState.BUDDY_LEARN && <EnglishTutor_mod />}
                {currentView === ViewState.LAB_DEV && <LabDev onNavigate={setCurrentView} gradeLevel={gradeLevel} setGradeLevel={setGradeLevel} language={effectiveLanguage} setLanguage={setLanguage} />}
                {currentView === ViewState.REWARDS && <PrizeStore language={effectiveLanguage} />}
                {currentView === ViewState.CURRICULUM && <MissionsLog language={effectiveLanguage} gradeLevel={gradeLevel || 3} onNavigate={setCurrentView} />}
                {currentView === ViewState.ARENA && <ArenaLobby language={effectiveLanguage} grade={(gradeLevel || 3) as any} userId={userId} onNavigate={setCurrentView} />}
                {currentView === ViewState.PARENT_DASHBOARD && <ParentDashboard parentId={userId} language={effectiveLanguage} />}
                {currentView === ViewState.TASK_CONTROL && <TaskControlCenter onNavigate={setCurrentView} userId={userId} />}
                {currentView === ViewState.GOOGLE_CLASSROOM && (
                    <div className="space-y-8">
                        <GoogleClassroomSync />
                        <SubjectProgressDashboard />
                    </div>
                )}
                {currentView === ViewState.FLASHCARDS && <Flashcards userId={userId} language={language === 'en' ? 'en' : 'es'} />}
                {currentView === ViewState.SUBSCRIPTION && <SubscriptionPage userName={userName} onClose={() => setCurrentView(ViewState.DASHBOARD)} />}

                {currentView === ViewState.PROGRESS && (
                    userRole === 'STUDENT' ? (
                        <HallOfFame
                            userId={userId}
                            userName={userName}
                            language={language === 'bilingual' ? 'es' : language}
                        />
                    ) : (
                        <Progress onNavigate={setCurrentView} onMenuConfigUpdate={() => { }} userRole={userRole} userId={userId} userName={userName} />
                    )
                )}

                {/* Admin Views */}
                {currentView === ViewState.GUARDIANS && <GuardiansManagement />}
                {currentView === ViewState.PAYMENTS && <PaymentsManagement />}
                {currentView === ViewState.STORE && <NovaStore />}
                {currentView === ViewState.T_SESSIONS && <TutorSessions />}

                {/* Fallbacks */}
                {currentView === ViewState.METRICS && (
                    <div className="p-8 text-center text-stone-500">
                        <h2 className="text-2xl font-bold mb-2">Sección en Construcción</h2>
                        <p>Las analíticas estarán disponibles pronto.</p>
                    </div>
                )}
            </main>
            <Toaster />
            <Sonner />
        </div>
    );
};
