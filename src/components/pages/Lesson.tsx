import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { curriculum } from "../../entities/Curriculum";
import { Module } from "../../entities/Curriculum";
import { BookOpen, Target, CheckCircle2, Circle, ArrowLeft, ArrowRight, Play, MessageCircle, PenTool, Volume2, Loader2 } from "lucide-react";
import { generateAudio, playAudio as playAudioUtil, cleanupAudioUrl, getAudioFromSupabase } from "../../utils/audio";
import { Button } from "../ui/button";
import ReactGA from 'react-ga4';

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
    ReactGA.event({
      category: 'Learning',
      action: 'Lesson Completed',
      label: currentModule?.lessons[currentLessonIndex]?.title || 'Unknown Lesson',
      value: 1
    });
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

  // Lesson 3.1: The Verbal Sentence (A2 Level)
  const lesson3_1Vocabulary = [
    { arabic: "يَكْتُبُ", transliteration: "yaktubu", meaning: "he writes", root: "ك ت ب" },
    { arabic: "يَشْرَبُ", transliteration: "yashrabu", meaning: "he drinks", root: "ش ر ب" },
    { arabic: "يَدْرُسُ", transliteration: "yadrusu", meaning: "he studies", root: "د ر س" },
    { arabic: "يَقْرَأُ", transliteration: "yaqra'u", meaning: "he reads", root: "ق ر أ" },
    { arabic: "يَعْمَلُ", transliteration: "yaʿmalu", meaning: "he works / does", root: "ع م ل" },
    { arabic: "اَلرَّجُلُ", transliteration: "ar-rajulu", meaning: "the man" },
    { arabic: "اَلْمَرْأةُ", transliteration: "al-mar'atu", meaning: "the woman" },
    { arabic: "اَلْمُوَظَّفُ", transliteration: "al-muwaẓẓafu", meaning: "the employee" },
    { arabic: "اَلشَّرِكَةُ", transliteration: "ash-sharika", meaning: "the company" },
    { arabic: "اَلصَّحيفَةَ", transliteration: "aṣ-ṣaḥīfata", meaning: "the newspaper (object)" },
    { arabic: "اَلرِّسالَةَ", transliteration: "ar-risālata", meaning: "the letter (object)" },
    { arabic: "اَلْماءَ", transliteration: "al-mā'a", meaning: "the water (object)" },
  ];

  const lesson3_1ExampleSentences = [
    { arabic: "يَكْتُبُ الْمُوَظَّفُ الرِّسالَةَ.", english: "The employee writes the letter." },
    { arabic: "تَشْرَبُ الْمَرْأةُ الْماءَ.", english: "The woman drinks the water." },
    { arabic: "يَقْرَأُ الرَّجُلُ الصَّحيفَةَ.", english: "The man reads the newspaper." },
    { arabic: "تَدْرُسُ الطَّالِبَةُ فِي الْجَامِعَةِ.", english: "The student (f) studies at the university." },
    { arabic: "يَعْمَلُ الْمُهَنْدِسُ فِي الشَّرِكَةِ.", english: "The engineer works in the company." },
    { arabic: "يَقْرَأُ الْمُوَظَّفُ الرِّسالَةَ.", english: "The employee reads the letter." },
    { arabic: "يَعْمَلُ الرَّجُلُ فِي الشَّرِكَةِ.", english: "The man works in the company." },
    { arabic: "يَشْرَبُ الطَّالِبُ الْماءَ.", english: "The student (m) drinks the water." },
    { arabic: "تَدْرُسُ الْمَرْأةُ فِي الْجَامِعَةِ.", english: "The woman studies at the university." },
    { arabic: "يَكْتُبُ الْمُهَنْدِسُ الصَّحيفَةَ.", english: "The engineer writes the newspaper." },
  ];

  const lesson3_1Exercises = [
    {
      question: "What is the three-letter root for the verb 'يَشْرَبُ' (he drinks)?",
      options: ["ي ش ر", "ش ر ب", "ش ر ب و", "ش ر ب ا"],
      correctAnswer: "ش ر ب"
    },
    {
      question: "In the sentence 'يَقْرَأُ الرَّجُلُ الصَّحيفَةَ.', the object is:",
      options: ["يَقْرَأُ", "الرَّجُلُ", "الصَّحيفَةَ"],
      correctAnswer: "الصَّحيفَةَ"
    },
    {
      question: "Which sentence correctly says 'The woman drinks the water'?",
      options: ["يَشْرَبُ الْمَرْأةُ الْماءَ.", "تَشْرَبُ الْمَرْأةُ الْماءَ.", "تَشْرَبُ الرَّجُلُ الْماءَ."],
      correctAnswer: "تَشْرَبُ الْمَرْأةُ الْماءَ."
    }
  ];

  // Lesson 3.2: Present Tense Conjugation (Singular) (A2 Level)
  const lesson3_2Vocabulary = [
    { arabic: "يَذْهَبُ", transliteration: "yadhhabu", meaning: "he goes", root: "ذ ه ب" },
    { arabic: "يَأْكُلُ", transliteration: "ya'kulu", meaning: "he eats", root: "أ ك ل" },
    { arabic: "يَسْكُنُ", transliteration: "yaskunu", meaning: "he lives/resides", root: "س ك ن" },
    { arabic: "يُحِبُّ", transliteration: "yuHibbu", meaning: "he loves/likes", root: "ح ب ب" },
    { arabic: "يُريدُ", transliteration: "yurīdu", meaning: "he wants", root: "ر و د" },
    { arabic: "اَلْمَدْرَسَةُ", transliteration: "al-madrasatu", meaning: "the school" },
    { arabic: "اَلْبَيْتُ", transliteration: "al-baytu", meaning: "the house/home" },
    { arabic: "اَلتُّفَّاحَةَ", transliteration: "at-tuffāḥata", meaning: "the apple (object)" },
    { arabic: "اَللُّغَةُ الْعَرَبِيَّةُ", transliteration: "al-lughatu al-ʿarabiyyatu", meaning: "the Arabic language" },
    { arabic: "اَلْمَدينَةُ", transliteration: "al-madīnatu", meaning: "the city" },
  ];

  const lesson3_2ExampleSentences = [
    { arabic: "أَنَا أَسْكُنُ فِي بَيْتٍ كَبيرٍ.", english: "I live in a big house." },
    { arabic: "أَنْتَ تَذْهَبُ إِلَى الْمَدْرَسَةِ.", english: "You (m.) go to the school." },
    { arabic: "أَنْتِ تَأْكُلِينَ التُّفَّاحَةَ.", english: "You (f.) eat the apple." },
    { arabic: "هُوَ يُحِبُّ الْقَهْوَةَ.", english: "He likes coffee." },
    { arabic: "هِيَ تُريدُ كِتابًا.", english: "She wants a book." },
    { arabic: "أَنَا أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ.", english: "I study the Arabic language." },
    { arabic: "أَنْتَ تَعْمَلُ فِي مَكْتَبٍ.", english: "You (m.) work in an office." },
    { arabic: "أَنْتِ تُحِبِّينَ مَدينَتَكِ.", english: "You (f.) love your city." },
    { arabic: "هُوَ يَسْكُنُ فِي الْقَاهِرَةِ.", english: "He lives in Cairo." },
    { arabic: "هِيَ تَذْهَبُ إِلَى الْجَامِعَةِ.", english: "She goes to the university." },
  ];

  const lesson3_2Exercises = [
    {
      question: "How do you say 'She writes'?",
      options: ["يَكْتُبُ", "أَكْتُبُ", "تَكْتُبُ", "تَكْتُبينَ"],
      correctAnswer: "تَكْتُبُ"
    },
    {
      question: "The prefix 'أَ' (a-) on a present tense verb corresponds to which pronoun?",
      options: ["أَنَا", "أَنْتَ", "هُوَ", "هِيَ"],
      correctAnswer: "أَنَا"
    },
    {
      question: "Which sentence correctly says 'You (f.) want the book'?",
      options: ["أَنْتِ تُريدُ الْكِتَابَ.", "أَنْتِ يُريدُ الْكِتَابَ.", "أَنْتِ تُريدينَ الْكِتَابَ."],
      correctAnswer: "أَنْتِ تُريدينَ الْكِتَابَ."
    }
  ];

  // Lesson 3.3: Plurals (A2 Level)
  const lesson3_3Vocabulary = [
    { arabic: "مُعَلِّمٌ", transliteration: "muʿallimun", meaning: "teacher (m)", plural: "مُعَلِّمُونَ" },
    { arabic: "مُسْلِمٌ", transliteration: "muslimun", meaning: "Muslim (m)", plural: "مُسْلِمُونَ" },
    { arabic: "مُهَنْدِسَةٌ", transliteration: "muhandisatun", meaning: "engineer (f)", plural: "مُهَنْدِسَاتٌ" },
    { arabic: "طَبِيبَةٌ", transliteration: "ṭabībatun", meaning: "doctor (f)", plural: "طَبِيبَاتٌ" },
    { arabic: "وَلَدٌ", transliteration: "waladun", meaning: "boy", plural: "أَوْلَادٌ" },
    { arabic: "رَجُلٌ", transliteration: "rajulun", meaning: "man", plural: "رِجَالٌ" },
    { arabic: "كِتَابٌ", transliteration: "kitābun", meaning: "book", plural: "كُتُبٌ" },
    { arabic: "بَيْتٌ", transliteration: "baytun", meaning: "house", plural: "بُيُوتٌ" },
    { arabic: "قَلَمٌ", transliteration: "qalamun", meaning: "pen", plural: "أَقْلَامٌ" },
    { arabic: "جَدِيدٌ", transliteration: "jadīdun", meaning: "new (m. sg.)", plural: "جُدُدٌ" },
  ];

  const lesson3_3ExampleSentences = [
    { arabic: "اَلْمُعَلِّمُونَ فِي الْمَدْرَسَةِ.", english: "The teachers (m.) are in the school." },
    { arabic: "اَلْمُهَنْدِسَاتُ فِي الشَّرِكَةِ.", english: "The engineers (f.) are in the company." },
    { arabic: "هَؤُلَاءِ رِجَالٌ طِوَالٌ.", english: "These are tall men." },
    { arabic: "اَلْكُتُبُ عَلَى الْمَكْتَبِ.", english: "The books are on the desk." },
    { arabic: "هَذِهِ بُيُوتٌ كَبِيرَةٌ.", english: "These are big houses." },
    { arabic: "اَلْمُسْلِمُونَ يَذْهَبُونَ إِلَى الْمَسْجِدِ.", english: "The Muslims (m.) go to the mosque." },
    { arabic: "اَلطَّبِيبَاتُ يَعْمَلْنَ فِي الْمُسْتَشْفَى.", english: "The doctors (f.) work in the hospital." },
    { arabic: "اَلْأَوْلَادُ يَشْرَبُونَ الْحَلِيبَ.", english: "The boys drink the milk." },
    { arabic: "اَلْأَقْلَامُ جَدِيدَةٌ.", english: "The pens are new." },
    { arabic: "أَنَا أُحِبُّ الْكُتُبَ الْقَدِيمَةَ.", english: "I like old books." },
  ];

  const lesson3_3Exercises = [
    {
      question: "What is the plural of 'مُعَلِّمٌ' (teacher, m.)?",
      options: ["مُعَلِّمَاتٌ", "مُعَلِّمُونَ", "مُعَلِّمِينَ", "أَعْلَامٌ"],
      correctAnswer: "مُعَلِّمُونَ"
    },
    {
      question: "The plural 'كُتُبٌ' (books) is an example of a:",
      options: ["Sound Masculine Plural", "Sound Feminine Plural", "Broken Plural"],
      correctAnswer: "Broken Plural"
    },
    {
      question: "Which sentence correctly says 'The cars are new'?",
      options: ["اَلسَّيَّارَاتُ جُدُدٌ.", "اَلسَّيَّارَاتُ جَدِيدَاتٌ.", "اَلسَّيَّارَاتُ جَدِيدَةٌ."],
      correctAnswer: "اَلسَّيَّارَاتُ جَدِيدَةٌ."
    }
  ];

  // Lesson 3.4: Present Tense Conjugation (Plural) (A2 Level)
  const lesson3_4Vocabulary = [
    { arabic: "يَجْلِسُ", transliteration: "yajlisu", meaning: "he sits", root: "ج ل س" },
    { arabic: "يَسْمَعُ", transliteration: "yasmaʿu", meaning: "he hears/listens", root: "س م ع" },
    { arabic: "يَتَكَلَّمُ", transliteration: "yatakallamu", meaning: "he speaks", root: "ك ل م" },
    { arabic: "يُشَاهِدُ", transliteration: "yushāhidu", meaning: "he watches", root: "ش ه د" },
    { arabic: "يَلْعَبُ", transliteration: "yalʿabu", meaning: "he plays", root: "ل ع ب" },
    { arabic: "نَحْنُ", transliteration: "naḥnu", meaning: "we" },
    { arabic: "أَنْتُمْ", transliteration: "antum", meaning: "you (plural, masc.)" },
    { arabic: "أَنْتُنَّ", transliteration: "antunna", meaning: "you (plural, fem.)" },
    { arabic: "هُمْ", transliteration: "hum", meaning: "they (masc.)" },
    { arabic: "هُنَّ", transliteration: "hunna", meaning: "they (fem.)" },
    { arabic: "اَلتِّلْفَازُ", transliteration: "at-tilfāzu", meaning: "the television" },
    { arabic: "اَلْأَخْبَارُ", transliteration: "al-akhbāru", meaning: "the news" },
  ];

  const lesson3_4ExampleSentences = [
    { arabic: "نَحْنُ نَجْلِسُ فِي الْبَيْتِ.", english: "We are sitting in the house." },
    { arabic: "أَنْتُمْ تَتَكَلَّمُونَ الْعَرَبِيَّةَ.", english: "You (m. pl.) speak Arabic." },
    { arabic: "أَنْتُنَّ تَسْمَعْنَ الْمُوسِيقَى.", english: "You (f. pl.) listen to the music." },
    { arabic: "هُمْ يُشَاهِدُونَ التِّلْفَازَ.", english: "They (m.) are watching the television." },
    { arabic: "هُنَّ يَلْعَبْنَ فِي الْحَدِيقَةِ.", english: "They (f.) are playing in the garden." },
    { arabic: "نَحْنُ نَدْرُسُ فِي الْجَامِعَةِ.", english: "We study at the university." },
    { arabic: "أَنْتُمْ تَأْكُلُونَ الطَّعَامَ.", english: "You (m. pl.) are eating the food." },
    { arabic: "أَنْتُنَّ تَعْمَلْنَ فِي الْمُسْتَشْفَى.", english: "You (f. pl.) work in the hospital." },
    { arabic: "هُمْ يَسْكُنُونَ فِي مَدِينَةٍ كَبِيرَةٍ.", english: "They (m.) live in a big city." },
    { arabic: "هُنَّ يَشْرَبْنَ الْقَهْوَةَ.", english: "They (f.) are drinking the coffee." },
    { arabic: "نَحْنُ نَسْمَعُ الْأَخْبَارَ كُلَّ يَوْمٍ.", english: "We listen to the news every day." },
  ];

  const lesson3_4Exercises = [
    {
      question: "How do you say 'We write'?",
      options: ["يَكْتُبُونَ", "تَكْتُبُونَ", "نَكْتُبُ", "يَكْتُبْنَ"],
      correctAnswer: "نَكْتُبُ"
    },
    {
      question: "The suffix 'ـْنَ' (nun al-niswa) is used for which two pronouns?",
      options: ["هُمْ and أَنْتُمْ", "هُنَّ and أَنْتُنَّ", "نَحْنُ and هُمْ", "هِيَ and أَنْتِ"],
      correctAnswer: "هُنَّ and أَنْتُنَّ"
    },
    {
      question: "Which sentence correctly says 'They (m.) are watching the television'?",
      options: ["هُمْ يُشَاهِدْنَ التِّلْفَازَ.", "هُمْ تُشَاهِدُونَ التِّلْفَازَ.", "هُمْ يُشَاهِدُونَ التِّلْفَازَ."],
      correctAnswer: "هُمْ يُشَاهِدُونَ التِّلْفَازَ."
    }
  ];

  // Lesson 3.5: Negating the Present Tense (A2 Level)
  const lesson3_5Vocabulary = [
    { arabic: "لَا", transliteration: "lā", meaning: "no, not (for present tense)" },
    { arabic: "يَعْرِفُ", transliteration: "yaʿrifu", meaning: "he knows", root: "ع ر ف" },
    { arabic: "يَفْهَمُ", transliteration: "yafhamu", meaning: "he understands", root: "ف ه م" },
    { arabic: "يُسَافِرُ", transliteration: "yusāfiru", meaning: "he travels", root: "س ف ر" },
    { arabic: "يَتَذَكَّرُ", transliteration: "yatadhakkaru", meaning: "he remembers", root: "ذ ك ر" },
    { arabic: "يَدْفَعُ", transliteration: "yadfaʿu", meaning: "he pays", root: "د ف ع" },
    { arabic: "يَسْتَخْدِمُ", transliteration: "yastakhdimu", meaning: "he uses", root: "خ د م" },
    { arabic: "يَبْدَأُ", transliteration: "yabda'u", meaning: "he begins", root: "ب د أ" },
    { arabic: "يَنْتَهِي", transliteration: "yantahī", meaning: "he finishes", root: "ن ه ي" },
    { arabic: "اَلْجَوَابُ", transliteration: "al-jawābu", meaning: "the answer" },
    { arabic: "اَلسُّؤَالُ", transliteration: "as-su'ālu", meaning: "the question" },
    { arabic: "اَلسَّيَّارَةُ", transliteration: "as-sayyāratu", meaning: "the car" },
    { arabic: "اَلْهَاتِفُ", transliteration: "al-hātifu", meaning: "the telephone" },
    { arabic: "اَلْفُنْدُقُ", transliteration: "al-funduqu", meaning: "the hotel" },
    { arabic: "اَلْيَوْمَ", transliteration: "al-yawma", meaning: "today" },
    { arabic: "غَدًا", transliteration: "ghadan", meaning: "tomorrow" },
    { arabic: "دَائِمًا", transliteration: "dā'iman", meaning: "always" },
    { arabic: "عَادَةً", transliteration: "ʿādatan", meaning: "usually" },
  ];

  const lesson3_5ExampleSentences = [
    { arabic: "أَنَا لَا أَفْهَمُ السُّؤَالَ.", english: "I do not understand the question." },
    { arabic: "أَنْتَ لَا تَعْرِفُ الْجَوَابَ.", english: "You (m.) do not know the answer." },
    { arabic: "أَنْتِ لَا تَسْتَخْدِمِينَ الْهَاتِفَ.", english: "You (f.) do not use the telephone." },
    { arabic: "هُوَ لَا يُسَافِرُ الْيَوْمَ.", english: "He is not traveling today." },
    { arabic: "هِيَ لَا تَتَذَكَّرُ اِسْمَهُ.", english: "She does not remember his name." },
    { arabic: "نَحْنُ لَا نَدْفَعُ فِي الْفُنْدُقِ.", english: "We do not pay at the hotel." },
    { arabic: "أَنْتُمْ لَا تَبْدَؤُونَ الْعَمَلَ غَدًا.", english: "You (m. pl.) do not begin work tomorrow." },
    { arabic: "هُنَّ لَا يَنْتَهِينَ مِنَ الدَّرْسِ.", english: "They (f.) are not finishing the lesson." },
    { arabic: "أَنَا لَا أُحِبُّ الشَّايَ عَادَةً.", english: "I do not usually like tea." },
    { arabic: "هُمْ لَا يَلْعَبُونَ دَائِمًا.", english: "They (m.) do not always play." },
  ];

  const lesson3_5Exercises = [
    {
      question: "Which particle is used to negate present tense verbs?",
      options: ["مَا", "لَا", "لَنْ", "لَمْ"],
      correctAnswer: "لَا"
    },
    {
      question: "How do you say 'We do not understand'?",
      options: ["لَا يَفْهَمُ", "لَا تَفْهَمُ", "لَا أَفْهَمُ", "لَا نَفْهَمُ"],
      correctAnswer: "لَا نَفْهَمُ"
    },
    {
      question: "Translate the sentence: 'هُوَ لَا يَعْرِفُ'",
      options: ["She does not know.", "He knows.", "He does not know.", "I do not know."],
      correctAnswer: "He does not know."
    }
  ];

  // Lesson 4.1: The Past Tense (Singular) (A2 Level)
  const lesson4_1Vocabulary = [
    { arabic: "فَعَلَ", transliteration: "faʿala", meaning: "he did", root: "ف ع ل" },
    { arabic: "ذَهَبَ", transliteration: "dhahaba", meaning: "he went", root: "ذ ه ب" },
    { arabic: "أَكَلَ", transliteration: "akala", meaning: "he ate", root: "أ ك ل" },
    { arabic: "شَرِبَ", transliteration: "shariba", meaning: "he drank", root: "ش ر ب" },
    { arabic: "فَتَحَ", transliteration: "fataḥa", meaning: "he opened", root: "ف ت ح" },
    { arabic: "جَلَسَ", transliteration: "jalasa", meaning: "he sat", root: "ج ل س" },
    { arabic: "خَرَجَ", transliteration: "kharaja", meaning: "he went out", root: "خ ر ج" },
    { arabic: "دَخَلَ", transliteration: "dakhala", meaning: "he entered", root: "د خ ل" },
    { arabic: "سَمِعَ", transliteration: "samiʿa", meaning: "he heard", root: "س م ع" },
    { arabic: "أَمْسِ", transliteration: "amsi", meaning: "yesterday" },
    { arabic: "اَلْمَطْعَمُ", transliteration: "al-maṭʿamu", meaning: "the restaurant" },
    { arabic: "اَلسُّوقُ", transliteration: "as-sūqu", meaning: "the market" },
    { arabic: "اَلصَّوْتُ", transliteration: "aṣ-ṣawtu", meaning: "the sound / voice" },
    { arabic: "اَلْبَابُ", transliteration: "al-bābu", meaning: "the door" },
    { arabic: "اَلْخُبْزَ", transliteration: "al-khubza", meaning: "the bread (object)" },
    { arabic: "اَلْفَصْلُ", transliteration: "al-faṣlu", meaning: "the classroom" },
    { arabic: "مَعَ", transliteration: "maʿa", meaning: "with" },
  ];

  const lesson4_1ExampleSentences = [
    { arabic: "أَنَا أَكَلْتُ الْخُبْزَ.", english: "I ate the bread." },
    { arabic: "أَنْتَ ذَهَبْتَ إِلَى السُّوقِ أَمْسِ.", english: "You (m.) went to the market yesterday." },
    { arabic: "أَنْتِ شَرِبْتِ الْقَهْوَةَ.", english: "You (f.) drank the coffee." },
    { arabic: "هُوَ فَتَحَ الْبَابَ.", english: "He opened the door." },
    { arabic: "هِيَ جَلَسَتْ عَلَى الْكُرْسِيِّ.", english: "She sat on the chair." },
    { arabic: "أَنَا سَمِعْتُ صَوْتًا.", english: "I heard a sound." },
    { arabic: "أَنْتَ خَرَجْتَ مِنَ الْبَيْتِ.", english: "You (m.) went out of the house." },
    { arabic: "أَنْتِ دَخَلْتِ الْفَصْلَ.", english: "You (f.) entered the classroom." },
    { arabic: "هُوَ أَكَلَ فِي الْمَطْعَمِ.", english: "He ate at the restaurant." },
    { arabic: "هِيَ ذَهَبَتْ مَعَ صَدِيقَتِهَا.", english: "She went with her friend (f.)." },
  ];

  const lesson4_1Exercises = [
    {
      question: "How do you say 'I went'?",
      options: ["ذَهَبَ", "ذَهَبَتْ", "ذَهَبْتَ", "ذَهَبْتُ"],
      correctAnswer: "ذَهَبْتُ"
    },
    {
      question: "The suffix 'ـتِ' (-ti) on a past tense verb corresponds to which pronoun?",
      options: ["أَنَا", "أَنْتَ", "أَنْتِ", "هِيَ"],
      correctAnswer: "أَنْتِ"
    },
    {
      question: "Which sentence correctly says 'She opened the door'?",
      options: ["هِيَ فَتَحَ الْبَابَ.", "هِيَ فَتَحَتِ الْبَابَ.", "هُوَ فَتَحَتِ الْبَابَ."],
      correctAnswer: "هِيَ فَتَحَتِ الْبَابَ."
    }
  ];

  // Lesson 4.4: Negating the Past Tense (A2 Level)
  const lesson4_4Vocabulary = [
    { arabic: "مَا", transliteration: "mā", meaning: "not (for past tense)" },
    { arabic: "قَالَ", transliteration: "qāla", meaning: "he said", root: "ق و ل" },
    { arabic: "كَانَ", transliteration: "kāna", meaning: "he was", root: "ك و ن" },
    { arabic: "مَاتَ", transliteration: "māta", meaning: "he died", root: "م و ت" },
    { arabic: "عَادَ", transliteration: "ʿāda", meaning: "he returned", root: "ع و د" },
    { arabic: "نَامَ", transliteration: "nāma", meaning: "he slept", root: "ن و م" },
    { arabic: "قَامَ", transliteration: "qāma", meaning: "he got up", root: "ق و م" },
    { arabic: "صَامَ", transliteration: "ṣāma", meaning: "he fasted", root: "ص و م" },
    { arabic: "اَلْأُسْتَاذُ", transliteration: "al-ustādhu", meaning: "the professor" },
    { arabic: "اَلطَّبِيبُ", transliteration: "aṭ-ṭabību", meaning: "the doctor" },
    { arabic: "اَلْمَرِيضُ", transliteration: "al-marīḍu", meaning: "the patient" },
    { arabic: "اَلْحَفْلَةُ", transliteration: "al-ḥaflatu", meaning: "the party" },
    { arabic: "اَللَّيْلَةُ", transliteration: "al-laylatu", meaning: "the night" },
    { arabic: "مُبَكِّرًا", transliteration: "mubakkiran", meaning: "early" },
    { arabic: "مُتَأَخِّرًا", transliteration: "muta'akhkhiran", meaning: "late" },
    { arabic: "شَيْءٌ", transliteration: "shay'un", meaning: "a thing / something" },
    { arabic: "لِمَاذَا؟", transliteration: "limādhā?", meaning: "Why?" },
  ];

  const lesson4_4ExampleSentences = [
    { arabic: "أَنَا مَا قُلْتُ شَيْئًا.", english: "I did not say anything." },
    { arabic: "أَنْتَ مَا كُنْتَ فِي الْبَيْتِ.", english: "You (m.) were not at home." },
    { arabic: "أَنْتِ مَا نِمْتِ مُبَكِّرًا.", english: "You (f.) did not sleep early." },
    { arabic: "هُوَ مَا عَادَ مِنَ الْعَمَلِ.", english: "He did not return from work." },
    { arabic: "هِيَ مَا قَامَتْ مِنَ السَّرِيرِ.", english: "She did not get up from the bed." },
    { arabic: "نَحْنُ مَا ذَهَبْنَا إِلَى الْحَفْلَةِ.", english: "We did not go to the party." },
    { arabic: "أَنْتُمْ مَا فَعَلْتُمْ شَيْئًا.", english: "You (m. pl.) did not do anything." },
    { arabic: "اَلْمَرِيضُ مَا صَامَ أَمْسِ.", english: "The patient did not fast yesterday." },
    { arabic: "لِمَاذَا مَا أَكَلْتَ؟", english: "Why didn't you (m.) eat?" },
    { arabic: "اَلْأُسْتَاذُ مَا قَالَ ذَلِكَ.", english: "The professor did not say that." },
  ];

  const lesson4_4Exercises = [
    {
      question: "Which particle is used to negate past tense verbs?",
      options: ["مَا", "لَا", "لَنْ", "لَمْ"],
      correctAnswer: "مَا"
    },
    {
      question: "How do you say 'We did not return'?",
      options: ["مَا عَادُوا", "مَا عُدْتُمْ", "مَا عُدْنَا", "مَا عُدْتُ"],
      correctAnswer: "مَا عُدْنَا"
    },
    {
      question: "Translate the sentence: 'هِيَ مَا كَانَتْ فِي الْمَكْتَبِ.'",
      options: ["She was in the office.", "He was not in the office.", "She is not in the office.", "She was not in the office."],
      correctAnswer: "She was not in the office."
    }
  ];

  // Lesson 4.5: Numbers 1-10 (A2 Level)
  const lesson4_5Vocabulary = [
    { arabic: "وَاحِدٌ / وَاحِدَةٌ", transliteration: "wāḥidun / wāḥidatun", meaning: "one (m/f)" },
    { arabic: "اِثْنَانِ / اِثْنَتَانِ", transliteration: "ithnāni / ithnatāni", meaning: "two (m/f)" },
    { arabic: "ثَلَاثَةٌ", transliteration: "thalāthatun", meaning: "three" },
    { arabic: "أَرْبَعَةٌ", transliteration: "arbaʿatun", meaning: "four" },
    { arabic: "خَمْسَةٌ", transliteration: "khamsatun", meaning: "five" },
    { arabic: "سِتَّةٌ", transliteration: "sittatun", meaning: "six" },
    { arabic: "سَبْعَةٌ", transliteration: "sabʿatun", meaning: "seven" },
    { arabic: "ثَمَانِيَةٌ", transliteration: "thamāniyatun", meaning: "eight" },
    { arabic: "تِسْعَةٌ", transliteration: "tisʿatun", meaning: "nine" },
    { arabic: "عَشَرَةٌ", transliteration: "ʿasharatun", meaning: "ten" },
    { arabic: "طُلَّابٌ", transliteration: "ṭullābun", meaning: "students (m. pl.)" },
    { arabic: "طَالِبَاتٌ", transliteration: "ṭālibātun", meaning: "students (f. pl.)" },
    { arabic: "أَقْلَامٌ", transliteration: "aqlāmun", meaning: "pens (pl.)" },
    { arabic: "سَيَّارَاتٌ", transliteration: "sayyārātun", meaning: "cars (pl.)" },
    { arabic: "أَبْوَابٌ", transliteration: "abwābun", meaning: "doors (pl.)" },
    { arabic: "غُرَفٌ", transliteration: "ghurafun", meaning: "rooms (pl.)" },
    { arabic: "هُنَا", transliteration: "hunā", meaning: "here" },
    { arabic: "هُنَاكَ", transliteration: "hunāka", meaning: "there" },
  ];

  const lesson4_5ExampleSentences = [
    { arabic: "عِنْدِي كِتَابٌ وَاحِدٌ.", english: "I have one book." },
    { arabic: "عِنْدِي سَيَّارَةٌ وَاحِدَةٌ.", english: "I have one car." },
    { arabic: "رَأَيْتُ طَالِبَيْنِ اثْنَيْنِ.", english: "I saw two students (m.)." },
    { arabic: "هُنَاكَ ثَلَاثَةُ طُلَّابٍ.", english: "There are three students (m.) here." },
    { arabic: "فِي الْبَيْتِ أَرْبَعُ غُرَفٍ.", english: "In the house are four rooms." },
    { arabic: "أُرِيدُ خَمْسَةَ أَقْلَامٍ.", english: "I want five pens." },
    { arabic: "عِنْدَهَا سِتُّ بَنَاتٍ.", english: "She has six daughters." },
    { arabic: "قَرَأْنَا سَبْعَةَ كُتُبٍ.", english: "We read seven books." },
    { arabic: "هُمْ ثَمَانِيَةُ رِجَالٍ.", english: "They are eight men." },
    { arabic: "فِي الشَّارِعِ عَشْرُ سَيَّارَاتٍ.", english: "In the street are ten cars." },
  ];

  const lesson4_5Exercises = [
    {
      question: "How do you say 'three students (m.)'?",
      options: ["ثَلَاثُ طُلَّابٍ", "ثَلَاثَةُ طُلَّابٍ", "ثَلَاثَةُ طَالِبَاتٍ"],
      correctAnswer: "ثَلَاثَةُ طُلَّابٍ"
    },
    {
      question: "How do you say 'three students (f.)'?",
      options: ["ثَلَاثُ طَالِبَاتٍ", "ثَلَاثَةُ طَالِبَاتٍ", "ثَلَاثَةُ طُلَّابٍ"],
      correctAnswer: "ثَلَاثُ طَالِبَاتٍ"
    },
    {
      question: "The numbers 3-10 follow a rule of:",
      options: ["Direct Agreement", "Reverse Agreement", "No Agreement"],
      correctAnswer: "Reverse Agreement"
    }
  ];

  // Lesson 5.1: The Future Tense (B1 Level)
  const lesson5_1Vocabulary = [
    { arabic: "سَـ / سَوْفَ", transliteration: "sa- / sawfa", meaning: "will (future prefix)" },
    { arabic: "سَيُسَافِرُ", transliteration: "sayusāfiru", meaning: "he will travel", root: "س ف ر" },
    { arabic: "سَيَزُورُ", transliteration: "sayazūru", meaning: "he will visit", root: "ز و ر" },
    { arabic: "سَيَشْتَرِي", transliteration: "sayashtarī", meaning: "he will buy", root: "ش ر ي" },
    { arabic: "سَيَبِيعُ", transliteration: "sayabīʿu", meaning: "he will sell", root: "ب ي ع" },
    { arabic: "سَيُصْبِحُ", transliteration: "sayuṣbiḥu", meaning: "he will become", root: "ص ب ح" },
    { arabic: "سَيَبْحَثُ عَنْ", transliteration: "sayabḥathu ʿan", meaning: "he will look for", root: "ب ح ث" },
    { arabic: "سَيَجِدُ", transliteration: "sayajidu", meaning: "he will find", root: "و ج د" },
    { arabic: "اَلْمُسْتَقْبَلُ", transliteration: "al-mustaqbalu", meaning: "the future" },
    { arabic: "اَلْعُطْلَةُ", transliteration: "al-ʿuṭlatu", meaning: "the vacation/holiday" },
    { arabic: "اَلْأُسْبُوعُ الْقَادِمُ", transliteration: "al-usbūʿu al-qādimu", meaning: "next week" },
    { arabic: "اَلشَّهْرُ الْقَادِمُ", transliteration: "ash-shahru al-qādimu", meaning: "next month" },
    { arabic: "اَلسَّنَةُ الْقَادِمَةُ", transliteration: "as-sanatu al-qādimatu", meaning: "next year" },
    { arabic: "زَمِيلٌ / زَمِيلَةٌ", transliteration: "zamīlun / zamīlatun", meaning: "colleague (m/f)" },
    { arabic: "شُغْلٌ", transliteration: "shughlun", meaning: "work / a job" },
    { arabic: "سُوقٌ", transliteration: "sūqun", meaning: "a market" },
    { arabic: "هَدِيَّةٌ", transliteration: "hadiyyatun", meaning: "a gift" },
  ];

  const lesson5_1ExampleSentences = [
    { arabic: "أَنَا سَأُسَافِرُ غَدًا.", english: "I will travel tomorrow." },
    { arabic: "أَنْتَ سَتَزُورُ زَمِيلَكَ.", english: "You (m.) will visit your colleague." },
    { arabic: "أَنْتِ سَتَشْتَرِينَ هَدِيَّةً.", english: "You (f.) will buy a gift." },
    { arabic: "هُوَ سَوْفَ يَبْحَثُ عَنْ شُغْلٍ جَدِيدٍ.", english: "He will look for a new job." },
    { arabic: "هِيَ سَوْفَ تُصْبِحُ طَبِيبَةً.", english: "She will become a doctor." },
    { arabic: "نَحْنُ سَنَزُورُ السُّوقَ.", english: "We will visit the market." },
    { arabic: "أَنْتُمْ سَتَجِدُونَ الْكِتَابَ.", english: "You (m. pl.) will find the book." },
    { arabic: "هُمْ سَيَبِيعُونَ سَيَّارَتَهُمْ.", english: "They (m.) will sell their car." },
    { arabic: "هُنَّ سَيُسَافِرْنَ فِي الْعُطْلَةِ.", english: "They (f.) will travel on the vacation." },
    { arabic: "سَوْفَ نَتَكَلَّمُ فِي الْمُسْتَقْبَلِ.", english: "We will speak in the future." },
  ];

  const lesson5_1Exercises = [
    {
      question: "Which prefix generally indicates the more distant future?",
      options: ["سَـ", "سَوْفَ", "لَا", "مَا"],
      correctAnswer: "سَوْفَ"
    },
    {
      question: "How do you say 'We will travel'?",
      options: ["سَيُسَافِرُ", "سَتُسَافِرُ", "سَنُسَافِرُ", "سَأُسَافِرُ"],
      correctAnswer: "سَنُسَافِرُ"
    },
    {
      question: "The future prefixes are attached to which form of the verb?",
      options: ["The past tense form", "The present tense form", "The root form", "A special future form"],
      correctAnswer: "The present tense form"
    }
  ];

  // Lesson 5.2: The Subjunctive Mood (B1 Level)
  const lesson5_2Vocabulary = [
    { arabic: "أَنْ", transliteration: "an", meaning: "to (that)" },
    { arabic: "لِـ", transliteration: "li-", meaning: "in order to" },
    { arabic: "لَنْ", transliteration: "lan", meaning: "will not (future negation)" },
    { arabic: "يُرِيدُ أَنْ", transliteration: "yurīdu an", meaning: "he wants to" },
    { arabic: "يَسْتَطِيعُ أَنْ", transliteration: "yastaṭīʿu an", meaning: "he is able to", root: "ط و ع" },
    { arabic: "يُحَاوِلُ أَنْ", transliteration: "yuḥāwilu an", meaning: "he tries to", root: "ح و ل" },
    { arabic: "يَجِبُ أَنْ", transliteration: "yajibu an", meaning: "he must / has to" },
    { arabic: "يُمْكِنُ أَنْ", transliteration: "yumkinu an", meaning: "it is possible to" },
    { arabic: "يَخْرُجُ", transliteration: "yakhruju", meaning: "he goes out", root: "خ ر ج" },
    { arabic: "يَنَامُ", transliteration: "yanāmu", meaning: "he sleeps", root: "ن و م" },
    { arabic: "يَعُودُ", transliteration: "yaʿūdu", meaning: "he returns", root: "ع و د" },
    { arabic: "يَحْصُلُ عَلَى", transliteration: "yaḥṣulu ʿalā", meaning: "he gets/obtains", root: "ح ص ل" },
    { arabic: "اَلْآنَ", transliteration: "al-āna", meaning: "now" },
    { arabic: "بَعْدَ قَلِيلٍ", transliteration: "baʿda qalīlin", meaning: "after a little while" },
    { arabic: "مَعًا", transliteration: "maʿan", meaning: "together" },
    { arabic: "اَلْقِرَاءَةُ", transliteration: "al-qirā'atu", meaning: "reading" },
    { arabic: "اَلْعَمَلُ", transliteration: "al-ʿamalu", meaning: "work" },
    { arabic: "اَلْجَوَازُ", transliteration: "al-jawāzu", meaning: "the passport" },
  ];

  const lesson5_2ExampleSentences = [
    { arabic: "أُرِيدُ أَنْ أَشْرَبَ قَهْوَةً.", english: "I want to drink a coffee." },
    { arabic: "يَجِبُ أَنْ تَذْهَبَ الْآنَ.", english: "You (m.) must go now." },
    { arabic: "هِيَ تَذْهَبُ إِلَى الْمَكْتَبَةِ لِتَدْرُسَ.", english: "She goes to the library in order to study." },
    { arabic: "لَنْ أُسَافِرَ هَذَا الْأُسْبُوعَ.", english: "I will not travel this week." },
    { arabic: "هَلْ يُمْكِنُ أَنْ نَجْلِسَ هُنَا؟", english: "Is it possible for us to sit here?" },
    { arabic: "هُمْ يُحَاوِلُونَ أَنْ يَتَكَلَّمُوا الْعَرَبِيَّةَ.", english: "They (m.) are trying to speak Arabic." },
    { arabic: "لَنْ تَحْصُلِي عَلَى الْجَوَازِ الْيَوْمَ.", english: "You (f.) will not get the passport today." },
    { arabic: "هُوَ يَنَامُ مُبَكِّرًا لِيَقُومَ مُبَكِّرًا.", english: "He sleeps early in order to get up early." },
    { arabic: "أَنْتُمْ لَنْ تَفْهَمُوا الدَّرْسَ.", english: "You (m. pl.) will not understand the lesson." },
    { arabic: "يَجِبُ أَنْ نَعُودَ إِلَى الْبَيْتِ.", english: "We must return to the house." },
  ];

  const lesson5_2Exercises = [
    {
      question: "Which particle is used to mean 'in order to'?",
      options: ["أَنْ", "لَنْ", "لِـ", "لَمْ"],
      correctAnswer: "لِـ"
    },
    {
      question: "How do you say 'I want to study'?",
      options: ["أُرِيدُ أَدْرُسُ", "أُرِيدُ أَنْ أَدْرُسَ", "أُرِيدُ أَنْ أَدْرُسُ", "أُرِيدُ لِأَدْرُسَ"],
      correctAnswer: "أُرِيدُ أَنْ أَدْرُسَ"
    },
    {
      question: "The particle 'لَنْ' is used to negate the...",
      options: ["Past Tense", "Present Tense", "Future Tense", "Imperative"],
      correctAnswer: "Future Tense"
    }
  ];

  // Lesson 5.3: The Jussive Mood (B1 Level)
  const lesson5_3Vocabulary = [
    { arabic: "لَمْ", transliteration: "lam", meaning: "did not (past negation)" },
    { arabic: "يَشَاهِدُ", transliteration: "yushāhidu", meaning: "he watches", root: "ش ه د" },
    { arabic: "يَسْتَمِعُ إِلَى", transliteration: "yastamiʿu ilā", meaning: "he listens to", root: "س م ع" },
    { arabic: "يُسَاعِدُ", transliteration: "yusāʿidu", meaning: "he helps", root: "س ع د" },
    { arabic: "يَطْبُخُ", transliteration: "yaṭbukhu", meaning: "he cooks", root: "ط ب خ" },
    { arabic: "يَنَامُ", transliteration: "yanāmu", meaning: "he sleeps", root: "ن و م" },
    { arabic: "يَقُومُ بِـ", transliteration: "yaqūmu bi-", meaning: "he does/undertakes", root: "ق و م" },
    { arabic: "يُحْضِرُ", transliteration: "yuḥḍiru", meaning: "he brings", root: "ح ض ر" },
    { arabic: "اَلْوَاجِبُ الْمَنْزِلِيُّ", transliteration: "al-wājibu al-manziliyyu", meaning: "the homework" },
    { arabic: "اَلْأَخْبَارُ", transliteration: "al-akhbāru", meaning: "the news" },
    { arabic: "اَلطَّعَامُ", transliteration: "aṭ-ṭaʿāmu", meaning: "the food" },
    { arabic: "اَلْفِيلْمُ", transliteration: "al-fīlmu", meaning: "the film" },
    { arabic: "اَلْأُمُّ", transliteration: "al-ummu", meaning: "the mother" },
    { arabic: "اَلْأَبُ", transliteration: "al-abu", meaning: "the father" },
    { arabic: "أَحَدٌ", transliteration: "aḥadun", meaning: "anyone" },
    { arabic: "جَيِّدًا", transliteration: "jayyidan", meaning: "well (adverb)" },
    { arabic: "بَعْدُ", transliteration: "baʿdu", meaning: "yet" },
  ];

  const lesson5_3ExampleSentences = [
    { arabic: "أَنَا لَمْ أَفْهَمِ الدَّرْسَ جَيِّدًا.", english: "I did not understand the lesson well." },
    { arabic: "أَنْتَ لَمْ تَكْتُبِ الْوَاجِبَ.", english: "You (m.) did not write the homework." },
    { arabic: "أَنْتِ لَمْ تَطْبُخِي الطَّعَامَ.", english: "You (f.) did not cook the food." },
    { arabic: "هُوَ لَمْ يُشَاهِدِ الْفِيلْمَ.", english: "He did not watch the film." },
    { arabic: "هِيَ لَمْ تَسْتَمِعْ إِلَى الْأَخْبَارِ.", english: "She did not listen to the news." },
    { arabic: "نَحْنُ لَمْ نَنَمْ مُبَكِّرًا.", english: "We did not sleep early." },
    { arabic: "أَنْتُمْ لَمْ تُسَاعِدُوا أَحَدًا.", english: "You (m. pl.) did not help anyone." },
    { arabic: "هُنَّ لَمْ يَخْرُجْنَ مِنَ الْبَيْتِ.", english: "They (f.) did not go out of the house." },
    { arabic: "أَبِي لَمْ يَعُدْ بَعْدُ.", english: "My father has not returned yet." },
    { arabic: "هُمْ لَمْ يَقُولُوا شَيْئًا.", english: "They (m.) did not say anything." },
  ];

  const lesson5_3Exercises = [
    {
      question: "The particle 'لَمْ' is followed by a verb in which mood?",
      options: ["Indicative", "Subjunctive", "Jussive", "Imperative"],
      correctAnswer: "Jussive"
    },
    {
      question: "How do you say 'I did not write'?",
      options: ["مَا أَكْتُبُ", "لَمْ أَكْتُبْ", "لَنْ أَكْتُبَ", "لَا أَكْتُبُ"],
      correctAnswer: "لَمْ أَكْتُبْ"
    },
    {
      question: "The combination 'لَمْ' + Jussive Verb expresses negation in which tense?",
      options: ["Present", "Past", "Future"],
      correctAnswer: "Past"
    }
  ];

  // Lesson 5.4: The Verbal Noun (Masdar) (B1 Level)
  const lesson5_4Vocabulary = [
    { arabic: "اَلْمَصْدَرُ", transliteration: "al-maṣdaru", meaning: "the verbal noun" },
    { arabic: "اَلسِّبَاحَةُ", transliteration: "as-sibāḥatu", meaning: "swimming" },
    { arabic: "اَلْقِرَاءَةُ", transliteration: "al-qirā'atu", meaning: "reading" },
    { arabic: "اَلْكِتَابَةُ", transliteration: "al-kitābatu", meaning: "writing" },
    { arabic: "اَلطَّبْخُ", transliteration: "aṭ-ṭabkhu", meaning: "cooking" },
    { arabic: "اَلرَّسْمُ", transliteration: "ar-rasmu", meaning: "drawing" },
    { arabic: "اَلْجَرْيُ", transliteration: "al-jaryu", meaning: "running" },
    { arabic: "اَلنَّوْمُ", transliteration: "an-nawmu", meaning: "sleeping" },
    { arabic: "اَلْخُرُوجُ", transliteration: "al-khurūju", meaning: "going out" },
    { arabic: "يُفَضِّلُ", transliteration: "yufaḍḍilu", meaning: "he prefers" },
    { arabic: "يَكْرَهُ", transliteration: "yakrahu", meaning: "he hates" },
    { arabic: "يَبْدَأُ", transliteration: "yabda'u", meaning: "he begins" },
    { arabic: "يُنْهِي", transliteration: "yunhī", meaning: "he finishes" },
    { arabic: "قَبْلَ", transliteration: "qabla", meaning: "before" },
    { arabic: "بَعْدَ", transliteration: "baʿda", meaning: "after" },
    { arabic: "صَعْبٌ", transliteration: "ṣaʿbun", meaning: "difficult" },
    { arabic: "سَهْلٌ", transliteration: "sahlun", meaning: "easy" },
    { arabic: "مُمْتِعٌ", transliteration: "mumtiʿun", meaning: "enjoyable" },
    { arabic: "مُفِيدٌ", transliteration: "mufīdun", meaning: "useful" },
  ];

  const lesson5_4ExampleSentences = [
    { arabic: "أَنَا أُحِبُّ الْقِرَاءَةَ.", english: "I like reading." },
    { arabic: "هُوَ يُفَضِّلُ السِّبَاحَةَ.", english: "He prefers swimming." },
    { arabic: "هِيَ تَكْرَهُ الطَّبْخَ.", english: "She hates cooking." },
    { arabic: "اَلْجَرْيُ مُفِيدٌ لِلصِّحَّةِ.", english: "Running is useful for your health." },
    { arabic: "اَلنَّوْمُ مُبَكِّرًا صَعْبٌ.", english: "Sleeping early is difficult." },
    { arabic: "أَنَا أَشْرَبُ الْقَهْوَةَ قَبْلَ الْخُرُوجِ.", english: "I drink coffee before going out." },
    { arabic: "هُوَ يَعُودُ إِلَى الْبَيْتِ بَعْدَ الْعَمَلِ.", english: "He returns to the house after work." },
    { arabic: "يَجِبُ أَنْ نَبْدَأَ الْكِتَابَةَ.", english: "We must begin the writing." },
    { arabic: "أَنْتُمْ تُحِبُّونَ الرَّسْمَ.", english: "You (m. pl.) like drawing." },
    { arabic: "هِيَ تُنْهِي الدِّرَاسَةَ هَذِهِ السَّنَةَ.", english: "She is finishing studying this year." },
  ];

  const lesson5_4Exercises = [
    {
      question: "A 'masdar' is the...",
      options: ["Past tense of a verb", "Noun form of a verb", "Plural form of a noun", "Future tense of a verb"],
      correctAnswer: "Noun form of a verb"
    },
    {
      question: "How do you say 'He prefers reading'?",
      options: ["هُوَ يُفَضِّلُ يَقْرَأُ.", "هُوَ يُفَضِّلُ أَنْ يَقْرَأَ.", "هُوَ يُفَضِّلُ الْقِرَاءَةَ."],
      correctAnswer: "هُوَ يُفَضِّلُ الْقِرَاءَةَ."
    },
    {
      question: "Which sentence correctly says 'Swimming is enjoyable'?",
      options: ["اَلسِّبَاحَةُ مُمْتِعَةٌ.", "اَلسِّبَاحَةُ مُمْتِعٌ.", "يَسْبَحُ مُمْتِعٌ."],
      correctAnswer: "اَلسِّبَاحَةُ مُمْتِعَةٌ."
    }
  ];

  // Lesson 6.1: Relative Clauses (B1 Level)
  const lesson6_1Vocabulary = [
    { arabic: "اَلَّذِي", transliteration: "alladhī", meaning: "who, which (m. sg.)" },
    { arabic: "اَلَّتِي", transliteration: "allatī", meaning: "who, which (f. sg.)" },
    { arabic: "اَلَّذِينَ", transliteration: "alladhīna", meaning: "who (m. pl.)" },
    { arabic: "اَللَّاتِي / اَللَّوَاتِي", transliteration: "allātī / allawātī", meaning: "who (f. pl.)" },
    { arabic: "يَعِيشُ", transliteration: "yaʿīshu", meaning: "he lives", root: "ع ي ش" },
    { arabic: "يَرَى", transliteration: "yarā", meaning: "he sees", root: "ر أ ي" },
    { arabic: "يَزُورُ", transliteration: "yazūru", meaning: "he visits", root: "ز و ر" },
    { arabic: "يَشْتَرِي", transliteration: "yashtarī", meaning: "he buys", root: "ش ر ي" },
    { arabic: "اَلْجَارُ", transliteration: "al-jāru", meaning: "the neighbor" },
    { arabic: "اَلشَّقَّةُ", transliteration: "ash-shaqqatu", meaning: "the apartment" },
    { arabic: "اَلْفُنْدُقُ", transliteration: "al-funduqu", meaning: "the hotel" },
    { arabic: "اَلْمُسْتَشْفَى", transliteration: "al-mustashfā", meaning: "the hospital" },
    { arabic: "اَلْفَرِيقُ", transliteration: "al-farīqu", meaning: "the team" },
    { arabic: "اَللَّاعِبُونَ", transliteration: "al-lāʿibūna", meaning: "the players" },
    { arabic: "اَلصُّورَةُ", transliteration: "aṣ-ṣūratu", meaning: "the picture" },
    { arabic: "اَلْجَائِزَةُ", transliteration: "al-jā'izatu", meaning: "the prize" },
    { arabic: "بِالْقُرْبِ مِنْ", transliteration: "bi-l-qurbi min", meaning: "near to" },
    { arabic: "فَازَ", transliteration: "fāza", meaning: "he won", root: "ف و ز" },
  ];

  const lesson6_1ExampleSentences = [
    { arabic: "اَلرَّجُلُ الَّذِي يَسْكُنُ هُنَا هُوَ صَدِيقِي.", english: "The man who lives here is my friend." },
    { arabic: "اَلْمَرْأَةُ الَّتِي تَعْمَلُ فِي الْمُسْتَشْفَى هِيَ أُمِّي.", english: "The woman who works in the hospital is my mother." },
    { arabic: "أُحِبُّ الْبَيْتَ الَّذِي اشْتَرَيْتُهُ.", english: "I like the house which I bought." },
    { arabic: "هَذِهِ هِيَ الشَّقَّةُ الَّتِي أُرِيدُهَا.", english: "This is the apartment that I want." },
    { arabic: "اَلرِّجَالُ الَّذِينَ خَرَجُوا هُمْ مُهَنْدِسُونَ.", english: "The men who left are engineers." },
    { arabic: "اَلطَّالِبَاتُ اللَّاتِي دَرَسْنَ نَجَحْنَ.", english: "The students (f.) who studied passed." },
    { arabic: "أَيْنَ الْكِتَابُ الَّذِي كَانَ عَلَى الْمَكْتَبِ؟", english: "Where is the book that was on the desk?" },
    { arabic: "هَذَا هُوَ الْفُنْدُقُ الَّذِي نَزَلْنَا فِيهِ.", english: "This is the hotel in which we stayed." },
    { arabic: "اَللَّاعِبُونَ الَّذِينَ فَازُوا حَصَلُوا عَلَى الْجَائِزَةِ.", english: "The players who won got the prize." },
    { arabic: "هَلْ رَأَيْتِ الصُّورَةَ الَّتِي رَسَمْتُهَا؟", english: "Did you (f.) see the picture that I drew?" },
  ];

  const lesson6_1Exercises = [
    {
      question: "Which relative pronoun would you use for 'اَلْبِنْتُ' (the girl)?",
      options: ["اَلَّذِي", "اَلَّتِي", "اَلَّذِينَ", "اَللَّاتِي"],
      correctAnswer: "اَلَّتِي"
    },
    {
      question: "Complete the sentence: اَلْأَوْلَادُ ... لَعِبُوا فِي الشَّارِعِ.",
      options: ["اَلَّذِي", "اَلَّتِي", "اَلَّذِينَ", "اَللَّاتِي"],
      correctAnswer: "اَلَّذِينَ"
    },
    {
      question: "A relative pronoun must agree with the noun it describes in:",
      options: ["Tense and Mood", "Gender and Number", "Vowels only", "Case only"],
      correctAnswer: "Gender and Number"
    }
  ];

  // Lesson 6.2: Weak Verbs I (Hollow & Assimilated) (B1 Level)
  const lesson6_2Vocabulary = [
    { arabic: "قَالَ / يَقُولُ", transliteration: "qāla / yaqūlu", meaning: "to say", root: "ق و ل", type: 'Hollow' },
    { arabic: "كَانَ / يَكُونُ", transliteration: "kāna / yakūnu", meaning: "to be", root: "ك و ن", type: 'Hollow' },
    { arabic: "زَارَ / يَزُورُ", transliteration: "zāra / yazūru", meaning: "to visit", root: "ز و ر", type: 'Hollow' },
    { arabic: "نَامَ / يَنَامُ", transliteration: "nāma / yanāmu", meaning: "to sleep", root: "ن و م", type: 'Hollow' },
    { arabic: "وَصَلَ / يَصِلُ", transliteration: "waṣala / yaṣilu", meaning: "to arrive", root: "و ص ل", type: 'Assimilated' },
    { arabic: "وَجَدَ / يَجِدُ", transliteration: "wajada / yajidu", meaning: "to find", root: "و ج د", type: 'Assimilated' },
    { arabic: "وَعَدَ / يَعِدُ", transliteration: "waʿada / yaʿidu", meaning: "to promise", root: "و ع د", type: 'Assimilated' },
    { arabic: "اَلْحَقِيقَةُ", transliteration: "al-ḥaqīqatu", meaning: "the truth", type: 'Noun/Other' },
    { arabic: "اَلْوَقْتُ", transliteration: "al-waqtu", meaning: "the time", type: 'Noun/Other' },
    { arabic: "اَلْمَطَارُ", transliteration: "al-maṭāru", meaning: "the airport", type: 'Noun/Other' },
    { arabic: "اَلْمُدِيرُ", transliteration: "al-mudīru", meaning: "the manager", type: 'Noun/Other' },
    { arabic: "اَلصَّدِيقُ", transliteration: "aṣ-ṣadīqu", meaning: "the friend", type: 'Noun/Other' },
    { arabic: "اَلْمُشْكِلَةُ", transliteration: "al-mushkilatu", meaning: "the problem", type: 'Noun/Other' },
    { arabic: "اَلْحَلُّ", transliteration: "al-ḥallu", meaning: "the solution", type: 'Noun/Other' },
    { arabic: "مَرِيضٌ", transliteration: "marīḍun", meaning: "sick", type: 'Noun/Other' },
    { arabic: "فِي الصَّبَاحِ", transliteration: "fī aṣ-ṣabāḥi", meaning: "in the morning", type: 'Noun/Other' },
  ];

  const lesson6_2ExampleSentences = [
    { arabic: "قَالَ لِي الْحَقِيقَةَ.", english: "He told me the truth." },
    { arabic: "كُنْتُ مَرِيضًا أَمْسِ.", english: "I was sick yesterday." },
    { arabic: "هِيَ تَزُورُ صَدِيقَتَهَا.", english: "She visits her friend (f.)." },
    { arabic: "لَمْ يَنَمِ الْوَلَدُ جَيِّدًا.", english: "The boy did not sleep well." },
    { arabic: "وَصَلَتِ الطَّائِرَةُ إِلَى الْمَطَارِ.", english: "The airplane arrived at the airport." },
    { arabic: "لَمْ أَجِدْ مِفْتَاحِي.", english: "I did not find my key." },
    { arabic: "نَحْنُ نَعِدُكَ بِالْمُسَاعَدَةِ.", english: "We promise you (m.) help." },
    { arabic: "مَتَى وَصَلْتُمْ؟", english: "When did you (m. pl.) arrive?" },
    { arabic: "هِيَ كَانَتْ فِي الْبَيْتِ.", english: "She was in the house." },
    { arabic: "أَنَا أَقُولُ الصِّدْقَ دَائِمًا.", english: "I always tell the truth." },
  ];

  const lesson6_2Exercises = [
    {
      question: "A verb with a 'و' or 'ي' as its middle root letter is called:",
      options: ["Assimilated", "Hollow", "Sound", "Defective"],
      correctAnswer: "Hollow"
    },
    {
      question: "How do you say 'I arrived'?",
      options: ["وَصَلَ", "وَصَلْتُ", "أَصِلُ", "صِلْتُ"],
      correctAnswer: "وَصَلْتُ"
    },
    {
      question: "In the present tense of an Assimilated verb like 'يَصِلُ', what happens to the first root letter 'و'?",
      options: ["It becomes 'أ'", "It stays the same", "It is dropped", "It becomes 'ي'"],
      correctAnswer: "It is dropped"
    }
  ];

  // Lesson 6.3: Comparatives & Superlatives (B1 Level)
  const lesson6_3Vocabulary = [
    { arabic: "أَكْبَرُ مِنْ", transliteration: "akbaru min", meaning: "bigger than" },
    { arabic: "أَصْغَرُ مِنْ", transliteration: "aṣgharu min", meaning: "smaller than" },
    { arabic: "أَطْوَلُ مِنْ", transliteration: "aṭwalu min", meaning: "taller than" },
    { arabic: "أَقْصَرُ مِنْ", transliteration: "aqṣaru min", meaning: "shorter than" },
    { arabic: "أَجْمَلُ مِنْ", transliteration: "ajmalu min", meaning: "more beautiful than" },
    { arabic: "أَفْضَلُ مِنْ", transliteration: "afḍalu min", meaning: "better than" },
    { arabic: "أَغْلَى مِنْ", transliteration: "aghlā min", meaning: "more expensive than" },
    { arabic: "أَرْخَصُ مِنْ", transliteration: "arkhaṣu min", meaning: "cheaper than" },
    { arabic: "صَعْبٌ", transliteration: "ṣaʿbun", meaning: "difficult" },
    { arabic: "سَهْلٌ", transliteration: "sahlun", meaning: "easy" },
    { arabic: "قَدِيمٌ", transliteration: "qadīmun", meaning: "old" },
    { arabic: "حَدِيثٌ", transliteration: "ḥadīthun", meaning: "modern" },
    { arabic: "اَلرِّيَاضِيَّاتُ", transliteration: "ar-riyāḍiyyātu", meaning: "mathematics" },
    { arabic: "اَلتَّارِيخُ", transliteration: "at-tārīkhu", meaning: "history" },
    { arabic: "اَلْفُنْدُقُ", transliteration: "al-funduqu", meaning: "the hotel" },
    { arabic: "اَلْمُتْحَفُ", transliteration: "al-mutḥafu", meaning: "the museum" },
    { arabic: "اَلنَّهْرُ", transliteration: "an-nahru", meaning: "the river" },
    { arabic: "اَلْبَحْرُ", transliteration: "al-baḥru", meaning: "the sea" },
  ];

  const lesson6_3ExampleSentences = [
    { arabic: "بَيْتِي أَكْبَرُ مِنْ بَيْتِكَ.", english: "My house is bigger than your house." },
    { arabic: "هَذِهِ السَّيَّارَةُ أَغْلَى مِنْ تِلْكَ.", english: "This car is more expensive than that one." },
    { arabic: "اَللُّغَةُ الْعَرَبِيَّةُ أَصْعَبُ مِنَ الْلُّغَةِ الْإِنْجِلِيزِيَّةِ.", english: "The Arabic language is more difficult than the English language." },
    { arabic: "هُوَ أَطْوَلُ رَجُلٍ فِي الْعَائِلَةِ.", english: "He is the tallest man in the family." },
    { arabic: "هِيَ أَذْكَى طَالِبَةٍ فِي الْفَصْلِ.", english: "She is the smartest student (f.) in the class." },
    { arabic: "هَذَا أَفْضَلُ كِتَابٍ قَرَأْتُهُ.", english: "This is the best book I have read." },
    { arabic: "نَهْرُ النِّيلِ أَطْوَلُ نَهْرٍ فِي الْعَالَمِ.", english: "The Nile River is the longest river in the world." },
    { arabic: "أَنَا أَسْكُنُ فِي أَجْمَلِ مَدِينَةٍ.", english: "I live in the most beautiful city." },
    { arabic: "هَذَا أَرْخَصُ هَاتِفٍ فِي السُّوقِ.", english: "This is the cheapest phone in the market." },
    { arabic: "دَرْسُ الْيَوْمِ أَسْهَلُ مِنْ دَرْسِ أَمْسِ.", english: "Today's lesson is easier than yesterday's lesson." },
  ];

  const lesson6_3Exercises = [
    {
      question: "How do you say 'The house is bigger than the apartment'?",
      options: ["اَلْبَيْتُ كَبِيرٌ مِنَ الشَّقَّةِ.", "اَلْبَيْتُ أَكْبَرُ الشَّقَّةِ.", "اَلْبَيْتُ أَكْبَرُ مِنَ الشَّقَّةِ."],
      correctAnswer: "اَلْبَيْتُ أَكْبَرُ مِنَ الشَّقَّةِ."
    },
    {
      question: "The comparative/superlative form 'أَفْعَلُ'...",
      options: ["Changes for masculine and feminine nouns.", "Does not change for gender.", "Is only used for masculine nouns."],
      correctAnswer: "Does not change for gender."
    },
    {
      question: "How do you say 'The oldest city'?",
      options: ["أَقْدَمُ مَدِينَةٍ", "اَلْمَدِينَةُ الْأَقْدَمُ", "مَدِينَةٌ قَدِيمَةٌ"],
      correctAnswer: "أَقْدَمُ مَدِينَةٍ"
    }
  ];

  // Lesson 6.4: Numbers 11-99 (B1 Level)
  const lesson6_4Vocabulary = [
    { arabic: "أَحَدَ عَشَرَ", transliteration: "aḥada ʿashara", meaning: "eleven" },
    { arabic: "اِثْنَا عَشَرَ", transliteration: "ithnā ʿashara", meaning: "twelve" },
    { arabic: "ثَلَاثَةَ عَشَرَ", transliteration: "thalāthata ʿashara", meaning: "thirteen" },
    { arabic: "عِشْرُونَ", transliteration: "ʿishrūna", meaning: "twenty" },
    { arabic: "ثَلَاثُونَ", transliteration: "thalāthūna", meaning: "thirty" },
    { arabic: "أَرْبَعُونَ", transliteration: "arbaʿūna", meaning: "forty" },
    { arabic: "خَمْسُونَ", transliteration: "khamsūna", meaning: "fifty" },
    { arabic: "سِتُّونَ", transliteration: "sittūna", meaning: "sixty" },
    { arabic: "سَبْعُونَ", transliteration: "sabʿūna", meaning: "seventy" },
    { arabic: "ثَمَانُونَ", transliteration: "thamānūna", meaning: "eighty" },
    { arabic: "تِسْعُونَ", transliteration: "tisʿūna", meaning: "ninety" },
    { arabic: "عُمْرٌ", transliteration: "ʿumrun", meaning: "age" },
    { arabic: "سَنَةٌ", transliteration: "sanatun", meaning: "year" },
    { arabic: "طَالِبٌ", transliteration: "ṭālibun", meaning: "student (m.)" },
    { arabic: "طَالِبَةٌ", transliteration: "ṭālibatun", meaning: "student (f.)" },
    { arabic: "صَفْحَةٌ", transliteration: "ṣafḥatun", meaning: "page" },
    { arabic: "دَقِيقَةٌ", transliteration: "daqīqatun", meaning: "minute" },
    { arabic: "رَقْمٌ", transliteration: "raqmun", meaning: "number" },
  ];

  const lesson6_4ExampleSentences = [
    { arabic: "فِي الْفَصْلِ أَحَدَ عَشَرَ طَالِبًا.", english: "In the classroom are eleven students (m.)." },
    { arabic: "رَأَيْتُ اثْنَتَيْ عَشْرَةَ طَالِبَةً.", english: "I saw twelve students (f.)." },
    { arabic: "عُمْرِي ثَلَاثَةٌ وَعِشْرُونَ سَنَةً.", english: "I am twenty-three years old." },
    { arabic: "قَرَأْتُ خَمْسًا وَأَرْبَعِينَ صَفْحَةً.", english: "I read forty-five pages." },
    { arabic: "فِي السَّاعَةِ سِتُّونَ دَقِيقَةً.", english: "In the hour are sixty minutes." },
    { arabic: "هُنَاكَ تِسْعَةَ عَشَرَ رَجُلًا فِي الْغُرْفَةِ.", english: "There are nineteen men in the room." },
    { arabic: "اِشْتَرَيْتُ الْكِتَابَ بِثَلَاثِينَ دُولَارًا.", english: "I bought the book for thirty dollars." },
    { arabic: "هِيَ تَسْكُنُ فِي الشَّقَّةِ رَقْمِ اثْنَيْنِ وَسَبْعِينَ.", english: "She lives in apartment number seventy-two." },
    { arabic: "سَافَرَ ثَمَانِيَةٌ وَخَمْسُونَ مُسَافِرًا.", english: "Fifty-eight travelers traveled." },
    { arabic: "فِي الْمَكْتَبَةِ تِسْعَةٌ وَتِسْعُونَ كِتَابًا.", english: "In the library are ninety-nine books." },
  ];

  const lesson6_4Exercises = [
    {
      question: "After numbers 11-99, the noun being counted is always:",
      options: ["Plural", "Singular", "Dual"],
      correctAnswer: "Singular"
    },
    {
      question: "How do you say 'twenty-five students (m.)'?",
      options: ["خَمْسَةٌ وَعِشْرُونَ طُلَّابٌ", "خَمْسَةٌ وَعِشْرُونَ طَالِبًا", "خَمْسٌ وَعِشْرُونَ طَالِبًا"],
      correctAnswer: "خَمْسَةٌ وَعِشْرُونَ طَالِبًا"
    },
    {
      question: "For numbers 13-19, the 'tens' part (`عَشَرَ`) agrees with the noun, while the 'ones' part has...",
      options: ["Direct Agreement", "Reverse Agreement", "No Agreement"],
      correctAnswer: "Reverse Agreement"
    }
  ];

  // Lesson 7.1: The Passive Voice (B2 Level)
  const lesson7_1Vocabulary = [
    { arabic: "فُتِحَ / يُفْتَحُ", transliteration: "futiḥa / yuftaḥu", meaning: "was opened / is opened", root: "ف ت ح" },
    { arabic: "كُتِبَ / يُكْتَبُ", transliteration: "kutiba / yuktabu", meaning: "was written / is written", root: "ك ت ب" },
    { arabic: "أُكِلَ / يُؤْكَلُ", transliteration: "ukila / yu'kalu", meaning: "was eaten / is eaten", root: "أ ك ل" },
    { arabic: "شُرِبَ / يُشْرَبُ", transliteration: "shuriba / yushrabu", meaning: "was drunk / is drunk", root: "ش ر ب" },
    { arabic: "أُرْسِلَ / يُرْسَلُ", transliteration: "ursila / yursalu", meaning: "was sent / is sent", root: "ر س ل" },
    { arabic: "قُتِلَ / يُقْتَلُ", transliteration: "qutila / yuqtalu", meaning: "was killed / is killed", root: "ق ت ل" },
    { arabic: "سُرِقَ / يُسْرَقُ", transliteration: "suriqa / yusraqu", meaning: "was stolen / is stolen", root: "س ر ق" },
    { arabic: "اَلْبَابُ", transliteration: "al-bābu", meaning: "the door" },
    { arabic: "اَلدَّرْسُ", transliteration: "ad-darsu", meaning: "the lesson" },
    { arabic: "اَلطَّعَامُ", transliteration: "aṭ-ṭaʿāmu", meaning: "the food" },
    { arabic: "اَلْقَهْوَةُ", transliteration: "al-qahwatu", meaning: "the coffee" },
    { arabic: "اَلرِّسَالَةُ", transliteration: "ar-risālatu", meaning: "the letter/message" },
    { arabic: "اَلْبَنْكُ", transliteration: "al-banku", meaning: "the bank" },
    { arabic: "اَللِّصُّ", transliteration: "al-liṣṣu", meaning: "the thief" },
    { arabic: "اَلْجُنْدِيُّ", transliteration: "al-jundiyyu", meaning: "the soldier" },
    { arabic: "بِوَاسِطَةِ", transliteration: "biwāsiṭati", meaning: "by (means of)" },
    { arabic: "مِنْ قِبَلِ", transliteration: "min qibali", meaning: "by (someone)" },
  ];

  const lesson7_1ExampleSentences = [
    { arabic: "فُتِحَ الْبَابُ.", english: "The door was opened." },
    { arabic: "كُتِبَ الدَّرْسُ بِالْأَمْسِ.", english: "The lesson was written yesterday." },
    { arabic: "يُؤْكَلُ الطَّعَامُ فِي الْمَطْعَمِ.", english: "The food is eaten in the restaurant." },
    { arabic: "تُشْرَبُ الْقَهْوَةُ فِي الصَّبَاحِ.", english: "The coffee is drunk in the morning." },
    { arabic: "أُرْسِلَتِ الرِّسَالَةُ مِنْ قِبَلِ الْمُدِيرِ.", english: "The message was sent by the manager." },
    { arabic: "سُرِقَ الْبَنْكُ.", english: "The bank was stolen from (robbed)." },
    { arabic: "يُعْرَفُ أَنَّهُ رَجُلٌ طَيِّبٌ.", english: "It is known that he is a good man." },
    { arabic: "قُتِلَ الْجُنْدِيُّ فِي الْحَرْبِ.", english: "The soldier was killed in the war." },
    { arabic: "يُقَالُ إِنَّ الطَّقْسَ سَيَكُونُ حَارًّا.", english: "It is said that the weather will be hot." },
    { arabic: "وُجِدَ الْكِتَابُ فِي الْمَكْتَبَةِ.", english: "The book was found in the library." },
  ];

  const lesson7_1Exercises = [
    {
      question: "What is the past passive form of the verb 'كَتَبَ' (he wrote)?",
      options: ["يُكْتَبُ", "كُتِبَ", "كَاتِبٌ", "مَكْتُوبٌ"],
      correctAnswer: "كُتِبَ"
    },
    {
      question: "What is the present passive form of the verb 'فَتَحَ' (he opened)?",
      options: ["فُتِحَ", "يَفْتَحُ", "فَاتِحٌ", "يُفْتَحُ"],
      correctAnswer: "يُفْتَحُ"
    },
    {
      question: "In a passive sentence, the doer of the action is...",
      options: ["Always the subject", "Always the object", "Often unknown or unimportant", "Always feminine"],
      correctAnswer: "Often unknown or unimportant"
    }
  ];

  // Lesson 7.2: Weak Verbs II (Defective & Doubled) (B2 Level)
  const lesson7_2Vocabulary = [
    { arabic: "مَشَى / يَمْشِي", transliteration: "mashā / yamshī", meaning: "to walk", root: "م ش ي", type: 'Defective' },
    { arabic: "بَقِيَ / يَبْقَى", transliteration: "baqiya / yabqā", meaning: "to remain/stay", root: "ب ق ي", type: 'Defective' },
    { arabic: "نَسِيَ / يَنْسَى", transliteration: "nasiya / yansā", meaning: "to forget", root: "ن س ي", type: 'Defective' },
    { arabic: "دَعَا / يَدْعُو", transliteration: "daʿā / yadʿū", meaning: "to invite/call", root: "د ع و", type: 'Defective' },
    { arabic: "أَحَبَّ / يُحِبُّ", transliteration: "aḥabba / yuḥibbu", meaning: "to love/like", root: "ح ب ب", type: 'Doubled' },
    { arabic: "ظَنَّ / يَظُنُّ", transliteration: "ẓanna / yaẓunnu", meaning: "to think/assume", root: "ظ ن ن", type: 'Doubled' },
    { arabic: "رَدَّ / يَرُدُّ", transliteration: "radda / yaruddu", meaning: "to reply/return", root: "ر د د", type: 'Doubled' },
    { arabic: "مَرَّ / يَمُرُّ", transliteration: "marra / yamurru", meaning: "to pass by", root: "م ر ر", type: 'Doubled' },
    { arabic: "اَلْحَفْلَةُ", transliteration: "al-ḥaflatu", meaning: "the party", type: 'Noun/Other' },
    { arabic: "اَلْوَقْتُ", transliteration: "al-waqtu", meaning: "the time", type: 'Noun/Other' },
    { arabic: "اَلْمَوْعِدُ", transliteration: "al-mawʿidu", meaning: "the appointment", type: 'Noun/Other' },
    { arabic: "اَلْجَوَابُ", transliteration: "al-jawābu", meaning: "the answer", type: 'Noun/Other' },
    { arabic: "اَلرِّسَالَةُ", transliteration: "ar-risālatu", meaning: "the letter/message", type: 'Noun/Other' },
    { arabic: "اَلطَّرِيقُ", transliteration: "aṭ-ṭarīqu", meaning: "the road/way", type: 'Noun/Other' },
    { arabic: "اَلْقَرْيَةُ", transliteration: "al-qaryatu", meaning: "the village", type: 'Noun/Other' },
    { arabic: "اَلْجَدُّ", transliteration: "al-jaddu", meaning: "the grandfather", type: 'Noun/Other' },
    { arabic: "مَعًا", transliteration: "maʿan", meaning: "together", type: 'Noun/Other' },
  ];

  const lesson7_2ExampleSentences = [
    { arabic: "مَشَيْتُ إِلَى السُّوقِ.", english: "I walked to the market." },
    { arabic: "هِيَ تَنْسَى مَوْعِدَهَا دَائِمًا.", english: "She always forgets her appointment." },
    { arabic: "دَعَوْنَاهُمْ إِلَى الْحَفْلَةِ.", english: "We invited them (m.) to the party." },
    { arabic: "لَمْ يَبْقَ أَحَدٌ فِي الْغُرْفَةِ.", english: "No one remained in the room." },
    { arabic: "أَنَا أُحِبُّ عَائِلَتِي.", english: "I love my family." },
    { arabic: "هَلْ ظَنَنْتَ أَنَّهُ سَيَأْتِي؟", english: "Did you (m.) think that he would come?" },
    { arabic: "لِمَاذَا لَمْ تَرُدَّ عَلَى رِسَالَتِي؟", english: "Why didn't you (f.) reply to my message?" },
    { arabic: "اَلْوَقْتُ يَمُرُّ بِسُرْعَةٍ.", english: "The time passes quickly." },
    { arabic: "جَدِّي يَمْشِي فِي الطَّرِيقِ.", english: "My grandfather walks in the road." },
    { arabic: "هُمْ بَقُوا فِي الْقَرْيَةِ.", english: "They (m.) stayed in the village." },
  ];

  const lesson7_2Exercises = [
    {
      question: "A verb with a 'و' or 'ي' as its final root letter is called:",
      options: ["Assimilated", "Hollow", "Sound", "Defective"],
      correctAnswer: "Defective"
    },
    {
      question: "How do you say 'I loved'?",
      options: ["أَحَبَّ", "أُحِبُّ", "أَحْبَبْتُ", "حَبَّبْتُ"],
      correctAnswer: "أَحْبَبْتُ"
    },
    {
      question: "In the past tense conjugation of Doubled verbs (like for 'أَنَا'), what happens?",
      options: ["The doubling is removed", "The verb doesn't change", "The first letter is doubled", "The verb adds a 'و'"],
      correctAnswer: "The doubling is removed"
    }
  ];

  // Lesson 7.3: Inna and Her Sisters (B2 Level)
  const lesson7_3Vocabulary = [
    { arabic: "إِنَّ", transliteration: "inna", meaning: "Indeed, verily (for emphasis)" },
    { arabic: "أَنَّ", transliteration: "anna", meaning: "that (conjunction)" },
    { arabic: "لٰكِنَّ", transliteration: "lākinna", meaning: "but, however" },
    { arabic: "اَلْاِمْتِحَانُ", transliteration: "al-imtiḥānu", meaning: "the exam" },
    { arabic: "اَلْخَبَرُ", transliteration: "al-khabaru", meaning: "the news" },
    { arabic: "اَلْحَقِيقَةُ", transliteration: "al-ḥaqīqatu", meaning: "the truth" },
    { arabic: "اَلطَّقْسُ", transliteration: "aṭ-ṭaqsu", meaning: "the weather" },
    { arabic: "اَلْفَصْلُ", transliteration: "al-faṣlu", meaning: "the class" },
    { arabic: "اَلْقِصَّةُ", transliteration: "al-qiṣṣatu", meaning: "the story" },
    { arabic: "صَحِيحٌ", transliteration: "ṣaḥīḥun", meaning: "correct / true" },
    { arabic: "خَطَأٌ", transliteration: "khaṭa'un", meaning: "wrong / a mistake" },
    { arabic: "صَعْبٌ", transliteration: "ṣaʿbun", meaning: "difficult" },
    { arabic: "سَهْلٌ", transliteration: "sahlun", meaning: "easy" },
    { arabic: "جَمِيلٌ", transliteration: "jamīlun", meaning: "beautiful" },
    { arabic: "بَارِدٌ", transliteration: "bāridun", meaning: "cold" },
    { arabic: "حَارٌّ", transliteration: "ḥārrun", meaning: "hot" },
    { arabic: "مُمْلٌ", transliteration: "mumillun", meaning: "boring" },
    { arabic: "أَعْتَقِدُ أَنَّ", transliteration: "aʿtaqidu anna", meaning: "I believe that..." },
    { arabic: "سَمِعْتُ أَنَّ", transliteration: "samiʿtu anna", meaning: "I heard that..." },
  ];

  const lesson7_3ExampleSentences = [
    { arabic: "اَلطَّقْسُ جَمِيلٌ.", english: "The weather is beautiful." },
    { arabic: "إِنَّ الطَّقْسَ جَمِيلٌ.", english: "Indeed, the weather is beautiful." },
    { arabic: "سَمِعْتُ أَنَّ الْاِمْتِحَانَ سَهْلٌ.", english: "I heard that the exam is easy." },
    { arabic: "أَعْتَقِدُ أَنَّ الْخَبَرَ صَحِيحٌ.", english: "I believe that the news is correct." },
    { arabic: "اَلْفَصْلُ طَوِيلٌ لٰكِنَّهُ مُفِيدٌ.", english: "The class is long, but it is useful." },
    { arabic: "اَلْبَيْتُ قَدِيمٌ لٰكِنَّ سَاكِنِيهِ سُعَدَاءُ.", english: "The house is old, but its residents are happy." },
    { arabic: "إِنَّ الْحَقِيقَةَ وَاضِحَةٌ.", english: "Indeed, the truth is clear." },
    { arabic: "قَالَ لِي أَنَّهُ سَيُسَافِرُ.", english: "He told me that he will travel." },
    { arabic: "اَلْقِصَّةُ مُمْلَةٌ لٰكِنَّ الْكِتَابَ جَيِّدٌ.", english: "The story is boring, but the book is good." },
    { arabic: "إِنَّ اللهَ غَفُورٌ رَحِيمٌ.", english: "Verily, God is forgiving and merciful." },
  ];

  const lesson7_3Exercises = [
    {
      question: "Which particle is used to mean 'that' in the middle of a sentence?",
      options: ["إِنَّ", "أَنَّ", "لٰكِنَّ", "لَمْ"],
      correctAnswer: "أَنَّ"
    },
    {
      question: "After 'إِنَّ', the subject of the nominal sentence takes which case ending?",
      options: ["Damma (-u)", "Fatha (-a)", "Kasra (-i)", "Sukun"],
      correctAnswer: "Fatha (-a)"
    },
    {
      question: "Which sentence correctly says 'The exam is difficult, but the student is smart'?",
      options: ["اَلْاِمْتِحَانُ صَعْبٌ لٰكِنَّ الطَّالِبُ ذَكِيٌّ.", "اَلْاِمْتِحَانُ صَعْبٌ لٰكِنَّ الطَّالِبَ ذَكِيٌّ.", "إِنَّ الْاِمْتِحَانَ صَعْبٌ لٰكِنَّ الطَّالِبَ ذَكِيٌّ."],
      correctAnswer: "اَلْاِمْتِحَانُ صَعْبٌ لٰكِنَّ الطَّالِبَ ذَكِيٌّ."
    }
  ];

  // Lesson 7.4: Introduction to Media Arabic (B2 Level)
  const lesson7_4Vocabulary = [
    { arabic: "أَعْلَنَ / يُعْلِنُ", transliteration: "aʿlana / yuʿlinu", meaning: "to announce" },
    { arabic: "أَكَّدَ / يُؤَكِّدُ", transliteration: "akkada / yu'akkidu", meaning: "to confirm / affirm" },
    { arabic: "صَرَّحَ / يُصَرِّحُ", transliteration: "ṣarraḥa / yuṣarriḥu", meaning: "to state / declare" },
    { arabic: "اِجْتَمَعَ / يَجْتَمِعُ", transliteration: "ijtamaʿa / yajtamiʿu", meaning: "to meet" },
    { arabic: "اَلرَّئِيسُ", transliteration: "ar-ra'īsu", meaning: "the president" },
    { arabic: "اَلْوَزِيرُ", transliteration: "al-wazīru", meaning: "the minister" },
    { arabic: "اَلْحُكُومَةُ", transliteration: "al-ḥukūmatu", meaning: "the government" },
    { arabic: "اَلْوِزَارَةُ", transliteration: "al-wizāratu", meaning: "the ministry" },
    { arabic: "اَلْوِلَايَاتُ الْمُتَّحِدَةُ", transliteration: "al-wilāyātu al-muttaḥidatu", meaning: "the United States" },
    { arabic: "اَلْأُمَمُ الْمُتَّحِدَةُ", transliteration: "al-umamu al-muttaḥidatu", meaning: "the United Nations" },
    { arabic: "اِتِّفَاقٌ", transliteration: "ittifāqun", meaning: "an agreement" },
    { arabic: "قَرَارٌ", transliteration: "qarārun", meaning: "a decision" },
    { arabic: "أَزْمَةٌ", transliteration: "azmatun", meaning: "a crisis" },
    { arabic: "عَلَاقَاتٌ", transliteration: "ʿalāqātun", meaning: "relations" },
    { arabic: "دَوْلِيٌّ", transliteration: "dawliyyun", meaning: "international" },
    { arabic: "سِيَاسِيٌّ", transliteration: "siyāsiyyun", meaning: "political" },
    { arabic: "اِقْتِصَادِيٌّ", transliteration: "iqtiṣādiyyun", meaning: "economic" },
    { arabic: "خِلَالَ", transliteration: "khilāla", meaning: "during" },
  ];

  const lesson7_4ExampleSentences = [
    { arabic: "أَعْلَنَ الرَّئِيسُ عَنْ قَرَارٍ جَدِيدٍ.", english: "The president announced a new decision." },
    { arabic: "أَكَّدَ الْوَزِيرُ أَهَمِّيَّةَ الْاِتِّفَاقِ.", english: "The minister affirmed the importance of the agreement." },
    { arabic: "اِجْتَمَعَتِ الْحُكُومَةُ لِبَحْثِ الْأَزْمَةِ.", english: "The government met to discuss the crisis." },
    { arabic: "صَرَّحَتْ وِزَارَةُ الْخَارِجِيَّةِ بِبَيَانٍ.", english: "The Foreign Ministry issued a statement." },
    { arabic: "تَتَحَسَّنُ الْعَلَاقَاتُ بَيْنَ الْبَلَدَيْنِ.", english: "Relations are improving between the two countries." },
    { arabic: "تَبْدَأُ الْاِنْتِخَابَاتُ الْأُسْبُوعَ الْقَادِمَ.", english: "The elections begin next week." },
    { arabic: "تُوَاجِهُ الْبِلَادُ أَزْمَةً اِقْتِصَادِيَّةً.", english: "The country is facing an economic crisis." },
    { arabic: "أَكَّدَتِ الْأُمَمُ الْمُتَّحِدَةُ عَلَى ضَرُورَةِ السَّلَامِ.", english: "The United Nations emphasized the necessity of peace." },
    { arabic: "سَيُسَافِرُ الْوَزِيرُ إِلَى الْوِلَايَاتِ الْمُتَّحِدَةِ.", english: "The minister will travel to the United States." },
    { arabic: "نَاقَشَ الرَّئِيسَانِ الْوَضْعَ الدَّوْلِيَّ.", english: "The two presidents discussed the international situation." },
  ];

  const lesson7_4Exercises = [
    {
      question: "The word 'اَلرَّئِيسُ' means:",
      options: ["The minister", "The government", "The president", "The king"],
      correctAnswer: "The president"
    },
    {
      question: "Which verb means 'to announce'?",
      options: ["أَكَّدَ", "صَرَّحَ", "اِجْتَمَعَ", "أَعْلَنَ"],
      correctAnswer: "أَعْلَنَ"
    },
    {
      question: "The phrase 'أَزْمَةٌ اِقْتِصَادِيَّةٌ' means:",
      options: ["Political crisis", "Economic crisis", "International relations", "A new decision"],
      correctAnswer: "Economic crisis"
    }
  ];

  // Lesson 8.1: The Concept of I'raab (Case) (B2 Level)
  const lesson8_1Vocabulary = [
    { arabic: "اَلْإِعْرَابُ", transliteration: "al-iʿrābu", meaning: "grammatical case system" },
    { arabic: "اَلْمَرْفُوعُ", transliteration: "al-marfūʿu", meaning: "the Nominative case (-u)" },
    { arabic: "اَلْمَنْصُوبُ", transliteration: "al-manṣūbu", meaning: "the Accusative case (-a)" },
    { arabic: "اَلْمَجْرُورُ", transliteration: "al-majrūru", meaning: "the Genitive case (-i)" },
    { arabic: "اَلْكَاتِبُ", transliteration: "al-kātibu", meaning: "the writer / author" },
    { arabic: "اَلشَّاعِرُ", transliteration: "ash-shāʿiru", meaning: "the poet" },
    { arabic: "اَلْقَصِيدَةُ", transliteration: "al-qaṣīdatu", meaning: "the poem" },
    { arabic: "اَلْمَعْنَى", transliteration: "al-maʿnā", meaning: "the meaning" },
    { arabic: "اَلْعِلْمُ", transliteration: "al-ʿilmu", meaning: "science / knowledge" },
    { arabic: "اَللُّغَةُ", transliteration: "al-lughatu", meaning: "the language" },
    { arabic: "اَلنَّحْوُ", transliteration: "an-naḥwu", meaning: "grammar" },
    { arabic: "اَلْقَاعِدَةُ", transliteration: "al-qāʿidatu", meaning: "the rule" },
    { arabic: "اَلْجُمْلَةُ", transliteration: "al-jumlatu", meaning: "the sentence" },
    { arabic: "وَاضِحٌ", transliteration: "wāḍiḥun", meaning: "clear / obvious" },
    { arabic: "مُهِمٌّ", transliteration: "muhimmun", meaning: "important" },
    { arabic: "جَمِيلٌ", transliteration: "jamīlun", meaning: "beautiful" },
    { arabic: "بَعْدَ", transliteration: "baʿda", meaning: "after" },
    { arabic: "قَبْلَ", transliteration: "qabla", meaning: "before" },
  ];

  const lesson8_1ExampleSentences = [
    { arabic: "اَلْكَاتِبُ مَشْهُورٌ.", english: "The writer (subject - nominative) is famous." },
    { arabic: "قَرَأْتُ الْكِتَابَ.", english: "I read the book (object - accusative)." },
    { arabic: "ذَهَبْتُ إِلَى الْبَيْتِ.", english: "I went to the house (after preposition - genitive)." },
    { arabic: "كَتَبَ الشَّاعِرُ الْقَصِيدَةَ.", english: "The poet (nominative) wrote the poem (accusative)." },
    { arabic: "فَهِمَ الطَّالِبُ الدَّرْسَ.", english: "The student (nominative) understood the lesson (accusative)." },
    { arabic: "اَلْعِلْمُ نُورٌ.", english: "Knowledge (subject - nominative) is light." },
    { arabic: "أُحِبُّ اللُّغَةَ الْعَرَبِيَّةَ.", english: "I love the Arabic language (object - accusative)." },
    { arabic: "مَعْنَى الْجُمْلَةِ وَاضِحٌ.", english: "The meaning of the sentence (idaafa - genitive) is clear." },
    { arabic: "دَرَسْتُ النَّحْوَ فِي الْجَامِعَةِ.", english: "I studied grammar (accusative) at the university (genitive)." },
    { arabic: "هَذِهِ قَاعِدَةٌ مُهِمَّةٌ.", english: "This is an important rule (nominative)." },
  ];

  const lesson8_1Exercises = [
    {
      question: "In the sentence 'فَتَحَ الْوَلَدُ الْبَابَ.', the word 'الْبَابَ' is in which case?",
      options: ["Nominative (marfūʿ)", "Accusative (manṣūb)", "Genitive (majrūr)"],
      correctAnswer: "Accusative (manṣūb)"
    },
    {
      question: "The Genitive case (-i) is used for a noun that is...",
      options: ["The subject of a sentence", "The object of a verb", "After a preposition or the second noun in an Idaafa"],
      correctAnswer: "After a preposition or the second noun in an Idaafa"
    },
    {
      question: "Which sentence is correctly voweled?",
      options: ["شَرِبَ الطِّفْلُ الْحَلِيبَ.", "شَرِبَ الطِّفْلَ الْحَلِيبُ.", "شَرِبَ الطِّفْلِ الْحَلِيبِ."],
      correctAnswer: "شَرِبَ الطِّفْلُ الْحَلِيبَ."
    }
  ];

  // Lesson 8.2: Conditional Sentences (B2 Level)
  const lesson8_2Vocabulary = [
    { arabic: "إِذَا", transliteration: "idhā", meaning: "if (for real/possible conditions)" },
    { arabic: "لَوْ", transliteration: "law", meaning: "if (for hypothetical/impossible conditions)" },
    { arabic: "لَـ", transliteration: "la-", meaning: "then (used in the response to 'law')" },
    { arabic: "نَجَحَ / يَنْجَحُ", transliteration: "najaḥa / yanjaḥu", meaning: "to succeed / pass" },
    { arabic: "سَافَرَ / يُسَافِرُ", transliteration: "sāfara / yusāfiru", meaning: "to travel" },
    { arabic: "اِمْتَلَكَ / يَمْتَلِكُ", transliteration: "imtalaka / yamtaliku", meaning: "to own / possess" },
    { arabic: "عَاشَ / يَعِيشُ", transliteration: "ʿāsha / yaʿīshu", meaning: "to live" },
    { arabic: "طَارَ / يَطِيرُ", transliteration: "ṭāra / yaṭīru", meaning: "to fly" },
    { arabic: "اَلْمَالُ", transliteration: "al-mālu", meaning: "money" },
    { arabic: "اَلْعَالَمُ", transliteration: "al-ʿālamu", meaning: "the world" },
    { arabic: "طَائِرٌ", transliteration: "ṭā'irun", meaning: "a bird" },
    { arabic: "قَصْرٌ", transliteration: "qaṣrun", meaning: "a palace" },
    { arabic: "اَلْوَقْتُ", transliteration: "al-waqtu", meaning: "time" },
    { arabic: "كَافٍ", transliteration: "kāfin", meaning: "enough" },
    { arabic: "سَعِيدٌ", transliteration: "saʿīdun", meaning: "happy" },
    { arabic: "غَنِيٌّ", transliteration: "ghaniyyun", meaning: "rich" },
    { arabic: "لَكِنْ", transliteration: "lākin", meaning: "but" },
  ];

  const lesson8_2ExampleSentences = [
    { arabic: "إِذَا دَرَسْتَ جَيِّدًا، سَتَنْجَحُ فِي الْاِمْتِحَانِ.", english: "If you (m.) study well, you will pass the exam." },
    { arabic: "إِذَا كَانَ الطَّقْسُ جَمِيلًا غَدًا، سَنَخْرُجُ.", english: "If the weather is nice tomorrow, we will go out." },
    { arabic: "إِذَا وَصَلَ الْقِطَارُ مُبَكِّرًا، سَأَتَّصِلُ بِكَ.", english: "If the train arrives early, I will call you (m.)." },
    { arabic: "سَأُسَافِرُ إِذَا كَانَ عِنْدِي مَالٌ كَافٍ.", english: "I will travel if I have enough money." },
    { arabic: "لَوْ كُنْتُ طَائِرًا، لَطِرْتُ حَوْلَ الْعَالَمِ.", english: "If I were a bird, I would fly around the world." },
    { arabic: "لَوْ كُنْتُ غَنِيًّا، لَاشْتَرَيْتُ قَصْرًا.", english: "If I were rich, I would buy a palace." },
    { arabic: "لَوْ عَرَفْتُ الْجَوَابَ، لَقُلْتُ لَكَ.", english: "If I had known the answer, I would have told you (m.)." },
    { arabic: "لَوْ زُرْتَنِي، لَكُنْتُ سَعِيدًا.", english: "If you (m.) had visited me, I would have been happy." },
    { arabic: "إِذَا لَمْ تَفْهَمْ، اِسْأَلِ الْأُسْتَاذَ.", english: "If you (m.) don't understand, ask the professor." },
    { arabic: "لَوْ كَانَ عِنْدِي وَقْتٌ، لَزُرْتُ الْمُتْحَفَ.", english: "If I had time, I would visit the museum." },
  ];

  const lesson8_2Exercises = [
    {
      question: "Which particle is used for real or possible conditions?",
      options: ["لَوْ", "إِذَا", "لَنْ", "لَمْ"],
      correctAnswer: "إِذَا"
    },
    {
      question: "Which particle is used for hypothetical or impossible conditions?",
      options: ["لَوْ", "إِذَا", "لَنْ", "لَمْ"],
      correctAnswer: "لَوْ"
    },
    {
      question: "The response part of a 'لَوْ' sentence often begins with:",
      options: ["سَـ", "سَوْفَ", "لَـ", "أَنْ"],
      correctAnswer: "لَـ"
    }
  ];

  // Lesson 8.3: Reading Unvowelled Texts (B2 Level)
  const lesson8_3Vocabulary = [
    { voweled: "اَلصُّحُفِيُّ", unvoweled: "الصحفي", transliteration: "aṣ-ṣuḥufiyyu", meaning: "the journalist" },
    { voweled: "اَلْمَقَالَةُ", unvoweled: "المقالة", transliteration: "al-maqālatu", meaning: "the article" },
    { voweled: "اَلْخَبَرُ", unvoweled: "الخبر", transliteration: "al-khabaru", meaning: "the news item" },
    { voweled: "اَلْجَرِيدَةُ", unvoweled: "الجريدة", transliteration: "al-jarīdatu", meaning: "the newspaper" },
    { voweled: "اَلْمُؤْتَمَرُ", unvoweled: "المؤتمر", transliteration: "al-mu'tamaru", meaning: "the conference" },
    { voweled: "اَلْحَادِثُ", unvoweled: "الحادث", transliteration: "al-ḥādithu", meaning: "the accident / incident" },
    { voweled: "اَلشَّاهِدُ", unvoweled: "الشاهد", transliteration: "ash-shāhidu", meaning: "the witness" },
    { voweled: "اَلشُّرْطَةُ", unvoweled: "الشرطة", transliteration: "ash-shurṭatu", meaning: "the police" },
    { voweled: "اَلْمَوْقِعُ", unvoweled: "الموقع", transliteration: "al-mawqiʿu", meaning: "the location / website" },
    { voweled: "اَلْهَدَفُ", unvoweled: "الهدف", transliteration: "al-hadafu", meaning: "the goal / objective" },
    { voweled: "اَلنَّتِيجَةُ", unvoweled: "النتيجة", transliteration: "an-natījatu", meaning: "the result" },
    { voweled: "اَلْمُبَارَاةُ", unvoweled: "المباراة", transliteration: "al-mubārātu", meaning: "the match (sports)" },
    { voweled: "اَلْفَرِيقُ", unvoweled: "الفريق", transliteration: "al-farīqu", meaning: "the team" },
    { voweled: "اَللَّاعِبُ", unvoweled: "اللاعب", transliteration: "al-lāʿibu", meaning: "the player" },
    { voweled: "مُهِمٌّ", unvoweled: "مهم", transliteration: "muhimmun", meaning: "important" },
    { voweled: "وَاضِحٌ", unvoweled: "واضح", transliteration: "wāḍiḥun", meaning: "clear" },
    { voweled: "نَشَرَ / يَنْشُرُ", unvoweled: "نشر / ينشر", transliteration: "nashara / yanshuru", meaning: "to publish" },
    { voweled: "وَقَعَ / يَقَعُ", unvoweled: "وقع / يقع", transliteration: "waqaʿa / yaqaʿu", meaning: "to occur / happen" },
  ];

  const lesson8_3ExampleSentences = [
    { voweled: "كَتَبَ الصُّحُفِيُّ مَقَالَةً طَوِيلَةً.", unvoweled: "كتب الصحفي مقالة طويلة.", english: "The journalist wrote a long article." },
    { voweled: "نَشَرَتِ الْجَرِيدَةُ الْخَبَرَ الْيَوْمَ.", unvoweled: "نشرت الجريدة الخبر اليوم.", english: "The newspaper published the news item today." },
    { voweled: "وَقَعَ الْحَادِثُ فِي وَسَطِ الْمَدِينَةِ.", unvoweled: "وقع الحادث في وسط المدينة.", english: "The accident occurred in the city center." },
    { voweled: "تَكَلَّمَ الشَّاهِدُ مَعَ الشُّرْطَةِ.", unvoweled: "تكلم الشاهد مع الشرطة.", english: "The witness spoke with the police." },
    { voweled: "كَانَ هَدَفُ الْفَرِيقِ الْفَوْزَ بِالْمُبَارَاةِ.", unvoweled: "كان هدف الفريق الفوز بالمباراة.", english: "The team's goal was to win the match." },
    { voweled: "اَلنَّتِيجَةُ لَمْ تَكُنْ وَاضِحَةً.", unvoweled: "النتيجة لم تكن واضحة.", english: "The result was not clear." },
    { voweled: "سَيُشَارِكُ الرَّئِيسُ فِي الْمُؤْتَمَرِ.", unvoweled: "سيشارك الرئيس في المؤتمر.", english: "The president will participate in the conference." },
    { voweled: "أَعْلَنَ اللَّاعِبُ اِعْتِزَالَهُ.", unvoweled: "أعلن اللاعب اعتزاله.", english: "The player announced his retirement." },
    { voweled: "هَذَا خَبَرٌ مُهِمٌّ جِدًّا.", unvoweled: "هذا خبر مهم جدا.", english: "This is very important news." },
    { voweled: "أَقْرَأُ الْأَخْبَارَ عَلَى مَوْقِعٍ إِخْبَارِيٍّ.", unvoweled: "أقرأ الأخبار على موقع إخباري.", english: "I read the news on a news website." },
  ];

  const lesson8_3Exercises = [
    {
      question: "Read the unvoweled sentence: 'وصل الوزير الى المطار'",
      options: ["waṣala al-wazīru ilā al-maṭāri.", "wuṣila al-wazīri ilā al-maṭāru.", "waṣṣala al-wazīru ilā al-maṭāri."],
      correctAnswer: "waṣala al-wazīru ilā al-maṭāri."
    },
    {
      question: "Recognizing word patterns like 'فاعل' (doer) and 'مفعول' (receiver of action) is a key strategy for reading unvoweled text.",
      options: ["True", "False"],
      correctAnswer: "True"
    },
    {
      question: "What is the most likely reading of this unvoweled phrase: 'رئيس الحكومة'?",
      options: ["ra'īsu al-ḥukūmati (The head of the government)", "ra'asa al-ḥukūmata (He presided over the government)"],
      correctAnswer: "ra'īsu al-ḥukūmati (The head of the government)"
    }
  ];

  // Lesson 8.4: Cultural Topics (B2 Level)
  const lesson8_4Vocabulary = [
    { arabic: "أَدِيبٌ / أُدَبَاءُ", transliteration: "adībun / udabā'u", meaning: "author(s), man of letters" },
    { arabic: "رِوَائِيٌّ", transliteration: "riwā'iyyun", meaning: "novelist" },
    { arabic: "شَهِيرٌ", transliteration: "shahīrun", meaning: "famous" },
    { arabic: "مِصْرِيٌّ", transliteration: "miṣriyyun", meaning: "Egyptian" },
    { arabic: "حَصَلَ عَلَى", transliteration: "ḥaṣala ʿalā", meaning: "he obtained / received" },
    { arabic: "جَائِزَةُ نُوبِل", transliteration: "jā'izatu nōbil", meaning: "The Nobel Prize" },
    { arabic: "اَلْأَدَبُ", transliteration: "al-adabu", meaning: "literature" },
    { arabic: "رِوَايَةٌ / رِوَايَاتٌ", transliteration: "riwāyatun / riwāyātun", meaning: "novel(s)" },
    { arabic: "قِصَّةٌ قَصِيرَةٌ", transliteration: "qiṣṣatun qaṣīratun", meaning: "short story" },
    { arabic: "تُرْجِمَ / يُتَرْجَمُ", transliteration: "turjima / yutarjamu", meaning: "was translated / is translated" },
    { arabic: "عَمَلٌ / أَعْمَالٌ", transliteration: "ʿamalun / aʿmālun", meaning: "a work / works (of art, literature)" },
    { arabic: "اَلْقَرْنُ الْعِشْرُونَ", transliteration: "al-qarnu al-ʿishrūna", meaning: "the 20th century" },
    { arabic: "يُعْتَبَرُ", transliteration: "yuʿtabaru", meaning: "he/it is considered" },
    { arabic: "وَاحِدٌ مِنْ", transliteration: "wāḥidun min", meaning: "one of" },
    { arabic: "أَهَمُّ", transliteration: "ahammu", meaning: "most important" },
    { arabic: "اَلْعَالَمُ الْعَرَبِيُّ", transliteration: "al-ʿālamu al-ʿarabiyyu", meaning: "the Arab world" },
    { arabic: "تُوُفِّيَ", transliteration: "tuwuffiya", meaning: "he passed away" },
  ];

  const lesson8_4ReadingPassage = {
    title: "نَجِيب مَحْفُوظ",
    text: "نَجِيب مَحْفُوظ هُوَ أَدِيبٌ وَرِوَائِيٌّ مِصْرِيٌّ شَهِيرٌ. يُعْتَبَرُ وَاحِدًا مِنْ أَهَمِّ الْكُتَّابِ فِي الْعَالَمِ الْعَرَبِيِّ فِي الْقَرْنِ الْعِشْرِينَ. فِي سَنَةِ ١٩٨٨، حَصَلَ مَحْفُوظ عَلَى جَائِزَةِ نُوبِل فِي الْأَدَبِ، وَكَانَ أَوَّلَ كَاتِبٍ عَرَبِيٍّ يَحْصُلُ عَلَيْهَا. كَتَبَ الْكَثِيرَ مِنَ الرِّوَايَاتِ وَالْقِصَصِ الْقَصِيرَةِ الَّتِي تُصَوِّرُ الْحَيَاةَ فِي الْقَاهِرَةِ. تُرْجِمَتْ أَعْمَالُهُ إِلَى لُغَاتٍ كَثِيرَةٍ. تُوُفِّيَ نَجِيب مَحْفُوظ سَنَةَ ٢٠٠٦."
  };

  const lesson8_4ExampleSentences = [
    { arabic: "يُعْتَبَرُ هَذَا الْفِيلْمُ مِنْ أَهَمِّ الْأَفْلَامِ.", english: "This film is considered one of the most important films." },
    { arabic: "تُرْجِمَ الْكِتَابُ إِلَى اللُّغَةِ الْإِنْجِلِيزِيَّةِ.", english: "The book was translated into the English language." },
    { arabic: "حَصَلَتِ الطَّالِبَةُ عَلَى دَرَجَاتٍ عَالِيَةٍ.", english: "The student (f.) received high grades." },
    { arabic: "كَانَ شَاعِرًا شَهِيرًا فِي بَلَدِهِ.", english: "He was a famous poet in his country." },
    { arabic: "تُوُفِّيَ جَدِّي فِي السَّنَةِ الْمَاضِيَةِ.", english: "My grandfather passed away last year." },
    { arabic: "أَنَا أَقْرَأُ رِوَايَةً لِكَاتِبٍ مَعْرُوفٍ.", english: "I am reading a novel by a well-known writer." },
    { arabic: "اَلْأَدَبُ الْعَرَبِيُّ غَنِيٌّ وَمُتَنَوِّعٌ.", english: "Arabic literature is rich and diverse." },
    { arabic: "هَذَا الْعَمَلُ الْفَنِّيُّ جَمِيلٌ جِدًّا.", english: "This work of art is very beautiful." },
    { arabic: "هُوَ وَاحِدٌ مِنْ أَفْضَلِ اللَّاعِبِينَ.", english: "He is one of the best players." },
    { arabic: "تُقَامُ الْحَفْلَةُ فِي قَاعَةٍ كَبِيرَةٍ.", english: "The party is held in a big hall." },
  ];

  const lesson8_4Exercises = [
    {
      question: "مِنْ أَيِّ بَلَدٍ كَانَ نَجِيب مَحْفُوظ؟",
      options: ["لُبْنَان", "مِصْر", "سوريا", "اَلْعِرَاق"],
      correctAnswer: "مِصْر"
    },
    {
      question: "مَا هِيَ الْجَائِزَةُ الْمُهِمَّةُ الَّتِي حَصَلَ عَلَيْهَا؟",
      options: ["جَائِزَةُ الْأُوسْكَار", "جَائِزَةُ نُوبِل", "جَائِزَةُ الْأَدَبِ الْعَرَبِيِّ"],
      correctAnswer: "جَائِزَةُ نُوبِل"
    },
    {
      question: "مَاذَا كَانَ يَكْتُبُ نَجِيب مَحْفُوظ؟",
      options: ["أَشْعَارًا فَقَطْ", "رِوَايَاتٍ وَقِصَصًا قَصِيرَةً", "مَقَالَاتٍ صُحُفِيَّةً"],
      correctAnswer: "رِوَايَاتٍ وَقِصَصًا قَصِيرَةً"
    }
  ];

  // Lesson 6.5: Your Most Powerful Tool - Using a Root-Based Dictionary
  const lesson6_5Vocabulary = [
    { arabic: "جَذْرٌ / جُذُورٌ", transliteration: "jadhrun / judhūrun", meaning: "root(s)" },
    { arabic: "وَزْنٌ / أَوْزَانٌ", transliteration: "waznun / awzānun", meaning: "pattern(s), form(s)" },
    { arabic: "قَامُوسٌ", transliteration: "qāmūsun", meaning: "dictionary" },
    { arabic: "مُعْجَمٌ", transliteration: "muʿjamun", meaning: "dictionary, lexicon" },
    { arabic: "فِعْلٌ / أَفْعَالٌ", transliteration: "fiʿlun / afʿālun", meaning: "verb(s)" },
    { arabic: "اِسْمٌ / أَسْمَاءٌ", transliteration: "ismun / asmā'un", meaning: "noun(s)" },
    { arabic: "مَاضٍ", transliteration: "māḍin", meaning: "past tense" },
    { arabic: "مُضَارِعٌ", transliteration: "muḍāriʿun", meaning: "present tense" },
    { arabic: "مَصْدَرٌ", transliteration: "maṣdarun", meaning: "verbal noun (masdar)" },
    { arabic: "مُجَرَّدٌ", transliteration: "mujarradun", meaning: "abstracted, stripped down" },
    { arabic: "مُشْتَقٌّ", transliteration: "mushtaqqun", meaning: "derived" },
    { arabic: "مَادَّةٌ", transliteration: "māddatun", meaning: "entry, lemma (in a dictionary)" },
    { arabic: "حَرْفٌ / حُرُوفٌ", transliteration: "ḥarfun / ḥurūfun", meaning: "letter(s)" },
    { arabic: "أَصْلِيٌّ", transliteration: "aṣliyyun", meaning: "original, root (adj.)" },
    { arabic: "زَائِدٌ", transliteration: "zā'idun", meaning: "extra, additional" },
    { arabic: "بَحَثَ عَنْ", transliteration: "baḥatha ʿan", meaning: "he searched for" },
    { arabic: "وَجَدَ", transliteration: "wajada", meaning: "he found" }
  ];

  const lesson6_5ExampleSentences = [
    { arabic: "مَا هُوَ جَذْرُ كَلِمَةِ 'مَكْتَبَة'؟", english: "What is the root of the word 'maktaba' (library)?" },
    { arabic: "بَحَثْتُ عَنِ الْمَصْدَرِ فِي الْمُعْجَمِ.", english: "I searched for the masdar in the dictionary." },
    { arabic: "اَلْحُرُوفُ الْأَصْلِيَّةُ لِلْفِعْلِ هِيَ 'د ر س'.", english: "The root letters of the verb are 'd r s'." },
    { arabic: "هَذَا الاِسْمُ مُشْتَقٌّ مِنَ الْفِعْلِ 'كَتَبَ'.", english: "This noun is derived from the verb 'kataba'." },
    { arabic: "وَجَدْتُ الْكَلِمَةَ تَحْتَ مَادَّةِ 'ع ل م'.", english: "I found the word under the entry for 'ʿ l m'." },
    { arabic: "لِكُلِّ فِعْلٍ فِي الْعَرَبِيَّةِ جَذْرٌ.", english: "Every verb in Arabic has a root." },
    { arabic: "أَوْزَانُ الْأَفْعَالِ مُهِمَّةٌ جِدًّا.", english: "The verb patterns are very important." },
    { arabic: "اَلْأَحْرُفُ الزَّائِدَةُ تُغَيِّرُ الْمَعْنَى.", english: "The extra letters change the meaning." },
    { arabic: "عَلَيْكَ أَنْ تُجَرِّدَ الْكَلِمَةَ لِتَجِدَ الْجَذْرَ.", english: "You must strip the word to find the root." },
    { arabic: "يَشْرَحُ الْقَامُوسُ مَعَانِيَ الْكَلِمَاتِ.", english: "The dictionary explains the meanings of words." }
  ];

  const lesson6_5Exercises = [
    {
      question: "What is the three-letter root of the word `مُسَافِرُونَ` (travelers)?",
      options: ["س ف ر", "س ف ا", "ف ر و"],
      correctAnswer: "س ف ر"
    },
    {
      question: "Under which root would you find the word `مِفْتَاح` (key)?",
      options: ["م ف ت", "ف ت ح", "ف ت ا"],
      correctAnswer: "ف ت ح"
    },
    {
      question: "What is the root of the verb `اِسْتَقْبَلَ` (to receive/welcome)?",
      options: ["س ق ب", "ت ق ب", "ق ب ل"],
      correctAnswer: "ق ب ل"
    }
  ];

  // Lesson 4.3: Object Pronouns (A2 Level)
  const lesson4_3Vocabulary = [
    { arabic: "ـنِي", transliteration: "-nī", meaning: "me" },
    { arabic: "ـكَ", transliteration: "-ka", meaning: "you (m. object)" },
    { arabic: "ـكِ", transliteration: "-ki", meaning: "you (f. object)" },
    { arabic: "ـهُ", transliteration: "-hu", meaning: "him / it" },
    { arabic: "ـهَا", transliteration: "-hā", meaning: "her / it" },
    { arabic: "رَأَى", transliteration: "ra'ā", meaning: "he saw", root: "ر أ ي" },
    { arabic: "سَأَلَ", transliteration: "sa'ala", meaning: "he asked", root: "س أ ل" },
    { arabic: "سَاعَدَ", transliteration: "sāʿada", meaning: "he helped", root: "س ع د" },
    { arabic: "عَرَفَ", transliteration: "ʿarafa", meaning: "he knew", root: "ع ر ف" },
    { arabic: "فَهِمَ", transliteration: "fahima", meaning: "he understood", root: "ف ه م" },
    { arabic: "زَارَ", transliteration: "zāra", meaning: "he visited", root: "ز و ر" },
    { arabic: "أَعْطَى", transliteration: "aʿṭā", meaning: "he gave", root: "ع ط ي" },
    { arabic: "اَلْمُدَرِّسُ", transliteration: "al-mudarrisu", meaning: "the teacher (m.)" },
    { arabic: "اَلشُّرْطِيُّ", transliteration: "ash-shurṭiyyu", meaning: "the policeman" },
    { arabic: "اَلطَّبِيبُ", transliteration: "aṭ-ṭabību", meaning: "the doctor (m.)" },
    { arabic: "اَلْأُسْتَاذُ", transliteration: "al-ustādhu", meaning: "the professor" },
    { arabic: "اَلْهَدِيَّةُ", transliteration: "al-hadiyyatu", meaning: "the gift" },
    { arabic: "اَلْمُشْكِلَةُ", transliteration: "al-mushkilatu", meaning: "the problem" },
    { arabic: "فِي", transliteration: "fī", meaning: "in / at" },
  ];

  const lesson4_3ExampleSentences = [
    { arabic: "اَلْمُدَرِّسُ سَأَلَنِي.", english: "The teacher asked me." },
    { arabic: "أَنَا سَاعَدْتُكَ.", english: "I helped you (m.)." },
    { arabic: "هَلْ رَأَيْتِهِ؟", english: "Did you (f.) see him?" },
    { arabic: "هُوَ عَرَفَهَا فِي الْجَامِعَةِ.", english: "He knew her at the university." },
    { arabic: "هِيَ زَارَتْهُ أَمْسِ.", english: "She visited him yesterday." },
    { arabic: "اَلشُّرْطِيُّ سَاعَدَنَا.", english: "The policeman helped us." },
    { arabic: "اَلْأُسْتَاذُ فَهِمَكُمْ.", english: "The professor understood you (m. pl.)." },
    { arabic: "أَنَا أَعْطَيْتُكُنَّ الْهَدِيَّةَ.", english: "I gave you (f. pl.) the gift." },
    { arabic: "هُمْ عَرَفُوهُ فِي السُّوقِ.", english: "They (m.) knew him at the market." },
    { arabic: "هُنَّ فَهِمْنَ الْمُشْكِلَةَ.", english: "They (f.) understood the problem." },
  ];

  const lesson4_3Exercises = [
    {
      question: "How do you say 'He saw me'?",
      options: ["رَآكَ", "رَآنِي", "رَآهُ", "رَآهَا"],
      correctAnswer: "رَآنِي"
    },
    {
      question: "The phrase 'سَاعَدْتُهَا' means:",
      options: ["I helped him.", "She helped me.", "I helped her.", "He helped her."],
      correctAnswer: "I helped her."
    },
    {
      question: "Which sentence correctly says 'Did you (m.) understand him?'",
      options: ["هَلْ فَهِمْتَهُ؟", "هَلْ فَهِمْتِهِ؟", "هَلْ فَهِمْتُهُ؟", "هَلْ فَهِمَهُ؟"],
      correctAnswer: "هَلْ فَهِمْتَهُ؟"
    }
  ];

  // Lesson 4.2: The Past Tense (Plural) (A2 Level)
  const lesson4_2Vocabulary = [
    { arabic: "كَتَبَ", transliteration: "kataba", meaning: "he wrote", root: "ك ت ب" },
    { arabic: "قَرَأَ", transliteration: "qara'a", meaning: "he read", root: "ق ر أ" },
    { arabic: "طَبَخَ", transliteration: "ṭabakha", meaning: "he cooked", root: "ط ب خ" },
    { arabic: "رَسَمَ", transliteration: "rasama", meaning: "he drew", root: "ر س م" },
    { arabic: "لَعِبَ", transliteration: "laʿiba", meaning: "he played", root: "ل ع ب" },
    { arabic: "نَظَّفَ", transliteration: "naẓẓafa", meaning: "he cleaned", root: "ن ظ ف" },
    { arabic: "شَاهَدَ", transliteration: "shāhada", meaning: "he watched", root: "ش ه د" },
    { arabic: "سَافَرَ", transliteration: "sāfara", meaning: "he traveled", root: "س ف ر" },
    { arabic: "اَلْأَوْلَادُ", transliteration: "al-awlādu", meaning: "the boys" },
    { arabic: "اَلْبَنَاتُ", transliteration: "al-banātu", meaning: "the girls" },
    { arabic: "اَلرِّجَالُ", transliteration: "ar-rijālu", meaning: "the men" },
    { arabic: "اَلنِّسَاءُ", transliteration: "an-nisā'u", meaning: "the women" },
    { arabic: "اَلْوَاجِبُ", transliteration: "al-wājibu", meaning: "the homework" },
    { arabic: "اَلطَّعَامُ", transliteration: "aṭ-ṭaʿāmu", meaning: "the food" },
    { arabic: "صُورَةٌ", transliteration: "ṣūratun", meaning: "a picture" },
    { arabic: "فِيلْمٌ", transliteration: "fīlmun", meaning: "a film" },
    { arabic: "كُرَةُ الْقَدَمِ", transliteration: "kuratu al-qadami", meaning: "football (soccer)" },
    { arabic: "إِلَى", transliteration: "ilā", meaning: "to" },
    { arabic: "مَعًا", transliteration: "maʿan", meaning: "together" },
  ];

  const lesson4_2ExampleSentences = [
    { arabic: "نَحْنُ كَتَبْنَا الْوَاجِبَ.", english: "We wrote the homework." },
    { arabic: "أَنْتُمْ لَعِبْتُمْ كُرَةَ الْقَدَمِ.", english: "You (m. pl.) played football." },
    { arabic: "أَنْتُنَّ طَبَخْتُنَّ الطَّعَامَ.", english: "You (f. pl.) cooked the food." },
    { arabic: "هُمْ سَافَرُوا إِلَى مِصْرَ.", english: "They (m.) traveled to Egypt." },
    { arabic: "هُنَّ رَسَمْنَ صُورَةً جَمِيلَةً.", english: "They (f.) drew a beautiful picture." },
    { arabic: "نَحْنُ شَاهَدْنَا فِيلْمًا مَعًا.", english: "We watched a film together." },
    { arabic: "أَنْتُمْ قَرَأْتُمُ الْكُتُبَ.", english: "You (m. pl.) read the books." },
    { arabic: "أَنْتُنَّ نَظَّفْتُنَّ الْبَيْتَ.", english: "You (f. pl.) cleaned the house." },
    { arabic: "هُمْ دَخَلُوا الْمَدْرَسَةَ.", english: "They (m.) entered the school." },
    { arabic: "هُنَّ جَلَسْنَ فِي الْفَصْلِ.", english: "They (f.) sat in the classroom." },
  ];

  const lesson4_2Exercises = [
    {
      question: "How do you say 'They (m.) wrote'?",
      options: ["كَتَبْنَ", "كَتَبُوا", "كَتَبْتُمْ", "كَتَبْنَا"],
      correctAnswer: "كَتَبُوا"
    },
    {
      question: "The suffix 'ـنَا' (-nā) on a past tense verb corresponds to which pronoun?",
      options: ["نَحْنُ", "هُمْ", "هُنَّ", "أَنْتُمْ"],
      correctAnswer: "نَحْنُ"
    },
    {
      question: "Which sentence correctly says 'You (f. pl.) cooked the food'?",
      options: ["أَنْتُنَّ طَبَخْتُنَّ الطَّعَامَ.", "أَنْتُمْ طَبَخْتُمُ الطَّعَامَ.", "هُنَّ طَبَخْنَ الطَّعَامَ."],
      correctAnswer: "أَنْتُنَّ طَبَخْتُنَّ الطَّعَامَ."
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
      ) : currentLesson.id === "a2-m3-l1" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 3.1: The Verbal Sentence</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to build sentences with actions using verbs and understand the three-letter root system.
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
                <span>Understand the concept of the Verbal Sentence (اَلْجُمْلَةُ الْفِعْلِيَّةُ).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn about the three-letter root system for Arabic verbs.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Identify the Subject, Verb, and Object in a basic sentence.</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Verbs and Sentence Structure</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The Three-Letter Root (اَلْجِذْرُ)</h5>
                <p className="text-gray-600 mt-1">Almost all Arabic words are built from a "root" of three consonants. This root carries the core meaning. For example, the root <span className="font-bold" lang="ar" dir="rtl">ك ت ب</span> is related to the idea of "writing". All words like 'book', 'author', 'library', and the verb 'to write' come from this root. Learning to recognize roots is a superpower in Arabic.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The Verbal Sentence</h5>
                <p className="text-gray-600 mt-1">A verbal sentence is one that begins with a verb. The most common structure is <strong>Verb - Subject - Object</strong>.</p>
                <div className="mt-3 border-t pt-3">
                  <p className="text-xl text-right mt-1" lang="ar" dir="rtl">يَشْرَبُ الْوَلَدُ الْقَهْوَةَ.</p>
                  <p className="text-sm text-gray-500 text-right">Drinks the boy the coffee. (The boy drinks the coffee.)</p>
                  <ul className="mt-2 text-right text-sm space-y-1">
                    <li><span className="font-semibold">Verb:</span> <span lang="ar" dir="rtl">يَشْرَبُ</span></li>
                    <li><span className="font-semibold">Subject:</span> <span lang="ar" dir="rtl">الْوَلَدُ</span></li>
                    <li><span className="font-semibold">Object:</span> <span lang="ar" dir="rtl">الْقَهْوَةَ</span></li>
                  </ul>
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
                    <th className="p-3 font-medium text-gray-600">Root</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson3_1Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3 text-gray-500 font-mono">{item.root || '---'}</td>
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
            <div className="bg-gray-100 p-4 rounded-lg space-y-4">
              {lesson3_1ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
              {lesson3_1Exercises.map((q, qIndex) => (
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
      ) : currentLesson.id === "a2-m3-l2" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 3.2: Present Tense Conjugation (Singular)</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn to talk about actions happening now for different people using proper verb conjugations.
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
                <span>Learn the prefix and suffix patterns for present tense verbs.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Conjugate regular verbs for the five singular pronouns.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Form complete verbal sentences using the new conjugations.</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Present Tense Conjugation</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Prefixes and Suffixes</h5>
                <p className="text-gray-600 mt-1">To change who is doing the action in the present tense, you add prefixes (and sometimes suffixes) to the verb stem. For example, using the verb <span lang="ar" dir="rtl">يَكْتُبُ</span> (he writes):</p>
              </div>
              <div className="overflow-x-auto p-4 bg-gray-50 rounded-lg">
                <table className="w-full text-left">
                  <thead className="border-b-2 border-gray-200">
                    <tr>
                      <th className="p-2 font-semibold text-gray-700">Pronoun</th>
                      <th className="p-2 font-semibold text-gray-700">Prefix</th>
                      <th className="p-2 font-semibold text-gray-700">Suffix</th>
                      <th className="p-2 font-semibold text-gray-700 text-right">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنَا</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">أَ</td><td className="p-2">---</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">أَ</span>كْتُبُ</td></tr>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتَ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">تَ</td><td className="p-2">---</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">تَ</span>كْتُبُ</td></tr>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتِ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">تَ</td><td className="p-2 text-blue-600 font-bold" lang="ar" dir="rtl">ينَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">تَ</span>كْتُب<span className="text-blue-600 font-bold">ينَ</span></td></tr>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">هُوَ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">يَ</td><td className="p-2">---</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">يَ</span>كْتُبُ</td></tr>
                    <tr><td className="p-2" lang="ar" dir="rtl">هِيَ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">تَ</td><td className="p-2">---</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">تَ</span>كْتُبُ</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Important Note</h5>
                <p className="text-gray-600 mt-1">Notice that the conjugation for <span lang="ar" dir="rtl">أَنْتَ</span> (you, m.) and <span lang="ar" dir="rtl">هِيَ</span> (she) is identical. You must use the context of the sentence to know who is being referred to.</p>
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
                    <th className="p-3 font-medium text-gray-600">Root</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson3_2Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3 text-gray-500 font-mono">{item.root || '---'}</td>
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
            <div className="bg-gray-100 p-4 rounded-lg space-y-4">
              {lesson3_2ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
              {lesson3_2Exercises.map((q, qIndex) => (
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
      ) : currentLesson.id === "a2-m3-l3" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 3.3: Plurals</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to describe more than one person or object using the three types of Arabic plurals.
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
                <span>Learn the Sound Masculine Plural (جَمْعُ الْمُذَكَّرِ السَّالِمُ).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Learn the Sound Feminine Plural (جَمْعُ الْمُؤَنَّثِ السَّالِمُ).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand the concept of Broken Plurals (جَمْعُ التَّكْسِيرِ).</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: The Three Types of Plurals</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">1. Sound Masculine Plural</h5>
                <p className="text-gray-600 mt-1">This plural is used for most words referring to groups of men (e.g., jobs, nationalities). You form it by adding the suffix <span className="font-bold text-lg" lang="ar" dir="rtl">ـُونَ</span> to the singular noun.</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">مُهَنْدِسٌ <span className="mx-2">→</span> مُهَنْدِسُونَ</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">2. Sound Feminine Plural</h5>
                <p className="text-gray-600 mt-1">This plural is used for most words referring to groups of women. You form it by dropping the final <span lang="ar" dir="rtl">ة</span> and adding the suffix <span className="font-bold text-lg" lang="ar" dir="rtl">ـَاتٌ</span>.</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">مُهَنْدِسَةٌ <span className="mx-2">→</span> مُهَنْدِسَاتٌ</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">3. Broken Plural</h5>
                <p className="text-gray-600 mt-1">This is the most common type of plural in Arabic, used for most non-human objects and many human nouns. There is no single rule; the plural form changes the internal structure of the singular word. <strong>Broken plurals must be memorized with their singulars.</strong></p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">كِتَابٌ <span className="mx-2">→</span> كُتُبٌ</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">رَجُلٌ <span className="mx-2">→</span> رِجَالٌ</p>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Very Important Rule: Non-Human Plurals</h5>
                <p className="text-gray-600 mt-1">When a <strong>non-human plural</strong> (like 'books' or 'houses') is the subject of a sentence, it is treated as a <strong>feminine singular</strong> noun for agreement purposes. This means any adjective describing it must also be feminine singular.</p>
                <p className="text-xl text-right mt-2" lang="ar" dir="rtl">اَلْبُيُوتُ كَبِيرَةٌ. (The houses are big.)</p>
                <p className="text-sm text-gray-500 text-right">Notice we use <span lang="ar" dir="rtl">كَبِيرَةٌ</span> (f. sg.) not <span lang="ar" dir="rtl">كِبَارٌ</span> (plural).</p>
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
                    <th className="p-3 text-lg font-semibold text-gray-700">Singular</th>
                    <th className="p-3 text-lg font-semibold text-gray-700">Plural</th>
                    <th className="p-3 font-medium text-gray-600">Meaning</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson3_3Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.plural}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => playAudio(item.plural, 'male')}
                          disabled={audioLoading[`${item.plural}-male`]}
                          className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                          title="Play audio"
                        >
                          {audioLoading[`${item.plural}-male`] ? (
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
            <div className="bg-gray-100 p-4 rounded-lg space-y-4">
              {lesson3_3ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
              {lesson3_3Exercises.map((q, qIndex) => (
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
      ) : currentLesson.id === "a2-m3-l4" ? (
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="clay-card p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 3.4: Present Tense Conjugation (Plural)</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn to talk about actions performed by groups of people using proper plural verb conjugations.
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
                <span>Learn the prefix and suffix patterns for plural present tense verbs.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Conjugate regular verbs for the five plural pronouns.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Understand the special role of the "nun al-niswa" (نُونُ النِّسْوَةِ).</span>
              </li>
            </ul>
          </div>

          {/* Grammar Explanation */}
          <div className="clay-card p-6">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Plural Conjugation</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Patterns for Groups</h5>
                <p className="text-gray-600 mt-1">Conjugating for plural subjects follows clear patterns of prefixes and suffixes. We will use the verb <span lang="ar" dir="rtl">يَسْكُنُ</span> (he lives) as our example.</p>
              </div>
              <div className="overflow-x-auto p-4 bg-gray-50 rounded-lg">
                <table className="w-full text-left">
                  <thead className="border-b-2 border-gray-200">
                    <tr>
                      <th className="p-2 font-semibold text-gray-700">Pronoun</th>
                      <th className="p-2 font-semibold text-gray-700">Prefix</th>
                      <th className="p-2 font-semibold text-gray-700">Suffix</th>
                      <th className="p-2 font-semibold text-gray-700 text-right">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">نَحْنُ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">نَ</td><td className="p-2">---</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">نَ</span>سْكُنُ</td></tr>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتُمْ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">تَ</td><td className="p-2 text-blue-600 font-bold" lang="ar" dir="rtl">ونَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">تَ</span>سْكُن<span className="text-blue-600 font-bold">ُونَ</span></td></tr>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتُنَّ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">تَ</td><td className="p-2 text-blue-600 font-bold" lang="ar" dir="rtl">نَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">تَ</span>سْكُنّ<span className="text-blue-600 font-bold">َ</span></td></tr>
                    <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">هُمْ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">يَ</td><td className="p-2 text-blue-600 font-bold" lang="ar" dir="rtl">ونَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">يَ</span>سْكُن<span className="text-blue-600 font-bold">ُونَ</span></td></tr>
                    <tr><td className="p-2" lang="ar" dir="rtl">هُنَّ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">يَ</td><td className="p-2 text-blue-600 font-bold" lang="ar" dir="rtl">نَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl"><span className="text-red-600 font-bold">يَ</span>سْكُنّ<span className="text-blue-600 font-bold">َ</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">The "Nun of the Women" (نُونُ النِّسْوَةِ)</h5>
                <p className="text-gray-600 mt-1">The suffix <span className="font-bold" lang="ar" dir="rtl">ـنَ</span> used for <span lang="ar" dir="rtl">أَنْتُنَّ</span> and <span lang="ar" dir="rtl">هُنَّ</span> is very powerful. It's called the <em>nun al-niswa</em>. When you add it, the vowel on the last letter of the verb root always becomes a <em>sukun</em> (no vowel). For example, <span lang="ar" dir="rtl">يَسْكُنُ</span> becomes <span lang="ar" dir="rtl">يَسْكُنْ</span> before adding the <span lang="ar" dir="rtl">ـنَ</span>.</p>
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
                    <th className="p-3 font-medium text-gray-600">Root</th>
                    <th className="p-3 font-medium text-gray-600">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson3_4Vocabulary.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                      <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                      <td className="p-3 text-gray-700">{item.meaning}</td>
                      <td className="p-3 text-gray-500 font-mono">{item.root || '---'}</td>
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
            <div className="bg-gray-100 p-4 rounded-lg space-y-4">
              {lesson3_4ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
              {lesson3_4Exercises.map((q, qIndex) => (
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
      ) : currentLesson.id === "a2-m3-l5" ? (
        <div className="space-y-8">
                     {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 3.5: Negating the Present Tense</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn how to say what you, or others, are not doing.
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
                 <span>Learn the negation particle لَا (lā) for the present tense.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice forming negative sentences for all pronouns.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Combine negation with adverbs like "always" and "usually".</span>
               </li>
             </ul>
           </div>

                     {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Simple Negation with لَا</h4>
             <div className="space-y-4">
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">The Rule</h5>
                 <p className="text-gray-600 mt-1">Negating a verb in the present tense is very simple. You just place the particle <span className="font-bold text-lg" lang="ar" dir="rtl">لَا</span> (lā) <strong>directly before the conjugated verb</strong>. Nothing else in the sentence changes.</p>
               </div>
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Structure: Affirmative vs. Negative</h5>
                 <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <p className="font-semibold text-gray-700">Affirmative (He understands):</p>
                     <p className="text-xl text-right mt-1" lang="ar" dir="rtl">هُوَ يَفْهَمُ.</p>
                   </div>
                   <div className="border-t md:border-t-0 md:border-l pt-2 md:pt-0 md:pl-4">
                     <p className="font-semibold text-gray-700">Negative (He does not understand):</p>
                     <p className="text-xl text-right mt-1" lang="ar" dir="rtl">هُوَ <span className="text-red-600 font-bold">لَا</span> يَفْهَمُ.</p>
                   </div>
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
                  {lesson3_5Vocabulary.map((item, index) => (
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
            <div className="bg-gray-100 p-4 rounded-lg space-y-4">
              {lesson3_5ExampleSentences.map((sentence, index) => (
                <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex-grow">
                    <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
              {lesson3_5Exercises.map((q, qIndex) => (
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
       ) : currentLesson.id === "a2-m4-l1" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 4.1: The Past Tense (Singular)</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to talk about actions that have already happened using the past tense.
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
                 <span>Understand that past tense verbs are conjugated with suffixes.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn the past tense verb endings for the five singular pronouns.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Form complete sentences describing past events.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Past Tense Conjugation (اَلْفِعْلُ الْمَاضِي)</h4>
             <div className="space-y-4">
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Suffixes, Not Prefixes</h5>
                 <p className="text-gray-600 mt-1">Unlike the present tense, the past tense is formed by adding <strong>suffixes</strong> to the end of the verb's root form. The base form of any verb is the "he" form, for example <span lang="ar" dir="rtl">كَتَبَ</span> (he wrote).</p>
               </div>
               <div className="overflow-x-auto p-4 bg-gray-50 rounded-lg">
                 <table className="w-full text-left">
                   <thead className="border-b-2 border-gray-200">
                     <tr>
                       <th className="p-2 font-semibold text-gray-700">Pronoun</th>
                       <th className="p-2 font-semibold text-gray-700">Suffix</th>
                       <th className="p-2 font-semibold text-gray-700 text-right">Example (Root: ف ع ل)</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنَا</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـتُ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلْ<span className="text-red-600 font-bold">ـتُ</span></td></tr>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتَ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـتَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلْ<span className="text-red-600 font-bold">ـتَ</span></td></tr>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتِ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـتِ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلْ<span className="text-red-600 font-bold">ـتِ</span></td></tr>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">هُوَ</td><td className="p-2">--- (base form)</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلَ</td></tr>
                     <tr><td className="p-2" lang="ar" dir="rtl">هِيَ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـَتْ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلَ<span className="text-red-600 font-bold">ـتْ</span></td></tr>
                   </tbody>
                 </table>
               </div>
               <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Important Note on Vowels</h5>
                 <p className="text-gray-600 mt-1">Notice that for the pronouns <em>I</em>, <em>you (m)</em>, and <em>you (f)</em>, the last letter of the verb root takes a <em>sukun</em> (no vowel) before the suffix is added. For example, <span lang="ar" dir="rtl">فَعَلَ</span> becomes <span lang="ar" dir="rtl">فَعَلْ</span> before adding <span lang="ar" dir="rtl">ـتُ</span>.</p>
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
                     <th className="p-3 font-medium text-gray-600">Root</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson4_1Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                       <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3 text-gray-500 font-mono">{item.root || '---'}</td>
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
             <div className="bg-gray-100 p-4 rounded-lg space-y-4">
               {lesson4_1ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson4_1Exercises.map((q, qIndex) => (
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
       ) : currentLesson.id === "a2-m4-l2" ? (
         <div className="space-y-8">
                       {/* Lesson Header */}
            <div className="clay-card p-8 text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 4.2: The Past Tense (Plural)</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Learn to describe past actions performed by groups.
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
                  <span>Learn the past tense verb endings for the five plural pronouns.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Practice conjugating verbs for plural subjects.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Form complete sentences describing what groups of people did.</span>
                </li>
              </ul>
            </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Plural Past Tense Conjugation</h4>
             <div className="space-y-4">
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Suffixes for Groups</h5>
                 <p className="text-gray-600 mt-1">Just like with singular pronouns, you add suffixes to the verb root to conjugate for plural subjects. Remember that the last letter of the root takes a <em>sukun</em> before most of these endings.</p>
               </div>
               <div className="overflow-x-auto p-4 bg-gray-50 rounded-lg">
                 <table className="w-full text-left">
                   <thead className="border-b-2 border-gray-200">
                     <tr>
                       <th className="p-2 font-semibold text-gray-700">Pronoun</th>
                       <th className="p-2 font-semibold text-gray-700">Suffix</th>
                       <th className="p-2 font-semibold text-gray-700 text-right">Example (Root: ف ع ل)</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">نَحْنُ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـنَا</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلْ<span className="text-red-600 font-bold">ـنَا</span></td></tr>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتُمْ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـتُمْ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلْ<span className="text-red-600 font-bold">ـتُمْ</span></td></tr>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">أَنْتُنَّ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـتُنَّ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلْ<span className="text-red-600 font-bold">ـتُنَّ</span></td></tr>
                     <tr className="border-b"><td className="p-2" lang="ar" dir="rtl">هُمْ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـُوا</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَل<span className="text-red-600 font-bold">ُوا</span></td></tr>
                     <tr><td className="p-2" lang="ar" dir="rtl">هُنَّ</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـنَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">فَعَلْ<span className="text-red-600 font-bold">ـنَ</span></td></tr>
                   </tbody>
                 </table>
               </div>
               <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Important Note on هُمْ</h5>
                 <p className="text-gray-600 mt-1">The conjugation for <em>هُمْ</em> (they, masc.) is unique. The last letter of the root takes a <em>damma</em> instead of a <em>sukun</em> before the <span lang="ar" dir="rtl">ـُوا</span> suffix is added. For example, <span lang="ar" dir="rtl">كَتَبَ</span> becomes <span lang="ar" dir="rtl">كَتَبُوا</span>.</p>
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
                     <th className="p-3 font-medium text-gray-600">Root</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson4_2Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                       <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3 text-gray-500 font-mono">{item.root || '---'}</td>
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
             <div className="bg-gray-100 p-4 rounded-lg space-y-4">
               {lesson4_2ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson4_2Exercises.map((q, qIndex) => (
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
       ) : currentLesson.id === "a2-m4-l3" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 4.3: Object Pronouns</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to attach pronouns to verbs to make your sentences more dynamic.
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
                 <span>Learn the attached pronoun suffixes for objects.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice attaching these suffixes to past tense verbs.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand the special "nun of protection" for the "-me" suffix.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Attaching Objects to Verbs</h4>
             <div className="space-y-4">
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Pronouns as Suffixes</h5>
                 <p className="text-gray-600 mt-1">Just like you attached pronouns to nouns to show possession, you can attach them to verbs to show who the action was done to. These suffixes are very similar to the ones you already know.</p>
               </div>
               <div className="overflow-x-auto p-4 bg-gray-50 rounded-lg">
                 <table className="w-full text-left">
                   <thead className="border-b-2 border-gray-200">
                     <tr>
                       <th className="p-2 font-semibold text-gray-700">Pronoun</th>
                       <th className="p-2 font-semibold text-gray-700">Suffix</th>
                       <th className="p-2 font-semibold text-gray-700 text-right">Example (He asked...)</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="border-b"><td className="p-2">me</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـنِي</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">سَأَلَ<span className="text-red-600 font-bold">ـنِي</span></td></tr>
                     <tr className="border-b"><td className="p-2">you (m.)</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـكَ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">سَأَلَ<span className="text-red-600 font-bold">ـكَ</span></td></tr>
                     <tr className="border-b"><td className="p-2">you (f.)</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـكِ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">سَأَلَ<span className="text-red-600 font-bold">ـكِ</span></td></tr>
                     <tr className="border-b"><td className="p-2">him</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـهُ</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">سَأَلَ<span className="text-red-600 font-bold">ـهُ</span></td></tr>
                     <tr><td className="p-2">her</td><td className="p-2 text-red-600 font-bold" lang="ar" dir="rtl">ـهَا</td><td className="p-2 text-xl text-right" lang="ar" dir="rtl">سَأَلَ<span className="text-red-600 font-bold">ـهَا</span></td></tr>
                   </tbody>
                 </table>
               </div>
               <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">The "Nun of Protection" (نُونُ الْوِقَايَةِ)</h5>
                 <p className="text-gray-600 mt-1">The suffix for "me" is special. It is <span lang="ar" dir="rtl">ـنِي</span>, not just <span lang="ar" dir="rtl">ـي</span>. The extra <span lang="ar" dir="rtl">نُون</span> is called the "nun of protection" because it protects the vowel at the end of the verb from changing.</p>
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
                     <th className="p-3 font-medium text-gray-600">Root</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson4_3Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                       <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3 text-gray-500 font-mono">{item.root || '---'}</td>
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
             <div className="bg-gray-100 p-4 rounded-lg space-y-4">
               {lesson4_3ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson4_3Exercises.map((q, qIndex) => (
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
       ) : currentLesson.id === "a2-m4-l4" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 4.4: Negating the Past Tense</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn how to say what you, or others, did not do.
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
                 <span>Learn the negation particle <span lang="ar" dir="rtl">مَا</span> (mā) for the past tense.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice forming negative past tense sentences for all pronouns.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Combine negation with time adverbs like "yesterday".</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Simple Negation with <span lang="ar" dir="rtl">مَا</span></h4>
             <div className="space-y-4">
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">The Rule</h5>
                 <p className="text-gray-600 mt-1">Negating a verb in the past tense is even simpler than the present tense. You just place the particle <span className="font-bold text-lg" lang="ar" dir="rtl">مَا</span> (mā) <strong>directly before the conjugated verb</strong>. Nothing else in the sentence changes.</p>
               </div>
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Structure: Affirmative vs. Negative</h5>
                 <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <p className="font-semibold text-gray-700">Affirmative (He said):</p>
                     <p className="text-xl text-right mt-1" lang="ar" dir="rtl">هُوَ قَالَ.</p>
                   </div>
                   <div className="border-t md:border-t-0 md:border-l pt-2 md:pt-0 md:pl-4">
                     <p className="font-semibold text-gray-700">Negative (He did not say):</p>
                     <p className="text-xl text-right mt-1" lang="ar" dir="rtl">هُوَ <span className="text-red-600 font-bold">مَا</span> قَالَ.</p>
                   </div>
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
                     <th className="p-3 font-medium text-gray-600">Root</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson4_4Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800" lang="ar" dir="rtl">{item.arabic}</td>
                       <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3 text-gray-500 font-mono">{item.root || '---'}</td>
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
             <div className="bg-gray-100 p-4 rounded-lg space-y-4">
               {lesson4_4ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson4_4Exercises.map((q, qIndex) => (
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

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

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
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
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
       ) : currentLesson.id === "a2-m4-l5" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 4.5: Numbers 1-10</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to count things and master the unique rules of Arabic numbers.
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
                 <span>Learn the cardinal numbers from one to ten.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand the agreement rules for numbers 1 and 2.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Master the rule of "reverse agreement" for numbers 3-10.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Number Agreement</h4>
             <div className="space-y-4">
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Numbers 1 and 2</h5>
                 <p className="text-gray-600 mt-1">The numbers one (<span lang="ar" dir="rtl">وَاحِدٌ</span>) and two (<span lang="ar" dir="rtl">اِثْنَانِ</span>) act like regular adjectives. They come <strong>after</strong> the noun and must <strong>agree with it in gender</strong>.</p>
                 <p className="text-xl text-right mt-2" lang="ar" dir="rtl">كِتَابٌ وَاحِدٌ (one book) / بِنْتٌ وَاحِدَةٌ (one girl)</p>
               </div>
               <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Numbers 3 - 10: Reverse Agreement</h5>
                 <p className="text-gray-600 mt-1">This is a very unique rule in Arabic. For numbers from three to ten:</p>
                 <ol className="mt-2 space-y-2 text-gray-700 list-decimal list-inside">
                   <li>The number comes <strong>before</strong> the noun.</li>
                   <li>The noun being counted must be in the <strong>plural</strong> form.</li>
                   <li>The number and the noun have <strong>opposite</strong> genders. If the noun is masculine, the number is feminine (ending in ة). If the noun is feminine, the number is masculine (no ة).</li>
                 </ol>
                 <div className="mt-3 border-t pt-3">
                   <p className="text-gray-700 font-medium">Example (Masculine Noun):</p>
                   <p className="text-xl text-right mt-1" lang="ar" dir="rtl">ثَلَاثَةُ أَوْلَادٍ (three boys)</p>
                   <p className="text-sm text-gray-500 text-right">`awlād` (boys) is masculine, so the number `thalātha` is feminine.</p>
                 </div>
                 <div className="mt-3 border-t pt-3">
                   <p className="text-gray-700 font-medium">Example (Feminine Noun):</p>
                   <p className="text-xl text-right mt-1" lang="ar" dir="rtl">ثَلَاثُ بَنَاتٍ (three girls)</p>
                   <p className="text-sm text-gray-500 text-right">`banāt` (girls) is feminine, so the number `thalāth` is masculine.</p>
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
                   {lesson4_5Vocabulary.map((item, index) => (
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
             <div className="bg-gray-100 p-4 rounded-lg space-y-4">
               {lesson4_5ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-2 last:border-b-0">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson4_5Exercises.map((q, qIndex) => (
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

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

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
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
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
       ) : currentLesson.id === "b1-m5-l1" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 5.1: The Future Tense</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to express future plans and actions using the future tense prefixes.
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
                 <span>Learn the future tense prefixes <span className="font-arabic" lang="ar" dir="rtl">سَـ</span> (sa-) and <span className="font-arabic" lang="ar" dir="rtl">سَوْفَ</span> (sawfa).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand the difference between the near and distant future.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Attach the future prefixes to present tense verbs.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Forming the Future Tense</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">The Rule</h5>
               <p className="text-gray-600">Forming the future tense is very easy. You take the verb already conjugated in the <strong>present tense</strong> and add one of two prefixes to the beginning.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-4 bg-white/50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-3">1. The Near Future: <span className="font-arabic" lang="ar" dir="rtl">سَـ</span> (sa-)</h5>
                 <p className="text-gray-600 mb-3">This prefix is attached directly to the verb and indicates something that will happen soon (e.g., today, tomorrow).</p>
                 <div className="bg-blue-50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">أَنَا أَذْهَبُ <span className="mx-2">→</span> أَنَا <span className="text-red-600 font-bold">سَ</span>أَذْهَبُ</p>
                   <p className="text-sm text-gray-500 text-right">I go <span className="mx-2">→</span> I will go</p>
                 </div>
               </div>
               <div className="p-4 bg-white/50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-3">2. The Distant Future: <span className="font-arabic" lang="ar" dir="rtl">سَوْفَ</span> (sawfa)</h5>
                 <p className="text-gray-600 mb-3">This is a separate word placed before the verb. It indicates something further in the future (e.g., next year, one day).</p>
                 <div className="bg-green-50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">هُوَ يَعْمَلُ <span className="mx-2">→</span> هُوَ <span className="text-red-600 font-bold">سَوْفَ</span> يَعْمَلُ</p>
                   <p className="text-sm text-gray-500 text-right">He works <span className="mx-2">→</span> He will work</p>
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
                   {lesson5_1Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson5_1ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson5_1Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m5-l2" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 5.2: The Subjunctive Mood</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Express purpose, possibility, and future negation using the subjunctive mood.
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
                 <span>Learn the subjunctive particles <span className="font-arabic" lang="ar" dir="rtl">أَنْ</span>, <span className="font-arabic" lang="ar" dir="rtl">لِـ</span>, and the negation particle <span className="font-arabic" lang="ar" dir="rtl">لَنْ</span>.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand how these particles change the ending of the following verb.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Form sentences expressing what you want, need, or will not do.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: The Subjunctive (اَلْمَنْصُوبُ)</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">The Rule</h5>
               <p className="text-gray-600">When certain particles come before a present tense verb, they put the verb into the <strong>subjunctive mood</strong>. This means the final vowel of the verb changes from a <em>damma</em> (u) to a <strong>fatha</strong> (a). For verbs ending in <span className="font-arabic" lang="ar" dir="rtl">ـُونَ</span> or <span className="font-arabic" lang="ar" dir="rtl">ـِينَ</span>, the final <span className="font-arabic" lang="ar" dir="rtl">ن</span> is dropped.</p>
             </div>
             <div className="p-4 bg-white/50 rounded-lg">
               <h5 className="text-lg font-semibold text-gray-700 mb-3">The Particles</h5>
               <ul className="mt-2 space-y-4">
                 <li><strong className="text-lg font-arabic" lang="ar" dir="rtl">أَنْ (an): that, to</strong> - Used after verbs like "want", "can", "must".<br/><span className="text-xl text-right font-arabic" lang="ar" dir="rtl">أُرِيدُ <span className="text-red-600 font-bold">أَنْ</span> أَذْهَبَ.</span> (I want to go.)</li>
                 <li><strong className="text-lg font-arabic" lang="ar" dir="rtl">لِـ (li-): in order to</strong> - Explains the purpose of an action.<br/><span className="text-xl text-right font-arabic" lang="ar" dir="rtl">أَدْرُسُ <span className="text-red-600 font-bold">لِ</span>أَفْهَمَ.</span> (I study in order to understand.)</li>
                 <li><strong className="text-lg font-arabic" lang="ar" dir="rtl">لَنْ (lan): will not</strong> - The strongest way to negate the future.<br/><span className="text-xl text-right font-arabic" lang="ar" dir="rtl"><span className="text-red-600 font-bold">لَنْ</span> أَذْهَبَ.</span> (I will not go.)</li>
               </ul>
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
                   {lesson5_2Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson5_2ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson5_2Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m5-l3" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 5.3: The Jussive Mood</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn a more formal and common way to negate the past using the jussive mood.
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
                 <span>Learn the past negation particle <span className="font-arabic" lang="ar" dir="rtl">لَمْ</span> (lam).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand that <span className="font-arabic" lang="ar" dir="rtl">لَمْ</span> is followed by a verb in the Jussive mood.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice forming negative past sentences with <span className="font-arabic" lang="ar" dir="rtl">لَمْ</span>.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: The Jussive (اَلْمَجْزُومُ)</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">A New Way to Say "Did Not"</h5>
               <p className="text-gray-600">While you learned to use <span className="font-arabic" lang="ar" dir="rtl">مَا</span> + Past Tense Verb, a more common and slightly more formal way to negate the past is to use the particle <span className="font-bold text-lg font-arabic" lang="ar" dir="rtl">لَمْ</span> (lam). The rule is: <span className="font-bold"><span className="font-arabic" lang="ar" dir="rtl">لَمْ</span> is followed by a PRESENT tense verb</span>, but the meaning is <strong>PAST</strong>.</p>
             </div>
             <div className="p-4 bg-white/50 rounded-lg">
               <h5 className="text-lg font-semibold text-gray-700 mb-3">The Jussive Mood</h5>
               <p className="text-gray-600 mb-3">The particle <span className="font-arabic" lang="ar" dir="rtl">لَمْ</span> puts the verb into the <strong>Jussive mood</strong>. This is very similar to the subjunctive. The final vowel of the verb changes from a <em>damma</em> (u) to a <strong>sukun</strong> (no vowel). For verbs ending in <span className="font-arabic" lang="ar" dir="rtl">ـُونَ</span> or <span className="font-arabic" lang="ar" dir="rtl">ـِينَ</span>, the final <span className="font-arabic" lang="ar" dir="rtl">ن</span> is dropped (just like the subjunctive).</p>
               <div className="mt-3 border-t pt-3">
                 <p className="text-gray-700 font-medium">Example:</p>
                 <div className="bg-blue-50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">هُوَ يَكْتُبُ <span className="mx-2">→</span> هُوَ <span className="text-red-600 font-bold">لَمْ</span> يَكْتُبْ</p>
                   <p className="text-sm text-gray-500 text-right">He writes <span className="mx-2">→</span> He did not write.</p>
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
                   {lesson5_3Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson5_3ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson5_3Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m5-l4" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 5.4: The Verbal Noun (Masdar)</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to talk about actions as concepts, like "reading" or "traveling".
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
                 <span>Understand the concept of the Verbal Noun (<span className="font-arabic" lang="ar" dir="rtl">اَلْمَصْدَرُ</span>).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn how to use masdars as the object of a verb (e.g., "I like reading").</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn how to use masdars as the subject of a sentence (e.g., "Swimming is fun").</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Using the Masdar</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">What is a Masdar?</h5>
               <p className="text-gray-600">A masdar is a noun that is derived from a verb root. It represents the <strong>idea or concept of the action itself</strong>. Think of it as the "-ing" form in English (reading, writing, sleeping). Because it's a noun, it can be definite (with <span className="font-arabic" lang="ar" dir="rtl">الـ</span>) and can be used in different parts of a sentence.</p>
             </div>
             <div className="p-4 bg-white/50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-3">1. Masdar as an Object</h5>
               <p className="text-gray-600 mb-3">This is a very common usage, especially after verbs like "to like", "to prefer", or "to hate".</p>
               <div className="bg-blue-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">أَنَا أُحِبُّ <span className="text-red-600 font-bold">السِّبَاحَةَ</span>.</p>
                 <p className="text-sm text-gray-500 text-right">I like <span className="text-red-600 font-bold">swimming</span>.</p>
               </div>
             </div>
             <div className="p-4 bg-white/50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-3">2. Masdar as a Subject</h5>
               <p className="text-gray-600 mb-3">A masdar can also be the subject of a nominal sentence.</p>
               <div className="bg-green-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl"><span className="text-red-600 font-bold">الْقِرَاءَةُ</span> مُمْتِعَةٌ.</p>
                 <p className="text-sm text-gray-500 text-right"><span className="text-red-600 font-bold">Reading</span> is enjoyable.</p>
               </div>
             </div>
             <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Important Note: Irregularity</h5>
               <p className="text-gray-600">Masdars follow many different patterns and are considered irregular. The best way to learn them is to memorize the masdar for each new verb you learn, just like you memorize broken plurals.</p>
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
                   {lesson5_4Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson5_4ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson5_4Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m6-l1" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 6.1: Relative Clauses</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to connect sentences to create more complex and descriptive ideas.
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
                 <span>Learn the relative pronouns for "who" and "which".</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand that the relative pronoun must agree in gender and number with the noun it describes.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice combining two simple sentences into one using a relative clause.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Connecting Sentences</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">What is a Relative Clause?</h5>
               <p className="text-gray-600">A relative clause is a part of a sentence that gives more information about a noun. In English, we use words like "who," "which," and "that." In Arabic, you use a specific set of relative pronouns that must agree with the noun.</p>
             </div>
             <div className="overflow-x-auto p-4 bg-white/50 rounded-lg mb-6">
               <table className="w-full text-left">
                 <thead className="border-b-2 border-gray-200">
                   <tr>
                     <th className="p-2 font-semibold text-gray-700">Pronoun</th>
                     <th className="p-2 font-semibold text-gray-700">Meaning</th>
                     <th className="p-2 font-semibold text-gray-700">Agrees with...</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr className="border-b"><td className="p-2 text-xl font-arabic" lang="ar" dir="rtl">اَلَّذِي</td><td className="p-2">who, which</td><td className="p-2">Masculine Singular</td></tr>
                   <tr className="border-b"><td className="p-2 text-xl font-arabic" lang="ar" dir="rtl">اَلَّتِي</td><td className="p-2">who, which</td><td className="p-2">Feminine Singular</td></tr>
                   <tr className="border-b"><td className="p-2 text-xl font-arabic" lang="ar" dir="rtl">اَلَّذِينَ</td><td className="p-2">who</td><td className="p-2">Masculine Plural (human)</td></tr>
                   <tr><td className="p-2 text-xl font-arabic" lang="ar" dir="rtl">اَللَّاتِي / اَللَّوَاتِي</td><td className="p-2">who</td><td className="p-2">Feminine Plural (human)</td></tr>
                 </tbody>
               </table>
             </div>
             <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Important Rule: Non-Human Plurals</h5>
               <p className="text-gray-600 mb-3">Remember the rule that non-human plurals are treated as feminine singular? The same applies here! For a non-human plural noun (like "the books"), you use the feminine singular relative pronoun <span className="font-arabic" lang="ar" dir="rtl">اَلَّتِي</span>.</p>
               <div className="bg-blue-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلْكُتُبُ <span className="text-red-600 font-bold">الَّتِي</span> قَرَأْتُهَا مُفِيدَةٌ.</p>
                 <p className="text-sm text-gray-500 text-right">The books <span className="text-red-600 font-bold">which</span> I read are useful.</p>
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
                   {lesson6_1Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson6_1ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson6_1Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m6-l2" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 6.2: Weak Verbs I (Hollow & Assimilated)</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Master the first two types of irregular verbs in Arabic.
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
                 <span>Identify and understand Hollow verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ الْأَجْوَفُ</span>).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Identify and understand Assimilated verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ الْمِثَالُ</span>).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn the key conjugation patterns for these verbs in the past and present tenses.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Irregular Verbs</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">1. Hollow Verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ الْأَجْوَفُ</span>)</h5>
               <p className="text-gray-600">A Hollow verb is a verb whose <strong>middle root letter</strong> is a weak letter, either <span className="font-arabic" lang="ar" dir="rtl">و</span> or <span className="font-arabic" lang="ar" dir="rtl">ي</span>. This weak letter often disappears or changes in conjugation.</p>
               <p className="text-gray-700 mt-2 font-semibold">Key Rule (Past Tense): When you add a suffix starting with a consonant (like <span className="font-arabic" lang="ar" dir="rtl">ـتُ</span>), the weak middle letter is dropped.</p>
               <div className="bg-blue-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">هُوَ قَالَ <span className="mx-2">→</span> أَنَا قُلْتُ</p>
                 <p className="text-sm text-gray-500 text-right">(He said → I said) - The long 'alif' disappears.</p>
               </div>
             </div>
             <div className="p-4 bg-white/50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">2. Assimilated Verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ الْمِثَالُ</span>)</h5>
               <p className="text-gray-600">An Assimilated verb is a verb whose <strong>first root letter</strong> is a weak letter, usually <span className="font-arabic" lang="ar" dir="rtl">و</span>.</p>
               <p className="text-gray-700 mt-2 font-semibold">Key Rule (Present Tense): The weak first letter <span className="font-arabic" lang="ar" dir="rtl">و</span> is dropped in the present tense conjugation.</p>
               <div className="bg-green-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">هُوَ وَصَلَ <span className="mx-2">→</span> هُوَ يَصِلُ</p>
                 <p className="text-sm text-gray-500 text-right">(He arrived → He arrives) - The 'waw' disappears.</p>
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
                     <th className="p-3 font-medium text-gray-600">Type</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson6_2Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
                       <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3 text-sm text-gray-500">{item.type}</td>
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
               {lesson6_2ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson6_2Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m6-l3" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 6.3: Comparatives & Superlatives</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to compare people, places, and things.
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
                 <span>Learn the <span className="font-arabic" lang="ar" dir="rtl">أَفْعَلُ</span> pattern for forming comparatives and superlatives.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Construct comparative sentences using <span className="font-arabic" lang="ar" dir="rtl">مِنْ</span> (than).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Construct superlative sentences using an Idaafa structure.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Making Comparisons</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">1. The Comparative (bigger than, smaller than...)</h5>
               <p className="text-gray-600">To compare two things, you use a special adjective pattern, <span className="font-bold font-arabic" lang="ar" dir="rtl">أَفْعَلُ</span>, followed by the word <span className="font-bold font-arabic" lang="ar" dir="rtl">مِنْ</span> (min), which means "than".</p>
               <p className="text-gray-700 mt-2 font-semibold">Structure: Noun 1 + <span className="text-red-600">أَفْعَلُ</span> + <span className="text-blue-600">مِنْ</span> + Noun 2</p>
               <div className="bg-blue-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلْبَيْتُ <span className="text-red-600">أَكْبَرُ</span> <span className="text-blue-600">مِنَ</span> الشَّقَّةِ.</p>
                 <p className="text-sm text-gray-500 text-right">The house is bigger than the apartment.</p>
               </div>
             </div>
             <div className="p-4 bg-white/50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">2. The Superlative (the biggest, the smallest...)</h5>
               <p className="text-gray-600">To say something is "the ...-est", you use the same <span className="font-bold font-arabic" lang="ar" dir="rtl">أَفْعَلُ</span> pattern, but you follow it with a singular indefinite noun in an Idaafa construction.</p>
               <p className="text-gray-700 mt-2 font-semibold">Structure: <span className="text-red-600">أَفْعَلُ</span> + Noun (singular, indefinite)</p>
               <div className="bg-green-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl"><span className="text-red-600">أَطْوَلُ</span> رَجُلٍ</p>
                 <p className="text-sm text-gray-500 text-right">The tallest man</p>
               </div>
             </div>
             <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Very Important Rule: Gender Agreement</h5>
               <p className="text-gray-600">The <span className="font-bold font-arabic" lang="ar" dir="rtl">أَفْعَلُ</span> form is special: it <strong>does not change for gender</strong>. You use the same form whether you are describing a masculine or feminine noun.</p>
               <div className="bg-blue-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلرَّجُلُ <span className="text-red-600">أَطْوَلُ</span> مِنَ الْمَرْأَةِ. (The man is taller than the woman.)</p>
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلْمَرْأَةُ <span className="text-red-600">أَطْوَلُ</span> مِنَ الرَّجُلِ. (The woman is taller than the man.)</p>
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
                   {lesson6_3Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson6_3ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson6_3Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m6-l4" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 6.4: Numbers 11-99</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Master counting with larger and compound numbers.
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
                 <span>Learn the rules for numbers 11-19.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn the tens (20, 30, 40, etc.).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Construct compound numbers like "twenty-five" using <span className="font-arabic" lang="ar" dir="rtl">وَ</span>.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Higher Numbers</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Rule Change: The Noun is Now Singular</h5>
               <p className="text-gray-600">This is a major rule: for all numbers from <strong>11 to 99</strong>, the noun that is being counted is always <strong>singular</strong> and indefinite.</p>
             </div>
             <div className="p-4 bg-white/50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Numbers 11-19</h5>
               <p className="text-gray-600 mb-3">For numbers 11 and 12, both parts of the number agree with the gender of the noun. For numbers 13-19, the "tens" part agrees, but the "ones" part has <strong>reverse agreement</strong>, just like you learned for numbers 3-9.</p>
               <div className="bg-blue-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">أَحَدَ عَشَرَ كَوْكَبًا (11 planets - m.)</p>
                 <p className="text-sm text-gray-500 text-right">11 planets - m.</p>
               </div>
               <div className="bg-green-50 p-3 rounded-lg mt-2">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">ثَلَاثَ عَشْرَةَ بِنْتًا (13 girls - f.)</p>
                 <p className="text-sm text-gray-500 text-right">13 girls - f.</p>
               </div>
             </div>
             <div className="p-4 bg-yellow-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Compound Numbers (21-99)</h5>
               <p className="text-gray-600 mb-3">To form numbers like "twenty-five," you state the "ones" first, then "and" (<span className="font-arabic" lang="ar" dir="rtl">وَ</span>), then the "tens". The "ones" part follows the same agreement rules as the single digits (1-2 agree, 3-9 have reverse agreement).</p>
               <div className="bg-blue-50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">خَمْسَةٌ وَعِشْرُونَ طَالِبًا</p>
                 <p className="text-sm text-gray-500 text-right">Five and twenty students (m.) (25 students)</p>
               </div>
               <div className="bg-green-50 p-3 rounded-lg mt-2">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">خَمْسٌ وَعِشْرُونَ طَالِبَةً</p>
                 <p className="text-sm text-gray-500 text-right">Five and twenty students (f.) (25 students)</p>
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
                   {lesson6_4Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson6_4ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson6_4Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m7-l1" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 7.1: The Verb Form System I (Forms I-V)</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Understanding the foundational verb forms and their patterns.
             </p>
           </div>

           {/* Placeholder Content */}
           <div className="clay-card p-8">
             <div className="text-center py-16">
               <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                 <BookOpen className="w-12 h-12 text-blue-700" />
               </div>
               <h4 className="text-xl font-semibold text-gray-800 mb-4">Content Coming Soon</h4>
               <p className="text-gray-600 mb-6">
                 This lesson will cover the foundational verb forms (I-V) and their patterns.
                 The detailed curriculum content will be added as you finalize the lesson plans.
               </p>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m7-l2" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 7.2: The Verb Form System II (Forms VI-X)</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Mastering the advanced verb forms and their applications.
             </p>
           </div>

           {/* Placeholder Content */}
           <div className="clay-card p-8">
             <div className="text-center py-16">
               <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                 <BookOpen className="w-12 h-12 text-blue-700" />
               </div>
               <h4 className="text-xl font-semibold text-gray-800 mb-4">Content Coming Soon</h4>
               <p className="text-gray-600 mb-6">
                 This lesson will cover the advanced verb forms (VI-X) and their applications.
                 The detailed curriculum content will be added as you finalize the lesson plans.
               </p>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m7-l3" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 7.3: The Passive Voice</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to construct sentences where the subject receives the action.
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
                 <span>Understand the function of the passive voice (<span className="font-arabic" lang="ar" dir="rtl">اَلْمَبْنِيُّ لِلْمَجْهُولِ</span>).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn the vowel pattern for forming past passive verbs.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn the vowel pattern for forming present passive verbs.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Building the Passive</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">When to Use the Passive Voice</h5>
               <p className="text-gray-600">The passive voice is used when the doer of an action is unknown or unimportant. The focus shifts from who did the action to what action was received. For example, instead of "The boy opened the door," we say "The door was opened."</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">1. Past Tense Passive</h5>
                 <p className="text-gray-600 mb-3">For a standard three-letter verb, the pattern is <strong>fu'ila</strong> (<span className="font-arabic" lang="ar" dir="rtl">فُعِلَ</span>). The first vowel is a <em>damma</em> and the second is a <em>kasra</em>.</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">كَسَرَ (he broke) <span className="mx-2">→</span> كُسِرَ (it was broken)</p>
                   <p className="text-sm text-gray-500 text-right">he broke → it was broken</p>
                 </div>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">2. Present Tense Passive</h5>
                 <p className="text-gray-600 mb-3">The pattern for the present tense is <strong>yuf'alu</strong> (<span className="font-arabic" lang="ar" dir="rtl">يُفْعَلُ</span>). The prefix takes a <em>damma</em> and the middle root letter takes a <em>fatha</em>.</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">يَكْسِرُ (he breaks) <span className="mx-2">→</span> يُكْسَرُ (it is broken)</p>
                   <p className="text-sm text-gray-500 text-right">he breaks → it is broken</p>
                 </div>
               </div>
             </div>
             <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg mt-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Key Difference: Active vs. Passive</h5>
               <p className="text-gray-600 mb-3">In active voice, the subject does the action. In passive voice, the subject receives the action. This is crucial for understanding media Arabic and formal texts.</p>
               <div className="bg-white/50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلطَّالِبُ كَتَبَ الدَّرْسَ (The student wrote the lesson)</p>
                 <p className="text-sm text-gray-500 text-right">Active: The student wrote the lesson</p>
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">كُتِبَ الدَّرْسُ (The lesson was written)</p>
                 <p className="text-sm text-gray-500 text-right">Passive: The lesson was written</p>
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
                     <th className="p-3 font-medium text-gray-600">Root</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson7_1Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
                       <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3 text-sm text-gray-500">{item.root || '-'}</td>
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
               {lesson7_1ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson7_1Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m7-l4" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 7.4: Weak Verbs II (Defective & Doubled)</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Master the final two categories of irregular verbs.
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
                 <span>Identify and understand Defective verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ النَّاقِصُ</span>).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Identify and understand Doubled verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ الْمُضَعَّفُ</span>).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn the key conjugation patterns for these verbs.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Final Irregular Verbs</h4>
             <div className="p-4 bg-blue-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">1. Defective Verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ النَّاقِصُ</span>)</h5>
               <p className="text-gray-600 mb-3">A Defective verb is a verb whose <strong>final root letter</strong> is a weak letter (<span className="font-arabic" lang="ar" dir="rtl">و</span> or <span className="font-arabic" lang="ar" dir="rtl">ي</span>). The weak letter often changes or is dropped, especially in the past tense.</p>
               <p className="text-gray-700 mb-2 font-semibold">Key Rule (Past Tense): When you add a suffix starting with a consonant (like <span className="font-arabic" lang="ar" dir="rtl">ـتُ</span>), the final weak letter becomes a regular <span className="font-arabic" lang="ar" dir="rtl">ي</span>.</p>
               <div className="bg-white/50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">هُوَ مَشَى <span className="mx-2">→</span> أَنَا مَشَيْتُ</p>
                 <p className="text-sm text-gray-500 text-right">(He walked → I walked)</p>
               </div>
             </div>
             <div className="p-4 bg-green-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">2. Doubled Verbs (<span className="font-arabic" lang="ar" dir="rtl">اَلْفِعْلُ الْمُضَعَّفُ</span>)</h5>
               <p className="text-gray-600 mb-3">A Doubled verb is a verb whose <strong>second and third root letters are the same</strong>. In the base form, they are written as one letter with a <em>shadda</em> ( ّ ).</p>
               <p className="text-gray-700 mb-2 font-semibold">Key Rule (Past Tense): When you add a suffix starting with a consonant (like <span className="font-arabic" lang="ar" dir="rtl">ـتُ</span>), the doubling is "broken" and both root letters are written out.</p>
               <div className="bg-white/50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">هُوَ أَحَبَّ <span className="mx-2">→</span> أَنَا أَحْبَبْتُ</p>
                 <p className="text-sm text-gray-500 text-right">(He loved → I loved)</p>
               </div>
             </div>
             <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Complete Weak Verb System</h5>
               <p className="text-gray-600">You now have mastered all four categories of irregular verbs in Arabic:</p>
               <ul className="mt-2 space-y-1 text-gray-600">
                 <li>• <strong>Hollow</strong> (middle letter is و/ي) - learned in Module 6</li>
                 <li>• <strong>Assimilated</strong> (first letter is و/ي) - learned in Module 6</li>
                 <li>• <strong>Defective</strong> (final letter is و/ي) - this lesson</li>
                 <li>• <strong>Doubled</strong> (second and third letters are the same) - this lesson</li>
               </ul>
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
                     <th className="p-3 font-medium text-gray-600">Type</th>
                     <th className="p-3 font-medium text-gray-600">Root</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson7_2Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
                       <td className="p-3 text-gray-600 italic">{item.transliteration}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3 text-sm text-gray-500">{item.type}</td>
                       <td className="p-3 text-sm text-gray-500">{item.root || '-'}</td>
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
               {lesson7_2ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson7_2Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m7-l5" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 7.5: Inna and Her Sisters</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to add emphasis and contrast to your sentences with powerful particles.
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
                 <span>Learn the sentence modifiers <span className="font-arabic" lang="ar" dir="rtl">إِنَّ</span>, <span className="font-arabic" lang="ar" dir="rtl">أَنَّ</span>, and <span className="font-arabic" lang="ar" dir="rtl">لٰكِنَّ</span>.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand how they change the case of the subject of a nominal sentence.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice forming more nuanced and formal sentences.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: Modifying Sentences</h4>
             <div className="p-4 bg-gray-50 rounded-lg mb-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">The Rule of "Inna and Her Sisters"</h5>
               <p className="text-gray-600">In Arabic grammar, <span className="font-arabic" lang="ar" dir="rtl">إِنَّ</span> and a group of similar particles (her "sisters") are used to modify nominal sentences. When you place one of these particles at the beginning of a nominal sentence, the subject is no longer in the nominative case (ending in <span className="font-arabic" lang="ar" dir="rtl">-u</span>). Instead, it must be in the <strong>accusative case</strong> (ending in <span className="font-arabic" lang="ar" dir="rtl">-a</span>).</p>
             </div>
             <div className="space-y-6">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2"><span className="font-arabic" lang="ar" dir="rtl">إِنَّ (inna): Indeed, Verily</span></h5>
                 <p className="text-gray-600 mb-3">Used at the beginning of a sentence for emphasis.</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلْبَيْتُ كَبِيرٌ. <span className="mx-2">→</span> <span className="text-red-600 font-bold">إِنَّ</span> الْبَيْتَ كَبِيرٌ.</p>
                   <p className="text-sm text-gray-500 text-right">(The house is big. → Indeed, the house is big.)</p>
                 </div>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2"><span className="font-arabic" lang="ar" dir="rtl">أَنَّ (anna): that</span></h5>
                 <p className="text-gray-600 mb-3">Used in the middle of a sentence, often after verbs like "to say" or "to believe".</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">أَعْتَقِدُ <span className="text-red-600 font-bold">أَنَّ</span> الْبَيْتَ كَبِيرٌ.</p>
                   <p className="text-sm text-gray-500 text-right">(I believe that the house is big.)</p>
                 </div>
               </div>
               <div className="p-4 bg-yellow-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2"><span className="font-arabic" lang="ar" dir="rtl">لٰكِنَّ (lākinna): but, however</span></h5>
                 <p className="text-gray-600 mb-3">Used to show contrast.</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلْبَيْتُ صَغِيرٌ <span className="text-red-600 font-bold">لٰكِنَّ</span> الْحَدِيقَةَ كَبِيرَةٌ.</p>
                   <p className="text-sm text-gray-500 text-right">(The house is small, but the garden is big.)</p>
                 </div>
               </div>
             </div>
             <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-lg mt-6">
               <h5 className="text-lg font-semibold text-gray-700 mb-2">Key Case Change Rule</h5>
               <p className="text-gray-600">Notice how the subject changes from nominative to accusative case:</p>
               <div className="bg-white/50 p-3 rounded-lg">
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">اَلطَّقْسُ جَمِيلٌ <span className="mx-2">→</span> إِنَّ <span className="text-red-600 font-bold">الطَّقْسَ</span> جَمِيلٌ</p>
                 <p className="text-sm text-gray-500 text-right">Nominative (-u) → Accusative (-a)</p>
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
                   {lesson7_3Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson7_3ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson7_3Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m7-l6" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 7.6: Introduction to Media Arabic</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Understand the language of news headlines and formal announcements.
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
                 <span>Learn key vocabulary used in politics and current events.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Analyze the structure of typical Arabic news headlines.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice reading and understanding formal Arabic texts.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Style & Structure in Media Arabic</h4>
             <div className="space-y-6">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Formal Vocabulary</h5>
                 <p className="text-gray-600">News Arabic uses more formal and specific verbs than everyday conversation. For example, instead of just <span className="font-arabic" lang="ar" dir="rtl">قَالَ</span> (he said), you will often see <span className="font-arabic" lang="ar" dir="rtl">أَكَّدَ</span> (he affirmed) or <span className="font-arabic" lang="ar" dir="rtl">صَرَّحَ</span> (he declared).</p>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Nominalization (Using the Masdar)</h5>
                 <p className="text-gray-600 mb-3">Headlines often use the <em>masdar</em> (verbal noun) instead of a verb to sound more official and concise. For example, a headline might say:</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">وُصُولُ الرَّئِيسِ إِلَى لُنْدُنَ</p>
                   <p className="text-sm text-gray-500 text-right">"The arrival of the president in London" instead of "The president arrived in London."</p>
                 </div>
               </div>
               <div className="p-4 bg-yellow-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Passive Voice is Common</h5>
                 <p className="text-gray-600">As you learned in Lesson 7.1, the passive voice is very common in news reporting when the doer of the action is unknown or less important than the action itself. For example, <span className="font-arabic" lang="ar" dir="rtl">قُتِلَ خَمْسَةُ أَشْخَاصٍ</span> (Five people were killed).</p>
               </div>
               <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Key Media Arabic Features</h5>
                 <ul className="space-y-2 text-gray-600">
                   <li>• <strong>Formal verbs</strong>: أَعْلَنَ (announced), أَكَّدَ (confirmed), صَرَّحَ (stated)</li>
                   <li>• <strong>Political vocabulary</strong>: اَلرَّئِيسُ (president), اَلْحُكُومَةُ (government), اَلْوَزِيرُ (minister)</li>
                   <li>• <strong>International terms</strong>: اَلْأُمَمُ الْمُتَّحِدَةُ (UN), دَوْلِيٌّ (international), عَلَاقَاتٌ (relations)</li>
                 </ul>
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
                   {lesson7_4Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
           
           {/* Example Sentences (Headlines) */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Example Headlines</h4>
             <div className="space-y-4">
               {lesson7_4ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson7_4Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m8-l1" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 8.1: The Concept of I'raab (Case)</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Understand the grammatical roles of words through their endings.
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
                 <span>Understand the concept of <span className="font-arabic" lang="ar" dir="rtl">إِعْرَاب</span> (case endings).</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Recognize the three main cases: Nominative, Accusative, and Genitive.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Identify the function of a word in a sentence based on its case ending.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: The Three Cases</h4>
             <div className="space-y-6">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">What is I'raab?</h5>
                 <p className="text-gray-600"><span className="font-arabic" lang="ar" dir="rtl">إِعْرَاب</span> is the system of changing the final vowel of a noun to show its grammatical function in a sentence. In spoken Arabic and most modern writing, these endings are often unpronounced. However, they are essential for reading formal texts like the Qur'an, classical literature, and poetry. <strong>Your goal in this lesson is to recognize them, not necessarily to produce them perfectly in speech.</strong></p>
               </div>
               <div className="overflow-x-auto p-4 bg-gray-50 rounded-lg">
                 <table className="w-full text-left">
                   <thead className="border-b-2 border-gray-200">
                     <tr>
                       <th className="p-2 font-semibold text-gray-700">Case</th>
                       <th className="p-2 font-semibold text-gray-700">Ending</th>
                       <th className="p-2 font-semibold text-gray-700">Primary Function</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="border-b">
                       <td className="p-2 font-bold font-arabic" lang="ar" dir="rtl">اَلْمَرْفُوعُ</td>
                       <td className="p-2 text-xl text-red-600 font-bold font-arabic" lang="ar" dir="rtl">ـُ / ـٌ</td>
                       <td className="p-2">Subject of the sentence</td>
                     </tr>
                     <tr className="border-b">
                       <td className="p-2 font-bold font-arabic" lang="ar" dir="rtl">اَلْمَنْصُوبُ</td>
                       <td className="p-2 text-xl text-red-600 font-bold font-arabic" lang="ar" dir="rtl">ـَ / ـً</td>
                       <td className="p-2">Object of a verb</td>
                     </tr>
                     <tr>
                       <td className="p-2 font-bold font-arabic" lang="ar" dir="rtl">اَلْمَجْرُورُ</td>
                       <td className="p-2 text-xl text-red-600 font-bold font-arabic" lang="ar" dir="rtl">ـِ / ـٍ</td>
                       <td className="p-2">After a preposition or in an Idaafa</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Example Breakdown</h5>
                 <p className="text-xl text-right font-arabic" lang="ar" dir="rtl">يَقْرَأُ <span className="text-blue-600">الطَّالِبُ</span> <span className="text-red-600">الْكِتَابَ</span> فِي <span className="text-green-600">الْبَيْتِ</span>.</p>
                 <ul className="mt-2 space-y-1 text-gray-700">
                   <li><span className="text-blue-600 font-arabic" lang="ar" dir="rtl">الطَّالِبُ</span>: Nominative (-u) because it's the <strong>subject</strong> (the one reading).</li>
                   <li><span className="text-red-600 font-arabic" lang="ar" dir="rtl">الْكِتَابَ</span>: Accusative (-a) because it's the <strong>object</strong> (the thing being read).</li>
                   <li><span className="text-green-600 font-arabic" lang="ar" dir="rtl">الْبَيْتِ</span>: Genitive (-i) because it comes <strong>after the preposition</strong> <span className="font-arabic" lang="ar" dir="rtl">فِي</span>.</li>
                 </ul>
               </div>
               <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Why This Matters</h5>
                 <p className="text-gray-600">Understanding case endings helps you:</p>
                 <ul className="mt-2 space-y-1 text-gray-600">
                   <li>• <strong>Read classical texts</strong> with full vowelings (like the Qur'an)</li>
                   <li>• <strong>Understand poetry</strong> where case endings are crucial for meaning</li>
                   <li>• <strong>Recognize grammatical relationships</strong> in complex sentences</li>
                   <li>• <strong>Appreciate the beauty</strong> of formal Arabic expression</li>
                 </ul>
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
                   {lesson8_1Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson8_1ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson8_1Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m8-l2" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 8.2: Conditional Sentences</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn to talk about real possibilities and hypothetical situations.
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
                 <span>Learn the particle <span className="font-arabic" lang="ar" dir="rtl">إِذَا</span> for real conditions.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn the particle <span className="font-arabic" lang="ar" dir="rtl">لَوْ</span> for hypothetical/impossible conditions.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Understand the typical verb tense patterns for each type of conditional sentence.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Grammar: "If..., then..."</h4>
             <div className="space-y-6">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">1. Real Conditions with <span className="font-arabic" lang="ar" dir="rtl">إِذَا</span> (idhā)</h5>
                 <p className="text-gray-600 mb-3">Use <span className="font-arabic font-bold" lang="ar" dir="rtl">إِذَا</span> to talk about real and possible situations. The structure is usually: <strong><span className="font-arabic" lang="ar" dir="rtl">إِذَا</span> + Past Tense Verb, Future Tense Verb.</strong> Even though the first verb is in the past tense, the meaning is present or future.</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl"><span className="text-red-600 font-bold">إِذَا</span> دَرَسْتَ، سَتَنْجَحُ.</p>
                   <p className="text-sm text-gray-500 text-right">If you study, you will succeed.</p>
                 </div>
                 <div className="mt-3 p-3 bg-blue-100/50 rounded-lg">
                   <p className="text-sm text-gray-700"><strong>Key Pattern:</strong> إِذَا + Past Tense → Future Tense</p>
                   <p className="text-sm text-gray-600">This creates a sense of "when this happens, that will happen"</p>
                 </div>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">2. Hypothetical Conditions with <span className="font-arabic" lang="ar" dir="rtl">لَوْ</span> (law)</h5>
                 <p className="text-gray-600 mb-3">Use <span className="font-arabic font-bold" lang="ar" dir="rtl">لَوْ</span> to talk about hypothetical, imaginary, or impossible situations. The structure is usually: <strong><span className="font-arabic" lang="ar" dir="rtl">لَوْ</span> + Past Tense Verb, <span className="font-arabic" lang="ar" dir="rtl">لَـ</span> + Past Tense Verb.</strong> The <span className="font-arabic" lang="ar" dir="rtl">لَـ</span> (la-) prefix on the second verb means "then".</p>
                 <div className="bg-white/50 p-3 rounded-lg">
                   <p className="text-xl text-right font-arabic" lang="ar" dir="rtl"><span className="text-red-600 font-bold">لَوْ</span> كُنْتُ غَنِيًّا، <span className="text-blue-600 font-bold">لَ</span>اشْتَرَيْتُ سَيَّارَةً.</p>
                   <p className="text-sm text-gray-500 text-right">If I were rich, I would buy a car.</p>
                 </div>
                 <div className="mt-3 p-3 bg-green-100/50 rounded-lg">
                   <p className="text-sm text-gray-700"><strong>Key Pattern:</strong> لَوْ + Past Tense → لَـ + Past Tense</p>
                   <p className="text-sm text-gray-600">This creates a sense of "if this were true, that would happen"</p>
                 </div>
               </div>
               <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Verb Tense Patterns</h5>
                 <div className="space-y-3">
                   <div className="bg-white/50 p-3 rounded-lg">
                     <p className="font-semibold text-gray-700 mb-1"><span className="font-arabic" lang="ar" dir="rtl">إِذَا</span> Sentences:</p>
                     <p className="text-sm text-gray-600">Past Tense + Future Tense (or Present Tense)</p>
                     <p className="text-right font-arabic" lang="ar" dir="rtl">إِذَا دَرَسْتَ، سَتَنْجَحُ</p>
                   </div>
                   <div className="bg-white/50 p-3 rounded-lg">
                     <p className="font-semibold text-gray-700 mb-1"><span className="font-arabic" lang="ar" dir="rtl">لَوْ</span> Sentences:</p>
                     <p className="text-sm text-gray-600">Past Tense + لَـ + Past Tense</p>
                     <p className="text-right font-arabic" lang="ar" dir="rtl">لَوْ كُنْتُ طَائِرًا، لَطِرْتُ</p>
                   </div>
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
                   {lesson8_2Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson8_2ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
               {lesson8_2Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m8-l3" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 8.3: Reading Unvowelled Texts</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Develop the essential skill of reading Arabic as it appears in the real world.
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
                 <span>Understand why most modern Arabic texts are not voweled.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn strategies for deducing vowels based on context and word patterns.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice reading unvoweled sentences.</span>
               </li>
             </ul>
           </div>

           {/* Grammar Explanation */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Strategies for Reading Without Vowels</h4>
             <div className="space-y-6">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Why No Vowels?</h5>
                 <p className="text-gray-600">Short vowels (harakat) are generally omitted in most books, newspapers, and websites because native speakers can infer them from context. As an advanced learner, this is your goal too. It's like an English speaker reading "rdng wtht vwls" and knowing what it means.</p>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Key Strategies</h5>
                 <div className="space-y-3">
                   <div className="bg-white/50 p-3 rounded-lg">
                     <h6 className="font-semibold text-gray-700 mb-1">1. Recognize Patterns</h6>
                     <p className="text-gray-600">You've learned many patterns already! For example, a word like <span className="font-arabic" lang="ar" dir="rtl">فَاعِل</span> is almost always the "doer" (e.g., <span className="font-arabic" lang="ar" dir="rtl">كَاتِب</span> - writer). A word like <span className="font-arabic" lang="ar" dir="rtl">مَفْعُول</span> is the receiver (e.g., <span className="font-arabic" lang="ar" dir="rtl">مَكْتُوب</span> - written).</p>
                   </div>
                   <div className="bg-white/50 p-3 rounded-lg">
                     <h6 className="font-semibold text-gray-700 mb-1">2. Use Context</h6>
                     <p className="text-gray-600">The grammar of the sentence tells you how to read the words. If you see <span className="font-arabic" lang="ar" dir="rtl">كَتَبَ الْوَلَدُ</span>, you know the next word is the object and will likely end in a fatha.</p>
                   </div>
                   <div className="bg-white/50 p-3 rounded-lg">
                     <h6 className="font-semibold text-gray-700 mb-1">3. Know Your Vocabulary</h6>
                     <p className="text-gray-600">The more words you know, the easier it is to recognize them without their vowels. There's no substitute for a large vocabulary.</p>
                   </div>
                 </div>
               </div>
               <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Common Word Patterns</h5>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white/50 p-3 rounded-lg">
                     <p className="font-semibold text-gray-700 mb-1"><span className="font-arabic" lang="ar" dir="rtl">فَاعِل</span> Pattern (Doer):</p>
                     <p className="text-sm text-gray-600">كَاتِب (writer), قَارِئ (reader), طَالِب (student)</p>
                   </div>
                   <div className="bg-white/50 p-3 rounded-lg">
                     <p className="font-semibold text-gray-700 mb-1"><span className="font-arabic" lang="ar" dir="rtl">مَفْعُول</span> Pattern (Receiver):</p>
                     <p className="text-sm text-gray-600">مَكْتُوب (written), مَقْرُوء (read), مَدْرُوس (studied)</p>
                   </div>
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
                     <th className="p-3 text-lg font-semibold text-gray-700">Voweled</th>
                     <th className="p-3 text-lg font-semibold text-gray-700">Unvoweled</th>
                     <th className="p-3 font-medium text-gray-600">Meaning</th>
                     <th className="p-3 font-medium text-gray-600">Audio</th>
                   </tr>
                 </thead>
                 <tbody>
                   {lesson8_3Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.voweled}</td>
                       <td className="p-3 text-xl font-medium text-gray-600 font-arabic" lang="ar" dir="rtl">{item.unvoweled}</td>
                       <td className="p-3 text-gray-700">{item.meaning}</td>
                       <td className="p-3">
                         <button 
                           onClick={() => playAudio(item.voweled, 'male')}
                           disabled={audioLoading[`${item.voweled}-male`]}
                           className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                           title="Play audio"
                         >
                           {audioLoading[`${item.voweled}-male`] ? (
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
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Reading Practice</h4>
             <div className="space-y-4">
               {lesson8_3ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.unvoweled}</p>
                     <p className="text-sm text-gray-500 text-right font-arabic" lang="ar" dir="rtl">{sentence.voweled}</p>
                     <p className="text-sm text-gray-500 mt-1">{sentence.english}</p>
                   </div>
                   <button 
                     onClick={() => playAudio(sentence.voweled, 'male')}
                     disabled={audioLoading[`${sentence.voweled}-male`]}
                     className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                     title="Play audio"
                   >
                     {audioLoading[`${sentence.voweled}-male`] ? (
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
               {lesson8_3Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b2-m8-l4" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 8.4: Cultural Topics</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Apply your skills to read and understand authentic texts about Arab culture.
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
                 <span>Read and understand a short biography of a famous Arab cultural figure.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Learn vocabulary related to literature, awards, and achievements.</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                 <span>Practice reading comprehension with an authentic, voweled text.</span>
               </li>
             </ul>
           </div>

           {/* Reading Strategy */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">How to Approach This Text: A B2 Strategy</h4>
             <div className="space-y-6">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Step 1: Skim for the Gist</h5>
                 <p className="text-gray-600">Read the text quickly one time. Don't stop for words you don't know. Look for "islands of certainty" like names (<span className="font-arabic" lang="ar" dir="rtl">نَجِيب مَحْفُوظ</span>), places (<span className="font-arabic" lang="ar" dir="rtl">مِصْرِيٌّ</span>), and key verbs (<span className="font-arabic" lang="ar" dir="rtl">كَتَبَ</span>, <span className="font-arabic" lang="ar" dir="rtl">حَصَلَ عَلَى</span>) to get the main idea.</p>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Step 2: Scan for New Vocabulary</h5>
                 <p className="text-gray-600">Read the text a second time, actively looking for the new vocabulary from this lesson. This will confirm your initial understanding and add important details.</p>
               </div>
               <div className="p-4 bg-yellow-50 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Step 3: Analyze the Grammar</h5>
                 <p className="text-gray-600">Read slowly and deconstruct the sentences. Look for grammar you've learned in previous modules. For example:</p>
                 <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                   <li>Find the <strong>passive voice</strong> (e.g., <span className="font-arabic" lang="ar" dir="rtl">يُعْتَبَرُ</span>, <span className="font-arabic" lang="ar" dir="rtl">تُرْجِمَتْ</span>).</li>
                   <li>Identify <strong>superlative Idaafas</strong> (e.g., <span className="font-arabic" lang="ar" dir="rtl">أَهَمِّ الْكُتَّابِ</span>).</li>
                   <li>Spot <strong>relative clauses</strong> (e.g., <span className="font-arabic" lang="ar" dir="rtl">الَّتِي تُصَوِّرُ...</span>).</li>
                 </ul>
               </div>
               <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-lg">
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Step 4: Final Reading for Full Comprehension</h5>
                 <p className="text-gray-600">Read the text one last time. With the vocabulary and grammar now clear, the full meaning should be accessible. You are now ready to confidently answer the comprehension questions.</p>
               </div>
             </div>
           </div>

           {/* Reading Text */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Reading Text</h4>
             <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 flex items-start space-x-4">
               <div className="flex-grow">
                 <h3 className="text-2xl font-bold text-center text-gray-800 mb-4 font-arabic" lang="ar" dir="rtl">{lesson8_4ReadingPassage.title}</h3>
                 <p className="text-xl leading-loose text-right text-gray-700 font-arabic" lang="ar" dir="rtl">{lesson8_4ReadingPassage.text}</p>
               </div>
               <button 
                 onClick={() => playAudio(lesson8_4ReadingPassage.text, 'male')}
                 disabled={audioLoading[`${lesson8_4ReadingPassage.text}-male`]}
                 className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50"
                 title="Play audio"
               >
                 {audioLoading[`${lesson8_4ReadingPassage.text}-male`] ? (
                   <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                 ) : (
                   <Volume2 className="w-4 h-4 text-blue-600" />
                 )}
               </button>
             </div>
           </div>

           {/* Vocabulary */}
           <div className="clay-card p-6">
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Key Vocabulary from the Text</h4>
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
                   {lesson8_4Vocabulary.map((item, index) => (
                     <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                       <td className="p-3 text-xl font-medium text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</td>
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
               {lesson8_4ExampleSentences.map((sentence, index) => (
                 <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                   <div className="flex-grow">
                     <p className="text-xl text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
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
             <h4 className="text-2xl font-semibold text-gray-800 mb-6">Reading Comprehension</h4>
             <div className="space-y-6">
               {lesson8_4Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="p-4 border border-gray-200/50 rounded-lg bg-white/30">
                   <p className="font-semibold text-gray-800 mb-4 text-lg font-arabic" lang="ar" dir="rtl">{qIndex + 1}. {q.question}</p>
                   <div className="space-y-3">
                     {q.options.map((option, oIndex) => {
                       const isSelected = selectedAnswers[qIndex] === option;
                       const isCorrect = q.correctAnswer === option;
                       let bgColor = 'bg-white/50';
                       if (showResults) {
                         if (isSelected && isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                         else if (isSelected && !isCorrect) bgColor = 'bg-red-100/80 border-red-400';
                         else if (isCorrect) bgColor = 'bg-green-100/80 border-green-400';
                       }

                       // Check if option is Arabic text for right-alignment
                       const isArabic = /[\u0600-\u06FF]/.test(option);
                       const textAlignment = isArabic ? 'text-right' : 'text-left';

                       return (
                         <label key={oIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300/50'} ${bgColor} hover:bg-white/70`}>
                           <input 
                             type="radio" 
                             name={`question-${qIndex}`} 
                             value={option} 
                             checked={isSelected} 
                             onChange={() => handleOptionChange(qIndex, option)} 
                             className="mr-3"
                           />
                           <span className={`text-lg flex-1 ${textAlignment}`} lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-8 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                 Check Answers
               </Button>
             </div>
           </div>
         </div>
       ) : currentLesson.id === "b1-m6-l5" ? (
         <div className="space-y-8">
           {/* Lesson Header */}
           <div className="clay-card p-8 text-center">
             <h3 className="text-3xl font-bold text-gray-800 mb-4">Lesson 6.5: Your Most Powerful Tool - Using a Root-Based Dictionary</h3>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Learn the essential skill that unlocks independent Arabic reading and vocabulary building.
             </p>
           </div>

           {/* Objectives */}
           <div className="clay-card p-6 bg-blue-50">
             <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
               <Target className="w-5 h-5 mr-2 text-blue-600" />
               Objectives
             </h4>
             <ul className="space-y-2 text-gray-700">
               <li className="flex items-start">
                 <CheckCircle2 className="w-4 h-4 mr-2 mt-1 text-green-600 flex-shrink-0" />
                 Understand why Arabic dictionaries are organized by root, not alphabetically.
               </li>
               <li className="flex items-start">
                 <CheckCircle2 className="w-4 h-4 mr-2 mt-1 text-green-600 flex-shrink-0" />
                 Learn the steps to "strip down" a word to find its three-letter root.
               </li>
               <li className="flex items-start">
                 <CheckCircle2 className="w-4 h-4 mr-2 mt-1 text-green-600 flex-shrink-0" />
                 Recognize common verb and noun patterns to isolate roots.
               </li>
               <li className="flex items-start">
                 <CheckCircle2 className="w-4 h-4 mr-2 mt-1 text-green-600 flex-shrink-0" />
                 Practice finding the roots of various derived words.
               </li>
             </ul>
           </div>

           {/* Grammar and Explanation */}
           <div className="clay-card p-6 bg-green-50">
             <h4 className="text-xl font-semibold text-gray-800 mb-4">How Arabic Dictionaries Work</h4>
             
             <div className="space-y-6">
               <div>
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Part 1: Why It's Different</h5>
                 <p className="text-gray-600 leading-relaxed">
                   In Arabic, words are families built from a core root. Words like <span className="font-arabic" lang="ar" dir="rtl">كِتَابٌ</span> (book), <span className="font-arabic" lang="ar" dir="rtl">مَكْتَبٌ</span> (office), <span className="font-arabic" lang="ar" dir="rtl">كَاتِبٌ</span> (writer), and <span className="font-arabic" lang="ar" dir="rtl">يَكْتُبُ</span> (he writes) all share the same root, <span className="font-arabic font-bold" lang="ar" dir="rtl">ك ت ب</span>, and are all found under that single entry in a dictionary.
                 </p>
               </div>

               <div>
                 <h5 className="text-lg font-semibold text-gray-700 mb-2">Part 2: The Art of Finding the Root</h5>
                 <p className="text-gray-600 leading-relaxed mb-3">
                   To find a word, you must first "strip it down" to its basic, original letters (<span className="font-arabic" lang="ar" dir="rtl">اَلْجَذْرُ</span>). This involves removing extra letters (<span className="font-arabic" lang="ar" dir="rtl">حُرُوفٌ زَائِدَةٌ</span>) that are part of a word's pattern (<span className="font-arabic" lang="ar" dir="rtl">وَزْنٌ</span>).
                 </p>
               </div>
               
               <div className="space-y-4">
                 <h5 className="text-lg font-semibold text-gray-700 border-b pb-2">Part 3: Comprehensive Walkthrough Examples</h5>
                 
                 <h6 className="text-md font-semibold text-gray-700 mt-4">A. Finding Roots of Verbs (Forms I-X)</h6>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Form I Verb: <span className="font-arabic" lang="ar" dir="rtl">يَشْرَبُونَ</span> (they drink)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>Remove the present tense prefix <span className="font-arabic" lang="ar" dir="rtl">يَـ</span> and the plural suffix <span className="font-arabic" lang="ar" dir="rtl">ـُونَ</span>.</li>
                     <li>You are left with <span className="font-arabic" lang="ar" dir="rtl">شْرَب</span>. The vowels can be ignored.</li>
                     <li>The root is <strong className="font-arabic" lang="ar" dir="rtl">ش ر ب</strong>.</li>
                   </ol>
                 </div>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Form II Verb: <span className="font-arabic" lang="ar" dir="rtl">يُدَرِّسُ</span> (he teaches)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>The pattern is <span className="font-arabic" lang="ar" dir="rtl">يُفَعِّلُ</span>. Remove the prefix <span className="font-arabic" lang="ar" dir="rtl">يُـ</span>.</li>
                     <li>The defining feature of Form II is the doubled middle root letter (<span className="font-arabic" lang="ar" dir="rtl">ـرِّ</span>). Un-double it.</li>
                     <li>The root is <strong className="font-arabic" lang="ar" dir="rtl">د ر س</strong>.</li>
                   </ol>
                 </div>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Form IV Verb: <span className="font-arabic" lang="ar" dir="rtl">أَرْسَلْنَا</span> (we sent)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>The pattern is <span className="font-arabic" lang="ar" dir="rtl">أَفْعَلَ</span>. The defining feature is the prefix <span className="font-arabic" lang="ar" dir="rtl">أَ</span> in the past tense.</li>
                     <li>Remove the prefix <span className="font-arabic" lang="ar" dir="rtl">أَ</span> and the past tense suffix <span className="font-arabic" lang="ar" dir="rtl">ـنَا</span>.</li>
                     <li>The root is <strong className="font-arabic" lang="ar" dir="rtl">ر س ل</strong>.</li>
                   </ol>
                 </div>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Form VIII Verb: <span className="font-arabic" lang="ar" dir="rtl">اِجْتِمَاع</span> (meeting)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>This is a masdar on the pattern <span className="font-arabic" lang="ar" dir="rtl">اِفْتِعَال</span>. The verb is <span className="font-arabic" lang="ar" dir="rtl">اِجْتَمَعَ</span>.</li>
                     <li>The pattern letters are the initial <span className="font-arabic" lang="ar" dir="rtl">اِ</span> and the infixed <span className="font-arabic" lang="ar" dir="rtl">ـتـ</span>.</li>
                     <li>Removing these leaves the root: <strong className="font-arabic" lang="ar" dir="rtl">ج م ع</strong>.</li>
                   </ol>
                 </div>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Form X Verb: <span className="font-arabic" lang="ar" dir="rtl">اِسْتَخْدَمْتُ</span> (I used)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>The pattern is <span className="font-arabic" lang="ar" dir="rtl">اِسْتَفْعَلَ</span>. The defining feature is the prefix <span className="font-arabic" lang="ar" dir="rtl">اِسْتَـ</span>.</li>
                     <li>Remove the prefix <span className="font-arabic" lang="ar" dir="rtl">اِسْتَـ</span> and the past tense suffix <span className="font-arabic" lang="ar" dir="rtl">ـتُ</span>.</li>
                     <li>The root is <strong className="font-arabic" lang="ar" dir="rtl">خ د م</strong>.</li>
                   </ol>
                 </div>
                 
                 <h6 className="text-md font-semibold text-gray-700 mt-6">B. Finding Roots of Derived Nouns & Participles</h6>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Noun of Place: <span className="font-arabic" lang="ar" dir="rtl">اَلْمَطْبَخ</span> (the kitchen)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>Remove the definite article <span className="font-arabic" lang="ar" dir="rtl">الـ</span>, leaving <span className="font-arabic" lang="ar" dir="rtl">مَطْبَخ</span>.</li>
                     <li>The pattern for a place is often <span className="font-arabic" lang="ar" dir="rtl">مَفْعَل</span>. Remove the prefix <span className="font-arabic" lang="ar" dir="rtl">مَـ</span>.</li>
                     <li>The root is <strong className="font-arabic" lang="ar" dir="rtl">ط ب خ</strong> (to cook).</li>
                   </ol>
                 </div>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Noun of Instrument: <span className="font-arabic" lang="ar" dir="rtl">مِفْتَاح</span> (key)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>The pattern for an instrument is often <span className="font-arabic" lang="ar" dir="rtl">مِفْعَال</span>.</li>
                     <li>The extra letters are the prefix <span className="font-arabic" lang="ar" dir="rtl">مِـ</span> and the infix <span className="font-arabic" lang="ar" dir="rtl">ـَا</span>.</li>
                     <li>Removing them leaves the root: <strong className="font-arabic" lang="ar" dir="rtl">ف ت ح</strong> (to open).</li>
                   </ol>
                 </div>

                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                   <p className="font-semibold text-gray-800">Passive Participle: <span className="font-arabic" lang="ar" dir="rtl">مَكْتُوب</span> (written)</p>
                   <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                     <li>This is on the pattern <span className="font-arabic" lang="ar" dir="rtl">مَفْعُول</span>.</li>
                     <li>The extra letters are the prefix <span className="font-arabic" lang="ar" dir="rtl">مَـ</span> and the infix <span className="font-arabic" lang="ar" dir="rtl">ـُو</span>.</li>
                     <li>Removing them leaves the root: <strong className="font-arabic" lang="ar" dir="rtl">ك ت ب</strong>.</li>
                   </ol>
                 </div>
               </div>
             </div>
           </div>

           {/* Vocabulary */}
           <div className="clay-card p-6 bg-yellow-50">
             <h4 className="text-xl font-semibold text-gray-800 mb-4">Meta-Language Vocabulary</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {lesson6_5Vocabulary.map((item, index) => (
                 <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                   <div className="flex items-start justify-between">
                     <div className="flex-grow">
                       <p className="text-lg font-medium text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{item.arabic}</p>
                       <p className="text-sm text-gray-500 italic">{item.transliteration}</p>
                       <p className="text-sm text-gray-700">{item.meaning}</p>
                     </div>
                     <button 
                       onClick={() => playAudio(item.arabic, 'male')}
                       disabled={audioLoading[`${item.arabic}-male`]}
                       className="clay-button p-2 hover:scale-110 transition-transform disabled:opacity-50 ml-2"
                       title="Play audio"
                     >
                       {audioLoading[`${item.arabic}-male`] ? (
                         <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                       ) : (
                         <Volume2 className="w-4 h-4 text-blue-600" />
                       )}
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Example Sentences */}
           <div className="clay-card p-6 bg-purple-50">
             <h4 className="text-xl font-semibold text-gray-800 mb-4">Example Sentences</h4>
             <div className="space-y-4">
               {lesson6_5ExampleSentences.map((sentence, index) => (
                 <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 flex items-start space-x-4">
                   <div className="flex-grow">
                     <p className="text-lg text-right text-gray-800 font-arabic" lang="ar" dir="rtl">{sentence.arabic}</p>
                     <p className="text-sm text-gray-600 mt-1">{sentence.english}</p>
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
           <div className="clay-card p-6 bg-red-50">
             <h4 className="text-xl font-semibold text-gray-800 mb-4">Practice Finding the Root</h4>
             <div className="space-y-6">
               {lesson6_5Exercises.map((q, qIndex) => (
                 <div key={qIndex} className="bg-white p-4 rounded-lg border border-gray-200">
                   <p className="font-semibold text-gray-800 mb-3 text-lg">{qIndex + 1}. {q.question}</p>
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
                         <label key={oIndex} className={`flex items-center p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${bgColor}`}>
                           <input type="radio" name={`question-${qIndex}`} value={option} checked={isSelected} onChange={() => handleOptionChange(qIndex, option)} className="mr-3"/>
                           <span className='text-lg font-arabic' lang="ar" dir="rtl">{option}</span>
                         </label>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-6 text-center">
               <Button onClick={checkAnswers} className="clay-button bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
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
                Practice Exercise
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
