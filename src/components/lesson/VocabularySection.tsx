import React from "react";
import { Play, Volume2 } from "lucide-react";
import { Button } from "../ui/button";

export default function VocabularySection({ vocabulary }) {
  const playAudio = (audioUrl) => {
    // Placeholder for audio functionality
    console.log('Playing audio:', audioUrl);
  };

  return (
    <div className="clay-card p-6 sm:p-8 mb-8">
      <div className="flex items-center mb-6">
        <Volume2 className="w-5 h-5 text-green-700 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Vocabulary</h2>
      </div>

      <div className="grid gap-4">
        {vocabulary.map((word, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-white/40 hover:shadow-lg transition-all duration-200">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-2xl font-bold text-gray-800 font-arabic">
                  {word.arabic}
                </span>
                <span className="text-lg text-gray-600 italic">
                  {word.transliteration}
                </span>
              </div>
              <p className="text-gray-700 font-medium">{word.meaning}</p>
            </div>
            
            <Button
              onClick={() => playAudio(word.audio_url)}
              className="clay-button p-2 ml-4"
              title="Play pronunciation"
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
