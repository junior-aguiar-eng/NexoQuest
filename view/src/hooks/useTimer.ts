import { useState, useEffect } from "react";

export function useTimer(isActive: boolean = true) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const resetTimer = () => setElapsedSeconds(0);

  const formattedTime = (() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  })();

  return {
    elapsedSeconds,
    elapsedMs: elapsedSeconds * 1000,
    formattedTime,
    resetTimer,
  };
}
