// Audio utility functions for ElevenLabs TTS and Supabase storage
import { createClient } from '@supabase/supabase-js';

// Simple hash function to create safe filenames
function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client only if environment variables are available
let supabase: any = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
}

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
    
    // Save audio file locally for manual upload to Supabase
    try {
      // Create a safe filename for local storage
      const safeFileName = `${createHash(audioKey)}.mp3`;
      console.log('✅ Audio generated successfully:', {
        originalKey: audioKey,
        safeFileName: safeFileName,
        fileSize: audioBlob.size
      });
      
      // Store the mapping: audioKey -> safeFileName for retrieval
      localStorage.setItem(`filename_${audioKey}`, safeFileName);
      
      // Create download link to save file to local project folder
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(audioBlob);
      downloadLink.download = safeFileName;
      downloadLink.style.display = 'none';
      
      // Add to DOM and trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the blob URL
      URL.revokeObjectURL(downloadLink.href);
      
      console.log('📁 Audio file downloaded:', safeFileName);
      console.log('💡 Save this file to: /public/audio/' + safeFileName);
      console.log('📋 Original text: ' + text);
      console.log('🎯 Voice type: ' + voiceType);
      
    } catch (localError) {
      console.error('Local storage error:', localError);
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
  
  // Try local file system first, then Supabase as fallback
  try {
    // Get the safe filename from localStorage mapping
    const safeFileName = localStorage.getItem(`filename_${audioKey}`);
    if (!safeFileName) {
      console.warn('No filename mapping found for:', audioKey);
      return null;
    }
    
    // Try to load from local public/audio folder first
    try {
      const localAudioUrl = `/audio/${safeFileName}`;
      console.log('Trying local audio file:', localAudioUrl);
      return localAudioUrl;
    } catch (localError) {
      console.warn('Local file not found, trying Supabase...');
    }
    
    // Fallback to Supabase if available and local file not available
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('audio')
          .download(safeFileName);
        
        if (error || !data) {
          return null;
        }
        
        const audioBlob = new Blob([data], { type: 'audio/mpeg' });
        return URL.createObjectURL(audioBlob);
      } catch (supabaseError) {
        console.warn('Supabase download failed:', supabaseError);
      }
    } else {
      console.warn('Supabase client not available');
    }
    
    return null;
  } catch (error) {
    console.warn('Could not retrieve audio:', error);
    return null;
  }
  
  return null;
};
