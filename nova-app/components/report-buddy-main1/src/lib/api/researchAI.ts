import { supabase } from '../../../../../services/supabase';
import type { Grade, Language } from '../../types/research';

type AIAction = 'summarize' | 'suggest_searches' | 'highlight_keywords';

interface AIResponse {
  success: boolean;
  result?: string;
  error?: string;
}

export async function callResearchAI(
  action: AIAction,
  text: string,
  grade: Grade,
  language: Language
): Promise<AIResponse> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return { success: false, error: 'Konfigurasi server hilang' };
    }
    const { data, error } = await supabase.functions.invoke('research-ai', {
      body: { action, text, grade, language },
    });

    if (error) {
      console.error('Research AI error:', error);
      return { success: false, error: error.message };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true, result: data.result };
  } catch (err) {
    console.error('Research AI exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido'
    };
  }
}

export function parseJSONResponse(response: string): string[] {
  try {
    // Try to extract JSON array from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    return [];
  }
}
