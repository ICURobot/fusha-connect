const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function replaceAudioFile(filename) {
  try {
    console.log(`🗑️ Deleting old ${filename} from Supabase...`);
    
    const { error: deleteError } = await supabase.storage
      .from('audio')
      .remove([filename]);
    
    if (deleteError) {
      console.error(`❌ Delete failed:`, deleteError.message);
      return false;
    }
    
    console.log(`✅ Old file deleted, now uploading new version...`);
    
    const filePath = path.join(__dirname, 'public', 'audio', filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Local file not found: ${filename}`);
      return false;
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filename, fileBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error(`❌ Upload failed:`, uploadError.message);
      return false;
    }
    
    console.log(`✅ New file uploaded successfully!`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error replacing ${filename}:`, error.message);
    return false;
  }
}

const filename = process.argv[2];
if (!filename) {
  console.error('❌ Please provide a filename as an argument');
  process.exit(1);
}

replaceAudioFile(filename).catch(console.error);


