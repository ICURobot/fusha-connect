const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const MALE_VOICE_ID = process.env.REACT_APP_ELEVENLABS_MALE_VOICE_ID;
const FEMALE_VOICE_ID = process.env.REACT_APP_ELEVENLABS_FEMALE_VOICE_ID;

// New conversation content that needs audio
const newConversationAudio = [
  { 
    arabic: "أَهْلاً وَ سَهْلاً", 
    english: "Welcome", 
    filename: "ahlan-wa-sahlan.mp3",
    voiceType: "female",
    voiceId: FEMALE_VOICE_ID
  },
  { 
    arabic: "كَيْفَ حَالُكِ؟", 
    english: "How are you? (to female)", 
    filename: "kayfa-haluki.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID
  },
  { 
    arabic: "بِخَيْر، شُكْراً", 
    english: "Fine, thank you", 
    filename: "bikhayr-shukran.mp3",
    voiceType: "female",
    voiceId: FEMALE_VOICE_ID
  },
  { 
    arabic: "مِن أَيْنَ أَنْتِ؟", 
    english: "Where are you from?", 
    filename: "min-ayna-anti.mp3",
    voiceType: "male",
    voiceId: MALE_VOICE_ID
  },
  { 
    arabic: "أَنَا مِن مِصْر", 
    english: "I'm from Egypt", 
    filename: "ana-min-misr.mp3",
    voiceType: "female",
    voiceId: FEMALE_VOICE_ID
  }
];

// Ensure audio directory exists
const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

function generateAudio(text, filename, voiceId) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`🎵 Generating ${filename} (${text})`);
      
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

async function generateAllConversationAudio() {
  try {
    console.log('🚀 Starting conversation audio generation...\n');
    
    // Check if required environment variables are set
    if (!ELEVENLABS_API_KEY || !MALE_VOICE_ID || !FEMALE_VOICE_ID) {
      console.error('❌ Missing environment variables!');
      console.error('Make sure REACT_APP_ELEVENLABS_API_KEY, REACT_APP_ELEVENLABS_MALE_VOICE_ID, and REACT_APP_ELEVENLABS_FEMALE_VOICE_ID are set in your .env file');
      process.exit(1);
    }
    
    let successCount = 0;
    let totalCount = newConversationAudio.length;

    // Generate each audio file
    for (const item of newConversationAudio) {
      try {
        const success = await generateAudio(item.arabic, item.filename, item.voiceId);
        if (success) successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to generate ${item.filename}:`, error.message);
      }
    }

    console.log(`\n🎯 Conversation audio generation complete!`);
    console.log(`✅ Success: ${successCount}/${totalCount} files`);
    console.log(`📁 Files saved to: ${audioDir}`);
    
    if (successCount === totalCount) {
      console.log(`\n🎉 All conversation audio files generated successfully!`);
      console.log(`🌐 Ready to upload to Supabase!`);
    } else {
      console.log(`\n⚠️  Some files failed to generate. Check the errors above.`);
    }

  } catch (error) {
    console.error('❌ Audio generation process failed:', error.message);
  }
}

// Run the audio generation
generateAllConversationAudio().catch(console.error);
