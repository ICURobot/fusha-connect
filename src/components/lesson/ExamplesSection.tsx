import React from "react";
import { MessageCircle, Play } from "lucide-react";
import { Button } from "../ui/button";

export default function ExamplesSection({ examples }) {
  const playAudio = (audioUrl) => {
    // Placeholder for audio functionality  
    console.log('Playing audio:', audioUrl);
  };

  return (
    <div className="clay-card p-6 sm:p-8 mb-8">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-5 h-5 text-amber-700 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Example Sentences</h2>
      </div>

      <div className="space-y-4">
        {examples.map((example, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-amber-50 to-green-50 rounded-2xl border-2 border-white/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-gray-800 font-arabic">
                {example.arabic}
              </span>
              <Button
                onClick={() => playAudio(example.audio_url)}
                className="clay-button p-2"
                title="Play audio"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-700 font-medium">{example.translation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
