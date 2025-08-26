// Audio utility functions for ElevenLabs TTS and Supabase storage

const ELEVENLABS_API_KEY = 'sk_73d348b186f145ab4a390b411fa34dd33a2a39e4264b5f0c';
const SUPABASE_URL = 'https://oriwiprgfknsjxiquwve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaXdpcHJnZmtuc2p4aXF1d3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ1ODUsImV4cCI6MjA3MTc1MDU4NX0.PQgYKstTgHj0HTrEDlSVBCxtbIQ1Q181MbO4lx1zufI';

// Voice IDs for ElevenLabs
const VOICE_IDS = {
  male: 'R6nda3uM038xEEKi7GFl', // Anas
  female: 'u0TsaWvt0v8migutHM3M' // Ghizlane
};

export interface AudioResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export const generateAudio = async (
  text: string, 
  voiceType: 'male' | 'female' = 'male'
): Promise<AudioResponse> => {
  try {
    const voiceId = VOICE_IDS[voiceType];
    
    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();
    
    // Convert to base64 for storage (or you could upload to Supabase directly)
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return {
      success: true,
      audioUrl: audioUrl
    };
    
  } catch (error) {
    console.error('Audio generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const playAudio = (audioUrl: string) => {
  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Audio playback error:', error);
  });
};

export const cleanupAudioUrl = (audioUrl: string) => {
  if (audioUrl.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl);
  }
};
