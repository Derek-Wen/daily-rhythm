"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Share2, Trophy, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RhythmGame from "@/components/RhythmGame";
import moment from "moment-timezone";

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [nextPuzzleTime, setNextPuzzleTime] = useState("");
  const [weather, setWeather] = useState<{
    high: number;
    low: number;
    condition: string;
  } | null>(null);

  useEffect(() => {
    // Get streak from local storage
    const savedStreak = localStorage.getItem("rhythmPuzzleStreak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }

    // Calculate time until next puzzle
    updateNextPuzzleTime();
    const timer = setInterval(updateNextPuzzleTime, 60000); // Update every minute

    // Fetch weather data
    fetchWeather();

    return () => clearInterval(timer);
  }, []);

  const updateNextPuzzleTime = () => {
    const nowSF = moment().tz("America/Los_Angeles");
    const tomorrowSF = nowSF.clone().add(1, "day").startOf("day");

    const diffMs = tomorrowSF.diff(nowSF);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    setNextPuzzleTime(`${diffHrs}h ${diffMins}m`);
  };

  const fetchWeather = async () => {
    try {
      // Using a free weather API (OpenWeatherMap alternative) - get daily forecast
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=America/Los_Angeles",
      );
      const data = await response.json();

      if (data.daily) {
        const high = Math.round(data.daily.temperature_2m_max[0]);
        const low = Math.round(data.daily.temperature_2m_min[0]);
        const weatherCode = data.daily.weathercode[0];

        // Simple weather condition mapping
        let condition = "Clear";
        if (weatherCode >= 61 && weatherCode <= 67) condition = "Rain";
        else if (weatherCode >= 71 && weatherCode <= 77) condition = "Snow";
        else if (weatherCode >= 45 && weatherCode <= 48) condition = "Fog";
        else if (weatherCode >= 51 && weatherCode <= 57) condition = "Drizzle";
        else if (weatherCode >= 1 && weatherCode <= 3) condition = "Cloudy";

        setWeather({ high, low, condition });
      }
    } catch (error) {
      console.log("Weather fetch failed:", error);
      // Set default weather if API fails
      setWeather({ high: 70, low: 55, condition: "Clear" });
    }
  };

  const handleGameComplete = (score: number) => {
    if (score > 0) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("rhythmPuzzleStreak", newStreak.toString());
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <motion.h1
            className="text-4xl font-bold mb-2 text-pink-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Emily's Daily Rhythm Game
          </motion.h1>
          <motion.p
            className="text-pink-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            By Derek Wen
          </motion.p>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Card className="w-full md:w-auto border-pink-200 bg-white/80">
            <CardContent className="flex items-center p-4">
              <Calendar className="mr-2 h-4 w-4 text-pink-600" />
              <span className="text-pink-700">
                Puzzle #
                {Math.floor(
                  moment().tz("America/Los_Angeles").valueOf() / 86400000,
                )}
              </span>
            </CardContent>
          </Card>

          {weather && (
            <Card className="w-full md:w-auto border-pink-200 bg-white/80">
              <CardContent className="flex items-center p-4">
                <Cloud className="mr-2 h-4 w-4 text-pink-600" />
                <span className="text-pink-700">
                  SF: {weather.high}°/{weather.low}°F {weather.condition}
                </span>
              </CardContent>
            </Card>
          )}

          <Card className="w-full md:w-auto border-pink-200 bg-white/80">
            <CardContent className="flex items-center p-4">
              <Clock className="mr-2 h-4 w-4 text-pink-600" />
              <span className="text-pink-700">
                Next puzzle: {nextPuzzleTime}
              </span>
            </CardContent>
          </Card>
        </div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="w-full overflow-hidden border-pink-200 bg-white/80">
            <CardContent className="p-0">
              <RhythmGame onComplete={handleGameComplete} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
