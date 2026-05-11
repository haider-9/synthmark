"use client";

import React from "react";
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
  HelpCircle,
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
import { Badge } from "@/components/ui/badge";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { ExportDialog } from "@/components/editor/export/ExportDialog";

const TOOLS = [
  {
    value: "select",
    icon: MousePointer2,
    label: "Select",
    key: "V",
    group: "nav",
  },
  { value: "pan", icon: Hand, label: "Pan", key: "Space", group: "nav" },
  { value: "box", icon: Square, label: "Box", key: "B", group: "draw" },
  {
    value: "polygon",
    icon: Hexagon,
    label: "Polygon",
    key: "P",
    group: "draw",
  },
  { value: "lasso", icon: Pencil, label: "Lasso", key: "L", group: "draw" },
  { value: "circle", icon: CircleIcon, label: "Circle", key: "C", group: "draw" },
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
      <div className="flex items-center justify-between w-full h-full gap-2">
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              synth<span className="text-primary">mark</span>
            </span>
          </div>
          <Badge
            variant="secondary"
            className="text-[9px] px-1.5 py-0 h-4 font-medium rounded-sm"
          >
            BETA
          </Badge>
        </div>

        <div className="toolbar-separator" />

        {/* ── Project name ──────────────────────────────────────────────── */}
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group px-1">
          <FolderOpen className="h-3.5 w-3.5" />
          <span className="font-medium">Untitled Project</span>
          <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
        </button>

        <div className="toolbar-separator" />

        {/* ── Tool palette ──────────────────────────────────────────────── */}
        <ToggleGroup
          value={[activeTool]}
          onValueChange={(values) => {
            const val = values[values.length - 1];
            if (val) setActiveTool(val as any);
          }}
          className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5"
        >
          {/* Nav group */}
          <ToolBtn value="select" icon={MousePointer2} label="Select" shortcut="V" />
          <ToolBtn value="pan" icon={Hand} label="Pan" shortcut="Space" />

          <div className="toolbar-separator mx-0.5" />

          {/* Draw group */}
          <ToolBtn value="box" icon={Square} label="Bounding Box" shortcut="B" />
          <ToolBtn value="polygon" icon={Hexagon} label="Polygon" shortcut="P" />
          <ToolBtn value="lasso" icon={Pencil} label="Lasso (Freehand)" shortcut="L" />
          <ToolBtn value="circle" icon={CircleIcon} label="Circle" shortcut="C" />
          <ToolBtn value="keypoint" icon={Dot} label="Keypoint" shortcut="K" />

          <div className="toolbar-separator mx-0.5" />

          {/* Ops group */}
          <ToolBtn value="erase" icon={Eraser} label="Subtract / Erase" shortcut="E" />
          <ToolBtn value="merge" icon={Merge} label="Merge Polygons" shortcut="M" />
        </ToggleGroup>

        <div className="toolbar-separator" />

        {/* ── Undo / Redo ───────────────────────────────────────────────── */}
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

        {/* ── Spacer ────────────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          <ActionBtn icon={Save} label="Save" shortcut="Ctrl+S" />
          <ActionBtn icon={Share2} label="Share" />
          <ExportDialog />
        </div>

        <div className="toolbar-separator" />
        <ActionBtn
          icon={HelpCircle}
          label="Show Tour"
          onClick={() => {
            localStorage.removeItem("synthmark-onboarding-done");
            window.location.reload();
          }}
        />

        <div className="toolbar-separator" />

        {/* ── Run AI ────────────────────────────────────────────────────── */}
        <Button size="sm" className="h-7 text-xs gap-1.5 px-3 font-medium">
          <Sparkles className="h-3 w-3" />
          Auto-label
        </Button>
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
