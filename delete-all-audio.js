const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deleteAllAudioFiles() {
  try {
    console.log('🗑️  Starting deletion of all audio files from Supabase...\n');
    
    // List all files in the audio bucket
    const { data: files, error: listError } = await supabase.storage
      .from('audio')
      .list('', { limit: 100 });
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }
    
    if (!files || files.length === 0) {
      console.log('📭 Audio bucket is already empty!');
      return;
    }
    
    console.log(`📁 Found ${files.length} files to delete:`);
    files.forEach(file => console.log(`   - ${file.name}`));
    
    // Delete all files
    const fileNames = files.map(file => file.name);
    const { error: deleteError } = await supabase.storage
      .from('audio')
      .remove(fileNames);
    
    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError);
      return;
    }
    
    console.log(`\n✅ Successfully deleted ${files.length} files from Supabase audio bucket!`);
    console.log('🗂️  Bucket is now clean and ready for new audio files.');
    
  } catch (error) {
    console.error('❌ Deletion process failed:', error.message);
  }
}

// Run the deletion
deleteAllAudioFiles().catch(console.error);
