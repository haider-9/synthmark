import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Annotation, Point, LabelClass, ActiveTool } from "../types/annotation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectImage {
  id: string;
  url: string;
  name: string;
  width: number;
  height: number;
  annotationCount: number;
  status: "todo" | "in_progress" | "completed" | "skipped";
}

interface AnnotationState {
  // Project
  projectId: string | null;

  // Annotations
  annotations: Annotation[];
  selectedAnnotationIds: string[];
  activeVertex: { annId: string; idx: number } | null;
  copiedAnnotations: Annotation[];

  // Tools
  activeTool: ActiveTool;
  activeLabelId: string | null;

  // Canvas
  zoomLevel: number;
  canvasOffset: Point;
  cursorPosition: Point;

  // History
  history: Annotation[][];
  historyIndex: number;

  // Label classes
  labelClasses: LabelClass[];

  // Images
  imageUrl: string;
  activeImageId: string | null;
  images: ProjectImage[];

  // ── Actions ──────────────────────────────────────────────────────────────

  // Project hydration
  setProjectId: (id: string) => void;
  hydrateProject: (data: {
    projectId: string;
    labelClasses: LabelClass[];
    images: ProjectImage[];
  }) => void;

  // Vertex
  setActiveVertex: (v: { annId: string; idx: number } | null) => void;
  deleteActiveVertex: () => void;

  // Annotations
  setAnnotations: (annotations: Annotation[]) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  setAnnotationsVisibility: (visible: boolean, labelId?: string) => void;
  deleteAnnotations: (ids: string[]) => void;
  duplicateAnnotations: (ids: string[]) => void;
  replaceAnnotations: (removeIds: string[], add: Annotation[]) => void;

  // Selection
  setSelectedAnnotationIds: (ids: string[]) => void;
  toggleSelectedAnnotationId: (id: string) => void;

  // Copy / paste
  copyAnnotations: (ids: string[]) => void;
  pasteAnnotations: () => void;

  // Tools
  setActiveTool: (tool: ActiveTool) => void;
  setActiveLabelId: (id: string | null) => void;

  // Canvas
  setZoomLevel: (level: number) => void;
  setCanvasOffset: (offset: Point) => void;
  setCursorPosition: (pos: Point) => void;
  setImageUrl: (url: string) => void;

  // Images
  addImage: (image: Omit<ProjectImage, "annotationCount" | "status"> & { id: string }) => void;
  removeImage: (id: string) => void;
  setActiveImage: (id: string) => void;
  updateImageStatus: (id: string, status: ProjectImage["status"]) => void;

  // Label classes
  addLabelClass: (cls: LabelClass) => void;
  updateLabelClass: (id: string, updates: Partial<LabelClass>) => void;
  deleteLabelClass: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  // ── Initial state — no hardcoded data ──────────────────────────────────────
  projectId: null,
  annotations: [],
  selectedAnnotationIds: [],
  activeVertex: null,
  copiedAnnotations: [],
  activeTool: "select",
  activeLabelId: null,
  zoomLevel: 1,
  canvasOffset: { x: 0, y: 0 },
  cursorPosition: { x: 0, y: 0 },
  history: [[]],
  historyIndex: 0,
  labelClasses: [],
  imageUrl: "",
  activeImageId: null,
  images: [],

  // ── Project ────────────────────────────────────────────────────────────────

  setProjectId: (id) => set({ projectId: id }),

  hydrateProject: ({ projectId, labelClasses, images }) => {
    const firstImage = images[0] ?? null;
    set({
      projectId,
      labelClasses,
      images,
      imageUrl: firstImage?.url ?? "",
      activeImageId: firstImage?.id ?? null,
      activeLabelId: labelClasses[0]?.id ?? null,
      // Reset editor state for fresh project load
      annotations: [],
      selectedAnnotationIds: [],
      activeVertex: null,
      history: [[]],
      historyIndex: 0,
      zoomLevel: 1,
      canvasOffset: { x: 0, y: 0 },
    });
  },

  // ── Vertex ─────────────────────────────────────────────────────────────────

  setActiveVertex: (v) => set({ activeVertex: v }),

  deleteActiveVertex: () => {
    const { activeVertex, annotations } = get();
    if (!activeVertex) return;
    const ann = annotations.find((a) => a.id === activeVertex.annId);
    if (!ann || ann.type !== "polygon") return;
    const points = (ann as import("../types/annotation").Polygon).points;
    if (points.length <= 3) return;
    const newPoints = points.filter((_, i) => i !== activeVertex.idx);
    set({
      annotations: annotations.map((a) =>
        a.id === activeVertex.annId ? { ...a, points: newPoints } : a
      ),
      activeVertex: null,
    });
    get().saveHistory();
  },

  // ── Annotations ────────────────────────────────────────────────────────────

  setAnnotations: (annotations) => set({ annotations }),

  addAnnotation: (annotation) => {
    const next = [...get().annotations, annotation];
    set({ annotations: next });
    get().saveHistory();
  },

  updateAnnotation: (id, updates) => {
    set({
      annotations: get().annotations.map((ann) =>
        ann.id === id ? ({ ...ann, ...updates } as Annotation) : ann
      ),
    });
    get().saveHistory();
  },

  setAnnotationsVisibility: (visible, labelId) => {
    const next = get().annotations.map((ann) =>
      labelId && ann.labelId !== labelId ? ann : { ...ann, isVisible: visible },
    );
    set({ annotations: next });
    get().saveHistory();
  },

