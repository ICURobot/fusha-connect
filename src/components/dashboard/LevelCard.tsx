import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Circle, Trophy } from "lucide-react";
import { Button } from "../ui/button";

export default function LevelCard({ 
  level, 
  modules, 
  lessons, 
  progress, 
  getModuleProgress, 
  getLessonsForModule, 
  completedLessons 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const levelColors = {
    A1: "from-green-100 to-green-200 text-green-700",
    A2: "from-cyan-100 to-cyan-200 text-cyan-700", 
    B1: "from-amber-100 to-amber-200 text-amber-700",
    B2: "from-gray-200 to-gray-300 text-gray-700"
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-cyan-500";
    if (percentage > 0) return "bg-amber-500";
    return "bg-gray-300";
  };

  return (
    <div className="clay-card p-6">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${levelColors[level.code] || levelColors.A1} flex items-center justify-center`}>
            <span className="font-bold text-xl">{level.code}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{level.title}</h3>
            <p className="text-gray-600">{level.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {progress.percentage === 100 && (
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          )}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="clay-button p-2"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Progress: {progress.completed} of {progress.total} lessons
          </span>
          <span className="text-sm font-bold text-gray-800">
            {progress.percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progress.percentage)}`}
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Modules (when expanded) */}
      {isExpanded && (
        <div className="space-y-4 mt-6">
          {modules.map((module) => {
            const moduleProgress = getModuleProgress(module.number);
            const moduleLessons = getLessonsForModule(module.number);

            return (
              <div key={module.id} className="bg-white/50 rounded-2xl p-4 border-2 border-white/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Module {module.number}: {module.title}
                  </h4>
                  <span className="text-sm font-medium text-gray-600">
                    {moduleProgress.percentage}% complete
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{module.description}</p>
                
                {/* Module Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(moduleProgress.percentage)}`}
                    style={{ width: `${moduleProgress.percentage}%` }}
                  ></div>
                </div>

                {/* Lessons */}
                <div className="space-y-2">
                  {moduleLessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    
                    return (
                      <Link
                        key={lesson.id}
                        to={`/lesson?id=${lesson.id}`}
                        className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200"
                      >
                        <div className="flex items-center space-x-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <h5 className="font-medium text-gray-800">
                              Lesson {lesson.number}: {lesson.title}
                            </h5>
                            <span className="text-sm text-gray-500">
                              {lesson.objectives?.length || 0} objectives
                            </span>
                          </div>
                        </div>
                        <BookOpen className="w-4 h-4 text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
