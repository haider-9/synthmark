"use client";

import React from "react";
import { MainLayout } from "@/components/editor/layout/MainLayout";
import { TopToolbar } from "@/components/editor/toolbars/TopToolbar";
import { LeftSidebar } from "@/components/editor/sidebar/LeftSidebar";
import { RightSidebar } from "@/components/editor/sidebar/RightSidebar";
import { AnnotationCanvas } from "@/components/editor/canvas/AnnotationCanvas";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
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

export default function ProjectPage() {
  const {
    zoomLevel,
    activeTool,
    annotations,
    cursorPosition,
    selectedAnnotationIds,
  } = useAnnotationStore();

  useKeyboardShortcuts();

  return (
    <div className="dark h-screen w-screen overflow-hidden">
      <MainLayout
        topToolbar={<TopToolbar />}
        leftSidebar={<LeftSidebar />}
        rightSidebar={<RightSidebar />}
        canvas={<AnnotationCanvas />}
        bottomBar={
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
                  <Separator
                    orientation="vertical"
                    className="h-3 opacity-40"
                  />
                  <span className="text-primary tabular-nums">
                    {selectedAnnotationIds.length} selected
                  </span>
                </>
              )}
            </div>

            {/* Right: cursor + zoom */}
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums opacity-60">
                {Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)}
              </span>
              <Separator orientation="vertical" className="h-3 opacity-40" />
              <span className="font-mono tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          </div>
        }
      />
      <Toaster />
      <OnboardingTour />
    </div>
  );
}
