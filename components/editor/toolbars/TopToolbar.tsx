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
  Sparkles,
  FolderOpen,
  Pencil,
  Square,
  CircleIcon,
  Clipboard,
  Copy,
  Check,
  Upload,
  FileDown,
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
import { fromLabelStudioResult, toLabelStudioResult } from "@/lib/export";
import type { ActiveTool } from "@/types/annotation";
import { toast } from "sonner";

const NXUS_POLYGON_EXTRACT_SCRIPT = `(() => {
  const selected = window.Htx?.annotationStore?.selected;
  const serialized = selected?.serializeAnnotation?.();
  const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value.values === "function") return Array.from(value.values());
    if (typeof value.toJSON === "function") return toArray(value.toJSON());
    if (typeof value === "object") return Object.values(value);
    return [];
  };
  const read = (value) => {
    if (!value) return value;
    if (typeof value.toJSON === "function") return value.toJSON();
    if (typeof value.serialize === "function") return value.serialize();
    return value;
  };
  const sources = [
    serialized?.result,
    selected?.results,
    selected?.annotation?.result,
    selected?.regions,
    selected?.regionStore?.regions,
    selected?.regionStore?._regions,
    selected?.regionStore?.children,
    selected?.regionStore?.asArray?.(),
    selected?.regionStore?.toJSON?.(),
  ];
  const originalWidth =
    selected?.task?.dataObj?.width ??
    selected?.task?.data?.width ??
    serialized?.original_width;
  const originalHeight =
    selected?.task?.dataObj?.height ??
    selected?.task?.data?.height ??
    serialized?.original_height;
  const seen = new Set();
  const candidates = sources.flatMap((source) => toArray(source).map(read)).filter(Boolean);
  const polygons = candidates.flatMap((result) => {
    const value = result.value ?? result;
    const points = value.points ?? result.points;
    const labels =
      value.polygonlabels ??
      result.polygonlabels ??
      value.labels ??
      result.labels ??
      result.labeling?.value ??
      [];
    if (!Array.isArray(points) || points.length < 3) return [];
    const key = JSON.stringify(points);
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      id: result.id,
      type: "polygonlabels",
      origin: result.origin ?? "manual",
      to_name: result.to_name ?? "image",
      from_name: result.from_name ?? "label",
      original_width: result.original_width ?? originalWidth,
      original_height: result.original_height ?? originalHeight,
      value: {
        points,
        polygonlabels: Array.isArray(labels) ? labels : [labels].filter(Boolean),
      },
    }];
  });
  const json = JSON.stringify(polygons);
  if (typeof copy === "function") {
    copy(json);
  } else {
    navigator.clipboard?.writeText(json);
  }
  console.log("Checked " + candidates.length + " NXUS result/region candidate(s).");
  console.log(\`Copied \${polygons.length} polygon(s) for Synthmark import.\`);
  console.log(json);
  return polygons;
})()`;

