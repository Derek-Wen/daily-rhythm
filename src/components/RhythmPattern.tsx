"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Note {
  id: number;
  lane: number;
  startTime: number;
  y: number;
  hit: boolean;
  type: "tap";
}

interface AccuracyFeedback {
  id: number;
  type: "perfect" | "good" | "okay" | "miss";
  x: number;
  y: number;
}

interface FallingNotesProps {
  notes?: Note[];
  isPlaying?: boolean;
  onNoteHit?: (
    noteId: number,
    accuracy: "perfect" | "good" | "okay" | "miss",
  ) => void;
  gameTime?: number;
  noteSpeed?: number;
}

const FallingNotes = ({
  notes = [],
  isPlaying = false,
  onNoteHit,
  gameTime = 0,
  noteSpeed = 300,
}: FallingNotesProps) => {
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [feedback, setFeedback] = useState<AccuracyFeedback[]>([]);
  const [activeTapZones, setActiveTapZones] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [pressBarActive, setPressBarActive] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const GAME_HEIGHT = 500;
  const TAP_ZONE_Y = GAME_HEIGHT - 80;
  const PRESS_BAR_Y = TAP_ZONE_Y - 20; // Press bar above tap zone
  const LANES = 4;
  const LANE_WIDTH = 100 / LANES;

  // Update note positions based on game time
  useEffect(() => {
    if (!isPlaying) return;

    const updatedNotes = notes
      .map((note) => ({
        ...note,
        y: (gameTime - note.startTime) * noteSpeed,
      }))
      .filter((note) => note.y < GAME_HEIGHT + 50 && !note.hit);

    setActiveNotes(updatedNotes);
  }, [gameTime, notes, isPlaying, noteSpeed]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      let lane = -1;
      switch (e.key.toLowerCase()) {
        case "d":
          lane = 0;
          break;
        case "f":
          lane = 1;
          break;
        case "j":
          lane = 2;
          break;
        case "k":
          lane = 3;
          break;
        default:
          return;
      }

      if (e.repeat) return; // Prevent key repeat

      handleKeyPress(lane, true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      let lane = -1;
      switch (e.key.toLowerCase()) {
        case "d":
          lane = 0;
          break;
        case "f":
          lane = 1;
          break;
        case "j":
          lane = 2;
          break;
        case "k":
          lane = 3;
          break;
        default:
          return;
      }

      handleKeyPress(lane, false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, activeNotes]);

  const handleKeyPress = (lane: number, isPressed: boolean) => {
    if (isPressed) {
      handleTap(lane);
    }

    // Update press bar visual state
    setPressBarActive((prev) => {
      const newState = [...prev];
      newState[lane] = isPressed;
      return newState;
    });
  };

  const handleTap = (lane: number) => {
    // Find the closest note in this lane
    const notesInLane = activeNotes.filter(
      (note) => note.lane === lane && !note.hit,
    );

    if (notesInLane.length === 0) {
      showFeedback(lane, "miss");
      return;
    }

    // Find the note closest to the tap zone
    const closestNote = notesInLane.reduce((closest, note) => {
      const currentDistance = Math.abs(note.y - TAP_ZONE_Y);
      const closestDistance = Math.abs(closest.y - TAP_ZONE_Y);
      return currentDistance < closestDistance ? note : closest;
    });

    const distance = Math.abs(closestNote.y - TAP_ZONE_Y);
    let accuracy: "perfect" | "good" | "okay" | "miss";

    // Stricter timing for expert difficulty
    if (distance <= 15) accuracy = "perfect";
    else if (distance <= 25) accuracy = "good";
    else if (distance <= 35) accuracy = "okay";
    else accuracy = "miss";

    if (accuracy !== "miss") {
      // Mark tap note as hit
      setActiveNotes((prev) =>
        prev.map((note) =>
          note.id === closestNote.id ? { ...note, hit: true } : note,
        ),
      );
    }

    showFeedback(lane, accuracy);
    if (onNoteHit) onNoteHit(closestNote.id, accuracy);

    // Visual feedback for tap zone
    setActiveTapZones((prev) => {
      const newState = [...prev];
      newState[lane] = true;
      setTimeout(() => {
        setActiveTapZones((current) => {
          const updated = [...current];
          updated[lane] = false;
          return updated;
        });
      }, 150);
      return newState;
    });
  };

  const showFeedback = (
    lane: number,
    type: "perfect" | "good" | "okay" | "miss",
  ) => {
    const x = lane * LANE_WIDTH + LANE_WIDTH / 2;
    const newFeedback: AccuracyFeedback = {
      id: Date.now() + Math.random(),
      type,
      x,
      y: TAP_ZONE_Y - 50,
    };

    setFeedback((prev) => [...prev, newFeedback]);

    setTimeout(() => {
      setFeedback((prev) => prev.filter((f) => f.id !== newFeedback.id));
    }, 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-pink-50 to-pink-100 rounded-lg shadow-lg overflow-hidden touch-none select-none">
      <div
        ref={gameAreaRef}
        className="relative bg-gradient-to-b from-pink-100 to-pink-200"
        style={{ height: GAME_HEIGHT }}
      >
        {/* Lane dividers */}
        {Array.from({ length: LANES - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-pink-300/50"
            style={{ left: `${(i + 1) * LANE_WIDTH}%` }}
          />
        ))}

        {/* Press Bar - Visual indicator for timing */}
        <div
          className="absolute w-full press-bar z-10"
          style={{ top: `${PRESS_BAR_Y}px` }}
        >
          <div className="w-full h-8 flex">
            {Array.from({ length: LANES }).map((_, i) => {
              return (
                <div
                  key={i}
                  className={cn(
                    "press-bar-segment flex-1 flex items-center justify-center",
                    pressBarActive[i] && "active",
                  )}
                >
                  <span className="text-sm font-bold text-primary">
                    {["D", "F", "J", "K"][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Falling notes */}
        <AnimatePresence>
          {activeNotes.map((note) => {
            const laneWidth = 100 / LANES;
            const leftPosition = `${note.lane * laneWidth}%`;

            return (
              <motion.div
                key={note.id}
                className="falling-note z-0"
                style={{
                  left: leftPosition,
                  top: `${note.y}px`,
                  width: `${laneWidth}%`,
                  height: "32px",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              />
            );
          })}
        </AnimatePresence>

        {/* Accuracy feedback */}
        <AnimatePresence>
          {feedback.map((f) => (
            <motion.div
              key={f.id}
              className={cn("accuracy-indicator", f.type)}
              style={{
                left: `${f.x}%`,
                top: `${f.y}px`,
                transform: "translateX(-50%)",
              }}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {f.type.toUpperCase()}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Tap zones - invisible but functional */}
        <div className="absolute w-full" style={{ top: `${TAP_ZONE_Y}px` }}>
          {Array.from({ length: LANES }).map((_, i) => {
            return (
              <button
                key={i}
                className="absolute bg-transparent border-none outline-none touch-manipulation"
                style={{
                  left: `${i * LANE_WIDTH}%`,
                  width: `${LANE_WIDTH}%`,
                  height: "64px",
                }}
                onMouseDown={() => handleKeyPress(i, true)}
                onMouseUp={() => handleKeyPress(i, false)}
                onMouseLeave={() => handleKeyPress(i, false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleKeyPress(i, true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleKeyPress(i, false);
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  handleKeyPress(i, false);
                }}
              ></button>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-pink-50 text-center relative z-20">
        <p className="text-sm text-pink-700">
          Press D, F, J, K keys or tap the lanes when notes reach the press bar!
        </p>
      </div>
    </div>
  );
};

export default FallingNotes;
