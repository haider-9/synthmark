"use client";

import React, { useState } from "react";
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
  Pencil,
  Square,
  CircleIcon,
  Clipboard,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { ExportDialog } from "@/components/editor/export/ExportDialog";
import { TimerDisplay } from "@/components/editor/TimerDisplay";
import { toLabelStudioResult } from "@/lib/export";
import { toast } from "sonner";

export function TopToolbar() {
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
  const undo = useAnnotationStore((s) => s.undo);
  const redo = useAnnotationStore((s) => s.redo);
  const historyIndex = useAnnotationStore((s) => s.historyIndex);
  const history = useAnnotationStore((s) => s.history);
  const annotations = useAnnotationStore((s) => s.annotations);
  const labelClasses = useAnnotationStore((s) => s.labelClasses);
  const images = useAnnotationStore((s) => s.images);
  const activeImageId = useAnnotationStore((s) => s.activeImageId);

  const [lsOpen, setLsOpen] = useState(false);
  const [lsJson, setLsJson] = useState("");
  const [textCopied, setTextCopied] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleCopyForLabelStudio = () => {
    const activeImage = images.find((i) => i.id === activeImageId);
    const result = toLabelStudioResult({
      annotations,
      labelClasses,
      imageWidth: activeImage?.width ?? 1920,
      imageHeight: activeImage?.height ?? 1080,
    });

    if (result.length === 0) {
      toast.error("No visible annotations to copy");
      return;
    }

    // Build the full ready-to-run console command with JSON embedded
    const json = JSON.stringify(result);
    setLsJson(`window.Htx.annotationStore.selected.appendResults(${json})`);
    setLsOpen(true);
    setTextCopied(false);
  };

  const handleTextCopy = () => {
    // Select all + copy via execCommand — works regardless of focus/permissions
    const el = document.getElementById("ls-json-textarea") as HTMLTextAreaElement | null;
    if (!el) return;
    el.select();
    document.execCommand("copy");
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

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
            value={[activeTool]}
            onValueChange={(values) => {
              const val = values[values.length - 1];
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
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={handleCopyForLabelStudio}
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom" className="text-xs">
                Copy for NXUS / Label Studio
              </TooltipContent>
            </Tooltip>
          </div>

          <Button size="sm" className="h-8 text-[12px] gap-2 px-4 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Sparkles className="h-3.5 w-3.5" />
            Auto-label
          </Button>
        </div>
      </div>

      {/* ── Label Studio JSON modal ───────────────────────────────────── */}
      <Dialog open={lsOpen} onOpenChange={setLsOpen}>
        <DialogContent className="sm:max-w-2xl dark">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Copy for NXUS / Label Studio</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-[12px] text-muted-foreground">
              In NXUS, open the task → press <kbd className="text-[10px] bg-muted border border-border px-1 py-0.5 rounded font-mono">F12</kbd> → Console → paste and run this:
            </p>

            <div className="relative">
              <textarea
                id="ls-json-textarea"
                readOnly
                value={lsJson}
                className="w-full h-36 text-[11px] font-mono bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 text-[#aaa] resize-none focus:outline-none focus:border-primary/40"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-6 text-[11px] gap-1.5 border-[#2a2a2a] hover:border-[#444]"
                onClick={handleTextCopy}
              >
                {textCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {textCopied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Click inside the box to select all, or use the Copy button. Then paste into the NXUS console and press Enter. Hit <span className="text-foreground font-medium">Submit</span> in NXUS when done.
            </p>
          </div>
        </DialogContent>
      </Dialog>
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
