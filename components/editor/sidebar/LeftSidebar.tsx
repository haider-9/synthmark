"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Layers,
  Database,
  Tag,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Square,
  Hexagon,
  Circle,
  Minus,
  Search,
  ChevronDown,
  MoreHorizontal,
  GripVertical,
  ImageIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Brush,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { Annotation } from "@/types/annotation";

const TYPE_ICON: Record<string, React.ElementType> = {
  box: Square,
  polygon: Hexagon,
  keypoint: Circle,
  line: Minus,
  circle: Circle,
  brush: Brush,
};

const TYPE_COLOR: Record<string, string> = {
  box: "text-blue-400",
  polygon: "text-emerald-400",
  keypoint: "text-amber-400",
  line: "text-purple-400",
  circle: "text-orange-400",
  brush: "text-pink-400",
};

const DATASET_ITEMS = [
  { id: 1, name: "frame_0001.jpg", status: "completed", count: 4 },
  { id: 2, name: "frame_0002.jpg", status: "in_progress", count: 2 },
  { id: 3, name: "frame_0003.jpg", status: "todo", count: 0 },
  { id: 4, name: "frame_0004.jpg", status: "todo", count: 0 },
  { id: 5, name: "frame_0005.jpg", status: "todo", count: 0 },
  { id: 6, name: "frame_0006.jpg", status: "todo", count: 0 },
];

const STATUS_ICON: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  in_progress: Clock,
  todo: AlertCircle,
};
const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-400",
  in_progress: "text-amber-400",
  todo: "text-muted-foreground/50",
};

