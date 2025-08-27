const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const MALE_VOICE_ID = process.env.REACT_APP_ELEVENLABS_MALE_VOICE_ID;

// Lesson 1.1 content
const lesson1_1Content = {
  vocabulary: [
    { arabic: "مَرْحَباً", english: "Hello", filename: "marhaban.mp3" },
    { arabic: "أَهْلاً وَ سَهْلاً", english: "Welcome", filename: "ahlan-wa-sahlan.mp3" },
    { arabic: "السَّلامُ عَلَيْكُم", english: "Peace be upon you", filename: "assalamu-alaykum.mp3" },
    { arabic: "وَ عَلَيْكُم السَّلام", english: "And upon you be peace", filename: "wa-alaykum-assalam.mp3" },
    { arabic: "صَباح الخَيْر", english: "Good morning", filename: "sabah-al-khayr.mp3" },
    { arabic: "صَباح النُّور", english: "Good morning (response)", filename: "sabah-an-nur.mp3" },
    { arabic: "مَساء الخَيْر", english: "Good evening", filename: "masa-al-khayr.mp3" },
    { arabic: "مَساء النُّور", english: "Good evening (response)", filename: "masa-an-nur.mp3" },
    { arabic: "كَيْفَ الحال؟", english: "How are you?", filename: "kayfa-al-hal.mp3" },
    { arabic: "بِخَيْر، شُكْراً", english: "Fine, thank you", filename: "bikhayr-shukran.mp3" },
    { arabic: "مِن فَضْلِك", english: "Please", filename: "min-fadlik.mp3" },
    { arabic: "شُكْراً", english: "Thank you", filename: "shukran.mp3" }
  ],
  conversation: [
    { arabic: "السَّلامُ عَلَيْكُم", english: "Peace be upon you", filename: "conversation-1.mp3" },
    { arabic: "وَ عَلَيْكُم السَّلام", english: "And upon you be peace", filename: "conversation-2.mp3" },
    { arabic: "صَباح الخَيْر", english: "Good morning", filename: "conversation-3.mp3" },
    { arabic: "صَباح النُّور. كَيْفَ الحال؟", english: "Good morning. How are you?", filename: "conversation-4.mp3" },
    { arabic: "أنا بِخَيْر، شُكْراً. وَ أَنْتِ؟", english: "I'm fine, thank you. And you?", filename: "conversation-5.mp3" },
    { arabic: "بِخَيْر، الحَمْدُ لِله", english: "Fine, praise be to God", filename: "conversation-6.mp3" }
  ]
};

// Ensure audio directory exists
const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

function generateAudio(text, filename) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`🎵 Generating audio for: ${text}`);
      
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
        path: `/v1/text-to-speech/${MALE_VOICE_ID}`,
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

async function generateAllAudio() {
  console.log('🚀 Starting audio generation for Lesson 1.1...\n');
  
  let successCount = 0;
  let totalCount = 0;
  
  // Generate vocabulary audio
  console.log('📚 Generating vocabulary audio...');
  for (const item of lesson1_1Content.vocabulary) {
    totalCount++;
    try {
      const success = await generateAudio(item.arabic, item.filename);
      if (success) successCount++;
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to generate ${item.filename}:`, error.message);
    }
  }
  
  console.log('\n💬 Generating conversation audio...');
  for (const item of lesson1_1Content.conversation) {
    totalCount++;
    try {
      const success = await generateAudio(item.arabic, item.filename);
      if (success) successCount++;
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to generate ${item.filename}:`, error.message);
    }
  }
  
  console.log(`\n🎯 Audio generation complete!`);
  console.log(`✅ Success: ${successCount}/${totalCount} files`);
  console.log(`📁 Files saved to: ${audioDir}`);
  
  // Create manifest file
  const manifest = {
    lesson: "1.1 - Greetings & Basic Phrases",
    generated: new Date().toISOString(),
    files: [...lesson1_1Content.vocabulary, ...lesson1_1Content.conversation]
  };
  
  const manifestPath = path.join(audioDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 Manifest created: manifest.json`);
}

// Check if required environment variables are set
if (!ELEVENLABS_API_KEY || !MALE_VOICE_ID) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure REACT_APP_ELEVENLABS_API_KEY and REACT_APP_ELEVENLABS_MALE_VOICE_ID are set in your .env file');
  process.exit(1);
}

// Run the audio generation
generateAllAudio().catch(console.error);
