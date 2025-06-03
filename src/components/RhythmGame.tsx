"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import moment from "moment-timezone";
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
import FallingNotes from "./RhythmPattern";
import ResultsDisplay from "./ResultsDisplay";

interface Note {
  id: number;
  lane: number;
  startTime: number;
  y: number;
  hit: boolean;
  type: "tap";
}

interface RhythmGameProps {
  difficulty?: number;
  onComplete?: (score: number, isWin: boolean) => void;
  hasWonToday?: boolean;
}

// Message bank for Emily
// Message bank for Emily
const MESSAGE_BANK = [
  "i like you so much",
  "you are the prettiest i am so lucky",
  "you are such a dummy butt",
  "if you played this game that means i like you more",
  "why are you so kind and caring",
  "i like you so so so so so so so much",
  "i'm very grateful that i met you",
  "good job bunghole",
  "5'2.9999",
  "can you come here now, why aren't you here now",
  "so you will play this dumb game but you won't teleport to me",
  "come here now i need you",
  "i think about you every day dummy",
  "god i like you so much wtf it's insane",
  "sibal i like you sibal",
  "are you sure you like me, i like you so much",
  "ANNYEONGHASEYO FINE SHYT",
  "you may like uni on hokkaido scallop and beef noodle soup but i like you o.o",
  "ur a bunghole pussio",
  "can i ask how you got so pretty?",
  "how is everything you do so cute?",
  "i like you mostestestestestestestestestestestestestestestestestestestestestest",
  "i still remember the togedemaru you drew for me, i am so lucky <3",
  "you can stop acting that you like me more when in fact i actually like you more",
  "you look pretty in every angle",
  "can we get a dog, why do u hate gandalf",
  "1 dog, 2 rascals, and 1 cat o.o",
  "come to my arms NOW",
  "how did i bag you that's crazy lucky from me wtf",
  "you have the trifecta of being pretty, hardworking, and funny personality wtf i won the lottery",
  "hot korean girlfriend o.o",
  "i love listening to ur voice <3",
  "i tira miss you :3",
  "can you carry a french press or a wet stone or a mocha pot back home o.o ",
  "can you be the milk to my shake",
  "first japan then korea then china then new york",
  "why do you hate burgers so much dummy",
  "great job u protein maxxer caffeine addict",
  "lips... o.o",
  "beautiful smile + cute voice = deadly combo",
  "why did you turn me into a cutesy cringe person you bunghole",
  "you make so happy and laugh so much :)",
  "ur the black cat to my golden retriever <3",
  "<3333333333333333333333",
];

