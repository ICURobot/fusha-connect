import React from "react";
import { BookOpen, CheckCircle2, Trophy, Target } from "lucide-react";

export default function ProgressStats({ levels, lessons, completedLessons }) {
  const totalLessons = lessons.length;
  const completedCount = completedLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const completedLevels = levels.filter(level => {
    const levelLessons = lessons.filter(l => l.level_code === level.code);
    const completedInLevel = levelLessons.filter(l => completedLessons.includes(l.id));
    return levelLessons.length > 0 && completedInLevel.length === levelLessons.length;
  }).length;

  const stats = [
    {
      title: "Overall Progress",
      value: `${overallProgress}%`,
      description: `${completedCount} of ${totalLessons} lessons completed`,
      icon: Target,
      color: "from-green-100 to-green-200",
      textColor: "text-green-700"
    },
    {
      title: "Lessons Completed",
      value: completedCount.toString(),
      description: `Keep going! ${totalLessons - completedCount} left`,
      icon: CheckCircle2,
      color: "from-cyan-100 to-cyan-200", 
      textColor: "text-cyan-700"
    },
    {
      title: "Levels Mastered",
      value: completedLevels.toString(),
      description: `${levels.length - completedLevels} levels remaining`,
      icon: Trophy,
      color: "from-amber-100 to-amber-200",
      textColor: "text-amber-700"
    },
    {
      title: "Total Lessons",
      value: totalLessons.toString(),
      description: "Comprehensive Arabic curriculum",
      icon: BookOpen,
      color: "from-gray-200 to-gray-300",
      textColor: "text-gray-700"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className="clay-card p-4 sm:p-6 text-center">
          <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
            <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
          <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
          <p className="text-xs text-gray-500">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
