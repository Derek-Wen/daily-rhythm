"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";

interface ResultsDisplayProps {
  score: number;
  maxScore: number;
  dailyMessage: string;
  accuracy: number;
  notesHitPercentage: number;
  onPlayAgain?: () => void;
}

const ResultsDisplay = ({
  score = 85,
  maxScore = 100,
  dailyMessage = "i like you <3",
  accuracy = 75,
  notesHitPercentage = 80,
  onPlayAgain = () => {},
}: ResultsDisplayProps) => {
  const [showMessage, setShowMessage] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Animate the message reveal after a short delay
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 800);

    // Hide confetti after animation completes
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  const scorePercentage = Math.round((score / maxScore) * 100);

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-pink-50 to-pink-100">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              initial={{
                top: "-10%",
                left: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#FF5733",
                  "#33FF57",
                  "#3357FF",
                  "#F3FF33",
                  "#FF33F3",
                ][Math.floor(Math.random() * 5)],
              }}
              animate={{
                top: "110%",
                rotate: 360 * Math.round(Math.random() * 5),
                scale: [0, 1, 0.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 shadow-lg border-pink-200 bg-white/80">
          <CardHeader className="text-center pb-2"></CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Your Score</p>
                <p className="text-3xl font-bold">{score}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Accuracy</p>
                <p className="text-3xl font-bold">{Math.round(accuracy)}%</p>
              </div>
            </div>

            <div className="flex justify-center items-center mt-2">
              <div className="text-center">
                <p className="text-sm font-medium">Notes Hit</p>
                <p className="text-2xl font-bold">
                  {Math.round(notesHitPercentage)}%
                </p>
              </div>
            </div>

            <Separator />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                showMessage ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-pink-100 to-pink-200 p-4 rounded-lg border border-pink-300"
            >
              <p className="text-center text-pink-800 font-medium">
                {dailyMessage}
              </p>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full border-pink-300 text-pink-700 hover:bg-pink-100"
              onClick={onPlayAgain}
            >
              Play Again
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResultsDisplay;
