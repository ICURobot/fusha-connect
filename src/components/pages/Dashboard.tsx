import React, { useState, useEffect } from "react";
import { LevelEntity as Level, ModuleEntity as Module, LessonEntity as Lesson, ProgressEntity as Progress } from "../../entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { CheckCircle2, Circle, BookOpen, Clock, Trophy, Target } from "lucide-react";
import LevelCard from "../dashboard/LevelCard";
import ProgressStats from "../dashboard/ProgressStats";

export default function Dashboard() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [levelsData, modulesData, lessonsData, progressData] = await Promise.all([
        Level.list('order'),
        Module.list('order'),
        Lesson.list('order'),
        Progress.list()
      ]);
      
      setLevels(levelsData);
      setModules(modulesData);
      setLessons(lessonsData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const getCompletedLessons = () => {
    const userId = getUserIdentifier();
    return progress.filter(p => p.user_identifier === userId).map(p => p.lesson_id);
  };

  const getModulesForLevel = (levelCode) => {
    return modules.filter(m => m.level_code === levelCode);
  };

  const getLessonsForModule = (levelCode, moduleNumber) => {
    return lessons.filter(l => l.level_code === levelCode && l.module_number === moduleNumber);
  };

  const calculateLevelProgress = (levelCode) => {
    const levelLessons = lessons.filter(l => l.level_code === levelCode);
    const completedLessons = getCompletedLessons();
    const completedInLevel = levelLessons.filter(l => completedLessons.includes(l.id));
    return {
      completed: completedInLevel.length,
      total: levelLessons.length,
      percentage: levelLessons.length > 0 ? Math.round((completedInLevel.length / levelLessons.length) * 100) : 0
    };
  };

  const calculateModuleProgress = (levelCode, moduleNumber) => {
    const moduleLessons = getLessonsForModule(levelCode, moduleNumber);
    const completedLessons = getCompletedLessons();
    const completedInModule = moduleLessons.filter(l => completedLessons.includes(l.id));
    return {
      completed: completedInModule.length,
      total: moduleLessons.length,
      percentage: moduleLessons.length > 0 ? Math.round((completedInModule.length / moduleLessons.length) * 100) : 0
    };
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="clay-card p-8">
            <div className="h-8 bg-gray-200 rounded-2xl w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-2xl w-2/3"></div>
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="clay-card p-6">
              <div className="h-6 bg-gray-200 rounded-2xl w-1/4 mb-4"></div>
              <div className="grid gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-20 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="clay-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Your Arabic Learning Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Continue your journey to Arabic fluency
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="w-12 h-12 clay-button rounded-full flex items-center justify-center mb-1">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <ProgressStats 
        levels={levels}
        lessons={lessons}
        completedLessons={getCompletedLessons()}
      />

      {/* Curriculum Levels */}
      <div className="space-y-8">
        {levels.map((level) => {
          // Create wrapper functions that capture the level code
          const getModuleProgressForLevel = (moduleNumber) => calculateModuleProgress(level.code, moduleNumber);
          const getLessonsForModuleInLevel = (moduleNumber) => getLessonsForModule(level.code, moduleNumber);
          
          return (
            <LevelCard
              key={level.id}
              level={level}
              modules={getModulesForLevel(level.code)}
              lessons={lessons}
              progress={calculateLevelProgress(level.code)}
              getModuleProgress={getModuleProgressForLevel}
              getLessonsForModule={getLessonsForModuleInLevel}
              completedLessons={getCompletedLessons()}
            />
          );
        })}
      </div>

      {/* Getting Started Guide */}
      {getCompletedLessons().length === 0 && (
        <div className="clay-card p-6 sm:p-8 mt-8 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Start Learning?</h3>
          <p className="text-lg text-gray-600 mb-6">
            Begin with A1 Level to build your Arabic foundation, or jump to your current skill level.
          </p>
          <p className="text-sm text-gray-500">
            Your progress is automatically saved in your browser as you complete lessons.
          </p>
        </div>
      )}
    </div>
  );
}
