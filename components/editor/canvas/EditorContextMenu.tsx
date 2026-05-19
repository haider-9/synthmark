"use client";

import React from "react";
import {
  Clipboard,
  CheckCircle2,
  Copy,
  Eraser,
  Eye,
  EyeOff,
  Hand,
  Hexagon,
  Layers2,
  Lock,
  Merge,
  MousePointer2,
  Pencil,
  Redo2,
  Search,
  Save,
  Square,
  Trash2,
  Undo2,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut,
  CircleIcon,
  Dot,
  FileDown,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import type { ActiveTool } from "@/types/annotation";
import { EDITOR_EVENTS, dispatchEditorEvent } from "@/lib/editor-events";

const TOOL_OPTIONS: Array<{
  value: ActiveTool;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
}> = [
  { value: "select", label: "Select", shortcut: "V", icon: MousePointer2 },
  { value: "pan", label: "Pan", shortcut: "Space", icon: Hand },
  { value: "box", label: "Box", shortcut: "B", icon: Square },
  { value: "polygon", label: "Polygon", shortcut: "P", icon: Hexagon },
  { value: "lasso", label: "Lasso", shortcut: "L", icon: Pencil },
  { value: "circle", label: "Circle", shortcut: "C", icon: CircleIcon },
  { value: "keypoint", label: "Keypoint", shortcut: "K", icon: Dot },
  { value: "erase", label: "Subtract", shortcut: "E", icon: Eraser },
  { value: "merge", label: "Merge", shortcut: "M", icon: Merge },
];

export function EditorContextMenu({ children }: { children: React.ReactNode }) {
  const annotations = useAnnotationStore((s) => s.annotations);
  const selectedAnnotationIds = useAnnotationStore((s) => s.selectedAnnotationIds);
  const copiedAnnotations = useAnnotationStore((s) => s.copiedAnnotations);
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
  const labelClasses = useAnnotationStore((s) => s.labelClasses);
  const images = useAnnotationStore((s) => s.images);
  const activeImageId = useAnnotationStore((s) => s.activeImageId);
  const zoomLevel = useAnnotationStore((s) => s.zoomLevel);
  const setZoomLevel = useAnnotationStore((s) => s.setZoomLevel);
  const undo = useAnnotationStore((s) => s.undo);
  const redo = useAnnotationStore((s) => s.redo);
  const history = useAnnotationStore((s) => s.history);
  const historyIndex = useAnnotationStore((s) => s.historyIndex);
  const savedAnnotationsSnapshot = useAnnotationStore(
    (s) => s.savedAnnotationsSnapshot,
  );
  const copyAnnotations = useAnnotationStore((s) => s.copyAnnotations);
  const pasteAnnotations = useAnnotationStore((s) => s.pasteAnnotations);
  const duplicateAnnotations = useAnnotationStore((s) => s.duplicateAnnotations);
  const overlayAnnotations = useAnnotationStore((s) => s.overlayAnnotations);
  const deleteAnnotations = useAnnotationStore((s) => s.deleteAnnotations);
  const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);

  const selectedAnnotations = annotations.filter((ann) =>
    selectedAnnotationIds.includes(ann.id),
  );
  const selectionCount = selectedAnnotationIds.length;
  const hasSelection = selectionCount > 0;
  const canOverlaySelection =
    hasSelection && selectedAnnotations.every((ann) => ann.type === "polygon");
  const activeImage = images.find((image) => image.id === activeImageId);
  const canPaste = copiedAnnotations.length > 0;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasUnsavedChanges =
    JSON.stringify(annotations) !== savedAnnotationsSnapshot;
  const allSelectedLocked =
    hasSelection && selectedAnnotations.every((ann) => ann.isLocked);
  const allSelectedHidden =
    hasSelection && selectedAnnotations.every((ann) => !ann.isVisible);
  const firstSelectedLabelId = selectedAnnotations[0]?.labelId ?? "";

  const setSelectedLock = (isLocked: boolean) => {
    selectedAnnotationIds.forEach((id) => updateAnnotation(id, { isLocked }));
  };

  const setSelectedVisibility = (isVisible: boolean) => {
    selectedAnnotationIds.forEach((id) => updateAnnotation(id, { isVisible }));
  };

  const setSelectedLabel = (labelId: string) => {
    selectedAnnotationIds.forEach((id) => updateAnnotation(id, { labelId }));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-56 rounded-md p-1.5">
        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
          {hasSelection
            ? `${selectionCount} selected`
            : "Canvas options"}
        </div>

        <ContextMenuItem onClick={undo} disabled={!canUndo}>
          <Undo2 />
          Undo
          <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={redo} disabled={!canRedo}>
          <Redo2 />
          Redo
          <ContextMenuShortcut>Ctrl+Shift+Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => dispatchEditorEvent(EDITOR_EVENTS.save)}
          disabled={!hasUnsavedChanges}
        >
          <Save />
          Save
          <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => dispatchEditorEvent(EDITOR_EVENTS.complete)}
          disabled={!activeImageId || activeImage?.status === "completed"}
        >
          <CheckCircle2 />
          Complete image
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Upload />
            Import
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="min-w-56">
            <ContextMenuItem
              onClick={() => dispatchEditorEvent(EDITOR_EVENTS.extractFromNxus)}
            >
              <FileDown />
              Extract polygons from NXUS
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => dispatchEditorEvent(EDITOR_EVENTS.importFromNxus)}
            >
              <Upload />
              Paste NXUS / Label Studio JSON
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem
          onClick={() => dispatchEditorEvent(EDITOR_EVENTS.copyForNxus)}
        >
          <Clipboard />
          Copy for NXUS / Label Studio
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => copyAnnotations(selectedAnnotationIds)}
          disabled={!hasSelection}
        >
          <Copy />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={pasteAnnotations} disabled={!canPaste}>
          <Clipboard />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => duplicateAnnotations(selectedAnnotationIds)}
          disabled={!hasSelection}
        >
          <Copy />
          Duplicate
          <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => overlayAnnotations(selectedAnnotationIds)}
          disabled={!canOverlaySelection}
        >
          <Layers2 />
          Overlay as active class
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onClick={() => deleteAnnotations(selectedAnnotationIds)}
          disabled={!hasSelection}
        >
          <Trash2 />
          Delete
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <MousePointer2 />
            Switch tool
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="min-w-44">
            <ContextMenuRadioGroup
              value={activeTool}
              onValueChange={(value) => setActiveTool(value as ActiveTool)}
            >
              {TOOL_OPTIONS.map(({ value, label, shortcut, icon: Icon }) => (
                <ContextMenuRadioItem key={value} value={value} closeOnClick>
                  <Icon />
                  {label}
                  {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!hasSelection || labelClasses.length === 0}>
            <Search />
            Assign class
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="min-w-44">
            <ContextMenuRadioGroup
              value={firstSelectedLabelId}
              onValueChange={(value) => setSelectedLabel(String(value))}
            >
              {labelClasses.map((label) => (
                <ContextMenuRadioItem key={label.id} value={label.id} closeOnClick>
                  <span
                    className="size-2.5 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="truncate">{label.name}</span>
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem
          onClick={() => setSelectedLock(!allSelectedLocked)}
          disabled={!hasSelection}
        >
          {allSelectedLocked ? <Unlock /> : <Lock />}
          {allSelectedLocked ? "Unlock selection" : "Lock selection"}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => setSelectedVisibility(allSelectedHidden)}
          disabled={!hasSelection}
        >
          {allSelectedHidden ? <Eye /> : <EyeOff />}
          {allSelectedHidden ? "Show selection" : "Hide selection"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => setZoomLevel(zoomLevel * 1.25)}>
          <ZoomIn />
          Zoom in
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setZoomLevel(zoomLevel / 1.25)}>
          <ZoomOut />
          Zoom out
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setZoomLevel(1)}>
          <Search />
          Reset zoom
          <ContextMenuShortcut>{Math.round(zoomLevel * 100)}%</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
