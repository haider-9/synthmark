"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TimerOptions {
  persist?: boolean;
  storageKey?: string;
}

export function useTimer(options?: TimerOptions) {
  const { persist = false, storageKey = "synthmark-timer" } = options ?? {};

  const getInitial = () => {
    if (!persist) return 0;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  };

  const [elapsed, setElapsed] = useState(getInitial);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(elapsed);

  elapsedRef.current = elapsed;

  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (persist) {
          try {
            localStorage.setItem(storageKey, String(next));
          } catch { /* noop */ }
        }
        return next;
      });
    }, 1000);
  }, [persist, storageKey]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();

    const handleVisibility = () => {
      if (document.hidden) {
        if (persist) {
          try {
            localStorage.setItem(storageKey, String(elapsedRef.current));
          } catch { /* noop */ }
        }
        stopTimer();
        setIsRunning(false);
      } else {
        startTimer();
        setIsRunning(true);
      }
    };

    const handleBeforeUnload = () => {
      if (!persist) return;
      try {
        localStorage.setItem(storageKey, String(elapsedRef.current));
      } catch { /* noop */ }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [startTimer, stopTimer, persist, storageKey]);

  const reset = useCallback(() => {
    setElapsed(0);
    if (persist) {
      try {
        localStorage.removeItem(storageKey);
      } catch { /* noop */ }
    }
  }, [persist, storageKey]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  return { elapsed, isRunning, reset, formatted: formatTime(elapsed) };
}
