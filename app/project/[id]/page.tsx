"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/editor/layout/MainLayout";
import { TopToolbar } from "@/components/editor/toolbars/TopToolbar";
import { LeftSidebar } from "@/components/editor/sidebar/LeftSidebar";
import { RightSidebar } from "@/components/editor/sidebar/RightSidebar";
import { AnnotationCanvas } from "@/components/editor/canvas/AnnotationCanvas";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTimer } from "@/hooks/useTimer";
import { OnboardingTour } from "@/components/editor/onboarding/OnboardingTour";

const TOOL_LABELS: Record<string, string> = {
  select: "Select",
  pan: "Pan",
  box: "Box",
  polygon: "Polygon",
  keypoint: "Keypoint",
  erase: "Erase",
  merge: "Merge",
  line: "Line",
};

function TimerDisplay() {
  const [mounted, setMounted] = React.useState(false);
  const timer = useTimer({ persist: true });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className="flex items-center gap-1.5 opacity-0" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
        <span className="font-mono tabular-nums">00:00:00</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${timer.isRunning ? "bg-[#22C55E]" : "bg-[#f59e0b]"}`}
      />
      <span className="font-mono tabular-nums">{timer.formatted}</span>
      {!timer.isRunning && (
        <span className="text-[10px] text-muted-foreground/60">paused</span>
      )}
    </span>
  );
}

function StatusBar({ cursorPosition }: { cursorPosition: { x: number; y: number } }) {
  const zoomLevel = useAnnotationStore((s) => s.zoomLevel);
  const setZoomLevel = useAnnotationStore((s) => s.setZoomLevel);
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const annotations = useAnnotationStore((s) => s.annotations);
  const selectedAnnotationIds = useAnnotationStore((s) => s.selectedAnnotationIds);

  return (
    <div className="flex items-center justify-between w-full px-4 text-[11px] font-medium text-muted-foreground/80">
      {/* Left: Tool + Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          <span className="uppercase tracking-wider font-bold text-[10px]">
            {TOOL_LABELS[activeTool] ?? activeTool}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="opacity-50">Objects:</span>
            <span className="text-foreground font-bold tabular-nums">{annotations.length}</span>
          </div>

          {selectedAnnotationIds.length > 0 && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <span className="opacity-50">Selected:</span>
              <span className="text-blue-500 font-bold tabular-nums">{selectedAnnotationIds.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Canvas Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 font-mono tracking-tight">
          <div className="flex items-center gap-1">
            <span className="opacity-30">X</span>
            <span className="text-foreground/60 w-8 text-right tabular-nums">{Math.round(cursorPosition.x)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="opacity-30">Y</span>
            <span className="text-foreground/60 w-8 text-right tabular-nums">{Math.round(cursorPosition.y)}</span>
          </div>
        </div>

        <div className="h-3 w-px bg-border/40" />

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/40 rounded border border-white/[0.03] p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-white/5"
              onClick={() => setZoomLevel(zoomLevel / 1.25)}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 font-mono text-[10px] hover:text-foreground transition-colors tabular-nums min-w-[3.5rem]"
              title="Reset zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-white/5"
              onClick={() => setZoomLevel(zoomLevel * 1.25)}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="h-3 w-px bg-border/40" />
        <TimerDisplay />
      </div>
    </div>
  );
}

export default function ProjectPage() {
  useKeyboardShortcuts();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="dark h-screen w-screen overflow-hidden">
      <MainLayout
        topToolbar={<TopToolbar />}
        leftSidebar={<LeftSidebar />}
        rightSidebar={<RightSidebar />}
        canvas={<AnnotationCanvas onCursorMove={setCursorPosition} />}
        bottomBar={<StatusBar cursorPosition={cursorPosition} />}
      />
      <Toaster />
      <OnboardingTour />
    </div>
  );
}
