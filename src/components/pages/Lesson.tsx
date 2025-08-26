import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LessonEntity as Lesson, ProgressEntity as Progress } from "../../entities";
import { createPageUrl } from "../../utils";
import { ArrowLeft, ArrowRight, CheckCircle2, Play, Target, BookOpen, MessageCircle, PenTool } from "lucide-react";
import { Button } from "../ui/button";
import VocabularySection from "../lesson/VocabularySection";
import ExamplesSection from "../lesson/ExamplesSection"; 
import ExercisesSection from "../lesson/ExercisesSection";
import LessonNavigation from "../lesson/LessonNavigation";

export default function LessonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const lessonId = searchParams.get('id');

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      loadAllLessons();
      checkCompletion();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      if (lessonId) {
        const lessonData = await Lesson.get(lessonId);
        if (lessonData) {
          setLesson(lessonData);
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  const loadAllLessons = async () => {
    try {
      const lessons = await Lesson.list('level_code, module_number, order');
      setAllLessons(lessons);
    } catch (error) {
      console.error('Error loading all lessons:', error);
    }
    setIsLoading(false);
  };

  const getUserIdentifier = () => {
    let userId = localStorage.getItem('fusha_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('fusha_user_id', userId);
    }
    return userId;
  };

  const checkCompletion = async () => {
    try {
      const userId = getUserIdentifier();
      const progressRecords = await Progress.filter({ 
        lesson_id: lessonId, 
        user_identifier: userId 
      });
      setIsCompleted(progressRecords.length > 0);
    } catch (error) {
      console.error('Error checking completion:', error);
    }
  };

  const markAsComplete = async () => {
    try {
      const userId = getUserIdentifier();
      if (lessonId) {
        await Progress.create({
          lesson_id: lessonId,
          user_identifier: userId
        });
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const findAdjacentLessons = () => {
    if (!lesson || allLessons.length === 0) return { prev: null, next: null };
    
    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    };
  };

  const { prev, next } = findAdjacentLessons();

  if (isLoading || !lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="clay-card p-8">
            <div className="h-8 bg-gray-200 rounded-2xl w-2/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-2xl w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded-2xl w-3/4"></div>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="clay-card p-6">
              <div className="h-6 bg-gray-200 rounded-2xl w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-4 bg-gray-200 rounded-2xl w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded-2xl w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="clay-card p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="clay-button p-2 sm:px-4 sm:py-2"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              {lesson.level_code} • Module {lesson.module_number} • Lesson {lesson.number}
            </span>
            {isCompleted && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          {lesson.title}
        </h1>

        {/* Lesson Objectives */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-white/40">
          <div className="flex items-center mb-3">
            <Target className="w-5 h-5 text-emerald-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Learning Objectives</h3>
          </div>
          <ul className="space-y-2">
            {lesson.objectives?.map((objective, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grammar Content */}
      <div className="clay-card p-6 sm:p-8 mb-8">
        <div className="flex items-center mb-4">
          <BookOpen className="w-5 h-5 text-green-700 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Grammar Explanation</h2>
        </div>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {lesson.grammar_content?.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Vocabulary Section */}
      {lesson.vocabulary && lesson.vocabulary.length > 0 && (
        <VocabularySection vocabulary={lesson.vocabulary} />
      )}

      {/* Examples Section */}
      {lesson.examples && lesson.examples.length > 0 && (
        <ExamplesSection examples={lesson.examples} />
      )}

      {/* Exercises Section */}
      {lesson.exercises && lesson.exercises.length > 0 && (
        <ExercisesSection exercises={lesson.exercises} />
      )}

      {/* Completion Section */}
      <div className="clay-card p-6 sm:p-8 mb-8 text-center">
        {!isCompleted ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Mark Lesson as Complete</h3>
            <p className="text-gray-600 mb-6">
              Once you've reviewed all the content and completed the exercises, mark this lesson as done.
            </p>
            <Button
              onClick={markAsComplete}
              className="clay-button text-lg px-8 py-3"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Complete Lesson
            </Button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Lesson Completed!</h3>
            <p className="text-gray-600">Great job! Your progress has been saved.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <LessonNavigation 
        previousLesson={prev}
        nextLesson={next}
      />
    </div>
  );
}