const RhythmGame = ({
  difficulty = 1,
  onComplete,
  hasWonToday = false,
}: RhythmGameProps) => {
  // Game states
  const [gameState, setGameState] = useState<
    "tutorial" | "ready" | "playing" | "complete"
  >("ready");
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [score, setScore] = useState({ perfect: 0, good: 0, okay: 0, miss: 0 });
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [usedMessageIndices, setUsedMessageIndices] = useState<number[]>([]);
  const [noteSpeed, setNoteSpeed] = useState(450);
  const [noteFrequency, setNoteFrequency] = useState(1.0);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const GAME_DURATION = 30; // seconds

  // Generate daily notes based on date seed
  useEffect(() => {
    // Set current date on client side to avoid hydration mismatch - using SF time
    const sfDate = moment().tz("America/Los_Angeles");
    setCurrentDate(sfDate.format("dddd, MMMM D, YYYY"));

    generateDailyNotes();

    // Check if user is first time visitor
    const visited = localStorage.getItem("emily-rhythm-game-visited");
    if (!visited) {
      setIsFirstTime(true);
      setIsTutorialOpen(true);
      localStorage.setItem("emily-rhythm-game-visited", "true");
    } else {
      setIsFirstTime(false);
    }

    // Set a random message for display when they've already won
    if (hasWonToday && !currentMessage) {
      const randomIndex = Math.floor(Math.random() * MESSAGE_BANK.length);
      setCurrentMessage(MESSAGE_BANK[randomIndex]);
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [difficulty, noteFrequency]);

  const generateDailyNotes = () => {
    // Use current SF date as seed for consistent daily patterns
    const todaySF = moment().tz("America/Los_Angeles");
    const seed =
      todaySF.year() * 10000 + (todaySF.month() + 1) * 100 + todaySF.date();

    console.log("=== GENERATING DAILY NOTES ===");
    console.log("Date seed:", seed);
    console.log("Note frequency multiplier:", noteFrequency);

    // Simple seeded random function
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };

    // Increased note frequency based on parameter
    const baseNoteCount = Math.floor(60 * noteFrequency); // Base 60 notes for 30 seconds
    const noteCount = baseNoteCount + Math.floor(seededRandom() * 20);
    console.log("Base note count:", baseNoteCount);
    console.log("Final note count:", noteCount);
    const newNotes: Note[] = [];
    let noteId = 0;

    // Generate complex patterns for expert difficulty
    for (let i = 0; i < noteCount; i++) {
      const baseTime = 2 + (i * (GAME_DURATION - 6)) / noteCount;
      const timeVariation = (seededRandom() - 0.5) * 1.5;
      const startTime = Math.max(1, baseTime + timeVariation);

      const lane = Math.floor(seededRandom() * 4);

      // Only tap notes now
      newNotes.push({
        id: noteId++,
        lane,
        startTime,
        y: -50,
        hit: false,
        type: "tap",
      });

      // Add rapid sequences for expert difficulty
      if (seededRandom() < 0.2 && i < noteCount - 3) {
        for (let j = 1; j <= 2; j++) {
          const rapidLane = (lane + j) % 4;
          newNotes.push({
            id: noteId++,
            lane: rapidLane,
            startTime: startTime + j * 0.15, // Very quick succession
            y: -50,
            hit: false,
            type: "tap",
          });
        }
        i += 2; // Skip ahead to avoid overcrowding
      }
    }

    // Sort by start time
    newNotes.sort((a, b) => a.startTime - b.startTime);
    console.log("Generated notes:", newNotes.length);
    console.log("First 5 notes:", newNotes.slice(0, 5));
    setNotes(newNotes);
  };

  const startGame = () => {
    setGameState("playing");
    setScore({ perfect: 0, good: 0, okay: 0, miss: 0 });
    setGameTime(0);
    setProgress(0);
    startTimeRef.current = Date.now();

    // Reset notes
    setNotes((prev) => prev.map((note) => ({ ...note, hit: false, y: -50 })));

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setGameTime(elapsed);
      setProgress((elapsed / GAME_DURATION) * 100);

      if (elapsed >= GAME_DURATION) {
        endGame();
      }
    }, 16); // ~60fps
  };

  const endGame = () => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    // Capture the current score before any state changes
    const currentScore = { ...score };
    const totalNotes = notes.length;
    const hitNotes =
      currentScore.perfect + currentScore.good + currentScore.okay;
    const totalScore =
      currentScore.perfect * 100 +
      currentScore.good * 70 +
      currentScore.okay * 40;
    const maxPossibleScore = totalNotes * 100;

    // DEBUG LOGS
    console.log("=== GAME END DEBUG ===");
    console.log("Total notes generated:", totalNotes);
    console.log("Score breakdown:", currentScore);
    console.log("Hit notes (perfect + good + okay):", hitNotes);
    console.log("Total score (weighted):", totalScore);
    console.log("Max possible score:", maxPossibleScore);

    // Calculate accuracy based on score quality (weighted by perfect/good/okay scores)
    const accuracy =
      maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    // Calculate percentage of notes hit (simple hit ratio)
    const notesHitPercentage =
      totalNotes > 0 ? (hitNotes / totalNotes) * 100 : 0;

    console.log("Calculated accuracy (weighted):", accuracy.toFixed(2) + "%");
    console.log(
      "Notes hit percentage (simple ratio):",
      notesHitPercentage.toFixed(2) + "%",
    );
    console.log("Are they the same?", accuracy === notesHitPercentage);

    // Select a message that hasn't been used yet
    let availableIndices: number[] = [];

    // If all messages have been used, reset the used indices
    if (usedMessageIndices.length >= MESSAGE_BANK.length) {
      setUsedMessageIndices([]);
      availableIndices = Array.from(
        { length: MESSAGE_BANK.length },
        (_, i) => i,
      );
    } else {
      // Get indices of messages that haven't been used yet
      availableIndices = Array.from(
        { length: MESSAGE_BANK.length },
        (_, i) => i,
      ).filter((index) => !usedMessageIndices.includes(index));
    }

    // Select a random message from available ones
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const messageIndex = availableIndices[randomIndex];

    // Update used messages
    setUsedMessageIndices((prev) => [...prev, messageIndex]);
    setCurrentMessage(MESSAGE_BANK[messageIndex]);

    // Determine if this is a win
    const isWin = accuracy >= 75 && notesHitPercentage >= 50;

    // Set game state to complete
    setGameState("complete");

    if (onComplete) onComplete(totalScore, isWin);
  };

  const handleNoteHit = (
    noteId: number,
    accuracy: "perfect" | "good" | "okay" | "miss",
  ) => {
    console.log(`Note hit: ID=${noteId}, Accuracy=${accuracy}`);
    setScore((prev) => {
      const newScore = {
        ...prev,
        [accuracy]: prev[accuracy] + 1,
      };
      console.log("Updated score:", newScore);
      return newScore;
    });
  };

  const resetGame = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setGameState("ready");
    setGameTime(0);
    setProgress(0);
    setScore({ perfect: 0, good: 0, okay: 0, miss: 0 });
    setCurrentMessage("");
    generateDailyNotes();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-[900px] mx-auto bg-gradient-to-br from-pink-50 to-pink-100 p-2 sm:p-4 rounded-lg">
      <Card className="w-full shadow-lg border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-100 to-pink-200">
          <CardTitle className="text-center text-2xl font-bold text-pink-800">
            {currentDate || "Loading..."}
          </CardTitle>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-pink-600">
              Notes: {notes.length} | Speed: {noteSpeed}px/s | Frequency:{" "}
              {noteFrequency.toFixed(1)}x
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpeedControl(!showSpeedControl)}
                className="text-pink-600 hover:text-pink-800 hover:bg-pink-100"
              >
                ⚙️ Speed
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTutorialOpen(true)}
                className="text-pink-600 hover:text-pink-800 hover:bg-pink-100"
              >
                <HelpCircle className="h-4 w-4 mr-1" /> How to Play
              </Button>
            </div>
          </div>

          {showSpeedControl && (
            <div className="mt-4 p-3 bg-pink-50 rounded-lg space-y-4">
              <div>
                <label className="text-sm font-medium text-pink-700 block mb-2">
                  Note Speed: {noteSpeed}px/s
                </label>
                <input
                  type="range"
                  min="200"
                  max="600"
                  step="25"
                  value={noteSpeed}
                  onChange={(e) => setNoteSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-pink-600 mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-pink-700 block mb-2">
                  Note Frequency: {noteFrequency.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={noteFrequency}
                  onChange={(e) => setNoteFrequency(Number(e.target.value))}
                  className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-pink-600 mt-1">
                  <span>Less</span>
                  <span>More</span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          {gameState === "complete" ? (
            <ResultsDisplay
              score={score.perfect * 100 + score.good * 70 + score.okay * 40}
              maxScore={notes.length * 100}
              dailyMessage={currentMessage}
              onPlayAgain={resetGame}
              accuracy={
                notes.length > 0
                  ? ((score.perfect * 100 + score.good * 70 + score.okay * 40) /
                      (notes.length * 100)) *
                    100
                  : 0
              }
              notesHitPercentage={
                notes.length > 0
                  ? ((score.perfect + score.good + score.okay) / notes.length) *
                    100
                  : 0
              }
              isWin={
                notes.length > 0 &&
                ((score.perfect * 100 + score.good * 70 + score.okay * 40) /
                  (notes.length * 100)) *
                  100 >=
                  75 &&
                ((score.perfect + score.good + score.okay) / notes.length) *
                  100 >=
                  50
              }
              hasWonToday={hasWonToday}
            />
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <Progress value={progress} className="h-3 bg-pink-100" />
                <div className="mt-4 flex justify-center gap-4 text-sm">
                  <span className="text-yellow-600">
                    Perfect: {score.perfect}
                  </span>
                  <span className="text-green-600">Good: {score.good}</span>
                  <span className="text-blue-600">Okay: {score.okay}</span>
                  <span className="text-red-600">Miss: {score.miss}</span>
                </div>
              </div>

              <FallingNotes
                notes={notes}
                isPlaying={gameState === "playing"}
                onNoteHit={handleNoteHit}
                gameTime={gameTime}
                noteSpeed={noteSpeed}
              />

              <div className="flex flex-col items-center space-y-4">
                {gameState === "ready" ? (
                  hasWonToday ? (
                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold text-green-600">
                        🎉 You Won Today! 🎉
                      </div>
                      <div className="bg-gradient-to-r from-pink-100 to-pink-200 p-4 rounded-lg border border-pink-300">
                        <p className="text-center text-pink-800 font-medium">
                          {currentMessage ||
                            "Come back tomorrow for a new challenge!"}
                        </p>
                      </div>
                      <p className="text-sm text-pink-600">
                        Come back tomorrow for the next puzzle!
                      </p>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      onClick={startGame}
                      className="w-40 h-16 text-lg bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Play className="mr-2 h-5 w-5" /> Start
                    </Button>
                  )
                ) : gameState === "playing" ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-700">
                      {Math.max(0, Math.ceil(GAME_DURATION - gameTime))}s
                    </div>
                    <p className="text-sm text-pink-600">Time remaining</p>
                  </div>
                ) : null}

                {!hasWonToday && (
                  <p className="text-sm text-pink-600 text-center">
                    {gameState === "playing"
                      ? "Hit tap notes! Match the rhythm pattern!"
                      : "Press Start to begin today's rhythm challenge"}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center bg-pink-50">
          {!hasWonToday && (
            <Button
              variant="outline"
              onClick={resetGame}
              className="border-pink-300 text-pink-700 hover:bg-pink-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> New Game
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Tutorial Dialog */}
      <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
        <DialogContent className="border-pink-200">
          <DialogHeader>
            <DialogTitle className="text-pink-800">
              How to Play Emily's Rhythm Game
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-4 text-pink-700">
                <p>by Derek Wen</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Watch the notes fall from the top of the screen</li>
                  <li>
                    Press <strong>D, F, J, K</strong> keys or tap the zones when
                    notes reach them
                  </li>
                  <li>
                    <strong>Tap Notes:</strong> Quick tap when they reach the
                    press bar
                  </li>
                  <li>Expert timing required:</li>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      <span className="text-yellow-600 font-bold">Perfect</span>{" "}
                      - ±15px timing (100 points)
                    </li>
                    <li>
                      <span className="text-green-600 font-bold">Good</span> -
                      ±25px timing (70 points)
                    </li>
                    <li>
                      <span className="text-blue-600 font-bold">Okay</span> -
                      ±35px timing (40 points)
                    </li>
                    <li>
                      <span className="text-red-600 font-bold">Miss</span> - No
                      points
                    </li>
                  </ul>
                  <li>
                    <strong>Challenge:</strong> Try to hit as many notes as
                    possible with good timing!
                  </li>
                  <li>Adjust note speed and frequency in settings</li>
                  <li>Come back daily for new expert patterns!</li>
                </ol>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setIsTutorialOpen(false)}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Let's Play!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RhythmGame;
