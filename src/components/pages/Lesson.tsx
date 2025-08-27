import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { curriculum } from "../../entities/Curriculum";
import { Module } from "../../entities/Curriculum";
import { BookOpen, Target, CheckCircle2, Circle, ArrowLeft, ArrowRight, Play, MessageCircle, PenTool, Volume2, Loader2 } from "lucide-react";
import { generateAudio, playAudio as playAudioUtil, cleanupAudioUrl, getAudioFromSupabase } from "../../utils/audio";
import { Button } from "../ui/button";

export default function Lesson() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({});
  const [audioLoading, setAudioLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (moduleId) {
      // Find the module in the curriculum
      for (const level of curriculum) {
        const module = level.modules.find(m => m.id === moduleId);
        if (module) {
          setCurrentModule(module);
          break;
        }
      }
    }
    setIsLoading(false);
  }, [moduleId]);

  // Cleanup audio URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(audioUrls).forEach(url => cleanupAudioUrl(url));
    };
  }, [audioUrls]);

  const handleLessonComplete = (lessonId: string) => {
    if (currentModule) {
      // Update lesson completion status (placeholder for now)
      console.log(`Lesson ${lessonId} completed`);
      
      // Move to next lesson if available
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      }
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentModule && currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handleOptionChange = (questionIndex: number, option: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const playAudio = async (text: string, voiceType: 'male' | 'female' = 'male') => {
    const key = `${text}-${voiceType}`;
    
    // If audio already exists, play it
    if (audioUrls[key]) {
      playAudioUtil(audioUrls[key]);
      return;
    }
    
    // Set loading state
    setAudioLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      // First try to get from backup
      const backupAudio = await getAudioFromSupabase(text, voiceType);
      if (backupAudio) {
        setAudioUrls(prev => ({ ...prev, [key]: backupAudio }));
        playAudioUtil(backupAudio);
        setAudioLoading(prev => ({ ...prev, [key]: false }));
        return;
      }
      
      // If no backup, generate new audio
      const result = await generateAudio(text, voiceType);
      if (result.success && result.audioUrl) {
        setAudioUrls(prev => ({ ...prev, [key]: result.audioUrl! }));
        playAudioUtil(result.audioUrl);
      } else {
        console.error('Failed to generate audio:', result.error);
      }
    } catch (error) {
      console.error('Audio generation error:', error);
    } finally {
      setAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-2xl w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded-2xl w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="clay-card p-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Module Not Found</h1>
          <p className="text-gray-600 mb-6">The module you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')} className="clay-button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentLesson = currentModule.lessons[currentLessonIndex];
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === currentModule.lessons.length - 1;

  // Debug logging
  console.log('Current lesson ID:', currentLesson?.id, 'Current lesson index:', currentLessonIndex);

  // Placeholder data for exercises (replace with actual data)
  const lesson1_1Vocabulary = [
    { arabic: "مَرْحَباً", transliteration: "marhaban", meaning: "Hello", audioUrl: "" },
    { arabic: "كَيْفَ حَالُكِ؟", transliteration: "kayfa haaluki", meaning: "How are you? (feminine form)", audioUrl: "" },
    { arabic: "أَنَا بِخَيْرٍ", transliteration: "ana bkhayr", meaning: "I'm fine", audioUrl: "" },
    { arabic: "أَنَا جَيِّدٌ", transliteration: "ana jayd", meaning: "I'm good", audioUrl: "" },
    { arabic: "أَنَا جَيِّدٌ جِدّاً", transliteration: "ana jayd jadhan", meaning: "I'm very good", audioUrl: "" },
  ];

  const lesson1_1Conversation = [
    { speaker: "Khalid", arabic: "مَرْحَباً", english: "Hello" },
    { speaker: "Maryam", arabic: "أَهْلاً وَ سَهْلاً", english: "Welcome" },
    { speaker: "Khalid", arabic: "كَيْفَ حَالُكِ؟", english: "How are you? (to female)" },
    { speaker: "Maryam", arabic: "بِخَيْر، شُكْراً", english: "Fine, thank you" },
    { speaker: "Khalid", arabic: "مِن أَيْنَ أَنْتِ؟", english: "Where are you from?" },
    { speaker: "Maryam", arabic: "أَنَا مِن مِصْر", english: "I'm from Egypt" }
  ];

  const lesson1_1Exercises = [
    {
      question: "What is the correct response to 'مَرْحَباً'?",
      options: ["مَرْحَباً", "كَيْفَ حَالُكَ؟", "أَنَا بِخَيْرٍ", "أَنَا جَيِّدٌ", "أَنَا جَيِّدٌ جِدّاً"],
      correctAnswer: "مَرْحَباً",
    },
    {
      question: "What is the correct response to 'كَيْفَ حَالُكِ؟'?",
      options: ["مَرْحَباً", "كَيْفَ حَالُكِ؟", "أَنَا بِخَيْرٍ", "أَنَا جَيِّدٌ", "أَنَا جَيِّدٌ جِدّاً"],
      correctAnswer: "أَنَا بِخَيْرٍ",
    },
    {
      question: "What is the correct response to 'أَنَا بِخَيْرٍ'?",
      options: ["مَرْحَباً", "كَيْفَ حَالُكَ؟", "أَنَا بِخَيْرٍ", "أَنَا جَيِّدٌ", "أَنَا جَيِّدٌ جِدّاً"],
      correctAnswer: "أَنَا جَيِّدٌ",
    },
  ];

  const lesson1_2Vocabulary = [
    { arabic: "الطَّالِبُ", transliteration: "atalib", meaning: "Student", audioUrl: "" },
    { arabic: "الطَّالِبَةُ", transliteration: "ataliba", meaning: "Female Student", audioUrl: "" },
    { arabic: "المُدَرِّسُ", transliteration: "madras", meaning: "Teacher", audioUrl: "" },
    { arabic: "المَدْرَسَةُ", transliteration: "madrasa", meaning: "School", audioUrl: "" },
    { arabic: "الكِتابُ", transliteration: "kitab", meaning: "Book", audioUrl: "" },
  ];

  const lesson1_2ExampleSentences = [
    { arabic: "الطَّالِبُ جَدِيدٌ", english: "The student is new" },
    { arabic: "الطَّالِبَةُ جَدِيدَةٌ", english: "The female student is new" },
    { arabic: "المُدَرِّسُ جَدِيدٌ", english: "The teacher is new" },
    { arabic: "المَدْرَسَةُ جَدِيدَةٌ", english: "The school is new" },
    { arabic: "الكِتابُ جَدِيدٌ", english: "The book is new" },
  ];

  const lesson1_2Exercises = [
    {
      question: "What is the correct response to 'الطَّالِبُ جَدِيدٌ'?",
      options: ["الطَّالِبُ جَدِيدٌ", "الطَّالِبَةُ جَدِيدَةٌ", "المُدَرِّسُ جَدِيدٌ", "المَدْرَسَةُ جَدِيدَةٌ", "الكِتابُ جَدِيدٌ"],
      correctAnswer: "الطَّالِبُ جَدِيدٌ",
    },
    {
      question: "What is the correct response to 'الطَّالِبَةُ جَدِيدَةٌ'?",
      options: ["الطَّالِبُ جَدِيدٌ", "الطَّالِبَةُ جَدِيدَةٌ", "المُدَرِّسُ جَدِيدٌ", "المَدْرَسَةُ جَدِيدَةٌ", "الكِتابُ جَدِيدٌ"],
      correctAnswer: "الطَّالِبَةُ جَدِيدَةٌ",
    },
    {
      question: "What is the correct response to 'المُدَرِّسُ جَدِيدٌ'?",
      options: ["الطَّالِبُ جَدِيدٌ", "الطَّالِبَةُ جَدِيدَةٌ", "المُدَرِّسُ جَدِيدٌ", "المَدْرَسَةُ جَدِيدَةٌ", "الكِتابُ جَدِيدٌ"],
      correctAnswer: "المُدَرِّسُ جَدِيدٌ",
    },
  ];

  const lesson1_3Vocabulary = [
    { arabic: "هٰذَا", transliteration: "haadhaa", meaning: "this (masculine)", audioUrl: "" },
    { arabic: "هٰذِهِ", transliteration: "haadhihi", meaning: "this (feminine)", audioUrl: "" },
    { arabic: "بَيْتٌ", transliteration: "bayt", meaning: "house", audioUrl: "" },
    { arabic: "سَيَّارَةٌ", transliteration: "sayyaara", meaning: "car", audioUrl: "" },
    { arabic: "كِتابٌ", transliteration: "kitaab", meaning: "book", audioUrl: "" },
    { arabic: "قَلَمٌ", transliteration: "qalam", meaning: "pen", audioUrl: "" },
    { arabic: "طاوِلَةٌ", transliteration: "Taawila", meaning: "table", audioUrl: "" },
    { arabic: "رَجُلٌ", transliteration: "rajul", meaning: "man", audioUrl: "" },
    { arabic: "اِمْرَأَةٌ", transliteration: "imra'a", meaning: "woman", audioUrl: "" },
    { arabic: "جَمِيلٌ / جَمِيلَةٌ", transliteration: "jamiil / jamiila", meaning: "beautiful (m/f)", audioUrl: "" },
    { arabic: "قَدِيمٌ / قَدِيمَةٌ", transliteration: "qadiim / qadiima", meaning: "old (m/f)", audioUrl: "" },
    { arabic: "واسِعٌ / واسِعَةٌ", transliteration: "waasi' / waasi'a", meaning: "spacious, wide (m/f)", audioUrl: "" },
  ];

  const lesson1_3ExampleSentences = [
    { arabic: "هٰذَا بَيْتٌ.", english: "This is a house." },
    { arabic: "هٰذِهِ سَيَّارَةٌ.", english: "This is a car." },
    { arabic: "هٰذَا قَلَمٌ جَمِيلٌ.", english: "This is a beautiful pen." },
    { arabic: "هٰذِهِ طاوِلَةٌ كَبِيرَةٌ.", english: "This is a big table." },
    { arabic: "هٰذَا رَجُلٌ مُهَنْدِسٌ.", english: "This man is an engineer." },
    { arabic: "هٰذِهِ اِمْرَأَةٌ مُدَرِّسَةٌ.", english: "This woman is a teacher." },
  ];

  const lesson1_3Exercises = [
    {
      question: "Choose the correct demonstrative pronoun for the word 'سَيَّارَةٌ' (car).",
      options: ["هٰذَا", "هٰذِهِ", "هُوَ", "هِيَ"],
      correctAnswer: "هٰذِهِ",
    },
    {
      question: "How do you say 'This is an old book'?",
      options: ["هٰذِهِ كِتابٌ قَدِيمٌ.", "هٰذَا كِتابٌ قَدِيمَةٌ.", "هٰذَا كِتابٌ قَدِيمٌ.", "هٰذِهِ كِتابٌ قَدِيمَةٌ."],
      correctAnswer: "هٰذَا كِتابٌ قَدِيمٌ.",
    },
    {
      question: "The sentence 'هٰذَا بَيْتٌ واسِعٌ.' means:",
      options: ["This is a new house.", "This is a spacious house.", "This is an old house.", "This is a small house."],
      correctAnswer: "This is a spacious house.",
    },
  ];

  const lesson1_4Vocabulary = [
    { arabic: "الـ", transliteration: "al-", meaning: "the (definite article)", audioUrl: "" },
    { arabic: "بابٌ", transliteration: "baab", meaning: "door", audioUrl: "" },
    { arabic: "شَمْسٌ", transliteration: "shams", meaning: "sun", audioUrl: "" },
    { arabic: "قَمَرٌ", transliteration: "qamar", meaning: "moon", audioUrl: "" },
    { arabic: "مِفْتاحٌ", transliteration: "miftaaH", meaning: "key", audioUrl: "" },
    { arabic: "نَجْمٌ", transliteration: "najm", meaning: "star", audioUrl: "" },
    { arabic: "وَلَدٌ", transliteration: "walad", meaning: "boy", audioUrl: "" },
    { arabic: "دَفْتَرٌ", transliteration: "daftar", meaning: "notebook", audioUrl: "" },
  ];

  const lesson1_4ExampleSentences = [
    { arabic: "البابُ مَفْتوحٌ.", english: "The door is open." },
    { arabic: "القَمَرُ جَمِيلٌ.", english: "The moon is beautiful." },
    { arabic: "الشَّمْسُ كَبِيرَةٌ.", english: "The sun is big." },
    { arabic: "النَّجْمُ صَغِيرٌ.", english: "The star is small." },
    { arabic: "هٰذَا هُوَ الوَلَدُ.", english: "This is the boy." },
    { arabic: "الدَّفْتَرُ عَلى الطّاوِلَةِ.", english: "The notebook is on the table." },
  ];

  const lesson1_4Exercises = [
    {
      question: "The letter 'ب' (b) in 'بابٌ' is a:",
      options: ["Sun Letter", "Moon Letter"],
      correctAnswer: "Moon Letter",
    },
    {
      question: "How do you correctly write and pronounce 'the sun'?",
      options: ["ال شَمْسٌ (al shams)", "الشَّمْسُ (ash-shams)"],
      correctAnswer: "الشَّمْسُ (ash-shams)",
    },
    {
      question: "When 'الـ' is added to a word starting with a Sun Letter, the 'ل' is...",
      options: ["Pronounced loudly", "Silent", "Also doubled", "Removed"],
      correctAnswer: "Silent",
    },
  ];

  const moonLetters = "أ ب ج ح خ ع غ ف ق ك م هـ و ي";
  const sunLetters = "ت ث د ذ ر ز س ش ص ض ط ظ ل ن";

  // Lesson 2.1: Countries & Nationalities
  const lesson2_1Vocabulary = [
    { arabic: "مِصْر", transliteration: "miSr", meaning: "Egypt", audioUrl: "" },
    { arabic: "مِصْرِيّ / مِصْرِيّة", transliteration: "miSriyy / miSriyya", meaning: "Egyptian (m/f)", audioUrl: "" },
    { arabic: "سوريا", transliteration: "suuriya", meaning: "Syria", audioUrl: "" },
    { arabic: "سورِيّ / سوريّة", transliteration: "suuriyy / suuriyya", meaning: "Syrian (m/f)", audioUrl: "" },
    { arabic: "لُبْنان", transliteration: "lubnaan", meaning: "Lebanon", audioUrl: "" },
    { arabic: "لُبْنانيّ / لُبْنانيّة", transliteration: "lubnaaniyy / lubnaaniyya", meaning: "Lebanese (m/f)", audioUrl: "" },
    { arabic: "العِراق", transliteration: "al-'iraaq", meaning: "Iraq", audioUrl: "" },
    { arabic: "عِراقيّ / عِراقيّة", transliteration: "'iraaqiyy / 'iraaqiyya", meaning: "Iraqi (m/f)", audioUrl: "" },
    { arabic: "أمريكا", transliteration: "amriika", meaning: "America", audioUrl: "" },
    { arabic: "أمريكيّ / أمريكيّة", transliteration: "amriikiyy / amriikiyya", meaning: "American (m/f)", audioUrl: "" },
    { arabic: "مِنْ أَيْنَ؟", transliteration: "min ayna?", meaning: "From where?", audioUrl: "" },
  ];

  const lesson2_1ExampleSentences = [
    { arabic: "هُوَ مِنْ مِصْر.", english: "He is from Egypt." },
    { arabic: "إِذَنْ، هُوَ مِصْرِيّ.", english: "Therefore, he is Egyptian." },
    { arabic: "هِيَ مِنْ سوريا.", english: "She is from Syria." },
    { arabic: "إِذَنْ، هِيَ سوريّة.", english: "Therefore, she is Syrian." },
    { arabic: "مِنْ أَيْنَ أَنْتَ؟", english: "Where are you from? (to a male)" },
    { arabic: "أنا أمريكيّ.", english: "I am American. (male speaker)" },
  ];

  const lesson2_1Exercises = [
    {
      question: "A man from 'لُبْنان' (Lebanon) is...",
      options: ["لُبْنانيّة", "لُبْنانيّ", "لُبْنان", "لُبْنانيّات"],
      correctAnswer: "لُبْنانيّ"
    },
    {
      question: "How would a woman from 'العِراق' (Iraq) describe herself?",
      options: ["أنا عِراقيّ.", "أنا عِراقيّة.", "أنا مِنْ عِراقيّ.", "أنا العِراق."],
      correctAnswer: "أنا عِراقيّة."
    },
    {
      question: "The adjective used to describe nationality is called:",
      options: ["Ta' Marbuta", "Idaafa", "Nisba", "Shadda"],
      correctAnswer: "Nisba"
    }
  ];

  // Lesson 2.2: "This is..." & Question Words
  const lesson2_2Vocabulary = [
    { arabic: "مَا؟", transliteration: "maa?", meaning: "What? (for non-humans)", audioUrl: "" },
    { arabic: "مَنْ؟", transliteration: "man?", meaning: "Who? (for humans)", audioUrl: "" },
    { arabic: "مَكْتَبٌ", transliteration: "maktabun", meaning: "desk, office", audioUrl: "" },
    { arabic: "نَافِذَةٌ", transliteration: "naafidhatun", meaning: "window", audioUrl: "" },
    { arabic: "طَبِيبٌ / طَبِيبَةٌ", transliteration: "Tabiibun / Tabiibatun", meaning: "doctor (m/f)", audioUrl: "" },
    { arabic: "مُمَرِّضٌ / مُمَرِّضَةٌ", transliteration: "mumarriDun / mumarriDatun", meaning: "nurse (m/f)", audioUrl: "" },
    { arabic: "بَابٌ", transliteration: "baabun", meaning: "door", audioUrl: "" },
    { arabic: "صَدِيقٌ / صَدِيقَةٌ", transliteration: "Sadiiqun / Sadiiqatun", meaning: "friend (m/f)", audioUrl: "" },
  ];

  const lesson2_2ExampleSentences = [
    { arabic: "مَا هَذَا؟", english: "What is this? (pointing to masc. object)", isQuestion: true },
    { arabic: "هَذَا مَكْتَبٌ.", english: "This is a desk.", isQuestion: false },
    { arabic: "مَا هَذِهِ؟", english: "What is this? (pointing to fem. object)", isQuestion: true },
    { arabic: "هَذِهِ نَافِذَةٌ.", english: "This is a window.", isQuestion: false },
    { arabic: "مَنْ هَذَا؟", english: "Who is this? (pointing to a male)", isQuestion: true },
    { arabic: "هَذَا صَدِيقِي.", english: "This is my friend (male).", isQuestion: false },
    { arabic: "مَنْ هَذِهِ؟", english: "Who is this? (pointing to a female)", isQuestion: true },
    { arabic: "هَذِهِ طَبِيبَةٌ.", english: "This is a (female) doctor.", isQuestion: false },
  ];

  const lesson2_2Exercises = [
    {
      question: "You are pointing to a male doctor (طَبِيبٌ). What do you ask?",
      options: ["مَا هَذَا؟", "مَنْ هَذَا؟", "مَا هَذِهِ؟", "مَنْ هَذِهِ؟"],
      correctAnswer: "مَنْ هَذَا؟"
    },
    {
      question: "You are pointing to a window (نَافِذَةٌ). What do you ask?",
      options: ["مَا هَذَا؟", "مَنْ هَذَا؟", "مَا هَذِهِ؟", "مَنْ هَذِهِ؟"],
      correctAnswer: "مَا هَذِهِ؟"
    },
    {
      question: "Someone asks you, 'مَنْ هَذِهِ؟'. A correct response could be:",
      options: ["هَذَا بَابٌ.", "هَذِهِ صَدِيقَتِي.", "هَذَا صَدِيقِي.", "هَذِهِ نَافِذَةٌ."],
      correctAnswer: "هَذِهِ صَدِيقَتِي."
    }
  ];

  // Lesson 2.3: Attached Pronouns (Possession)
  const lesson2_3Vocabulary = [
    { arabic: "ـي", transliteration: "-ī", meaning: "my", audioUrl: "" },
    { arabic: "ـكَ", transliteration: "-ka", meaning: "your (masc.)", audioUrl: "" },
    { arabic: "ـكِ", transliteration: "-ki", meaning: "your (fem.)", audioUrl: "" },
    { arabic: "ـهُ", transliteration: "-hu", meaning: "his", audioUrl: "" },
    { arabic: "ـهَا", transliteration: "-hā", meaning: "her", audioUrl: "" },
    { arabic: "اِسْمٌ", transliteration: "ismun", meaning: "name", audioUrl: "" },
    { arabic: "كِتَابٌ", transliteration: "kitābun", meaning: "book", audioUrl: "" },
    { arabic: "صَدِيقٌ", transliteration: "ṣadīqun", meaning: "friend (male)", audioUrl: "" },
    { arabic: "صَدِيقَةٌ", transliteration: "ṣadīqatun", meaning: "friend (female)", audioUrl: "" },
    { arabic: "سَيَّارَةٌ", transliteration: "sayyāratun", meaning: "car", audioUrl: "" },
  ];

  const lesson2_3ExampleSentences = [
    { arabic: "اِسْمِي خَالِدٌ.", english: "My name is Khalid." },
    { arabic: "هَذَا كِتَابُكَ.", english: "This is your book. (to a male)" },
    { arabic: "هَذِهِ سَيَّارَتُكِ.", english: "This is your car. (to a female)" },
    { arabic: "صَدِيقُهُ مُهَنْدِسٌ.", english: "His friend is an engineer." },
    { arabic: "اِسْمُهَا مَهَا.", english: "Her name is Maha." },
    { arabic: "صَدِيقَتِي طَبِيبَةٌ.", english: "My friend (female) is a doctor." },
  ];

  const lesson2_3Exercises = [
    {
      question: "How do you say 'my book'?",
      options: ["كِتَابُكَ", "كِتَابِي", "كِتَابُهَا", "كِتَابُهُ"],
      correctAnswer: "كِتَابِي"
    },
    {
      question: "The phrase 'اِسْمُهَا' means:",
      options: ["His name", "Your name (m)", "My name", "Her name"],
      correctAnswer: "Her name"
    },
    {
      question: "You are talking to a female friend. How do you say 'your car'?",
      options: ["سَيَّارَتُكِ", "سَيَّارَتِي", "سَيَّارَتُكَ", "سَيَّارَتُهُ"],
      correctAnswer: "سَيَّارَتُكِ"
    }
  ];

  // Lesson 2.4: The Idaafa Construction
  const lesson2_4Vocabulary = [
    { arabic: "بِنْتٌ", transliteration: "bintun", meaning: "daughter / girl", audioUrl: "" },
    { arabic: "جَامِعَةٌ", transliteration: "jāmiʿatun", meaning: "university", audioUrl: "" },
    { arabic: "مَدِينَةٌ", transliteration: "madīnatun", meaning: "city", audioUrl: "" },
    { arabic: "غُرْفَةٌ", transliteration: "ghurfatun", meaning: "room", audioUrl: "" },
    { arabic: "مِفْتَاحٌ", transliteration: "miftāḥun", meaning: "key", audioUrl: "" },
    { arabic: "مَكْتَبٌ", transliteration: "maktabun", meaning: "desk / office", audioUrl: "" },
    { arabic: "اَلْمُدِيرُ", transliteration: "al-mudīru", meaning: "the director / manager", audioUrl: "" },
    { arabic: "لَوْنٌ", transliteration: "lawnun", meaning: "color", audioUrl: "" },
    { arabic: "قَمِيصٌ", transliteration: "qamīṣun", meaning: "shirt", audioUrl: "" },
    { arabic: "طَعَامٌ", transliteration: "ṭaʿāmun", meaning: "food", audioUrl: "" },
    { arabic: "مَطْبَخٌ", transliteration: "maṭbakhun", meaning: "kitchen", audioUrl: "" },
    { arabic: "صُورَةٌ", transliteration: "ṣūratun", meaning: "picture / photo", audioUrl: "" },
    { arabic: "طَبِيبٌ", transliteration: "ṭabībun", meaning: "doctor", audioUrl: "" },
    { arabic: "مُسْتَشْفَى", transliteration: "mustashfā", meaning: "hospital", audioUrl: "" },
    { arabic: "حَقِيبَةٌ", transliteration: "ḥaqībatun", meaning: "bag / suitcase", audioUrl: "" },
    { arabic: "شَارِعٌ", transliteration: "shāriʿun", meaning: "street", audioUrl: "" },
    { arabic: "نَافِذَةٌ", transliteration: "nāfidhatun", meaning: "window", audioUrl: "" },
  ];

  const lesson2_4ExampleSentences = [
    { arabic: "هَذَا بَيْتُ الْمُهَنْدِسِ.", english: "This is the engineer's house." },
    { arabic: "اِسْمُ الطَّالِبِ مُحَمَّدٌ.", english: "The student's name is Muhammad." },
    { arabic: "مِفْتَاحُ السَّيَّارَةِ جَدِيدٌ.", english: "The key of the car is new." },
    { arabic: "بِنْتُ الْمُدَرِّسَةِ فِي الْجَامِعَةِ.", english: "The teacher's daughter is at the university." },
    { arabic: "هَذَا مَكْتَبُ الْمُدِيرِ.", english: "This is the director's office." },
    { arabic: "لَوْنُ الْقَمِيصِ أَزْرَقُ.", english: "The shirt's color is blue." },
    { arabic: "نَافِذَةُ الْغُرْفَةِ كَبِيرَةٌ.", english: "The room's window is big." },
    { arabic: "صُورَةُ الْبِنْتِ جَمِيلَةٌ.", english: "The girl's picture is beautiful." },
    { arabic: "حَقِيبَةُ الطَّالِبَةِ عَلَى الْمَكْتَبِ.", english: "The student's (f) bag is on the desk." },
    { arabic: "طَعَامُ الْمَطْبَخِ لَذِيذٌ.", english: "The kitchen's food is delicious." },
    { arabic: "سَيَّارَةُ الطَّبِيبِ فِي الشَّارِعِ.", english: "The doctor's car is in the street." },
    { arabic: "اِسْمُ الْمُسْتَشْفَى \"الشِّفَاءُ\".", english: "The hospital's name is \"Al-Shifaa\"." },
    { arabic: "مِفْتَاحُ الْبَابِ صَغِيرٌ.", english: "The key of the door is small." },
    { arabic: "مَدِينَةُ الْقَاهِرَةِ فِي مِصْرَ.", english: "The city of Cairo is in Egypt." },
    { arabic: "جَامِعَةُ دِمَشْقَ قَدِيمَةٌ.", english: "The University of Damascus is old." },
  ];

  const lesson2_4Exercises = [
    {
      question: "Which of these is a grammatically correct Idaafa construction for 'the student's book'?",
      options: ["اَلْكِتَابُ الطَّالِبِ", "كِتَابُ الطَّالِبِ", "كِتَابٌ الطَّالِبِ", "اَلْكِتَابُ اَلطَّالِبِ"],
      correctAnswer: "كِتَابُ الطَّالِبِ"
    },
    {
      question: "In the phrase 'بَابُ الْبَيْتِ' (the door of the house), the word 'بَابُ' is the...",
      options: ["MuDaaf", "MuDaaf ilayhi"],
      correctAnswer: "MuDaaf"
    },
    {
      question: "The first noun (MuDaaf) in an Idaafa can NEVER have:",
      options: ["A fatha", "A kasra", "al- and tanwiin", "A Damma"],
      correctAnswer: "al- and tanwiin"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Module Header */}
      <div className="clay-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{currentModule.title}</h1>
              <p className="text-gray-600">{currentModule.description}</p>
            </div>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="clay-button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Can-Do Statement */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-400">
          <div className="flex items-start space-x-2">
            <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Can-Do Statement:</p>
              <p className="text-sm text-green-700 italic">"{currentModule.canDoStatement}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Navigation */}
      <div className="clay-card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Lesson {currentLessonIndex + 1} of {currentModule.lessons.length}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentLessonIndex + 1} / {currentModule.lessons.length}
            </span>
          </div>
        </div>

        {/* Lesson Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentLessonIndex + 1) / currentModule.lessons.length) * 100}%` }}
          ></div>
        </div>

        {/* Lesson List */}
        <div className="grid gap-3">
          {currentModule.lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              onClick={() => setCurrentLessonIndex(index)}
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                index === currentLessonIndex
                  ? 'border-blue-500 bg-blue-50'
                  : index < currentLessonIndex
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {index < currentLessonIndex ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : index === currentLessonIndex ? (
                <Play className="w-5 h-5 text-blue-600 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  index === currentLessonIndex ? 'text-blue-800' : 
                  index < currentLessonIndex ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {lesson.title}
                </p>
                {lesson.description && (
                  <p className={`text-sm ${
                    index === currentLessonIndex ? 'text-blue-600' : 
                    index < currentLessonIndex ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {lesson.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson Content */}
      {currentLesson.id === "a1-m1-l1" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">{currentLesson.title}</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn the essential phrases for your first conversations in Arabic.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn and use formal and informal greetings.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Practice the call-and-response nature of Arabic greetings.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Ask "How are you?" and provide a simple answer.</span>
              </li>
            </ul>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                                  <tbody>
                    {lesson1_1Vocabulary.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                        <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                        <td className="p-3 text-gray-700">{item.meaning}</td>
                        <td className="p-3">
                          <button 
                            onClick={() => playAudio(item.arabic, 'male')}
                            disabled={audioLoading[`${item.arabic}-male`]}
                            className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                            title="Play audio"
                          >
                            {audioLoading[`${item.arabic}-male`] ? (
                              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </div>

          {/* Conversation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Conversation</h4>
            <div className="space-y-4">
              {lesson1_1Conversation.map((line, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 font-bold text-blue-600 min-w-[60px]">{line.speaker}:</div>
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{line.arabic}</p>
                    <p className="text-sm text-gray-500">{line.english}</p>
                  </div>
                  <button 
                    onClick={() => playAudio(`conversation-${line.arabic}`, line.speaker === 'Khalid' ? 'male' : 'female')}
                    disabled={audioLoading[`conversation-${line.arabic}-${line.speaker === 'Khalid' ? 'male' : 'female'}`]}
                    className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                    title={`Play ${line.speaker === 'Khalid' ? 'male' : 'female'} voice`}
                  >
                    {audioLoading[`conversation-${line.arabic}-${line.speaker === 'Khalid' ? 'male' : 'female'}`] ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar & Culture Notes */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>Grammar & Culture Notes</span>
            </h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Many Arabic greetings have a standard response. It's like a script you learn. For example, 'as-salaamu 'alaykum' is always answered with 'wa 'alaykum as-salaam'.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>The phrase 'al-Hamdu lillah' (Praise be to God) is a very common response to 'How are you?', expressing gratitude.</span>
              </li>
            </ul>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson1_1Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className={`${q.options.some(opt => opt.match(/[\u0600-\u06FF]/)) ? 'text-lg' : ''} text-right flex-1`} lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m1-l2" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">{currentLesson.title}</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn to build basic Arabic sentences without using any verbs.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand the concept of the Nominal Sentence (الجملة الاسمية).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn the basic subject pronouns (I, you, he, she).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand gender in Arabic and how adjectives must agree with nouns.</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: The Nominal Sentence</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">No Verb "To Be"</h5>
                <p className="text-gray-600">In Arabic, the simplest sentences don't need a verb in the present tense. A sentence like "The student is new" is just two words: "The student" (الطالِب) and "new" (جَديد). The "is" is understood. This is called a <strong>Nominal Sentence</strong> because it starts with a noun.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Gender and the Ta' Marbuta (ة)</h5>
                <p className="text-gray-600">Most nouns in Arabic are either masculine or feminine. The easiest way to spot a feminine noun is by the <strong>Ta' Marbuta (ة)</strong> at the end. For example, `طالِب` (Taalib) is a male student, while `طالِبة` (Taaliba) is a female student.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Adjective Agreement</h5>
                <p className="text-gray-600">Adjectives must <strong>agree</strong> with the noun they describe in gender. If the noun is feminine, the adjective must also be made feminine, usually by adding a Ta' Marbuta (ة).</p>
                <p className="text-gray-700 mt-2 font-medium">Example: `طالِب جَديد` (a new male student) vs. `طالِبة جَديدة` (a new female student).</p>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson1_2Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => playAudio(item.arabic, 'male')}
                          disabled={audioLoading[`${item.arabic}-male`]}
                          className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                          title="Play audio"
                        >
                          {audioLoading[`${item.arabic}-male`] ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Sentences</h4>
            <div className="space-y-4">
              {lesson1_2ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                    <p className="text-sm text-gray-500">{sentence.english}</p>
                  </div>
                  <button 
                    onClick={() => playAudio(sentence.arabic, 'male')}
                    disabled={audioLoading[`${sentence.arabic}-male`]}
                    className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                    title="Play audio"
                  >
                    {audioLoading[`${sentence.arabic}-male`] ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson1_2Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m1-l3" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Gender, Agreement, and Demonstratives</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn to point to and describe objects using demonstrative pronouns.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn the demonstrative pronouns <span className="font-bold" lang="ar" dir="rtl">هذا</span> (this, masc.) and <span className="font-bold" lang="ar" dir="rtl">هذه</span> (this, fem.).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Combine demonstratives with nouns and adjectives to form descriptive sentences.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Reinforce your understanding of gender agreement.</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Demonstrative Pronouns</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Pointing Things Out</h5>
                <p className="text-gray-600">In Arabic, the word for "this" changes based on the gender of the noun you are pointing to. This is a core rule you will use constantly.</p>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>Use <span className="font-bold text-lg" lang="ar" dir="rtl">هذا (haadhaa)</span> for <strong>masculine</strong> nouns.</li>
                  <li>Use <span className="font-bold text-lg" lang="ar" dir="rtl">هذه (haadhihi)</span> for <strong>feminine</strong> nouns (usually those ending in ة).</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Building Sentences</h5>
                <p className="text-gray-600">You can now combine what you learned in the last lesson with these new words. The structure is simple: <strong>Demonstrative + Noun + Adjective</strong>. Remember, the adjective must agree in gender with the noun.</p>
                <div className="mt-3 border-t pt-3">
                  <p className="text-gray-700 font-medium">Masculine Example:</p>
                  <p className="text-xl text-right mt-1" lang="ar" dir="rtl">هذا كِتابٌ جَديدٌ.</p>
                  <p className="text-sm text-gray-500">This is a new book.</p>
                </div>
                <div className="mt-3 border-t pt-3">
                  <p className="text-gray-700 font-medium">Feminine Example:</p>
                  <p className="text-xl text-right mt-1" lang="ar" dir="rtl">هذه سَيّارةٌ جَديدةٌ.</p>
                  <p className="text-sm text-gray-500">This is a new car.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson1_3Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => playAudio(item.arabic)}
                          className="clay-button p-2 hover:scale-110 transition-transform"
                        >
                          <Volume2 className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Sentences</h4>
            <div className="space-y-4">
              {lesson1_3ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                    <p className="text-sm text-gray-500">{sentence.english}</p>
                  </div>
                  <button 
                    onClick={() => playAudio(sentence.arabic)}
                    className="clay-button p-2 hover:scale-110 transition-transform"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson1_3Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m1-l4" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">The Definite Article</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to say "the" in Arabic and master the rules of Sun and Moon letters.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn to use the definite article <span className="font-bold" lang="ar" dir="rtl">الـ</span> (al-).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand the difference between definite and indefinite nouns.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Distinguish between Sun Letters (الحُروف الشَّمْسِيّة) and Moon Letters (الحُروف القَمَرِيّة).</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Sun and Moon Letters</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The Definite Article <span className="font-bold" lang="ar" dir="rtl">الـ</span> (al-)</h5>
                <p className="text-gray-600">In Arabic, you make a noun definite (e.g., from "a book" to "the book") by adding the prefix <span className="font-bold" lang="ar" dir="rtl">الـ</span> to the beginning. However, the pronunciation of the <span className="font-bold" lang="ar" dir="rtl">ل</span> (l) in <span className="font-bold" lang="ar" dir="rtl">الـ</span> changes depending on the first letter of the noun it's attached to.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Moon Letters (الحُروف القَمَرِيّة)</h5>
                <p className="text-gray-600">If a noun starts with a Moon Letter, the <span className="font-bold" lang="ar" dir="rtl">ل</span> in <span className="font-bold" lang="ar" dir="rtl">الـ</span> is <strong>pronounced clearly</strong>. The word for moon, <span lang="ar" dir="rtl">قَمَر</span>, is a perfect example.</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">القَمَر (al-qamar)</p>
                <p className="mt-3 text-gray-700 font-medium">The 14 Moon Letters are:</p>
                <p className="text-2xl text-right mt-1 leading-relaxed" lang="ar" dir="rtl">{moonLetters}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Sun Letters (الحُروف الشَّمْسِيّة)</h5>
                <p className="text-gray-600">If a noun starts with a Sun Letter, the <span className="font-bold" lang="ar" dir="rtl">ل</span> in <span className="font-bold" lang="ar" dir="rtl">الـ</span> becomes <strong>silent</strong>, and you <strong>double the pronunciation</strong> of the Sun Letter itself. This is marked in writing with a <em>shadda</em> ( ّ ) symbol. The word for sun, <span lang="ar" dir="rtl">شَمْس</span>, is the key example.</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">الشَّمْس (ash-shams) - <span className="text-base text-gray-500 italic">Notice you don't hear the 'l' sound.</span></p>
                <p className="mt-3 text-gray-700 font-medium">The 14 Sun Letters are:</p>
                <p className="text-2xl text-right mt-1 leading-relaxed" lang="ar" dir="rtl">{sunLetters}</p>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson1_4Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => playAudio(item.arabic)}
                          className="clay-button p-2 hover:scale-110 transition-transform"
                        >
                          <Volume2 className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Sentences</h4>
            <div className="space-y-4">
              {lesson1_4ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                    <p className="text-sm text-gray-500">{sentence.english}</p>
                  </div>
                  <button 
                    onClick={() => playAudio(sentence.arabic)}
                    className="clay-button p-2 hover:scale-110 transition-transform"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson1_4Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m1-l5" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">The Idaafa Construction</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to form Idaafa constructions (الإضافة الإضافية) and understand the rules.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand the concept of Idaafa (الإضافة الإضافية).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn how to form Idaafa constructions.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Practice forming Idaafa constructions with nouns and adjectives.</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Idaafa Construction</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">What is an Idaafa?</h5>
                <p className="text-gray-600">An Idaafa is an extra word added to a sentence to make it more specific or descriptive. It's like adding a modifier to a noun. For example, "The book is new" (كِتابٌ جَديدٌ) can become "The student's book is new" (كِتابُ الطالبِ جَديدٌ).</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">How to Form an Idaafa?</h5>
                <p className="text-gray-600">To form an Idaafa, you add a word (MuDaaf) before the noun. The MuDaaf can be:</p>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>A possessive pronoun (like "my", "your", "his", "her").</li>
                  <li>A demonstrative pronoun (like "this", "that").</li>
                  <li>A personal pronoun (like "I", "you", "he", "she").</li>
                  <li>A relative pronoun (like "who", "whom").</li>
                  <li>A possessive adjective (like "my", "your", "his", "her").</li>
                </ul>
                <p className="text-gray-600 mt-2">The MuDaaf must agree in gender and number with the noun it's attached to.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Example: Idaafa with Possessive Pronouns</h5>
                <p className="text-gray-600">`طالب جَديد` (a new student) + `ـي` (my) = `طالبِي جَديدٌ` (my new student).</p>
                <p className="text-gray-600 mt-2">`طالبة جَديدة` (a new female student) + `ـكِ` (your) = `طالبَتِكِ جَديدَةٌ` (your new female student).</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Example: Idaafa with Demonstrative Pronouns</h5>
                <p className="text-gray-600">`كِتاب جَديد` (a new book) + `هذا` (this) = `كِتابُ هذا جَديدٌ` (this new book).</p>
                <p className="text-gray-600 mt-2">`كِتاب جَديد` (a new book) + `هٰذِه` (this) = `كِتابُ هٰذِه جَديدٌ` (this new book).</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Example: Idaafa with Personal Pronouns</h5>
                <p className="text-gray-600">`كِتاب جَديد` (a new book) + `أَنَا` (I) = `كِتابِ أَنَا جَديدٌ` (my new book).</p>
                <p className="text-gray-600 mt-2">`كِتاب جَديد` (a new book) + `أَنتِ` (you) = `كِتابِ أَنتِ جَديدٌ` (your new book).</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Example: Idaafa with Relative Pronouns</h5>
                <p className="text-gray-600">`كِتاب جَديد` (a new book) + `الذِي` (who) = `كِتابُ الذِي جَديدٌ` (the new book).</p>
                <p className="text-gray-600 mt-2">`كِتاب جَديد` (a new book) + `الذِين` (who) = `كِتابُ الذِين جَديدٌ` (the new books).</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Example: Idaafa with Possessive Adjectives</h5>
                <p className="text-gray-600">`كِتاب جَديد` (a new book) + `أَنَا` (my) = `كِتابِ أَنَا جَديدٌ` (my new book).</p>
                <p className="text-gray-600 mt-2">`كِتاب جَديد` (a new book) + `أَنتِ` (your) = `كِتابِ أَنتِ جَديدٌ` (your new book).</p>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson2_4Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => playAudio(item.arabic)}
                          className="clay-button p-2 hover:scale-110 transition-transform"
                        >
                          <Volume2 className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Sentences</h4>
            <div className="space-y-4">
              {lesson2_4ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                    <p className="text-sm text-gray-500">{sentence.english}</p>
                  </div>
                  <button 
                    onClick={() => playAudio(sentence.arabic)}
                    className="clay-button p-2 hover:scale-110 transition-transform"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson2_4Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m2-l4" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 2.4: The Idaafa Construction</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn the most important way to show possession in Arabic.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand the concept of the Idaafa (الإِضَافَة) to show possession.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn the two parts of an Idaafa: the <em>MuDaaf</em> and the <em>MuDaaf ilayhi</em>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Master the two essential rules for the first noun in an Idaafa.</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Possession with Idaafa</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">"The Book of the Student"</h5>
                <p className="text-gray-600">Besides attached pronouns, the main way to show possession is by placing two nouns next to each other. This is called an <strong>Idaafa</strong>. It translates to "the X of the Y" or "Y's X".</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">كِتَابُ الطَّالِبِ</p>
                <p className="text-sm text-gray-500 text-right">The book of the student (The student's book)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The Two Parts</h5>
                <ul className="mt-2 space-y-2 text-gray-700">
                  <li><strong>1. The MuDaaf (الْمُضَافُ):</strong> The first noun. This is the thing that is possessed (e.g., 'the book').</li>
                  <li><strong>2. The MuDaaf ilayhi (الْمُضَافُ إِلَيْهِ):</strong> The second noun. This is the possessor (e.g., 'the student').</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The Two Golden Rules of the MuDaaf</h5>
                <p className="text-gray-600">The first noun (the MuDaaf) has two very strict rules you must always follow:</p>
                <ol className="mt-2 space-y-2 text-gray-700 list-decimal list-inside">
                  <li>It can <strong>NEVER</strong> have the definite article <span lang="ar" dir="rtl">الـ</span>.</li>
                  <li>It can <strong>NEVER</strong> have <em>tanwiin</em> (the -un/-an/-in endings).</li>
                </ol>
                <p className="text-gray-600 mt-2">The second noun (the MuDaaf ilayhi) will almost always be definite (have <span lang="ar" dir="rtl">الـ</span>) at this stage.</p>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson2_4Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            // Special case for duplicate vocabulary items
                            if (item.arabic === 'مَكْتَبٌ') {
                              // Use lesson2-4 specific key for مَكْتَبٌ
                            } else if (item.arabic === 'نَافِذَةٌ') {
                              // Use lesson2-4 specific key for نَافِذَةٌ
                            }
                            playAudio(item.arabic, 'male');
                          }}
                          disabled={audioLoading[`${item.arabic}-male`]}
                          className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                          title="Play audio"
                        >
                          {audioLoading[`${item.arabic}-male`] ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Sentences</h4>
            <div className="space-y-4">
              {lesson2_4ExampleSentences.map((sentence, index) => {
                // Determine voice type based on sentence content
                let voiceType: 'male' | 'female' = 'male';
                if (sentence.arabic.includes('بِنْتُ') || sentence.arabic.includes('نَافِذَةُ') || sentence.arabic.includes('صُورَةُ') || sentence.arabic.includes('حَقِيبَةُ') || sentence.arabic.includes('مَدِينَةُ') || sentence.arabic.includes('جَامِعَةُ')) {
                  voiceType = 'female';
                }
                
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0">
                    <div className="flex-grow">
                      <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                      <p className="text-sm text-gray-500">{sentence.english}</p>
                    </div>
                    <button 
                      onClick={() => playAudio(sentence.arabic, voiceType)}
                      disabled={audioLoading[`${sentence.arabic}-${voiceType}`]}
                      className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                      title="Play audio"
                    >
                      {audioLoading[`${sentence.arabic}-${voiceType}`] ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson2_4Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m2-l1" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 2.1: Countries & Nationalities</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn to ask where someone is from and state your own nationality.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn the names of several countries in Arabic.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand and form <em>nisba</em> adjectives to describe nationality.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Ask and answer the question "Where are you from?".</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: The Nisba Adjective (النِّسْبة)</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">From a Place to a Person</h5>
                <p className="text-gray-600">In Arabic, you can turn the name of a place (like a country or city) into an adjective to describe someone's origin. This is called a <strong>nisba</strong> adjective. It's like turning "America" into "American."</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">How to Form the Nisba</h5>
                <p className="text-gray-600">The rule is simple. You add a suffix to the end of the place name:</p>
                <ul className="mt-2 space-y-2 text-gray-700">
                  <li>For <strong>masculine</strong> nouns, add <span className="font-bold text-lg" lang="ar" dir="rtl">ـيّ</span> (pronounced "-iyy").</li>
                  <li>For <strong>feminine</strong> nouns, add <span className="font-bold text-lg" lang="ar" dir="rtl">ـيّة</span> (pronounced "-iyya").</li>
                </ul>
                <div className="mt-3 border-t pt-3">
                  <p className="text-gray-700 font-medium">Example:</p>
                  <p className="text-xl text-right mt-1" lang="ar" dir="rtl">مِصْر (Egypt) <span className="mx-2">→</span> مِصْرِيّ (Egyptian man) <span className="mx-2">→</span> مِصْرِيّة (Egyptian woman)</p>
                </div>
                <div className="mt-3 border-t pt-3">
                  <p className="text-gray-700 font-medium">Note:</p>
                  <p className="text-gray-600">If the place name ends in a <em>Ta' Marbuta</em> (ة) or <em>Alif</em> (ا), you usually drop that letter before adding the <em>nisba</em> ending. For example, <span lang="ar" dir="rtl">سوريا → سوريّ</span>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson2_1Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => playAudio(item.arabic, 'male')}
                          disabled={audioLoading[`${item.arabic}-male`]}
                          className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                          title="Play audio"
                        >
                          {audioLoading[`${item.arabic}-male`] ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Sentences</h4>
            <div className="space-y-4">
              {lesson2_1ExampleSentences.map((sentence, index) => {
                // Determine voice type based on sentence content
                let voiceType: 'male' | 'female' = 'male';
                if (sentence.arabic.includes('هِيَ') || sentence.arabic.includes('سوريّة')) {
                  voiceType = 'female';
                }
                
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0">
                    <div className="flex-grow">
                      <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                      <p className="text-sm text-gray-500">{sentence.english}</p>
                    </div>
                    <button 
                      onClick={() => playAudio(sentence.arabic, voiceType)}
                      disabled={audioLoading[`${sentence.arabic}-${voiceType}`]}
                      className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                      title="Play audio"
                    >
                      {audioLoading[`${sentence.arabic}-${voiceType}`] ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson2_1Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m2-l2" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 2.2: "This is..." & Question Words</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn to ask fundamental questions about people and objects around you.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Review the demonstratives <span className="font-bold" lang="ar" dir="rtl">هَذَا</span> (this, masc.) and <span className="font-bold" lang="ar" dir="rtl">هَذِهِ</span> (this, fem.).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn the difference between <span className="font-bold" lang="ar" dir="rtl">مَا؟</span> (What?) and <span className="font-bold" lang="ar" dir="rtl">مَنْ؟</span> (Who?).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Practice forming simple questions and answers.</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Asking Questions</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">What? vs. Who?</h5>
                <p className="text-gray-600">Arabic makes a clear distinction between asking about people and asking about objects. This is one of the most important rules for forming basic questions.</p>
                <ul className="mt-2 space-y-2 text-gray-700">
                  <li>Use <span className="font-bold text-lg" lang="ar" dir="rtl">مَا؟ (maa?)</span> to ask "What?" for <strong>non-human</strong> nouns (objects, ideas, animals).</li>
                  <li>Use <span className="font-bold text-lg" lang="ar" dir="rtl">مَنْ؟ (man?)</span> to ask "Who?" for <strong>human</strong> nouns.</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Sentence Structure</h5>
                <p className="text-gray-600">The structure for these questions is very simple: <strong>Question Word + Demonstrative?</strong> You must still choose the correct demonstrative (<span lang="ar" dir="rtl">هَذَا</span> or <span lang="ar" dir="rtl">هَذِهِ</span>) to match the gender of the noun you are asking about.</p>
                <div className="mt-3 border-t pt-3">
                  <p className="text-gray-700 font-medium">Asking about an object (masculine):</p>
                  <p className="text-xl text-right mt-1" lang="ar" dir="rtl">مَا هَذَا؟ <span className="text-base text-gray-500 italic">(maa haadhaa?)</span></p>
                </div>
                <div className="mt-3 border-t pt-3">
                  <p className="text-gray-700 font-medium">Asking about a person (feminine):</p>
                  <p className="text-xl text-right mt-1" lang="ar" dir="rtl">مَنْ هَذِهِ؟ <span className="text-base text-gray-500 italic">(man haadhihi?)</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson2_2Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => playAudio(item.arabic, 'male')}
                          disabled={audioLoading[`${item.arabic}-male`]}
                          className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                          title="Play audio"
                        >
                          {audioLoading[`${item.arabic}-male`] ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Conversation</h4>
            <div className="space-y-4">
              {lesson2_2ExampleSentences.map((sentence, index) => {
                // Determine voice type based on sentence content
                let voiceType: 'male' | 'female' = 'male';
                if (sentence.arabic.includes('هَذِهِ') || sentence.arabic.includes('طَبِيبَةٌ')) {
                  voiceType = 'female';
                }
                
                return (
                  <div key={index} className={`flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0 ${sentence.isQuestion ? 'font-semibold' : ''}`}>
                    <div className="flex-grow">
                      <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                      <p className="text-sm text-gray-500">{sentence.english}</p>
                    </div>
                    <button 
                      onClick={() => playAudio(sentence.arabic, voiceType)}
                      disabled={audioLoading[`${sentence.arabic}-${voiceType}`]}
                      className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                      title="Play audio"
                    >
                      {audioLoading[`${sentence.arabic}-${voiceType}`] ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson2_2Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : currentLesson.id === "a1-m2-l3" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 2.3: Attached Pronouns (Possession)</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn one of the most common and useful features of Arabic: possessive suffixes.
            </p>
          </div>

          {/* Objectives */}
          <div className="clay-card p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Learning Objectives</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn the five singular attached pronouns for possession.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Attach these pronouns to both masculine and feminine nouns.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand the rule for nouns ending in Ta' Marbuta (ة).</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Possessive Suffixes</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">A More Efficient Way</h5>
                <p className="text-gray-600">Instead of having separate words for "my," "your," etc., Arabic attaches a short suffix directly to the end of a noun. This is an extremely common feature of the language.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The Five Singular Pronouns</h5>
                <table className="w-full mt-2">
                  <tbody>
                    <tr className="border-b"><td className="p-2 text-xl" lang="ar" dir="rtl">ـي</td><td className="p-2 italic">...-ī</td><td className="p-2">my</td></tr>
                    <tr className="border-b"><td className="p-2 text-xl" lang="ar" dir="rtl">ـكَ</td><td className="p-2 italic">...-ka</td><td className="p-2">your (to a male)</td></tr>
                    <tr className="border-b"><td className="p-2 text-xl" lang="ar" dir="rtl">ـكِ</td><td className="p-2 italic">...-ki</td><td className="p-2">your (to a female)</td></tr>
                    <tr className="border-b"><td className="p-2 text-xl" lang="ar" dir="rtl">ـهُ</td><td className="p-2 italic">...-hu</td><td className="p-2">his</td></tr>
                    <tr><td className="p-2 text-xl" lang="ar" dir="rtl">ـهَا</td><td className="p-2 italic">...-hā</td><td className="p-2">her</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The Ta' Marbuta Rule (ة)</h5>
                <p className="text-gray-600">This is a very important rule: When you add a possessive suffix to a feminine noun that ends in a <strong>Ta' Marbuta (ة)</strong>, the <strong>ة changes to a regular `ت`</strong> before the suffix is added.</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">سَيَّارَةٌ + ـهَا  <span className="mx-2">→</span>  سَيَّارَتُهَا</p>
                <p className="text-sm text-gray-500 text-right">A car + her → her car</p>
              </div>
            </div>
          </div>

          {/* Vocabulary */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Vocabulary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-lg font-semibold text-gray-700">Arabic</th>
                    <th className="p-3 font-medium text-gray-600">Transliteration</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson2_3Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            // Special case for car vocabulary to avoid duplicate key
                            const audioKey = item.arabic === 'سَيَّارَةٌ' ? 'سَيَّارَةٌ (lesson2-3)-male' : `${item.arabic}-male`;
                            playAudio(audioKey.replace('-male', ''), 'male');
                          }}
                          disabled={audioLoading[`${item.arabic}-male`]}
                          className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                          title="Play audio"
                        >
                          {audioLoading[`${item.arabic}-male`] ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example Sentences */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Sentences</h4>
            <div className="space-y-4">
              {lesson2_3ExampleSentences.map((sentence, index) => {
                // Determine voice type based on sentence content
                let voiceType: 'male' | 'female' = 'male';
                if (sentence.arabic.includes('هَذِهِ') || sentence.arabic.includes('سَيَّارَتُكِ') || sentence.arabic.includes('اِسْمُهَا') || sentence.arabic.includes('صَدِيقَتِي')) {
                  voiceType = 'female';
                }
                
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-b border-gray-200 last:border-b-0">
                    <div className="flex-grow">
                      <p className="text-xl text-right text-gray-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                      <p className="text-sm text-gray-500">{sentence.english}</p>
                    </div>
                    <button 
                      onClick={() => playAudio(sentence.arabic, voiceType)}
                      disabled={audioLoading[`${sentence.arabic}-${voiceType}`]}
                      className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                      title="Play audio"
                    >
                      {audioLoading[`${sentence.arabic}-${voiceType}`] ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercises */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Check Your Understanding</h4>
            <div className="space-y-6">
              {lesson2_3Exercises.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrect = q.correctAnswer === option;
                      let bgColor = 'bg-white';
                      if (showResults) {
                        if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-400';
                        else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-400';
                        else if (isCorrect) bgColor = 'bg-green-100 border-green-400';
                      }

                      return (
                        <label key={oIndex} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                          <input 
                            type="radio" 
                            name={`question-${qIndex}`} 
                            value={option} 
                            checked={isSelected} 
                            onChange={() => handleOptionChange(qIndex, option)} 
                            className="mr-3"
                          />
                          <span className="text-lg text-right flex-1" lang="ar" dir="rtl">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={checkAnswers} className="clay-button text-lg px-8 py-3">
                Check Answers
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Placeholder Content for other lessons */
        <div className="clay-card p-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-blue-700" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Lesson Content Coming Soon</h4>
            <p className="text-gray-600 mb-6">
              This lesson will contain interactive content, exercises, and practice materials.
              The detailed curriculum content will be added as you finalize the lesson plans.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button className="clay-button">
                <MessageCircle className="w-4 h-4 mr-2" />
                Practice Exercise
              </Button>
              <Button className="clay-button">
                <PenTool className="w-4 h-4 mr-2" />
                Take Notes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Navigation */}
      <div className="flex justify-between mt-8">
        <Button 
          onClick={handlePreviousLesson}
          disabled={isFirstLesson}
          className={`clay-button ${isFirstLesson ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous Lesson
        </Button>

        <Button 
          onClick={() => handleLessonComplete(currentLesson.id)}
          className="clay-button bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
        >
          Mark Complete
          <CheckCircle2 className="w-4 h-4 ml-2" />
        </Button>

        <Button 
          onClick={handleNextLesson}
          disabled={isLastLesson}
          className={`clay-button ${isLastLesson ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          Next Lesson
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
