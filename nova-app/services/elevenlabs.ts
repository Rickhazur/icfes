const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Voice Configuration
// English: "Rachel" (Standard, Clear American) - 21m00Tcm4TlvDq8ikWAM
// Spanish (Col/LatAm): "Domi" (Soft, Warm female) - EXAVITQu4vr4xnSDxMaL (Bella is often used too, but Domi is warmer)
// Let's use specific IDs if possible. 
// "Bella" - EXAVITQu4vr4xnSDxMaL (American, Soft)
// "Rachel" - 21m00Tcm4TlvDq8ikWAM (American, Narrative)
// For Colombian, we need a multilingual voice. "Domi" is good. 
// English: "Rachelle" (User provided) - ZT9u07TYPVl83ejeLakq
// Spanish: "Lina" (User provided) - VmejBeYhbrcTPwDniox7
export const VOICE_IDS = {
    en: 'ZT9u07TYPVl83ejeLakq', // Rachelle
    es: 'VmejBeYhbrcTPwDniox7', // Lina
};

const DEFAULT_VOICE_ID_EN = 'ZT9u07TYPVl83ejeLakq'; // Rachelle
const DEFAULT_VOICE_ID_ES = 'VmejBeYhbrcTPwDniox7'; // Lina

const MODEL_ID = 'eleven_multilingual_v2';

export const getElevenLabsKey = () => {
    const key = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    return key.trim();
};

export async function generateSpeech(text: string, language: 'en' | 'es' = 'es', customVoiceId?: string): Promise<ArrayBuffer> {
    // Use the environment variable function
    const apiKey = getElevenLabsKey();

    // Select voice based on language or use custom provided ID
    const voiceId = customVoiceId || (language === 'en' ? DEFAULT_VOICE_ID_EN : DEFAULT_VOICE_ID_ES);
    const url = `${ELEVENLABS_API_URL}/${voiceId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: MODEL_ID,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            console.error(`ElevenLabs API Error: ${response.status}`);
            throw new Error(`ELEVENLABS_ERROR_${response.status}`);
        }

        return await response.arrayBuffer();
    } catch (error) {
        console.error("ElevenLabs critical failure:", error);
        throw error; // Will be caught by TutorPanel
    }
}