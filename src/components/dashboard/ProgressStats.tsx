import React from "react";
import { Target, BookOpen, CheckCircle2, Trophy } from "lucide-react";

interface ProgressStatsProps {
  totalLevels: number;
  totalModules: number;
  totalLessons: number;
  completedLevels: number;
  completedModules: number;
  completedLessons: number;
}

export default function ProgressStats({
  totalLevels,
  totalModules,
  totalLessons,
  completedLevels,
  completedModules,
  completedLessons
}: ProgressStatsProps) {
  const levelProgress = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
  const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  const lessonProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const stats = [
    {
      title: "Levels Completed",
      value: `${completedLevels}/${totalLevels}`,
      percentage: levelProgress,
      icon: Target,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100",
      textColor: "text-green-700"
    },
    {
      title: "Modules Completed",
      value: `${completedModules}/${totalModules}`,
      percentage: moduleProgress,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700"
    },
    {
      title: "Lessons Completed",
      value: `${completedLessons}/${totalLessons}`,
      percentage: lessonProgress,
      icon: CheckCircle2,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="clay-card p-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 clay-button rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Overall Progress</h2>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${lessonProgress}%` }}
          ></div>
        </div>
        <p className="text-lg text-gray-600">
          {Math.round(lessonProgress)}% Complete • {completedLessons} of {totalLessons} lessons finished
        </p>
      </div>

      {/* Detailed Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="clay-card p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mb-3">{stat.value}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000`}
                style={{ width: `${stat.percentage}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600">
              {Math.round(stat.percentage)}% Complete
            </p>
          </div>
        ))}
      </div>

      {/* Achievement Summary */}
      {completedLessons > 0 && (
        <div className="clay-card p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Great Progress!</h3>
          </div>
          <p className="text-gray-600">
            You've completed {completedLessons} lessons so far. 
            {completedLessons >= totalLessons * 0.25 && " You're making excellent progress!"}
            {completedLessons >= totalLessons * 0.5 && " You're halfway there!"}
            {completedLessons >= totalLessons * 0.75 && " You're almost finished!"}
            {completedLessons === totalLessons && " Congratulations! You've completed the entire curriculum!"}
          </p>
        </div>
      )}
    </div>
  );
}
