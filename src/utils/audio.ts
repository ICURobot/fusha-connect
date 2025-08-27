// Audio utility functions for ElevenLabs TTS and Supabase storage
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client only if environment variables are available
let supabase: any = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('❌ Supabase environment variables missing:', {
    url: SUPABASE_URL ? '✅' : '❌',
    key: SUPABASE_ANON_KEY ? '✅' : '❌'
  });
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
    console.log('🔍 Looking for audio for:', text, voiceType);
    
    // Map Arabic text to exact filenames we uploaded to Supabase
    const filenameMap: { [key: string]: string } = {
      // Lesson 1.1 Vocabulary section - using exact text from the app
      'مَرْحَباً-male': 'marhaban.mp3',
      'كَيْفَ حَالُكِ؟-male': 'kayfa-haaluki.mp3',
      'أَنَا بِخَيْرٍ-male': 'ana-bikhayr.mp3',
      'أَنَا جَيِّدٌ-male': 'ana-jayid.mp3',
      'أَنَا جَيِّدٌ جِدّاً-male': 'ana-jayid-jiddan.mp3',
      // Lesson 1.1 Conversation section - using exact text from the app
      'conversation-مَرْحَباً-male': 'khalid-marhaban.mp3',
      'conversation-أَهْلاً وَ سَهْلاً-female': 'maryam-ahlan.mp3',
      'conversation-كَيْفَ حَالُكِ؟-male': 'khalid-kayfa-haaluki.mp3',
      'conversation-بِخَيْر، شُكْراً-female': 'maryam-bikhayr.mp3',
      'conversation-مِن أَيْنَ أَنْتِ؟-male': 'khalid-min-ayna.mp3',
      'conversation-أَنَا مِن مِصْر-female': 'maryam-ana-misr.mp3',
      // Lesson 1.2 Vocabulary section
      'الطَّالِبُ-male': 'lesson1-2-vocab-1.mp3',
      'الطَّالِبَةُ-male': 'lesson1-2-vocab-2.mp3',
      'المُدَرِّسُ-male': 'lesson1-2-vocab-3.mp3',
      'المَدْرَسَةُ-male': 'lesson1-2-vocab-4.mp3',
      'الكِتابُ-male': 'lesson1-2-vocab-5.mp3',
      // Lesson 1.2 Example Sentences section
      'الطَّالِبُ جَدِيدٌ-male': 'lesson1-2-sentence-1.mp3',
      'الطَّالِبَةُ جَدِيدَةٌ-male': 'lesson1-2-sentence-2.mp3',
      'المُدَرِّسُ جَدِيدٌ-male': 'lesson1-2-sentence-3.mp3',
      'المَدْرَسَةُ جَدِيدَةٌ-male': 'lesson1-2-sentence-4.mp3',
      'الكِتابُ جَدِيدٌ-male': 'lesson1-2-sentence-5.mp3'
    };

    const audioKey = `${text}-${voiceType}`;
    console.log('🔑 Audio key:', audioKey);
    
    const filename = filenameMap[audioKey];
    console.log('📁 Filename found:', filename);

    if (!filename) {
      console.warn('❌ No filename mapping found for:', audioKey);
      console.log('🔍 Available keys:', Object.keys(filenameMap));
      return null;
    }

    if (!supabase) {
      console.warn('❌ Supabase client not available');
      return null;
    }

    console.log('📤 Downloading from Supabase:', filename);
    
    // Get audio from Supabase bucket
    const { data, error } = await supabase.storage
      .from('audio')
      .download(filename);

    if (error || !data) {
      console.warn('❌ Supabase download failed for:', filename, error);
      return null;
    }

    // Convert to blob URL for playback
    const audioBlob = new Blob([data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('✅ Audio loaded from Supabase:', filename);
    return audioUrl;

  } catch (error) {
    console.error('❌ Error getting audio from Supabase:', error);
    return null;
  }
};
