# Lesson 2.1 Audio Setup Guide

## 🎵 Audio Functionality for Lesson 2.1: Countries & Nationalities

### ✅ What's Already Done

1. **Audio Mappings Added** - All Lesson 2.1 text-to-audio mappings are now in `src/utils/audio.ts`
2. **Build Tested** - Project builds successfully with the new audio mappings
3. **Upload Script Created** - `upload-lesson2-1-to-supabase.js` is ready to use
4. **Local Backup Structure** - Audio files will be stored in `/public/audio/` folder

### 🔧 What You Need to Do

#### Step 1: Generate Proper Audio Files
The current audio files are too small (16 bytes) because the `say` command didn't work properly. You need to:

**Option A: Use ElevenLabs (Recommended)**
```bash
# Install ElevenLabs CLI or use their web interface
# Generate audio for each Arabic phrase with appropriate voices
# Save as MP3 files with the exact names listed below
```

**Option B: Use Another TTS Service**
- Google Cloud TTS
- Amazon Polly
- Microsoft Azure Speech
- Or any other Arabic TTS service

#### Step 2: Audio File Requirements

**Vocabulary Files (Male Voice - Ahmed):**
- `lesson2-1-vocab-1.mp3` - مِصْر (Egypt)
- `lesson2-1-vocab-2.mp3` - مِصْرِيّ / مِصْرِيّة (Egyptian m/f)
- `lesson2-1-vocab-3.mp3` - سوريا (Syria)
- `lesson2-1-vocab-4.mp3` - سورِيّ / سوريّة (Syrian m/f)
- `lesson2-1-vocab-5.mp3` - لُبْنان (Lebanon)
- `lesson2-1-vocab-6.mp3` - لُبْنانيّ / لُبْنانيّة (Lebanese m/f)
- `lesson2-1-vocab-7.mp3` - العِراق (Iraq)
- `lesson2-1-vocab-8.mp3` - عِراقيّ / عِراقيّة (Iraqi m/f)
- `lesson2-1-vocab-9.mp3` - أمريكا (America)
- `lesson2-1-vocab-10.mp3` - أمريكيّ / أمريكيّة (American m/f)
- `lesson2-1-vocab-11.mp3` - مِنْ أَيْنَ؟ (From where?)

**Example Sentences Files:**
- `lesson2-1-sentence-1.mp3` - هُوَ مِنْ مِصْر. (male voice)
- `lesson2-1-sentence-2.mp3` - إِذَنْ، هُوَ مِصْرِيّ. (male voice)
- `lesson2-1-sentence-3.mp3` - هِيَ مِنْ سوريا. (female voice)
- `lesson2-1-sentence-4.mp3` - إِذَنْ، هِيَ سوريّة. (female voice)
- `lesson2-1-sentence-5.mp3` - مِنْ أَيْنَ أَنْتَ؟ (male voice)
- `lesson2-1-sentence-6.mp3` - أنا أمريكيّ. (male voice)

#### Step 3: Place Audio Files
Put all the MP3 files in the `/public/audio/` folder.

#### Step 4: Upload to Supabase
```bash
# Make sure your .env file has Supabase credentials
node upload-lesson2-1-to-supabase.js
```

#### Step 5: Test Audio Functionality
1. Start the development server: `npm start`
2. Navigate to Lesson 2.1: Countries & Nationalities
3. Click the audio buttons on vocabulary and example sentences
4. Verify that audio plays correctly and caches properly

### 🎯 Audio Mapping Details

The audio system uses exact text matches as keys:
- **Vocabulary**: `{arabic_text}-male` → `lesson2-1-vocab-X.mp3`
- **Sentences**: `{arabic_text}-{voice}` → `lesson2-1-sentence-X.mp3`

**Example mappings:**
```typescript
'مِصْر-male': 'lesson2-1-vocab-1.mp3',
'هُوَ مِنْ مِصْر.-male': 'lesson2-1-sentence-1.mp3',
'هِيَ مِنْ سوريا-female': 'lesson2-1-sentence-3.mp3'
```

### 🔍 Troubleshooting

**Audio not playing:**
1. Check browser console for errors
2. Verify audio files exist in Supabase bucket
3. Check filename mappings in `src/utils/audio.ts`
4. Ensure audio files are valid MP3 format

**Build errors:**
1. Run `npm run build` to check for syntax errors
2. Verify all audio mappings have proper syntax
3. Check that all referenced files exist

### 📁 File Structure
```
public/audio/
├── lesson2-1-vocab-1.mp3      # مِصْر
├── lesson2-1-vocab-2.mp3      # مِصْرِيّ / مِصْرِيّة
├── lesson2-1-vocab-3.mp3      # سوريا
├── ... (all vocabulary files)
├── lesson2-1-sentence-1.mp3   # هُوَ مِنْ مِصْر.
├── lesson2-1-sentence-2.mp3   # إِذَنْ، هُوَ مِصْرِيّ.
├── ... (all sentence files)
└── lesson2-1-manifest.json    # Audio file manifest
```

### 🚀 Next Steps
Once audio files are properly generated and uploaded:
1. Test all audio buttons in the lesson
2. Verify audio caching works (repeated playback)
3. Check that male/female voices are correct
4. Ensure no duplicate keys exist in the mapping

### 📞 Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify Supabase bucket permissions
3. Test with a simple audio file first
4. Ensure all environment variables are set correctly
