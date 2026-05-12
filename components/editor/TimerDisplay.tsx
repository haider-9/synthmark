"use client";

import React, { useEffect, useState } from "react";
import { useTimer } from "@/hooks/useTimer";

export function TimerDisplay() {
  const [mounted, setMounted] = useState(false);
  const timer = useTimer({ persist: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className="flex items-center gap-1.5 opacity-0">
        <span className="w-1.5 h-1.5 rounded-full bg-muted" />
        <span className="font-mono tabular-nums text-xs">00:00:00</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-md border border-white/5 shadow-inner">
      <span
        className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)] ${
          timer.isRunning ? "bg-[#22C55E] animate-pulse" : "bg-[#f59e0b]"
        }`}
      />
      <span className="font-mono tabular-nums text-xs font-bold text-foreground/90">
        {timer.formatted}
      </span>
      {!timer.isRunning && (
        <span className="text-[9px] uppercase tracking-wider font-black text-muted-foreground/50">
          PAUSED
        </span>
      )}
    </span>
  );
}
