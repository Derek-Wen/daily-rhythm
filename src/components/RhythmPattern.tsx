"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Beat {
  id: number;
  active: boolean;
  played: boolean;
  current: boolean;
}

interface RhythmPatternProps {
  pattern?: number[];
  currentBeat?: number;
  isPlaying?: boolean;
  tempo?: number;
  onComplete?: () => void;
}

const RhythmPattern = ({
  pattern = [1, 0, 1, 0, 1, 1, 0, 1],
  currentBeat = -1,
  isPlaying = false,
  tempo = 120,
  onComplete,
}: RhythmPatternProps) => {
  const [beats, setBeats] = useState<Beat[]>([]);

  // Initialize beats based on pattern
  useEffect(() => {
    const initialBeats = pattern.map((value, index) => ({
      id: index,
      active: value === 1,
      played: false,
      current: false,
    }));
    setBeats(initialBeats);
  }, [pattern]);

  // Update current beat when playing
  useEffect(() => {
    if (currentBeat >= 0 && currentBeat < beats.length) {
      const updatedBeats = beats.map((beat, index) => ({
        ...beat,
        current: index === currentBeat,
        played: index < currentBeat || beat.played,
      }));
      setBeats(updatedBeats);

      // Check if pattern is complete
      if (currentBeat === beats.length - 1 && onComplete) {
        onComplete();
      }
    }
  }, [currentBeat, beats.length, onComplete]);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-background border rounded-lg shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Today's Rhythm Pattern</h3>
        <div className="text-sm text-muted-foreground">Tempo: {tempo} BPM</div>
      </div>

      <div className="flex items-center justify-center space-x-2 mb-6">
        {beats.map((beat) => (
          <div
            key={beat.id}
            className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200",
              beat.active ? "border-2 border-primary" : "border border-muted",
              beat.current && "ring-2 ring-primary ring-offset-2",
              beat.played && beat.active ? "bg-primary/20" : "bg-background",
            )}
          >
            {beat.active && (
              <div
                className={cn(
                  "w-6 h-6 rounded-full",
                  beat.current
                    ? "bg-primary animate-pulse"
                    : beat.played
                      ? "bg-primary/60"
                      : "bg-primary/30",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
        {isPlaying && (
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{
              width: `${((currentBeat + 1) / beats.length) * 100}%`,
            }}
          />
        )}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {isPlaying
          ? "Listen to the pattern and tap when highlighted"
          : "Get ready to match the rhythm pattern"}
      </div>
    </div>
  );
};

export default RhythmPattern;
