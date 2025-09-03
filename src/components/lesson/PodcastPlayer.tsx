import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { getPodcastFromSupabase } from "../../utils/audio";

interface PodcastPlayerProps {
  lessonId: string;
  lessonTitle: string;
}

export default function PodcastPlayer({ lessonId, lessonTitle }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadPodcast = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = await getPodcastFromSupabase(lessonId);
      if (url) {
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
        }
      } else {
        setError("Podcast not available for this lesson");
      }
    } catch (err) {
      setError("Failed to load podcast");
      console.error("Podcast loading error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setError("Audio playback error");
    setIsPlaying(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className="clay-card p-6 sm:p-8 mb-8">
      <div className="flex items-center mb-6">
        <Volume2 className="w-6 h-6 text-purple-700 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lesson Podcast</h2>
          <p className="text-sm text-gray-600">Listen to a conversation-style lesson</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-white/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {lessonTitle} - Podcast
            </h3>
            <p className="text-sm text-gray-600">
              Two-person conversation covering lesson content
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!audioUrl && !isLoading && (
              <Button
                onClick={loadPodcast}
                className="clay-button px-4 py-2 flex items-center space-x-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Load Podcast</span>
              </Button>
            )}
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            
            {audioUrl && (
              <Button
                onClick={togglePlayPause}
                className="clay-button px-4 py-2 flex items-center space-x-2"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {audioUrl && (
          <div className="text-xs text-gray-500">
            <p>🎧 Experimental feature - Two-person conversation style lesson</p>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="none"
      />
    </div>
  );
}
