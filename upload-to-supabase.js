const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Audio directory path
const audioDir = path.join(__dirname, 'public', 'audio');

async function uploadAudioFile(filename) {
  try {
    const filePath = path.join(audioDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filename}`);
      return false;
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`📤 Uploading: ${filename}`);
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(filename, fileBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`❌ Upload failed for ${filename}:`, error.message);
      return false;
    }

    console.log(`✅ Uploaded: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${filename}:`, error.message);
    return false;
  }
}

async function uploadAllAudio() {
  try {
    console.log('🚀 Starting upload to Supabase...\n');
    
    // Check if audio directory exists
    if (!fs.existsSync(audioDir)) {
      console.error('❌ Audio directory not found:', audioDir);
      return;
    }

    // Get all MP3 files
    const files = fs.readdirSync(audioDir)
      .filter(file => file.endsWith('.mp3'))
      .sort();

    console.log(`📁 Found ${files.length} audio files to upload\n`);

    let successCount = 0;
    let totalCount = files.length;

    // Upload each file
    for (const filename of files) {
      const success = await uploadAudioFile(filename);
      if (success) successCount++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎯 Upload complete!`);
    console.log(`✅ Success: ${successCount}/${totalCount} files`);
    console.log(`📁 Files uploaded to Supabase 'audio' bucket`);
    
    if (successCount === totalCount) {
      console.log(`\n🎉 All files uploaded successfully!`);
      console.log(`🌐 Your Arabic audio is now available in the cloud!`);
    } else {
      console.log(`\n⚠️  Some files failed to upload. Check the errors above.`);
    }

  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
  }
}

// Check if required environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

// Run the upload
uploadAllAudio().catch(console.error);
