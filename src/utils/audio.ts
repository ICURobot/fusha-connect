// Audio utility functions for ElevenLabs TTS and Supabase storage
import { createClient } from '@supabase/supabase-js';

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

// Voice IDs for ElevenLabs
const VOICE_IDS = {
  male: process.env.REACT_APP_ELEVENLABS_MALE_VOICE_ID || '',
  female: process.env.REACT_APP_ELEVENLABS_FEMALE_VOICE_ID || ''
};

interface AudioResponse {
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
    
    if (!voiceId) {
      throw new Error(`Voice ID not configured for ${voiceType} voice`);
    }
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }
    
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
    
    // Create local backup (save to localStorage)
    const audioKey = `${text}-${voiceType}`;
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(audioArrayBuffer);
    const audioBase64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
    
    try {
      localStorage.setItem(`audio_${audioKey}`, audioBase64);
      console.log(`Local backup created for: ${audioKey}`);
    } catch (localStorageError) {
      console.warn('Could not save to localStorage:', localStorageError);
    }
    
    // Upload to Supabase bucket
    try {
      const fileName = `${audioKey}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.warn('Supabase upload failed:', uploadError);
      } else {
        console.log('Audio uploaded to Supabase:', uploadData);
      }
    } catch (supabaseError) {
      console.warn('Supabase upload error:', supabaseError);
    }
    
    // Convert to blob URL for playback
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

// Function to get audio from local backup or Supabase
export const getAudioFromBackup = async (text: string, voiceType: 'male' | 'female' = 'male'): Promise<string | null> => {
  const audioKey = `${text}-${voiceType}`;
  
  // Try localStorage first
  try {
    const localAudio = localStorage.getItem(`audio_${audioKey}`);
    if (localAudio) {
      const audioBlob = new Blob([Uint8Array.from(atob(localAudio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      return URL.createObjectURL(audioBlob);
    }
  } catch (error) {
    console.warn('Could not retrieve from localStorage:', error);
  }
  
  // Try Supabase if local backup not available
  try {
    const fileName = `${audioKey}.mp3`;
    const { data, error } = await supabase.storage
      .from('audio')
      .download(fileName);
    
    if (error || !data) {
      return null;
    }
    
    const audioBlob = new Blob([data], { type: 'audio/mpeg' });
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.warn('Could not retrieve from Supabase:', error);
    return null;
  }
  
  return null;
};
