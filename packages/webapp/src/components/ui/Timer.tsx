"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface TimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function Timer({
  initialSeconds,
  onComplete,
  isRunning = true,
  className = "",
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const urgency = seconds <= 60 ? "text-tg-destructive" : seconds <= 300 ? "text-yellow-500" : "text-tg-text";

  return (
    <div className={`font-mono text-2xl font-bold ${urgency} ${className}`}>
      {formatTime(seconds)}
    </div>
  );
}
