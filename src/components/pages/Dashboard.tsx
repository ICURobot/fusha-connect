import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { curriculum } from "../../entities/Curriculum";
import LevelCard from "../dashboard/LevelCard";
import ModuleCard from "../dashboard/ModuleCard";
import ProgressStats from "../dashboard/ProgressStats";
import ProgressTracker from "../../utils/progress";
import { Target, BookOpen, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [progressStats, setProgressStats] = useState({
    completedLevels: 0,
    completedModules: 0,
    completedLessons: 0
  });

  const totalLevels = curriculum.length;
  const totalModules = curriculum.reduce((acc, level) => acc + level.modules.length, 0);
  const totalLessons = curriculum.reduce((acc, level) => 
    acc + level.modules.reduce((modAcc, module) => modAcc + module.lessons.length, 0), 0
  );

  // Calculate progress from actual completion data
  useEffect(() => {
    const calculateProgress = () => {
      let completedLevels = 0;
      let completedModules = 0;
      let completedLessons = 0;

      curriculum.forEach(level => {
        let levelCompleted = true;
        
        level.modules.forEach(module => {
          let moduleCompleted = true;
          
          module.lessons.forEach(lesson => {
            if (ProgressTracker.isLessonCompleted(lesson.id)) {
              completedLessons++;
            } else {
              moduleCompleted = false;
            }
          });
          
          if (moduleCompleted) {
            completedModules++;
          } else {
            levelCompleted = false;
          }
        });
        
        if (levelCompleted) {
          completedLevels++;
        }
      });

      setProgressStats({
        completedLevels,
        completedModules,
        completedLessons
      });
    };

    calculateProgress();
    
    // Listen for storage changes to update progress in real-time
    const handleStorageChange = () => {
      calculateProgress();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom progress events
    window.addEventListener('progressUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('progressUpdated', handleStorageChange);
    };
  }, []);

  const handleLevelClick = (levelId: string) => {
    setSelectedLevel(selectedLevel === levelId ? null : levelId);
    setSelectedModule(null);
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(selectedModule === moduleId ? null : moduleId);
    // Navigate to lesson page (placeholder for now)
    navigate(`/lesson/${moduleId}`);
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Your Arabic Learning Journey
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Follow our CEFR-based curriculum designed by Arabic language experts. 
          Track your progress through each level and module.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-12">
        <ProgressStats 
          totalLevels={totalLevels}
          totalModules={totalModules}
          totalLessons={totalLessons}
          completedLevels={progressStats.completedLevels}
          completedModules={progressStats.completedModules}
          completedLessons={progressStats.completedLessons}
        />
      </div>

      {/* Curriculum Structure */}
      <div className="space-y-12">
        {curriculum.map((level) => (
          <div key={level.id} className="space-y-6">
            {/* Level Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${level.textColor}`}>{level.code}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{level.title}</h2>
                  <p className="text-lg text-gray-600">{level.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Target className="w-4 h-4" />
                      <span>{level.modules.length} modules</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <BookOpen className="w-4 h-4" />
                      <span>{level.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleLevelClick(level.id)}
                className="clay-button px-6 py-3 flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <span>{selectedLevel === level.id ? 'Hide' : 'Show'} Modules</span>
                <ArrowRight className={`w-4 h-4 transition-transform ${selectedLevel === level.id ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Level Goal */}
            <div className="clay-card p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Learning Goal</span>
                </h3>
                <p className="text-gray-700">{level.goal}</p>
              </div>
            </div>

            {/* Modules */}
            {selectedLevel === level.id && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 text-center">
                  Modules in {level.code}
                </h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  {level.modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      levelCode={level.code}
                      onModuleClick={handleModuleClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Start CTA */}
      <div className="mt-16 text-center">
        <div className="clay-card p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Begin Your Arabic Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start with Level A1 to build your foundation, or jump to your current proficiency level.
          </p>
          <button 
            onClick={() => handleLevelClick('a1')}
            className="clay-button text-lg px-8 py-4 hover:scale-105 transition-transform"
          >
            Start with Level A1
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
