import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '@/types';
import { TutorReport } from '@/types/tutor';
import { sampleTutorReports } from '@/lib/olliePersonality_mod';
import { supabase, saveTutorReport, fetchTutorReports } from '@/services/supabase';


interface LearningContextType {
    reports: TutorReport[];
    addReport: (report: TutorReport) => void;
    getReportsBySource: (source: "math-tutor" | "research-center") => TutorReport | undefined;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reports, setReports] = useState<TutorReport[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>('es');

    // Initial load - try to get auth user & language
    useEffect(() => {
        // Load language
        const savedLang = localStorage.getItem('nova_language');
        if (savedLang === 'en' || savedLang === 'es') {
            setLanguage(savedLang);
        }

        const checkUserAndLoad = async () => {
            const session = await supabase?.auth.getSession();
            if (session?.data.session?.user) {
                const uid = session.data.session.user.id;
                setUserId(uid);
                const dbReports = await fetchTutorReports(uid);
                if (dbReports.length > 0) {
                    setReports(dbReports);
                    return;
                }
            }

            // Fallback to local if no DB data or offline
            const saved = localStorage.getItem('nova_tutor_reports');
            if (saved) {
                try {
                    setReports(JSON.parse(saved));
                } catch (e) { console.error("Error parsing local reports", e); }
            } else {
                setReports(sampleTutorReports);
            }
        };

        checkUserAndLoad();
    }, []);

    // Persist language on change
    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('nova_language', lang);
    };

    const addReport = async (report: TutorReport) => {
        // Optimistic update
        setReports(prev => {
            const filtered = prev.filter(r => r.source !== report.source);
            const newReports = [...filtered, report];
            localStorage.setItem('nova_tutor_reports', JSON.stringify(newReports)); // Backup
            return newReports;
        });

        // Persist to DB
        if (userId) {
            await saveTutorReport(userId, report);
        } else {
            // Try to get user again if not set
            const session = await supabase?.auth.getSession();
            if (session?.data.session?.user) {
                const uid = session.data.session.user.id;
                setUserId(uid);
                await saveTutorReport(uid, report);
            }
        }
    };

    const getReportsBySource = (source: "math-tutor" | "research-center") => {
        return reports.find(r => r.source === source);
    }

    return (
        <LearningContext.Provider value={{ reports, addReport, getReportsBySource, language, setLanguage: handleSetLanguage }}>
            {children}
        </LearningContext.Provider>
    );
};

export const useLearning = () => {
    const context = useContext(LearningContext);
    if (context === undefined) {
        throw new Error('useLearning must be used within a LearningProvider');
    }
    return context;
};
