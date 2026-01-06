import { createClient } from "@supabase/supabase-js";

// HARDCODED CREDENTIALS FOR FACTORY APP (Since it's a local admin tool)
// Ideally these should be in .env, but for speed and since it's local only, we can hardcode or ask user to fill .env
// We will try to read from .env first

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Faltan credenciales de Supabase en .env.local de la Factory App");
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

export const saveQuestionToBank = async (question: any) => {
    const { data, error } = await supabase
        .from('icfes_questions')
        .insert([question])
        .select();

    if (error) {
        console.error("Error saving question:", error);
        throw error;
    }
    return data;
};
