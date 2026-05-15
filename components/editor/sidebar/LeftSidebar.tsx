"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
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
  ImageIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Trash2,
  Images,
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
import { toast } from "sonner";

const TYPE_ICON: Record<string, React.ElementType> = {
  box: Square,
  polygon: Hexagon,
  keypoint: Circle,
  line: Minus,
};

const TYPE_COLOR: Record<string, string> = {
  box: "text-blue-400",
  polygon: "text-emerald-400",
  keypoint: "text-amber-400",
  line: "text-purple-400",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  in_progress: Clock,
  todo: AlertCircle,
};
const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-400",
  in_progress: "text-amber-400",
  todo: "text-muted-foreground/40",
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

  return (
    <div
      onClick={onSelect}
      className={`
        group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer
        transition-all duration-150 text-[11px] font-medium
        ${
          isSelected
            ? "bg-primary/10 text-foreground shadow-[inset_0_0_0_1px_rgba(79,142,247,0.2)]"
            : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
        }
      `}
    >
      <div className={`p-1 rounded-md ${isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground/60 group-hover:text-muted-foreground"}`}>
        <Icon className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="truncate">{labelName}</span>
        <span className="text-[9px] opacity-20 font-mono">{ann.id.slice(0, 4)}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className={`flex items-center gap-0.5 flex-shrink-0 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          {ann.isVisible ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5 opacity-30" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
          className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          {ann.isLocked ? <Lock className="h-2.5 w-2.5 opacity-50" /> : <Unlock className="h-2.5 w-2.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Image thumbnail card ─────────────────────────────────────────────────────
function ImageCard({
  image,
  isActive,
  onSelect,
  onRemove,
}: {
  image: { id: string; url: string; name: string; annotationCount: number; status: string };
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const StatusIcon = STATUS_ICON[image.status] ?? AlertCircle;

  return (
    <div
      onClick={onSelect}
      className={`
        group relative rounded-lg overflow-hidden cursor-pointer border transition-all duration-150
        ${isActive
          ? "border-primary/60 ring-1 ring-primary/30 shadow-lg shadow-primary/10"
          : "border-border/30 hover:border-border/60"
        }
      `}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-muted/40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {/* Active overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-primary/40 rounded-lg pointer-events-none" />
        )}
        {/* Annotation count badge */}
        {image.annotationCount > 0 && (
          <div className="absolute top-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {image.annotationCount}
          </div>
        )}
        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-red-500/80 text-white p-1 rounded-md backdrop-blur-sm"
          title="Remove image"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Footer */}
      <div className={`px-2 py-1.5 flex items-center gap-1.5 ${isActive ? "bg-primary/5" : "bg-muted/20"}`}>
        <StatusIcon className={`h-2.5 w-2.5 flex-shrink-0 ${STATUS_COLOR[image.status]}`} />
        <span className="text-[10px] font-medium truncate flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
          {image.name}
        </span>
        {isActive && (
          <span className="text-[9px] text-primary font-bold uppercase tracking-wide flex-shrink-0">
            Active
          </span>
        )}
      </div>
    </div>
  );
}

export function LeftSidebar() {
  const annotations = useAnnotationStore((s) => s.annotations);
  const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
  const selectedAnnotationIds = useAnnotationStore((s) => s.selectedAnnotationIds);
  const setSelectedAnnotationIds = useAnnotationStore((s) => s.setSelectedAnnotationIds);
  const toggleSelectedAnnotationId = useAnnotationStore((s) => s.toggleSelectedAnnotationId);
  const labelClasses = useAnnotationStore((s) => s.labelClasses);
  const addLabelClass = useAnnotationStore((s) => s.addLabelClass);
  const updateLabelClass = useAnnotationStore((s) => s.updateLabelClass);
  const deleteLabelClass = useAnnotationStore((s) => s.deleteLabelClass);
  const activeLabelId = useAnnotationStore((s) => s.activeLabelId);
  const setActiveLabelId = useAnnotationStore((s) => s.setActiveLabelId);
  const images = useAnnotationStore((s) => s.images);
  const activeImageId = useAnnotationStore((s) => s.activeImageId);
  const addImage = useAnnotationStore((s) => s.addImage);
  const removeImage = useAnnotationStore((s) => s.removeImage);
  const setActiveImage = useAnnotationStore((s) => s.setActiveImage);

  const [newClassName, setNewClassName] = useState("");
  const [newClassColor, setNewClassColor] = useState("#6366f1");
  const [filterText, setFilterText] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labelColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of labelClasses) map.set(c.id, c.color);
    return map;
  }, [labelClasses]);
  const labelNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of labelClasses) map.set(c.id, c.name);
    return map;
  }, [labelClasses]);
  const getColor = (labelId: string) => labelColorMap.get(labelId) ?? "#6366f1";
  const getName = (labelId: string) => labelNameMap.get(labelId) ?? "Unknown";

  const filtered = useMemo(
    () =>
      filterText
        ? annotations.filter((a) => {
            const name = labelNameMap.get(a.labelId) ?? "Unknown";
            return (
              a.type.includes(filterText.toLowerCase()) ||
              name.toLowerCase().includes(filterText.toLowerCase()) ||
              a.id.toLowerCase().includes(filterText.toLowerCase())
            );
          })
        : annotations,
    [annotations, filterText, labelNameMap],
  );

  const typeCounts = useMemo(
    () =>
      annotations.reduce(
        (acc, a) => {
          acc[a.type] = (acc[a.type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [annotations],
  );

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    addLabelClass({ id: uuidv4(), name: newClassName.trim(), color: newClassColor });
    setNewClassName("");
  };

  const handleSelect = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) toggleSelectedAnnotationId(id);
    else setSelectedAnnotationIds([id]);
  };

  // Image upload handler
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select image files only");
      return;
    }
    imageFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        addImage({
          url,
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        toast.success(`Added "${file.name}"`);
      };
      img.src = url;
    });
  }, [addImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const completedCount = images.filter((i) => i.status === "completed").length;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        <Tabs defaultValue="images" className="flex flex-col h-full">
          {/* Tab bar */}
          <div className="px-2 pt-1.5 pb-0 flex-shrink-0">
            <TabsList className="w-full h-7 grid grid-cols-4 bg-muted/50 p-0.5 rounded-md">
              <TabsTrigger
                value="images"
                className="text-[10px] h-6 rounded-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Images className="h-3 w-3 mr-1" />
                Images
              </TabsTrigger>
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

          {/* ── IMAGES ──────────────────────────────────────────────────── */}
          <TabsContent value="images" className="flex-1 overflow-hidden m-0 flex flex-col mt-0">
            {/* Header */}
            <div className="px-2 py-1.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {images.length} image{images.length !== 1 ? "s" : ""}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] px-2 border-border/60 hover:border-primary/50 hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Progress bar */}
            {images.length > 0 && (
              <div className="px-2 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Annotated</span>
                  <span className="tabular-nums">{completedCount} / {images.length}</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: images.length > 0 ? `${(completedCount / images.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            )}

            {/* Drop zone + grid */}
            <ScrollArea className="flex-1 px-2">
              {/* Drag-and-drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                className={`
                  mb-2 rounded-lg border-2 border-dashed transition-all duration-150 flex flex-col items-center justify-center gap-1.5 py-4 cursor-pointer
                  ${isDraggingOver
                    ? "border-primary/60 bg-primary/5 text-primary"
                    : "border-border/30 hover:border-border/60 text-muted-foreground/50 hover:text-muted-foreground"
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5" />
                <span className="text-[10px] font-medium">Drop images or click to upload</span>
                <span className="text-[9px] opacity-60">PNG, JPG, WEBP supported</span>
              </div>

              {/* Image grid */}
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground/60">No images yet</p>
                  <p className="text-[10px] text-muted-foreground/40">Upload images to start annotating</p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {images.map((img) => (
                    <ImageCard
                      key={img.id}
                      image={img}
                      isActive={activeImageId === img.id}
                      onSelect={() => setActiveImage(img.id)}
                      onRemove={() => {
                        if (images.length === 1) {
                          toast.error("Cannot remove the last image");
                          return;
                        }
                        removeImage(img.id);
                        toast.success(`Removed "${img.name}"`);
                      }}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ── LAYERS ──────────────────────────────────────────────────── */}
          <TabsContent value="layers" className="flex-1 overflow-hidden m-0 flex flex-col mt-0 pt-0">
            {annotations.length > 0 && (
              <div className="px-2 py-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const Icon = TYPE_ICON[type] ?? Square;
                  return (
                    <div key={type} className="flex items-center gap-1 bg-muted/60 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground">
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
                      {annotations.length === 0 ? "No annotations yet" : "No matches"}
                    </p>
                    {annotations.length === 0 && (
                      <p className="text-[10px] text-muted-foreground/40">Use the toolbar to start annotating</p>
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
                      onToggleVisibility={() => updateAnnotation(ann.id, { isVisible: !ann.isVisible })}
                      onToggleLock={() => updateAnnotation(ann.id, { isLocked: !ann.isLocked })}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── CLASSES ─────────────────────────────────────────────────── */}
          <TabsContent value="classes" className="flex-1 overflow-hidden m-0 flex flex-col mt-0">
            <div className="px-2 py-1.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {labelClasses.length} classes
              </span>
            </div>
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-0.5 pb-2">
                {labelClasses.map((cls) => {
                  const isActive = activeLabelId === cls.id;
                  const count = annotations.filter((a) => a.labelId === cls.id).length;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        setActiveLabelId(cls.id);
                        if (selectedAnnotationIds.length > 0) {
                          selectedAnnotationIds.forEach((id) => updateAnnotation(id, { labelId: cls.id }));
                        }
                      }}
                      className={`
                        group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                        transition-all text-xs border
                        ${isActive ? "bg-primary/10 border-primary/30" : "border-transparent hover:bg-accent/60 hover:border-border/40"}
                      `}
                    >
                      <input
                        type="color"
                        value={cls.color}
                        onChange={(e) => { e.stopPropagation(); updateLabelClass(cls.id, { color: e.target.value }); }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                        title="Change color"
                      />
                      <span className="flex-1 truncate font-medium">{cls.name}</span>
                      {count > 0 && (
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums">{count}</span>
                      )}
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLabelClass(cls.id); }}
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
          <TabsContent value="dataset" className="flex-1 overflow-hidden m-0 flex flex-col mt-0">
            <div className="px-2 py-1.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {images.length} images
              </span>
            </div>
            <div className="px-2 pb-2 flex-shrink-0">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Progress</span>
                <span className="tabular-nums">{completedCount} / {images.length}</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: images.length > 0 ? `${(completedCount / images.length) * 100}%` : "0%" }}
                />
              </div>
            </div>
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-0.5 pb-4">
                {images.map((item) => {
                  const StatusIcon = STATUS_ICON[item.status] ?? AlertCircle;
                  const isActive = activeImageId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveImage(item.id)}
                      className={`
                        group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                        transition-all text-xs border
                        ${isActive ? "bg-primary/10 border-primary/30" : "border-transparent hover:bg-accent/60 hover:border-border/40"}
                      `}
                    >
                      <div className="w-8 h-8 rounded bg-muted/60 flex-shrink-0 overflow-hidden border border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <StatusIcon className={`h-2.5 w-2.5 ${STATUS_COLOR[item.status]}`} />
                          <span className="text-[10px] text-muted-foreground/60 capitalize">
                            {item.status.replace("_", " ")}
                          </span>
                          {item.annotationCount > 0 && (
                            <span className="text-[10px] text-muted-foreground/40 ml-auto tabular-nums">
                              {item.annotationCount} ann
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
