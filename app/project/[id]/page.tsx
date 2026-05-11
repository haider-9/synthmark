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
  const timer = useTimer({ persist: true });
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
    <div className="flex items-center justify-between w-full">
      {/* Left: tool + selection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-medium">
            {TOOL_LABELS[activeTool] ?? activeTool}
          </span>
        </div>
        <Separator orientation="vertical" className="h-3 opacity-40" />
        <span className="tabular-nums">{annotations.length} objects</span>
        {selectedAnnotationIds.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-3 opacity-40" />
            <span className="text-primary tabular-nums">
              {selectedAnnotationIds.length} selected
            </span>
          </>
        )}
      </div>

      {/* Right: cursor | zoom | timer */}
      <div className="flex items-center gap-3">
        <span className="font-mono tabular-nums opacity-60">
          {Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)}
        </span>
        <Separator orientation="vertical" className="h-3 opacity-40" />
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={() => setZoomLevel(zoomLevel / 1.25)}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <button
            onClick={() => setZoomLevel(1)}
            className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors px-1 min-w-[3rem] text-center tabular-nums"
            title="Reset zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={() => setZoomLevel(zoomLevel * 1.25)}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
        <Separator orientation="vertical" className="h-3 opacity-40" />
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
