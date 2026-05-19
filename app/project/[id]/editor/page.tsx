"use client";

import React, { useState, useEffect, use } from "react";
import { MainLayout } from "@/components/editor/layout/MainLayout";
import { TopToolbar } from "@/components/editor/toolbars/TopToolbar";
import { RightSidebar } from "@/components/editor/sidebar/RightSidebar";
import { AnnotationCanvas } from "@/components/editor/canvas/AnnotationCanvas";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, AlertCircle } from "lucide-react";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTimer } from "@/hooks/useTimer";
import { OnboardingTour } from "@/components/editor/onboarding/OnboardingTour";
import type { ProjectImage } from "@/stores/useAnnotationStore";
import { LeftSidebar } from "@/components/editor/sidebar/LeftSidebar";
import { AppLoading } from "@/components/ui/app-loading";

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

// ─── Timer display ────────────────────────────────────────────────────────────
function TimerDisplay() {
  const timer = useTimer({ persist: true });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <span className="flex items-center gap-1.5 opacity-0" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="font-mono tabular-nums">00:00:00</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${timer.isRunning ? "bg-emerald-500" : "bg-amber-500"}`} />
      <span className="font-mono tabular-nums">{timer.formatted}</span>
      {!timer.isRunning && (
        <span className="text-[10px] text-muted-foreground/60">paused</span>
      )}
    </span>
  );
}

// ─── Status bar ───────────────────────────────────────────────────────────────
function StatusBar({ cursorPosition }: { cursorPosition: { x: number; y: number } }) {
  const zoomLevel = useAnnotationStore((s) => s.zoomLevel);
  const setZoomLevel = useAnnotationStore((s) => s.setZoomLevel);
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const annotations = useAnnotationStore((s) => s.annotations);
  const selectedAnnotationIds = useAnnotationStore((s) => s.selectedAnnotationIds);

  return (
    <div className="flex items-center justify-between w-full px-4 text-[11px] font-medium text-muted-foreground/80">
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
        <div className="flex items-center bg-muted/40 rounded border border-primary/3 p-0.5">
          <Button
            variant="ghost" size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-primary/5"
            onClick={() => setZoomLevel(zoomLevel / 1.25)}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2 font-mono text-[10px] hover:text-foreground transition-colors tabular-nums min-w-14"
            title="Reset zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <Button
            variant="ghost" size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-primary/5"
            onClick={() => setZoomLevel(zoomLevel * 1.25)}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
        <div className="h-3 w-px bg-border/40" />
        <TimerDisplay />
      </div>
    </div>
  );
}

// ─── Loading / error states ───────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <AppLoading
      variant="editor"
      fullScreen
      title="Loading annotation editor"
    />
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="dark h-screen w-screen flex items-center justify-center bg-[oklch(0.12_0_0)]">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-foreground">Failed to load project</p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  useKeyboardShortcuts();

  const hydrateProject = useAnnotationStore((s) => s.hydrateProject);
  const activeImageId = useAnnotationStore((s) => s.activeImageId);
  const setAnnotations = useAnnotationStore((s) => s.setAnnotations);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Project");

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;
        setProjectName(data.project?.name ?? data.name ?? "Project");

        // Map DB rows → store shape
        const images: ProjectImage[] = (data.images ?? []).map((img: {
          id: string;
          imageUrl: string;
          fileName: string;
          width: number;
          height: number;
          status: ProjectImage["status"];
          thumbnailUrl?: string;
        }) => ({
          id: img.id,
          url: img.imageUrl,
          name: img.fileName,
          width: img.width,
          height: img.height,
          annotationCount: 0,
          status: img.status,
        }));

        const labelClasses = (data.labelClasses ?? []).map((c: {
          id: string;
          name: string;
          color: string;
        }) => ({
          id: c.id,
          name: c.name,
          color: c.color,
        }));

        hydrateProject({ projectId, labelClasses, images });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProject();
    return () => { cancelled = true; };
  }, [projectId, hydrateProject]);

  useEffect(() => {
    if (!activeImageId) return;
    let cancelled = false;

    async function loadAnnotations() {
      try {
        const res = await fetch(`/api/projects/${projectId}/images/${activeImageId}/annotations`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAnnotations(data.annotations ?? []);
      } catch {
        if (!cancelled) setAnnotations([]);
      }
    }

    loadAnnotations();
    return () => { cancelled = true; };
  }, [activeImageId, projectId, setAnnotations]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className="dark h-screen w-screen overflow-hidden">
      <MainLayout
        topToolbar={<TopToolbar projectId={projectId} projectName={projectName} />}
        leftSidebar={<LeftSidebar projectId={projectId} />}
        rightSidebar={<RightSidebar />}
        canvas={<AnnotationCanvas onCursorMove={setCursorPosition} />}
        bottomBar={<StatusBar cursorPosition={cursorPosition} />}
      />
      <OnboardingTour />
    </div>
  );
}