export function TopToolbar({ projectId, projectName }: { projectId: string; projectName: string }) {
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
  const undo = useAnnotationStore((s) => s.undo);
  const redo = useAnnotationStore((s) => s.redo);
  const historyIndex = useAnnotationStore((s) => s.historyIndex);
  const history = useAnnotationStore((s) => s.history);
  const annotations = useAnnotationStore((s) => s.annotations);
  const savedAnnotationsSnapshot = useAnnotationStore(
    (s) => s.savedAnnotationsSnapshot
  );
  const labelClasses = useAnnotationStore((s) => s.labelClasses);
  const images = useAnnotationStore((s) => s.images);
  const activeImageId = useAnnotationStore((s) => s.activeImageId);
  const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
  const replaceAnnotations = useAnnotationStore((s) => s.replaceAnnotations);
  const updateImageStatus = useAnnotationStore((s) => s.updateImageStatus);
  const markAnnotationsSaved = useAnnotationStore((s) => s.markAnnotationsSaved);
  const activeLabelId = useAnnotationStore((s) => s.activeLabelId);

  const [lsOpen, setLsOpen] = useState(false);
  const [lsJson, setLsJson] = useState("");
  const [textCopied, setTextCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [extractScriptCopied, setExtractScriptCopied] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasUnsavedChanges =
    JSON.stringify(annotations) !== savedAnnotationsSnapshot;

  const handleSave = async () => {
    if (!activeImageId) {
      toast.error("Upload or select an image before saving");
      return;
    }

    const save = async () => {
      const response = await fetch(
        `/api/projects/${projectId}/images/${activeImageId}/annotations`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ annotations }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");
      return data;
    };

    const promise = save();
    toast.promise(promise, {
      loading: "Saving annotations...",
      success: "Annotations saved",
      error: (err) => err instanceof Error ? err.message : "Save failed",
    });

    try {
      const data = await promise;
      updateImageStatus(activeImageId, data.status);
      markAnnotationsSaved();
    } catch (error) {
      // toast.promise already presents the failure.
    }
  };

  const handleAutoLabel = () => {
    const activeImage = images.find((image) => image.id === activeImageId);
    const activeLabel = labelClasses[0];
    if (!activeImage || !activeLabel) {
      toast.error("Select an image and create at least one class first");
      return;
    }

    addAnnotation({
      id: crypto.randomUUID(),
      type: "box",
      labelId: activeLabel.id,
      x: Math.round(activeImage.width * 0.1),
      y: Math.round(activeImage.height * 0.1),
      width: Math.round(activeImage.width * 0.8),
      height: Math.round(activeImage.height * 0.8),
      isVisible: true,
      isLocked: false,
      metadata: { source: "auto-label" },
    });
    toast.success("Created a starter box. Adjust it, then save.");
  };

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
    toast.success("Copied to clipboard");
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  const handleExtractScriptCopy = () => {
    const el = document.getElementById("nxus-extract-script-textarea") as HTMLTextAreaElement | null;
    if (!el) return;
    el.select();
    document.execCommand("copy");
    toast.success("NXUS extractor script copied");
    setExtractScriptCopied(true);
    setTimeout(() => setExtractScriptCopied(false), 2000);
  };

  const handleImportFromLabelStudio = () => {
    const activeImage = images.find((i) => i.id === activeImageId);

    try {
      const imported = fromLabelStudioResult({
        input: importText,
        labelClasses,
        imageWidth: activeImage?.width ?? 1920,
        imageHeight: activeImage?.height ?? 1080,
        fallbackLabelId: activeLabelId,
      });

      if (imported.length === 0) {
        toast.error("No supported NXUS annotations found");
        return;
      }

      replaceAnnotations([], imported);
      setImportOpen(false);
      setImportText("");
      toast.success(`Imported ${imported.length} annotation${imported.length === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between w-full h-full px-4 gap-4">
        {/* ── Left: Brand & Project ────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-primary/20 transition-all group-hover:border-primary/40">
              <img src="/logo.png" alt="Synthmark" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline-block">
              synth<span className="text-primary/80">mark</span>
            </span>
          </Link>

          <div className="h-4 w-px bg-border/40" />

          <Link
            href={`/project/${projectId}`}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent/50 transition-colors group"
          >
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground max-w-44 truncate">
              {projectName}
            </span>
          </Link>
        </div>

        {/* ── Center: Tool Palette ─────────────────────────────────────── */}
        <div className="flex items-center bg-muted/30 border border-primary/[0.03] rounded-lg p-1 shadow-inner">
          <ToggleGroup
            value={[activeTool]}
            onValueChange={(values) => {
              const val = values[values.length - 1];
              if (val) setActiveTool(val as ActiveTool);
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
            <ActionBtn
              icon={Save}
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              label={hasUnsavedChanges ? "Save changes" : "All changes saved"}
              shortcut="Ctrl+S"
            />
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
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      setImportOpen(true);
                      setExtractScriptCopied(false);
                    }}
                  >
                    <FileDown className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom" className="text-xs">
                Export polygons from NXUS
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setImportOpen(true)}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom" className="text-xs">
                Import from NXUS / Label Studio
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            size="sm"
            className="h-8 text-[12px] gap-2 px-4 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            onClick={handleAutoLabel}
          >
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
                className="w-full h-36 text-[11px] font-mono bg-background border border-border rounded-lg p-3 text-muted-foreground resize-none focus:outline-none focus:border-primary/40"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-6 text-[11px] gap-1.5 border-border hover:border-border"
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

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-2xl dark">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Export polygons from NXUS</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-[12px] text-muted-foreground">
              In NXUS, open the task â†’ press <kbd className="text-[10px] bg-muted border border-border px-1 py-0.5 rounded font-mono">F12</kbd> â†’ Console â†’ paste and run this:
            </p>

            <div className="relative">
              <textarea
                id="nxus-extract-script-textarea"
                readOnly
                value={NXUS_POLYGON_EXTRACT_SCRIPT}
                className="w-full h-40 text-[11px] font-mono bg-background border border-border rounded-lg p-3 pr-20 text-muted-foreground resize-none focus:outline-none focus:border-primary/40"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-6 text-[11px] gap-1.5 border-border hover:border-border"
                onClick={handleExtractScriptCopy}
              >
                {extractScriptCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {extractScriptCopied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <p className="text-[12px] text-muted-foreground">
              The script copies only NXUS polygons. Paste the copied JSON here:
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[{"type":"polygonlabels","value":{"points":[[10,20],[30,40],[20,60]],"polygonlabels":["Class"]}}]'
              className="w-full h-36 text-[11px] font-mono bg-background border border-border rounded-lg p-3 text-foreground resize-none focus:outline-none focus:border-primary/40"
            />

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleImportFromLabelStudio} disabled={importText.trim().length === 0}>
                Import
              </Button>
            </div>
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
