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
