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
  // Only cleanup if it's a blob URL and not in our cache
  if (audioUrl.startsWith('blob:')) {
    // Check if this URL is still in our cache
    const isCached = Object.values(audioCache).includes(audioUrl);
    if (!isCached) {
      URL.revokeObjectURL(audioUrl);
      console.log('🧹 Cleaned up unused blob URL');
    } else {
      console.log('💾 Keeping cached blob URL');
    }
  }
};

// Cache for audio blob URLs to prevent re-downloading
const audioCache: { [key: string]: string } = {};

// Function to get audio directly from Supabase bucket
export const getAudioFromSupabase = async (text: string, voiceType: 'male' | 'female' = 'male'): Promise<string | null> => {
  try {
    const audioKey = `${text}-${voiceType}`;
    console.log('🔍 Looking for audio for:', text, voiceType);
    
    // Check if we already have this audio cached
    if (audioCache[audioKey]) {
      console.log('💾 Using cached audio URL for:', audioKey);
      return audioCache[audioKey];
    }
    
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
      'الكِتابُ جَدِيدٌ-male': 'lesson1-2-sentence-5.mp3',
      // Lesson 1.3 Vocabulary section
      'هٰذَا-male': 'lesson1-3-vocab-1.mp3',
      'هٰذِهِ-male': 'lesson1-3-vocab-2.mp3',
      'بَيْتٌ-male': 'lesson1-3-vocab-3.mp3',
      'سَيَّارَةٌ-male': 'lesson1-3-vocab-4.mp3',
      'كِتابٌ-male': 'lesson1-3-vocab-5.mp3',
      'قَلَمٌ-male': 'lesson1-3-vocab-6.mp3',
      'طاوِلَةٌ-male': 'lesson1-3-vocab-7.mp3',
      'رَجُلٌ-male': 'lesson1-3-vocab-8.mp3',
      'اِمْرَأَةٌ-male': 'lesson1-3-vocab-9.mp3',
      'جَمِيلٌ / جَمِيلَةٌ-male': 'lesson1-3-vocab-10.mp3',
      'قَدِيمٌ / قَدِيمَةٌ-male': 'lesson1-3-vocab-11.mp3',
      'واسِعٌ / واسِعَةٌ-male': 'lesson1-3-vocab-12.mp3',
      // Lesson 1.3 Example Sentences section
      'هٰذَا بَيْتٌ.-male': 'lesson1-3-sentence-1.mp3',
      'هٰذِهِ سَيَّارَةٌ.-male': 'lesson1-3-sentence-2.mp3',
      'هٰذَا قَلَمٌ جَمِيلٌ.-male': 'lesson1-3-sentence-3.mp3',
      'هٰذِهِ طاوِلَةٌ كَبِيرَةٌ.-male': 'lesson1-3-sentence-4.mp3',
      'هٰذَا رَجُلٌ مُهَنْدِسٌ.-male': 'lesson1-3-sentence-5.mp3',
      'هٰذِهِ اِمْرَأَةٌ مُدَرِّسَةٌ.-male': 'lesson1-3-sentence-6.mp3',
      // Lesson 1.4 Vocabulary section
      'الـ-male': 'lesson1-4-vocab-1.mp3',
      'بابٌ-male': 'lesson1-4-vocab-2.mp3',
      'شَمْسٌ-male': 'lesson1-4-vocab-3.mp3',
      'قَمَرٌ-male': 'lesson1-4-vocab-4.mp3',
      'مِفْتاحٌ-male': 'lesson1-4-vocab-5.mp3',
      'نَجْمٌ-male': 'lesson1-4-vocab-6.mp3',
      'وَلَدٌ-male': 'lesson1-4-vocab-7.mp3',
      'دَفْتَرٌ-male': 'lesson1-4-vocab-8.mp3',
      // Lesson 1.4 Example Sentences section
      'البابُ مَفْتوحٌ.-male': 'lesson1-4-sentence-1.mp3',
      'القَمَرُ جَمِيلٌ.-male': 'lesson1-4-sentence-2.mp3',
      'الشَّمْسُ كَبِيرَةٌ.-male': 'lesson1-4-sentence-3.mp3',
      'النَّجْمُ صَغِيرٌ.-male': 'lesson1-4-sentence-4.mp3',
      'هٰذَا هُوَ الوَلَدُ.-male': 'lesson1-4-sentence-5.mp3',
      'الدَّفْتَرُ عَلى الطّاوِلَةِ.-male': 'lesson1-4-sentence-6.mp3',
      // Lesson 2.1 Vocabulary section - Countries & Nationalities
      'مِصْر-male': 'lesson2-1-vocab-1.mp3',
      'مِصْرِيّ / مِصْرِيّة-male': 'lesson2-1-vocab-2.mp3',
      'سوريا-male': 'lesson2-1-vocab-3.mp3',
      'سورِيّ / سوريّة-male': 'lesson2-1-vocab-4.mp3',
      'لُبْنان-male': 'lesson2-1-vocab-5.mp3',
      'لُبْنانيّ / لُبْنانيّة-male': 'lesson2-1-vocab-6.mp3',
      'العِراق-male': 'lesson2-1-vocab-7.mp3',
      'عِراقيّ / عِراقيّة-male': 'lesson2-1-vocab-8.mp3',
      'أمريكا-male': 'lesson2-1-vocab-9.mp3',
      'أمريكيّ / أمريكيّة-male': 'lesson2-1-vocab-10.mp3',
      'مِنْ أَيْنَ؟-male': 'lesson2-1-vocab-11.mp3',
      // Lesson 2.1 Example Sentences section - Countries & Nationalities
      'هُوَ مِنْ مِصْر.-male': 'lesson2-1-sentence-1.mp3',
      'إِذَنْ، هُوَ مِصْرِيّ.-male': 'lesson2-1-sentence-2.mp3',
      'هِيَ مِنْ سوريا.-female': 'lesson2-1-sentence-3.mp3',
      'إِذَنْ، هِيَ سوريّة.-female': 'lesson2-1-sentence-4.mp3',
      'مِنْ أَيْنَ أَنْتَ؟-male': 'lesson2-1-sentence-5.mp3',
      'أنا أمريكيّ.-male': 'lesson2-1-sentence-6.mp3'
    };
    
    const filename = filenameMap[audioKey];
    console.log('🔑 Audio key:', audioKey);
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
    
    // Cache the audio URL for future use
    audioCache[audioKey] = audioUrl;
    
    console.log('✅ Audio loaded from Supabase and cached:', filename);
    return audioUrl;

  } catch (error) {
    console.error('❌ Error getting audio from Supabase:', error);
    return null;
  }
};
