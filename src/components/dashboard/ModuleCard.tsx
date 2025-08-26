import React from "react";
import { Module } from "../../entities/Curriculum";
import { BookOpen, Target, CheckCircle2, Circle } from "lucide-react";

interface ModuleCardProps {
  module: Module;
  levelCode: string;
  onModuleClick: (moduleId: string) => void;
}

export default function ModuleCard({ module, levelCode, onModuleClick }: ModuleCardProps) {
  const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
  const totalLessons = module.lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div 
      className="clay-card p-6 cursor-pointer group hover:scale-105 transition-transform duration-300"
      onClick={() => onModuleClick(module.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-gray-500">Level {levelCode}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {module.completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-4">{module.description}</p>

      {/* Can-Do Statement */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl mb-4 border-l-4 border-green-400">
        <div className="flex items-start space-x-2">
          <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 mb-1">Can-Do Statement:</p>
            <p className="text-sm text-green-700 italic">"{module.canDoStatement}"</p>
          </div>
        </div>
      </div>

      {/* Lessons Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Lessons Progress</span>
          <span className="text-sm text-gray-500">{completedLessons}/{totalLessons}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-2">
        {module.lessons.map((lesson) => (
          <div 
            key={lesson.id}
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              lesson.completed 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {lesson.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                lesson.completed ? 'text-green-800' : 'text-gray-700'
              }`}>
                {lesson.title}
              </p>
              {lesson.description && (
                <p className={`text-xs ${
                  lesson.completed ? 'text-green-600' : 'text-gray-500'
                } truncate`}>
                  {lesson.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Module Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full clay-button py-2 text-sm font-medium group-hover:bg-blue-50 transition-colors">
          {module.completed ? 'Review Module' : 'Start Module'}
        </button>
      </div>
    </div>
  );
}