function AnnotationRow({
  ann,
  isSelected,
  color,
  labelName,
  onSelect,
  onToggleVisibility,
  onToggleLock,
}: {
  ann: Annotation;
  isSelected: boolean;
  color: string;
  labelName: string;
  onSelect: (e: React.MouseEvent) => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}) {
  const Icon = TYPE_ICON[ann.type] ?? Square;
  const typeColor = TYPE_COLOR[ann.type] ?? "text-muted-foreground";

  return (
    <div
      onClick={onSelect}
      className={`
        group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
        transition-all duration-100 text-xs
        ${
          isSelected
            ? "bg-primary/15 border border-primary/30 text-foreground"
            : "border border-transparent hover:bg-accent/60 hover:border-border/40"
        }
      `}
    >
      {/* Drag handle */}
      <GripVertical className="h-3 w-3 text-muted-foreground/30 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Class color dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-black/20"
        style={{ backgroundColor: color }}
      />

      {/* Type icon */}
      <Icon className={`h-3 w-3 flex-shrink-0 ${typeColor}`} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        <span className="font-medium truncate">{labelName}</span>
        <span className="text-muted-foreground/60 font-mono ml-1">
          #{ann.id.slice(0, 5)}
        </span>
      </div>

      {/* Actions — visible on hover or when selected */}
      <div
        className={`flex items-center gap-0.5 flex-shrink-0 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={ann.isVisible ? "Hide" : "Show"}
        >
          {ann.isVisible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 opacity-50" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={ann.isLocked ? "Unlock" : "Lock"}
        >
          {ann.isLocked ? (
            <Lock className="h-3 w-3 opacity-50" />
          ) : (
            <Unlock className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}

export function LeftSidebar() {
  const {
    annotations,
    updateAnnotation,
    selectedAnnotationIds,
    setSelectedAnnotationIds,
    toggleSelectedAnnotationId,
    labelClasses,
    addLabelClass,
    updateLabelClass,
    deleteLabelClass,
    activeLabelId,
    setActiveLabelId,
  } = useAnnotationStore();

  const [newClassName, setNewClassName] = useState("");
  const [newClassColor, setNewClassColor] = useState("#6366f1");
  const [filterText, setFilterText] = useState("");

  const getClass = (labelId: string) =>
    labelClasses.find((c) => c.id === labelId);
  const getColor = (labelId: string) => getClass(labelId)?.color ?? "#6366f1";
  const getName = (labelId: string) => getClass(labelId)?.name ?? "Unknown";

  const filtered = filterText
    ? annotations.filter(
        (a) =>
          a.type.includes(filterText.toLowerCase()) ||
          getName(a.labelId).toLowerCase().includes(filterText.toLowerCase()) ||
          a.id.toLowerCase().includes(filterText.toLowerCase()),
      )
    : annotations;

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    addLabelClass({
      id: uuidv4(),
      name: newClassName.trim(),
      color: newClassColor,
    });
    setNewClassName("");
  };

  const handleSelect = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) toggleSelectedAnnotationId(id);
    else setSelectedAnnotationIds([id]);
  };

  // Group annotations by type for summary
  const typeCounts = annotations.reduce(
    (acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        <Tabs defaultValue="layers" className="flex flex-col h-full">
          {/* Tab bar */}
          <div className="px-2 pt-1.5 pb-0 flex-shrink-0">
            <TabsList className="w-full h-7 grid grid-cols-3 bg-muted/50 p-0.5 rounded-md">
              <TabsTrigger
                value="layers"
                className="text-[10px] h-6 rounded-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Layers className="h-3 w-3 mr-1" />
                Layers
              </TabsTrigger>
              <TabsTrigger
                value="classes"
                className="text-[10px] h-6 rounded-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Tag className="h-3 w-3 mr-1" />
                Classes
              </TabsTrigger>
              <TabsTrigger
                value="dataset"
                className="text-[10px] h-6 rounded-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Database className="h-3 w-3 mr-1" />
                Dataset
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── LAYERS ──────────────────────────────────────────────────── */}
          <TabsContent
            value="layers"
            className="flex-1 overflow-hidden m-0 flex flex-col mt-0 pt-0"
          >
            {/* Summary chips */}
            {annotations.length > 0 && (
              <div className="px-2 py-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const Icon = TYPE_ICON[type] ?? Square;
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-1 bg-muted/60 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <Icon className={`h-2.5 w-2.5 ${TYPE_COLOR[type]}`} />
                      <span className="font-medium tabular-nums">{count}</span>
                    </div>
                  );
                })}
                <div className="ml-auto text-[10px] text-muted-foreground/60 tabular-nums">
                  {annotations.length} total
                </div>
              </div>
            )}

            {/* Search */}
            <div className="px-2 pb-1.5 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                <Input
                  placeholder="Filter layers..."
                  className="h-7 text-xs pl-7 bg-muted/40 border-border/40 focus:border-primary/50"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-0.5 pb-4">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <Layers className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground/60">
                      {annotations.length === 0
                        ? "No annotations yet"
                        : "No matches"}
                    </p>
                    {annotations.length === 0 && (
                      <p className="text-[10px] text-muted-foreground/40">
                        Use the toolbar to start annotating
                      </p>
                    )}
                  </div>
                ) : (
                  filtered.map((ann) => (
                    <AnnotationRow
                      key={ann.id}
                      ann={ann}
                      isSelected={selectedAnnotationIds.includes(ann.id)}
                      color={getColor(ann.labelId)}
                      labelName={getName(ann.labelId)}
                      onSelect={(e) => handleSelect(e, ann.id)}
                      onToggleVisibility={() =>
                        updateAnnotation(ann.id, { isVisible: !ann.isVisible })
                      }
                      onToggleLock={() =>
                        updateAnnotation(ann.id, { isLocked: !ann.isLocked })
                      }
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── CLASSES ─────────────────────────────────────────────────── */}
          <TabsContent
            value="classes"
            className="flex-1 overflow-hidden m-0 flex flex-col mt-0"
          >
            <div className="px-2 py-1.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {labelClasses.length} classes
              </span>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-0.5 pb-2">
                {labelClasses.map((cls) => {
                  const isActive = activeLabelId === cls.id;
                  const count = annotations.filter(
                    (a) => a.labelId === cls.id,
                  ).length;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        setActiveLabelId(cls.id);
                        // Also reclassify every selected annotation
                        if (selectedAnnotationIds.length > 0) {
                          selectedAnnotationIds.forEach((id) =>
                            updateAnnotation(id, { labelId: cls.id }),
                          );
                        }
                      }}
                      className={`
                        group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                        transition-all text-xs border
                        ${
                          isActive
                            ? "bg-primary/10 border-primary/30"
                            : "border-transparent hover:bg-accent/60 hover:border-border/40"
                        }
                      `}
                    >
                      <input
                        type="color"
                        value={cls.color}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateLabelClass(cls.id, { color: e.target.value });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                        title="Change color"
                      />
                      <span className="flex-1 truncate font-medium">
                        {cls.name}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                          {count}
                        </span>
                      )}
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLabelClass(cls.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all rounded"
                        title="Delete class"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator className="opacity-50" />
            <div className="p-2 space-y-1.5 flex-shrink-0">
              <div className="flex gap-1.5">
                <input
                  type="color"
                  value={newClassColor}
                  onChange={(e) => setNewClassColor(e.target.value)}
                  className="w-7 h-7 rounded border border-border/60 cursor-pointer bg-transparent p-0.5 flex-shrink-0"
                />
                <Input
                  placeholder="Class name..."
                  className="h-7 text-xs flex-1 bg-muted/40 border-border/40"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs border-dashed border-border/60 hover:border-primary/50 hover:text-primary"
                onClick={handleAddClass}
                disabled={!newClassName.trim()}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Class
              </Button>
            </div>
          </TabsContent>

          {/* ── DATASET ─────────────────────────────────────────────────── */}
          <TabsContent
            value="dataset"
            className="flex-1 overflow-hidden m-0 flex flex-col mt-0"
          >
            <div className="px-2 py-1.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                6 images
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] px-2 border-border/60"
              >
                <Plus className="h-3 w-3 mr-1" />
                Import
              </Button>
            </div>

            {/* Progress bar */}
            <div className="px-2 pb-2 flex-shrink-0">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Progress</span>
                <span className="tabular-nums">1 / 6</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: "16.6%" }}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-0.5 pb-4">
                {DATASET_ITEMS.map((item) => {
                  const StatusIcon = STATUS_ICON[item.status];
                  const isActive = item.id === 1;
                  return (
                    <div
                      key={item.id}
                      className={`
                        group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                        transition-all text-xs border
                        ${
                          isActive
                            ? "bg-primary/10 border-primary/30"
                            : "border-transparent hover:bg-accent/60 hover:border-border/40"
                        }
                      `}
                    >
                      <div className="w-8 h-8 rounded bg-muted/60 flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/40">
                        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <StatusIcon
                            className={`h-2.5 w-2.5 ${STATUS_COLOR[item.status]}`}
                          />
                          <span className="text-[10px] text-muted-foreground/60 capitalize">
                            {item.status.replace("_", " ")}
                          </span>
                          {item.count > 0 && (
                            <span className="text-[10px] text-muted-foreground/40 ml-auto tabular-nums">
                              {item.count} ann
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