  deleteAnnotations: (ids) => {
    set({
      annotations: get().annotations.filter((ann) => !ids.includes(ann.id)),
      selectedAnnotationIds: get().selectedAnnotationIds.filter((id) => !ids.includes(id)),
    });
    get().saveHistory();
  },

  duplicateAnnotations: (ids) => {
    const toDuplicate = get().annotations.filter((a) => ids.includes(a.id));
    const dupes = toDuplicate.map((a) => ({ ...a, id: uuidv4() }));
    set({
      annotations: [...get().annotations, ...dupes],
      selectedAnnotationIds: dupes.map((d) => d.id),
    });
    get().saveHistory();
  },

  replaceAnnotations: (removeIds, add) => {
    const kept = get().annotations.filter((a) => !removeIds.includes(a.id));
    set({
      annotations: [...kept, ...add],
      selectedAnnotationIds: add.map((a) => a.id),
    });
    get().saveHistory();
  },

  // ── Selection ──────────────────────────────────────────────────────────────

  setSelectedAnnotationIds: (ids) => set({ selectedAnnotationIds: ids }),

  toggleSelectedAnnotationId: (id) => {
    const { selectedAnnotationIds } = get();
    set({
      selectedAnnotationIds: selectedAnnotationIds.includes(id)
        ? selectedAnnotationIds.filter((s) => s !== id)
        : [...selectedAnnotationIds, id],
    });
  },

  // ── Copy / paste ───────────────────────────────────────────────────────────

  copyAnnotations: (ids) => {
    const toCopy = get().annotations.filter((a) => ids.includes(a.id));
    set({ copiedAnnotations: toCopy });
  },

  pasteAnnotations: () => {
    const { copiedAnnotations, annotations } = get();
    if (copiedAnnotations.length === 0) return;
    const OFFSET = 20;
    const pasted = copiedAnnotations.map((a) => {
      const n = { ...a, id: uuidv4(), isVisible: true };
      if (n.type === "box")      return { ...n, x: n.x + OFFSET, y: n.y + OFFSET };
      if (n.type === "circle")   return { ...n, x: n.x + OFFSET, y: n.y + OFFSET };
      if (n.type === "polygon")  return { ...n, points: n.points.map((p) => ({ x: p.x + OFFSET, y: p.y + OFFSET })) };
      if (n.type === "keypoint") return { ...n, point: { x: n.point.x + OFFSET, y: n.point.y + OFFSET } };
      return n;
    });
    set({
      annotations: [...annotations, ...pasted],
      selectedAnnotationIds: pasted.map((a) => a.id),
    });
    get().saveHistory();
  },

  // ── Tools ──────────────────────────────────────────────────────────────────

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveLabelId: (id) => set({ activeLabelId: id }),

  // ── Canvas ─────────────────────────────────────────────────────────────────

  setZoomLevel: (level) => set({ zoomLevel: Math.max(0.05, Math.min(40, level)) }),
  setCanvasOffset: (offset) => set({ canvasOffset: offset }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setImageUrl: (url) => set({ imageUrl: url }),

  // ── Images ─────────────────────────────────────────────────────────────────

  addImage: (imageData) => {
    const newImage: ProjectImage = { ...imageData, annotationCount: 0, status: "todo" };
    set((state) => ({ images: [...state.images, newImage] }));
    // Auto-switch to the new image
    get().setActiveImage(newImage.id);
  },

  removeImage: (id) => {
    const { images, activeImageId } = get();
    const remaining = images.filter((img) => img.id !== id);
    const updates: Partial<AnnotationState> = { images: remaining };
    if (activeImageId === id && remaining.length > 0) {
      updates.imageUrl = remaining[0].url;
      updates.activeImageId = remaining[0].id;
      updates.annotations = [];
      updates.history = [[]];
      updates.historyIndex = 0;
    } else if (remaining.length === 0) {
      updates.imageUrl = "";
      updates.activeImageId = null;
    }
    set(updates as AnnotationState);
  },

  setActiveImage: (id) => {
    const img = get().images.find((i) => i.id === id);
    if (!img) return;
    set({
      activeImageId: id,
      imageUrl: img.url,
      canvasOffset: { x: 0, y: 0 },
      zoomLevel: 1,
      selectedAnnotationIds: [],
      activeVertex: null,
      // Clear annotations — in a real app you'd load per-image annotations here
      annotations: [],
      history: [[]],
      historyIndex: 0,
    });
  },

  updateImageStatus: (id, status) => {
    set((state) => ({
      images: state.images.map((img) => img.id === id ? { ...img, status } : img),
    }));
  },

  // ── Label classes ──────────────────────────────────────────────────────────

  addLabelClass: (cls) =>
    set((state) => ({ labelClasses: [...state.labelClasses, cls] })),

  updateLabelClass: (id, updates) =>
    set((state) => ({
      labelClasses: state.labelClasses.map((c) => c.id === id ? { ...c, ...updates } : c),
    })),

  deleteLabelClass: (id) =>
    set((state) => ({
      labelClasses: state.labelClasses.filter((c) => c.id !== id),
    })),

  // ── History ────────────────────────────────────────────────────────────────

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
      set({ annotations: [...history[historyIndex - 1]], historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ annotations: [...history[historyIndex + 1]], historyIndex: historyIndex + 1 });
    }
  },
}));
