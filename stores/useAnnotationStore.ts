import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Annotation, Point, LabelClass, ActiveTool } from "../types/annotation";

interface AnnotationState {
  annotations: Annotation[];
  selectedAnnotationIds: string[];
  /** The single vertex currently focused for keyboard-delete. */
  activeVertex: { annId: string; idx: number } | null;
  activeTool: ActiveTool;
  activeLabelId: string | null;
  zoomLevel: number;
  canvasOffset: Point;
  history: Annotation[][];
  historyIndex: number;
  labelClasses: LabelClass[];
  cursorPosition: Point;

  // Actions
  setActiveVertex: (v: { annId: string; idx: number } | null) => void;
  deleteActiveVertex: () => void;
  setAnnotations: (annotations: Annotation[]) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotations: (ids: string[]) => void;
  duplicateAnnotations: (ids: string[]) => void;
  /** Atomic: remove ids and add replacements in a single state update + one history entry */
  replaceAnnotations: (removeIds: string[], add: Annotation[]) => void;
  setSelectedAnnotationIds: (ids: string[]) => void;
  toggleSelectedAnnotationId: (id: string) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setActiveLabelId: (id: string | null) => void;
  setZoomLevel: (level: number) => void;
  setCanvasOffset: (offset: Point) => void;
  setCursorPosition: (pos: Point) => void;

  // Label class management
  addLabelClass: (cls: LabelClass) => void;
  updateLabelClass: (id: string, updates: Partial<LabelClass>) => void;
  deleteLabelClass: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

const DEFAULT_CLASSES: LabelClass[] = [
  { id: "cls-1", name: "Object", color: "#3b82f6" },
  { id: "cls-2", name: "Person", color: "#10b981" },
  { id: "cls-3", name: "Vehicle", color: "#f59e0b" },
  { id: "cls-4", name: "Background", color: "#8b5cf6" },
];

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  selectedAnnotationIds: [],
  activeVertex: null,
  activeTool: "select",
  activeLabelId: "cls-1",
  zoomLevel: 1,
  canvasOffset: { x: 0, y: 0 },
  history: [[]],
  historyIndex: 0,
  labelClasses: DEFAULT_CLASSES,
  cursorPosition: { x: 0, y: 0 },

  setActiveVertex: (v) => set({ activeVertex: v }),

  deleteActiveVertex: () => {
    const { activeVertex, annotations } = get();
    if (!activeVertex) return;
    const ann = annotations.find((a) => a.id === activeVertex.annId);
    if (!ann || ann.type !== "polygon") return;
    const points = (ann as import("../types/annotation").Polygon).points;
    // Never drop below 3 vertices — a polygon needs at least a triangle
    if (points.length <= 3) return;
    const newPoints = points.filter((_, i) => i !== activeVertex.idx);
    const newAnnotations = annotations.map((a) =>
      a.id === activeVertex.annId ? { ...a, points: newPoints } : a,
    );
    set({ annotations: newAnnotations, activeVertex: null });
    get().saveHistory();
  },

  setAnnotations: (annotations) => set({ annotations }),

  addAnnotation: (annotation) => {
    const { annotations } = get();
    const newAnnotations = [...annotations, annotation];
    set({ annotations: newAnnotations });
    get().saveHistory();
  },

  updateAnnotation: (id, updates) => {
    const { annotations } = get();
    const newAnnotations = annotations.map((ann) =>
      ann.id === id ? ({ ...ann, ...updates } as Annotation) : ann,
    );
    set({ annotations: newAnnotations });
    get().saveHistory();
  },

  deleteAnnotations: (ids) => {
    const { annotations } = get();
    const newAnnotations = annotations.filter((ann) => !ids.includes(ann.id));
    set({
      annotations: newAnnotations,
      selectedAnnotationIds: get().selectedAnnotationIds.filter(
        (id) => !ids.includes(id),
      ),
    });
    get().saveHistory();
  },

  duplicateAnnotations: (ids) => {
    const { annotations } = get();
    const toDuplicate = annotations.filter((a) => ids.includes(a.id));
    const dupes = toDuplicate.map((a) => ({ ...a, id: uuidv4() }));
    const newAnnotations = [...annotations, ...dupes];
    set({
      annotations: newAnnotations,
      selectedAnnotationIds: dupes.map((d) => d.id),
    });
    get().saveHistory();
  },

  replaceAnnotations: (removeIds, add) => {
    const { annotations } = get();
    const kept = annotations.filter((a) => !removeIds.includes(a.id));
    const next = [...kept, ...add];
    set({
      annotations: next,
      selectedAnnotationIds: add.map((a) => a.id),
    });
    get().saveHistory();
  },

  setSelectedAnnotationIds: (ids) => set({ selectedAnnotationIds: ids }),

  toggleSelectedAnnotationId: (id) => {
    const { selectedAnnotationIds } = get();
    if (selectedAnnotationIds.includes(id)) {
      set({
        selectedAnnotationIds: selectedAnnotationIds.filter((s) => s !== id),
      });
    } else {
      set({ selectedAnnotationIds: [...selectedAnnotationIds, id] });
    }
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveLabelId: (id) => set({ activeLabelId: id }),
  setZoomLevel: (level) =>
    set({ zoomLevel: Math.max(0.05, Math.min(40, level)) }),
  setCanvasOffset: (offset) => set({ canvasOffset: offset }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),

  addLabelClass: (cls) =>
    set((state) => ({ labelClasses: [...state.labelClasses, cls] })),
  updateLabelClass: (id, updates) =>
    set((state) => ({
      labelClasses: state.labelClasses.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),
  deleteLabelClass: (id) =>
    set((state) => ({
      labelClasses: state.labelClasses.filter((c) => c.id !== id),
    })),

  saveHistory: () => {
    const { annotations, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...annotations]);
    if (newHistory.length > 50) {
      newHistory.shift();
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    } else {
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({ annotations: [...history[prevIndex]], historyIndex: prevIndex });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({ annotations: [...history[nextIndex]], historyIndex: nextIndex });
    }
  },
}));
