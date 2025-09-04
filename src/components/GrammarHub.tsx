import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import ConjugationTable from './ConjugationTable';
import ProgressTracker from '../utils/progress';
import { 
  pastTenseData, 
  presentTenseData, 
  subjunctiveData, 
  jussiveData, 
  imperativeData,
  verbFormsData 
} from '../data/grammarData';

export default function GrammarHub() {
  // Check if user has completed lesson 7.2 (b2-m7-l2)
  const hasCompletedLesson72 = ProgressTracker.isLessonCompleted('b2-m7-l2');
  
  // Debug: Log all progress to console
  const allProgress = ProgressTracker.getProgress();
  console.log('All completed lessons:', allProgress);
  console.log('Has completed lesson 7.2:', hasCompletedLesson72);

  // Table of Contents data
  const tableOfContents = [
    { id: 'verb-forms', title: 'Verb Forms', available: hasCompletedLesson72 },
    { id: 'past-tense', title: 'Past Tense', available: true },
    { id: 'present-tense', title: 'Present Tense', available: hasCompletedLesson72 },
    { id: 'subjunctive', title: 'Subjunctive', available: hasCompletedLesson72 },
    { id: 'jussive', title: 'Jussive', available: hasCompletedLesson72 },
    { id: 'imperative', title: 'Imperative', available: hasCompletedLesson72 }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 clay-button rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Grammar Reference Hub</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your comprehensive library of Arabic grammar tables. Complete lessons to unlock new content!
          </p>
        </div>

        {/* Table of Contents */}
        <div className="clay-card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Table of Contents</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {tableOfContents.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`clay-button px-4 py-2 text-sm transition-all duration-200 ${
                  item.available 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                disabled={!item.available}
              >
                {item.title}
                {!item.available && <span className="ml-1">🔒</span>}
              </button>
            ))}
          </div>
          {!hasCompletedLesson72 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Complete Lesson 7.2 to unlock all tables
            </p>
          )}
        </div>

        {/* Verb Forms Summary - Only show if lesson 7.2 is completed */}
        {hasCompletedLesson72 && (
          <div id="verb-forms" className="clay-card p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">The Ten Verb Forms</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <th className="border border-green-200 px-4 py-3 text-left font-semibold text-gray-700">
                      Form
                    </th>
                    <th className="border border-green-200 px-4 py-3 text-right font-semibold text-gray-700">
                      Pattern
                    </th>
                    <th className="border border-green-200 px-4 py-3 text-left font-semibold text-gray-700">
                      Meaning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {verbFormsData.map((row, index) => (
                    <tr key={index} className="hover:bg-green-50 transition-colors">
                      <td className="border border-green-200 px-4 py-3 text-left text-gray-700 font-medium">
                        {row.form}
                      </td>
                      <td className="border border-green-200 px-4 py-3 text-right text-2xl font-medium text-gray-800">
                        {row.pattern}
                      </td>
                      <td className="border border-green-200 px-4 py-3 text-left text-gray-600">
                        {row.meaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Past Tense - Always available */}
        <div id="past-tense">
          <ConjugationTable 
            title="Past Tense (الماضي)" 
            data={pastTenseData} 
          />
        </div>

        {/* Additional tables - Only show if lesson 7.2 is completed */}
        {hasCompletedLesson72 && (
          <>
            <div id="present-tense">
              <ConjugationTable 
                title="Present Tense (المضارع)" 
                data={presentTenseData} 
              />
            </div>
            
            <div id="subjunctive">
              <ConjugationTable 
                title="Subjunctive Mood (المضارع المنصوب)" 
                data={subjunctiveData} 
              />
            </div>
            
            <div id="jussive">
              <ConjugationTable 
                title="Jussive Mood (المضارع المجزوم)" 
                data={jussiveData} 
              />
            </div>
            
            <div id="imperative">
              <ConjugationTable 
                title="The Imperative Mood (الأَمْرُ)" 
                data={imperativeData} 
              />
            </div>
          </>
        )}

        {/* Debug section - remove this in production */}
        <div className="clay-card p-6 bg-gray-50 border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Debug Info</h3>
          <p className="text-sm text-gray-600 mb-2">Completed lessons: {allProgress.length}</p>
          <p className="text-sm text-gray-600 mb-2">Has completed lesson 7.2: {hasCompletedLesson72 ? 'Yes' : 'No'}</p>
          <div className="mt-3 space-x-2">
            <button 
              onClick={() => {
                ProgressTracker.markLessonCompleted('b2-m7-l2');
                window.location.reload();
              }}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Mark Lesson 7.2 Complete (Test)
            </button>
            <button 
              onClick={() => {
                ProgressTracker.clearProgress();
                window.location.reload();
              }}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Clear All Progress
            </button>
          </div>
          <details className="text-sm mt-3">
            <summary className="cursor-pointer text-blue-600">Show all completed lessons</summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(allProgress, null, 2)}
            </pre>
          </details>
        </div>

        {/* Progress indicator */}
        {!hasCompletedLesson72 && (
          <div className="clay-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 clay-button rounded-full flex items-center justify-center bg-gradient-to-r from-amber-100 to-orange-100">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">More Content Coming Soon!</h3>
                <p className="text-gray-600">
                  Complete Lesson 7.2 to unlock the complete verb conjugation tables, including present tense, subjunctive, jussive, and the ten verb forms.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
