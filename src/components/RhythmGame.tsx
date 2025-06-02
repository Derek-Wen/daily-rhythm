"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import RhythmPattern from "./RhythmPattern";
import ResultsDisplay from "./ResultsDisplay";

interface RhythmGameProps {
  difficulty?: number;
  onComplete?: (score: number) => void;
}

const RhythmGame = ({ difficulty = 1, onComplete }: RhythmGameProps) => {
  // Game states
  const [gameState, setGameState] = useState<
    "tutorial" | "ready" | "playing" | "success" | "failure"
  >("ready");
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tempo, setTempo] = useState(60); // BPM

  const audioContext = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const beatInterval = 60000 / tempo; // ms between beats

  // Generate a random rhythm pattern based on difficulty
  useEffect(() => {
    generatePattern();

    // Check if user is first time visitor
    const visited = localStorage.getItem("rhythm-game-visited");
    if (!visited) {
      setIsFirstTime(true);
      setIsTutorialOpen(true);
      localStorage.setItem("rhythm-game-visited", "true");
    } else {
      setIsFirstTime(false);
    }

    // Initialize audio context
    if (typeof window !== "undefined") {
      audioContext.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty]);

  const generatePattern = () => {
    const length = 4 + Math.floor(difficulty / 2); // Pattern length increases with difficulty
    const newPattern: number[] = [];

    // Generate pattern with 1s (beats) and 0s (rests)
    for (let i = 0; i < length; i++) {
      // Higher difficulty means more complex patterns
      if (difficulty > 3 && Math.random() > 0.7) {
        // Add syncopation for higher difficulties
        newPattern.push(0);
      } else {
        newPattern.push(1);
      }
    }

    setPattern(newPattern);
    setTempo(60 + difficulty * 5); // Tempo increases with difficulty
  };

  const playSound = (frequency = 440) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.value = 0.1;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.current.currentTime + 0.3,
    );

    setTimeout(() => oscillator.stop(), 300);
  };

  const startGame = () => {
    setGameState("playing");
    setUserPattern([]);
    setCurrentBeat(-1);
    setProgress(0);

    // Start the metronome
    let beat = 0;
    const totalBeats = pattern.length;

    timerRef.current = setInterval(() => {
      if (beat >= totalBeats) {
        if (timerRef.current) clearInterval(timerRef.current);
        setCurrentBeat(-1);
        return;
      }

      setCurrentBeat(beat);
      setProgress(((beat + 1) / totalBeats) * 100);

      if (pattern[beat] === 1) {
        playSound(440); // Play A4 for beats
      } else {
        playSound(220); // Play A3 for rests (quieter)
      }

      beat++;
    }, beatInterval);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (gameState !== "playing") return;

    // Space bar or Enter key to tap
    if (e.key === " " || e.key === "Enter") {
      handleTap();
    }
  };

  const handleTap = () => {
    if (gameState !== "playing") return;

    const newUserPattern = [...userPattern];
    newUserPattern[currentBeat] = 1;
    setUserPattern(newUserPattern);

    // Visual feedback
    playSound(660); // Higher pitch for user taps
  };

  const checkResult = () => {
    // Compare user pattern with the game pattern
    let correct = true;
    let userScore = 0;

    for (let i = 0; i < pattern.length; i++) {
      // If pattern has a beat and user tapped, or pattern has no beat and user didn't tap
      if (
        (pattern[i] === 1 && userPattern[i] === 1) ||
        (pattern[i] === 0 && !userPattern[i])
      ) {
        userScore += 10;
      } else {
        correct = false;
        // Still give partial points for trying
        if (userPattern[i]) userScore += 2;
      }
    }

    setScore(userScore);

    if (correct) {
      setGameState("success");
      setStreak((prev) => prev + 1);
      if (onComplete) onComplete(userScore);
    } else {
      setGameState("failure");
      setStreak(0);
    }
  };

  useEffect(() => {
    // When the pattern finishes playing, check the result
    if (currentBeat === pattern.length - 1) {
      setTimeout(() => {
        checkResult();
      }, beatInterval + 500); // Wait a bit after the last beat
    }
  }, [currentBeat]);

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("ready");
    setUserPattern([]);
    setCurrentBeat(-1);
    setProgress(0);
    generatePattern();
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-[800px] mx-auto bg-background p-4"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Daily Rhythm Challenge
          </CardTitle>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-muted-foreground">
              Difficulty: {difficulty} | Streak: {streak}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTutorialOpen(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" /> How to Play
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {gameState === "success" || gameState === "failure" ? (
            <ResultsDisplay
              success={gameState === "success"}
              score={score}
              streak={streak}
              onPlayAgain={resetGame}
            />
          ) : (
            <div className="space-y-8">
              <div className="relative">
                <Progress value={progress} className="h-2" />
                <div className="mt-8">
                  <RhythmPattern
                    pattern={pattern}
                    currentBeat={currentBeat}
                    userPattern={userPattern}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                {gameState === "ready" ? (
                  <Button
                    size="lg"
                    onClick={startGame}
                    className="w-40 h-16 text-lg"
                  >
                    <Play className="mr-2 h-5 w-5" /> Start
                  </Button>
                ) : (
                  <motion.div
                    className="w-40 h-16 flex items-center justify-center rounded-md bg-primary text-primary-foreground"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTap}
                  >
                    Tap!
                  </motion.div>
                )}

                <p className="text-sm text-muted-foreground text-center">
                  {gameState === "playing"
                    ? "Tap when you hear a beat!"
                    : "Press Start to begin the rhythm challenge"}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetGame}>
            <RefreshCw className="mr-2 h-4 w-4" /> New Pattern
          </Button>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString()}
          </div>
        </CardFooter>
      </Card>

      {/* Tutorial Dialog */}
      <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Play the Rhythm Challenge</DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-4">
                <p>
                  Welcome to the Daily Rhythm Challenge! Test your rhythm skills
                  by tapping along with the pattern.
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Press <strong>Start</strong> to begin the challenge
                  </li>
                  <li>Listen carefully to the rhythm pattern</li>
                  <li>
                    Tap the button (or press Space/Enter) when you hear a beat
                  </li>
                  <li>Don't tap during rests (silent moments)</li>
                  <li>Match the pattern to unlock today's message!</li>
                </ol>
                <p>
                  Come back daily for a new challenge and to build your streak!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setIsTutorialOpen(false)}>Got it!</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RhythmGame;
