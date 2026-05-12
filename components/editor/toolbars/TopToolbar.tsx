"use client";

import React from "react";
import Link from "next/link";
import {
  MousePointer2,
  Hexagon,
  Dot,
  Undo2,
  Redo2,
  Save,
  Hand,
  Eraser,
  Merge,
  ChevronDown,
  Sparkles,
  FolderOpen,
  Share2,
  Play,
  Pencil,
  Square,
  CircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { ExportDialog } from "@/components/editor/export/ExportDialog";
import { TimerDisplay } from "@/components/editor/TimerDisplay";

const TOOLS = [
  {
    value: "select",
    icon: MousePointer2,
    label: "Select",
    key: "V",
    group: "nav",
  },
  { value: "pan", icon: Hand, label: "Pan", key: "Space", group: "nav" },
  {
    value: "polygon",
    icon: Hexagon,
    label: "Polygon",
    key: "P",
    group: "draw",
  },
  { value: "keypoint", icon: Dot, label: "Keypoint", key: "K", group: "draw" },
  { value: "erase", icon: Eraser, label: "Erase", key: "E", group: "ops" },
  { value: "merge", icon: Merge, label: "Merge", key: "M", group: "ops" },
] as const;

export function TopToolbar() {
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
  const undo = useAnnotationStore((s) => s.undo);
  const redo = useAnnotationStore((s) => s.redo);
  const historyIndex = useAnnotationStore((s) => s.historyIndex);
  const history = useAnnotationStore((s) => s.history);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between w-full h-full px-4 gap-4">
        {/* ── Left: Brand & Project ────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center transition-all group-hover:bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline-block">
              synth<span className="text-primary/80">mark</span>
            </span>
          </Link>

          <div className="h-4 w-px bg-border/40" />

          <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent/50 transition-colors group">
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground">Untitled Project</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground/70" />
          </button>
        </div>

        {/* ── Center: Tool Palette ─────────────────────────────────────── */}
        <div className="flex items-center bg-muted/30 border border-white/[0.03] rounded-lg p-1 shadow-inner">
          <ToggleGroup
            type="single"
            value={activeTool}
            onValueChange={(val) => {
              if (val) setActiveTool(val as any);
            }}
            className="flex items-center gap-1"
          >
            <div className="flex items-center gap-0.5 px-1">
              <ToolBtn value="select" icon={MousePointer2} label="Select" shortcut="V" />
              <ToolBtn value="pan" icon={Hand} label="Pan" shortcut="Space" />
            </div>
            
            <div className="w-px h-4 bg-border/40 mx-1" />

            <div className="flex items-center gap-0.5 px-1">
              <ToolBtn value="box" icon={Square} label="Bounding Box" shortcut="B" />
              <ToolBtn value="polygon" icon={Hexagon} label="Polygon" shortcut="P" />
              <ToolBtn value="lasso" icon={Pencil} label="Lasso" shortcut="L" />
              <ToolBtn value="circle" icon={CircleIcon} label="Circle" shortcut="C" />
              <ToolBtn value="keypoint" icon={Dot} label="Keypoint" shortcut="K" />
            </div>

            <div className="w-px h-4 bg-border/40 mx-1" />

            <div className="flex items-center gap-0.5 px-1">
              <ToolBtn value="erase" icon={Eraser} label="Subtract" shortcut="E" />
              <ToolBtn value="merge" icon={Merge} label="Merge" shortcut="M" />
            </div>
          </ToggleGroup>
        </div>

        {/* ── Right: History & Actions ──────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <TimerDisplay />
          
          <div className="h-4 w-px bg-border/40" />

          <div className="flex items-center gap-0.5">
            <ActionBtn
              icon={Undo2}
              onClick={undo}
              disabled={!canUndo}
              label="Undo"
              shortcut="Ctrl+Z"
            />
            <ActionBtn
              icon={Redo2}
              onClick={redo}
              disabled={!canRedo}
              label="Redo"
              shortcut="Ctrl+Shift+Z"
            />
          </div>

          <div className="h-4 w-px bg-border/40" />

          <div className="flex items-center gap-1">
            <ActionBtn icon={Save} label="Save" shortcut="Ctrl+S" />
            <ExportDialog />
          </div>

          <Button size="sm" className="h-8 text-[12px] gap-2 px-4 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Sparkles className="h-3.5 w-3.5" />
            Auto-label
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

function ToolBtn({
  value,
  icon: Icon,
  label,
  shortcut,
}: {
  value: string;
  icon: React.ElementType;
  label: string;
  shortcut: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToggleGroupItem
            value={value}
            aria-label={label}
            className="h-7 w-7 p-0 rounded transition-all aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        }
      />
      <TooltipContent
        side="bottom"
        className="flex items-center gap-2 text-xs"
      >
        <span>{label}</span>
        <kbd className="text-[10px] bg-muted text-primary border border-border px-1.5 py-0.5 rounded font-mono leading-none">
          {shortcut}
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function ActionBtn({
  icon: Icon,
  onClick,
  disabled,
  label,
  shortcut,
}: {
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  shortcut?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onClick}
            disabled={disabled}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <TooltipContent
        side="bottom"
        className="flex items-center gap-2 text-xs"
      >
        <span>{label}</span>
        {shortcut && (
          <kbd className="text-[10px] bg-muted text-primary border border-border px-1.5 py-0.5 rounded font-mono leading-none">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
