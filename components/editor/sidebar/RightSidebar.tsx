"use client";

import React, { useState } from "react";
import {
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Merge,
  Zap,
  Maximize2,
  Wand2,
  MousePointer2,
  Hash,
  Ruler,
  Layers2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { usePolygonOps } from "@/hooks/usePolygonOps";
import { BoundingBox, Keypoint, Polygon } from "@/types/annotation";
import { Scissors } from "lucide-react";

function Section({
  title,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors group"
      >
        <Icon className="h-3 w-3" />
        <span className="flex-1 text-left">{title}</span>
        {open ? (
          <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
        ) : (
          <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
        )}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

export function RightSidebar() {
  const selectedAnnotationIds = useAnnotationStore((s) => s.selectedAnnotationIds);
  const annotations = useAnnotationStore((s) => s.annotations);
  const deleteAnnotations = useAnnotationStore((s) => s.deleteAnnotations);
  const duplicateAnnotations = useAnnotationStore((s) => s.duplicateAnnotations);
  const overlayAnnotations = useAnnotationStore((s) => s.overlayAnnotations);
  const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
  const labelClasses = useAnnotationStore((s) => s.labelClasses);
  const activeLabelId = useAnnotationStore((s) => s.activeLabelId);

  const { handleMerge, handleSubtractSelected } = usePolygonOps();

  const [identOpen, setIdentOpen] = useState(true);
  const [geomOpen, setGeomOpen] = useState(true);
  const [styleOpen, setStyleOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

  const count = selectedAnnotationIds.length;
  const ann = annotations.find((a) => a.id === selectedAnnotationIds[0]);
  const cls = labelClasses.find((c) => c.id === ann?.labelId);
  const activeCls = labelClasses.find((c) => c.id === activeLabelId);

  // Both selected are polygons
  const selectedPolygons = selectedAnnotationIds
    .map((id) => annotations.find((a) => a.id === id))
    .filter((a) => a?.type === "polygon");

  const canMerge = selectedPolygons.length >= 2;
  const canSubtract = selectedPolygons.length === 2; // exactly 2: first minus second
  const canOverlay =
    selectedPolygons.length > 0 && selectedPolygons.length === count;

  const handleLabelChange = (classId: string) => {
    selectedAnnotationIds.forEach((id) =>
      updateAnnotation(id, { labelId: classId }),
    );
  };

  const handleOpacity = (val: number | readonly number[]) => {
    const v = (Array.isArray(val) ? val[0] : val) / 100;
    selectedAnnotationIds.forEach((id) =>
      updateAnnotation(id, { metadata: { opacity: v } }),
    );
  };

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
        <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center">
          <MousePointer2 className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Nothing selected
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
            Click an annotation to inspect it
          </p>
        </div>
        <div className="w-full mt-2 p-2 rounded-md bg-muted/30 border border-border/40 text-[10px] text-muted-foreground/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <kbd className="bg-muted text-primary border border-border px-1.5 py-0.5 rounded font-mono text-[9px] leading-none">
              Shift
            </kbd>{" "}
            multi-select
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-muted text-primary border border-border px-1.5 py-0.5 rounded font-mono text-[9px] leading-none">
              Del
            </kbd>{" "}
            delete selected
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-muted text-primary border border-border px-1.5 py-0.5 rounded font-mono text-[9px] leading-none">
              M
            </kbd>{" "}
            merge polygons
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="pb-4">
        {/* ── Selection header ──────────────────────────────────────── */}
        <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full ring-1 ring-border flex-shrink-0"
              style={{ backgroundColor: cls?.color ?? "#6366f1" }}
            />
            <span className="text-xs font-semibold truncate">
              {cls?.name ?? "Unknown"}
            </span>
          </div>
          {count > 1 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {count} selected
            </Badge>
          )}
        </div>

        {/* ── Identity ──────────────────────────────────────────────── */}
        <Section
          title="Identity"
          icon={Hash}
          open={identOpen}
          onToggle={() => setIdentOpen((v) => !v)}
        >
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-muted/40 rounded p-2 border border-border/30">
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wide mb-0.5">
                Type
              </div>
              <div className="text-xs font-medium capitalize">{ann?.type}</div>
            </div>
            <div className="bg-muted/40 rounded p-2 border border-border/30">
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wide mb-0.5">
                ID
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {ann?.id.slice(0, 8)}
              </div>
            </div>
          </div>

          {/* Class picker */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Class
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center justify-between gap-2 h-7 px-2 rounded-md border border-border/60 bg-muted/30 hover:bg-accent/60 transition-colors text-xs cursor-pointer">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cls?.color ?? "#6366f1" }}
                  />
                  <span>{cls?.name ?? "Unassigned"}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {labelClasses.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => handleLabelChange(c.id)}
                    className="text-xs gap-2"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Visibility + Lock */}
          <div className="flex gap-1.5">
            <button
              onClick={() =>
                ann && updateAnnotation(ann.id, { isVisible: !ann.isVisible })
              }
              className={`flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md border text-xs transition-colors ${
                ann?.isVisible
                  ? "border-border/60 bg-muted/30 hover:bg-accent/60 text-foreground"
                  : "border-border/40 bg-muted/20 text-muted-foreground"
              }`}
            >
              {ann?.isVisible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {ann?.isVisible ? "Visible" : "Hidden"}
            </button>
            <button
              onClick={() =>
                ann && updateAnnotation(ann.id, { isLocked: !ann.isLocked })
              }
              className={`flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md border text-xs transition-colors ${
                ann?.isLocked
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                  : "border-border/60 bg-muted/30 hover:bg-accent/60 text-foreground"
              }`}
            >
              {ann?.isLocked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
              {ann?.isLocked ? "Locked" : "Unlocked"}
            </button>
          </div>
        </Section>

        <Separator className="opacity-30" />

        {/* ── Geometry ──────────────────────────────────────────────── */}
        <Section
          title="Geometry"
          icon={Ruler}
          open={geomOpen}
          onToggle={() => setGeomOpen((v) => !v)}
        >
          {ann?.type === "box" && (
            <div className="grid grid-cols-2 gap-1.5">
              {(["x", "y", "width", "height"] as const).map((field) => (
                <div key={field} className="space-y-0.5">
                  <Label className="text-[9px] uppercase tracking-wide text-muted-foreground/70">
                    {field}
                  </Label>
                  <Input
                    className="h-6 text-xs font-mono bg-muted/40 border-border/40 px-2"
                    value={Math.round((ann as BoundingBox)[field])}
                    onChange={(e) =>
                      updateAnnotation(ann.id, {
                        [field]: Number(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {ann?.type === "polygon" && (
            <div className="flex items-center gap-2 bg-muted/40 rounded p-2 border border-border/30">
              <Layers2 className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">
                  {(ann as Polygon).points.length}
                </span>{" "}
                vertices
              </span>
            </div>
          )}

          {ann?.type === "keypoint" && (
            <div className="grid grid-cols-2 gap-1.5">
              {(["x", "y"] as const).map((field) => (
                <div key={field} className="space-y-0.5">
                  <Label className="text-[9px] uppercase tracking-wide text-muted-foreground/70">
                    {field}
                  </Label>
                  <Input
                    className="h-6 text-xs font-mono bg-muted/40 border-border/40 px-2"
                    value={Math.round((ann as Keypoint).point[field])}
                    readOnly
                  />
                </div>
              ))}
            </div>
          )}

          {canMerge && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs border-dashed border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => handleMerge(selectedAnnotationIds)}
            >
              <Merge className="h-3 w-3 mr-1.5" />
              Merge {selectedPolygons.length} Polygons
            </Button>
          )}

          {canSubtract && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground/60 text-center">
                Subtract: first selected minus second
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs border-dashed border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={() =>
                  handleSubtractSelected(
                    selectedAnnotationIds[0],
                    selectedAnnotationIds[1],
                  )
                }
              >
                <Scissors className="h-3 w-3 mr-1.5" />
                Subtract (A − B)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs border-dashed border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={() =>
                  handleSubtractSelected(
                    selectedAnnotationIds[1],
                    selectedAnnotationIds[0],
                  )
                }
              >
                <Scissors className="h-3 w-3 mr-1.5" />
                Subtract (B − A)
              </Button>
            </div>
          )}
        </Section>

        <Separator className="opacity-30" />

        {/* ── Style ─────────────────────────────────────────────────── */}
        <Section
          title="Style"
          icon={Layers2}
          open={styleOpen}
          onToggle={() => setStyleOpen((v) => !v)}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Opacity
              </Label>
              <span className="text-[10px] font-mono text-muted-foreground">
                80%
              </span>
            </div>
            <Slider
              defaultValue={[80]}
              max={100}
              step={1}
              className="py-1"
              onValueChange={handleOpacity}
            />
          </div>
        </Section>

        <Separator className="opacity-30" />

        {/* ── AI Assistance ─────────────────────────────────────────── */}
        <Section
          title="AI Assistance"
          icon={Zap}
          open={aiOpen}
          onToggle={() => setAiOpen((v) => !v)}
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs justify-start gap-2 border-border/60 hover:border-primary/40 hover:text-primary"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Auto-Segment (SAM)
            <Badge variant="secondary" className="ml-auto text-[9px] px-1">
              AI
            </Badge>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs justify-start gap-2 border-border/60 hover:border-primary/40 hover:text-primary"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Magic Wand
            <Badge variant="secondary" className="ml-auto text-[9px] px-1">
              AI
            </Badge>
          </Button>
        </Section>

        <Separator className="opacity-30" />

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div className="px-3 pt-2 space-y-1.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs border-border/60"
            onClick={() => overlayAnnotations(selectedAnnotationIds)}
            disabled={!canOverlay}
          >
            <Layers2 className="h-3 w-3 mr-1.5" />
            Overlay as {activeCls?.name ?? "active class"}
          </Button>
          <div className="flex gap-1.5">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => deleteAnnotations(selectedAnnotationIds)}
            >
              <Trash2 className="h-3 w-3 mr-1.5" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs border-border/60"
              onClick={() => duplicateAnnotations(selectedAnnotationIds)}
            >
              <Copy className="h-3 w-3 mr-1.5" />
              Duplicate
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
