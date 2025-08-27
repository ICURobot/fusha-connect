const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const MALE_VOICE_ID = process.env.REACT_APP_ELEVENLABS_MALE_VOICE_ID;
const FEMALE_VOICE_ID = process.env.REACT_APP_ELEVENLABS_FEMALE_VOICE_ID;

// Lesson 1.1 Audio Content - Organized and Clear
const lesson1Audio = [
  // VOCABULARY SECTION (5 phrases)
  { 
    arabic: "مَرْحَباً", 
    english: "Hello", 
    filename: "marhaban.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "vocabulary"
  },
  { 
    arabic: "كَيْفَ حَالُكِ؟", 
    english: "How are you? (feminine form)", 
    filename: "kayfa-haaluki.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "vocabulary"
  },
  { 
    arabic: "أَنَا بِخَيْرٍ", 
    english: "I'm fine", 
    filename: "ana-bikhayr.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "vocabulary"
  },
  { 
    arabic: "أَنَا جَيِّدٌ", 
    english: "I'm good", 
    filename: "ana-jayid.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "vocabulary"
  },
  { 
    arabic: "أَنَا جَيِّدٌ جِدّاً", 
    english: "I'm very good", 
    filename: "ana-jayid-jiddan.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "vocabulary"
  },
  
  // CONVERSATION SECTION (6 phrases - Khalid & Maryam)
  { 
    arabic: "مَرْحَباً", 
    english: "Hello (Khalid says)", 
    filename: "khalid-marhaban.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "conversation"
  },
  { 
    arabic: "أَهْلاً وَ سَهْلاً", 
    english: "Welcome (Maryam says)", 
    filename: "maryam-ahlan.mp3",
    voiceType: "female",
    voiceId: FEMALE_VOICE_ID,
    category: "conversation"
  },
  { 
    arabic: "كَيْفَ حَالُكِ؟", 
    english: "How are you? (Khalid asks Maryam)", 
    filename: "khalid-kayfa-haaluki.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "conversation"
  },
  { 
    arabic: "بِخَيْر، شُكْراً", 
    english: "Fine, thank you (Maryam says)", 
    filename: "maryam-bikhayr.mp3",
    voiceType: "female",
    voiceId: FEMALE_VOICE_ID,
    category: "conversation"
  },
  { 
    arabic: "مِن أَيْنَ أَنْتِ؟", 
    english: "Where are you from? (Khalid asks)", 
    filename: "khalid-min-ayna.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID,
    category: "conversation"
  },
  { 
    arabic: "أَنَا مِن مِصْر", 
    english: "I'm from Egypt (Maryam says)", 
    filename: "maryam-ana-misr.mp3",
    voiceType: "female",
    voiceId: FEMALE_VOICE_ID,
    category: "conversation"
  }
];

// Ensure audio directory exists
const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

function generateAudio(text, filename, voiceId, category) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`🎵 Generating ${filename} (${text}) [${category}]`);
      
      const postData = JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      });

      const options = {
        hostname: 'api.elevenlabs.io',
        port: 443,
        path: `/v1/text-to-speech/${voiceId}`,
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`ElevenLabs API error: ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          try {
            const audioBuffer = Buffer.concat(chunks);
            const filePath = path.join(audioDir, filename);
            
            fs.writeFileSync(filePath, audioBuffer);
            console.log(`✅ Saved: ${filename}`);
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

async function generateAllLesson1Audio() {
  try {
    console.log('🚀 Starting Lesson 1.1 Audio Generation...\n');
    console.log('📚 This will generate 11 audio files:');
    console.log('   • 5 Vocabulary phrases (male voice)');
    console.log('   • 6 Conversation phrases (Khalid: male, Maryam: female)\n');
    
    // Check if required environment variables are set
    if (!ELEVENLABS_API_KEY || !MALE_VOICE_ID || !FEMALE_VOICE_ID) {
      console.error('❌ Missing environment variables!');
      console.error('Make sure REACT_APP_ELEVENLABS_API_KEY, REACT_APP_ELEVENLABS_MALE_VOICE_ID, and REACT_APP_ELEVENLABS_FEMALE_VOICE_ID are set in your .env file');
      process.exit(1);
    }
    
    let successCount = 0;
    let totalCount = lesson1Audio.length;

    // Generate each audio file
    for (const item of lesson1Audio) {
      try {
        const success = await generateAudio(item.arabic, item.filename, item.voiceId, item.category);
        if (success) successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to generate ${item.filename}:`, error.message);
      }
    }

    console.log(`\n🎯 Lesson 1.1 Audio Generation Complete!`);
    console.log(`✅ Success: ${successCount}/${totalCount} files`);
    console.log(`📁 Files saved to: ${audioDir}`);
    
    if (successCount === totalCount) {
      console.log(`\n🎉 All Lesson 1.1 audio files generated successfully!`);
      console.log(`🌐 Ready to upload to Supabase!`);
      console.log(`\n📋 Next steps:`);
      console.log(`   1. Run: node upload-to-supabase.js`);
      console.log(`   2. Update the audio mapping in src/utils/audio.ts`);
      console.log(`   3. Test the lesson!`);
    } else {
      console.log(`\n⚠️  Some files failed to generate. Check the errors above.`);
    }

  } catch (error) {
    console.error('❌ Audio generation process failed:', error.message);
  }
}

// Run the audio generation
generateAllLesson1Audio().catch(console.error);
