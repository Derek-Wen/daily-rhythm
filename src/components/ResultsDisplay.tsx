"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Trophy, Calendar, Star } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ResultsDisplayProps {
  score: number;
  maxScore: number;
  streak: number;
  dailyMessage: string;
  date?: Date;
  onPlayAgain?: () => void;
  onShare?: () => void;
}

const ResultsDisplay = ({
  score = 85,
  maxScore = 100,
  streak = 3,
  dailyMessage = "Congratulations! You've got rhythm! Keep up the great work and come back tomorrow for a new challenge.",
  date = new Date(),
  onPlayAgain = () => {},
  onShare = () => {},
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

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const scorePercentage = Math.round((score / maxScore) * 100);

  return (
    <div className="w-full max-w-md mx-auto bg-background">
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
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mx-auto mb-2"
            >
              <Trophy className="h-12 w-12 text-yellow-500" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Success!</CardTitle>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Your Score</p>
                <p className="text-3xl font-bold">{score}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Accuracy</p>
                <p className="text-3xl font-bold">{scorePercentage}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span>Streak: {streak} days</span>
              </Badge>
            </div>

            <Separator />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                showMessage ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5 }}
              className="bg-primary/10 p-4 rounded-lg border border-primary/20"
            >
              <p className="text-center italic">"{dailyMessage}"</p>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onPlayAgain}
              >
                Play Again
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={onShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share your results</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Come back tomorrow for a new rhythm challenge!
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResultsDisplay;
