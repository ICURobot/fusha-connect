import React, { useState } from "react";
import { PenTool, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

export default function ExercisesSection({ exercises }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const handleAnswer = (exerciseIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [exerciseIndex]: answer
    }));
  };

  const checkAnswer = (exerciseIndex) => {
    const exercise = exercises[exerciseIndex];
    const userAnswer = answers[exerciseIndex];
    const isCorrect = userAnswer === exercise.correct_answer;
    
    setShowResults(prev => ({
      ...prev,
      [exerciseIndex]: { isCorrect, submitted: true }
    }));
  };

  const resetExercise = (exerciseIndex) => {
    setAnswers(prev => ({
      ...prev,
      [exerciseIndex]: ''
    }));
    setShowResults(prev => ({
      ...prev,
      [exerciseIndex]: { isCorrect: false, submitted: false }
    }));
  };

  return (
    <div className="clay-card p-6 sm:p-8 mb-8">
      <div className="flex items-center mb-6">
        <PenTool className="w-5 h-5 text-amber-700 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Interactive Exercises</h2>
      </div>

      <div className="space-y-6">
        {exercises.map((exercise, index) => {
          const result = showResults[index];
          const userAnswer = answers[index];

          return (
            <div key={index} className="p-6 bg-white rounded-2xl border-2 border-white/40">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Question {index + 1}
              </h3>
              
              <p className="text-gray-700 mb-4 text-lg">{exercise.question}</p>

              {exercise.type === 'multiple_choice' && (
                <div className="space-y-3 mb-4">
                  {exercise.options?.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`exercise-${index}`}
                        value={option}
                        checked={userAnswer === option}
                        onChange={(e) => handleAnswer(index, e.target.value)}
                        disabled={result?.submitted}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className={`text-gray-700 ${
                        result?.submitted 
                          ? option === exercise.correct_answer 
                            ? 'text-green-600 font-medium' 
                            : option === userAnswer && !result.isCorrect
                              ? 'text-red-600'
                              : 'text-gray-500'
                          : ''
                      }`}>
                        {option}
                      </span>
                      {result?.submitted && option === exercise.correct_answer && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {result?.submitted && option === userAnswer && !result.isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </label>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-3">
                {!result?.submitted ? (
                  <Button
                    onClick={() => checkAnswer(index)}
                    disabled={!userAnswer}
                    className="clay-button"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {result.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {result.isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <Button
                      onClick={() => resetExercise(index)}
                      className="clay-button p-2"
                      title="Try again"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
