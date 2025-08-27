// Audio utility functions for ElevenLabs TTS and Supabase storage
import { createClient } from '@supabase/supabase-js';

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

interface AudioResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export const generateAudio = async (
  text: string, 
  voiceType: 'male' | 'female' = 'male'
): Promise<AudioResponse> => {
  // This function is no longer needed since we're using Supabase-only playback
  // But keeping it for compatibility with existing code
  return {
    success: true,
    audioUrl: null
  };
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

// Function to get audio directly from Supabase bucket
export const getAudioFromSupabase = async (text: string, voiceType: 'male' | 'female' = 'male'): Promise<string | null> => {
  try {
    // Map Arabic text to exact filenames we uploaded to Supabase
    const filenameMap: { [key: string]: string } = {
      // Vocabulary section
      'مَرْحَباً-male': 'marhaban.mp3',
      'أَهْلاً وَ سَهْلاً-male': 'ahlan-wa-sahlan.mp3',
      'السَّلامُ عَلَيْكُم-male': 'assalamu-alaykum.mp3',
      'وَ عَلَيْكُم السَّلام-male': 'wa-alaykum-assalam.mp3',
      'صَباح الخَيْر-male': 'sabah-al-khayr.mp3',
      'صَباح النُّور-male': 'sabah-an-nur.mp3',
      'مَساء الخَيْر-male': 'masa-al-khayr.mp3',
      'مَساء النُّور-male': 'masa-an-nur.mp3',
      'كَيْفَ الحال؟-male': 'kayfa-al-hal.mp3',
      'بِخَيْر، شُكْراً-male': 'bikhayr-shukran.mp3',
      'مِن فَضْلِك-male': 'min-fadlik.mp3',
      'شُكْراً-male': 'shukran.mp3',
      // Conversation section (with unique context identifiers)
      'conversation-السَّلامُ عَلَيْكُم-male': 'conversation-1.mp3',
      'conversation-وَ عَلَيْكُم السَّلام-male': 'conversation-2.mp3',
      'conversation-صَباح الخَيْر-male': 'conversation-3.mp3',
      'conversation-صَباح النُّور. كَيْفَ الحال؟-male': 'conversation-4.mp3',
      'conversation-أنا بِخَيْر، شُكْراً. وَ أَنْتِ؟-male': 'conversation-5.mp3',
      'conversation-بِخَيْر، الحَمْدُ لِله-male': 'conversation-6.mp3'
    };

    const audioKey = `${text}-${voiceType}`;
    const filename = filenameMap[audioKey];

    if (!filename) {
      console.warn('No filename mapping found for:', audioKey);
      return null;
    }

    if (!supabase) {
      console.warn('Supabase client not available');
      return null;
    }

    // Get audio from Supabase bucket
    const { data, error } = await supabase.storage
      .from('audio')
      .download(filename);

    if (error || !data) {
      console.warn('Supabase download failed for:', filename, error);
      return null;
    }

    // Convert to blob URL for playback
    const audioBlob = new Blob([data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('✅ Audio loaded from Supabase:', filename);
    return audioUrl;

  } catch (error) {
    console.error('Error getting audio from Supabase:', error);
    return null;
  }
};
