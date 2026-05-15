import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Annotation, Point, LabelClass, ActiveTool } from "../types/annotation";

export interface ProjectImage {
  id: string;
  url: string;
  name: string;
  width: number;
  height: number;
  annotationCount: number;
  status: "todo" | "in_progress" | "completed";
}

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
  imageUrl: string;
  activeImageId: string | null;
  images: ProjectImage[];
  copiedAnnotations: Annotation[];

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
  cursorPosition: Point;
  setCursorPosition: (pos: Point) => void;
  setImageUrl: (url: string) => void;
  addImage: (image: Omit<ProjectImage, "id" | "annotationCount" | "status">) => void;
  removeImage: (id: string) => void;
  setActiveImage: (id: string) => void;
  copyAnnotations: (ids: string[]) => void;
  pasteAnnotations: () => void;

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
  { id: "cls-bottom_bun", name: "bottom_bun", color: "#eab308", shortcut: "s" },
  { id: "cls-cheese_slice", name: "cheese_slice", color: "#bef264", shortcut: "d" },
  { id: "cls-patty", name: "patty", color: "#22c55e", shortcut: "f" },
  { id: "cls-tomato_slice", name: "tomato_slice", color: "#06b6d4", shortcut: "g" },
  { id: "cls-lettuce_leaf", name: "lettuce_leaf", color: "#bfdbfe", shortcut: "z" },
  { id: "cls-top_bun", name: "top_bun", color: "#a855f7", shortcut: "x" },
  { id: "cls-lettuce_container", name: "lettuce_container", color: "#ec4899", shortcut: "c" },
  { id: "cls-tomato_container", name: "tomato_container", color: "#f43f5e", shortcut: "[" },
  { id: "cls-cheese_rack", name: "cheese_rack", color: "#f97316", shortcut: "b" },
  { id: "cls-patty_rack", name: "patty_rack", color: "#facc15", shortcut: "y" },
  { id: "cls-burger_box", name: "burger_box", color: "#84cc16", shortcut: "]" },
  { id: "cls-onion_container", name: "onion_container", color: "#eab308", shortcut: "o" },
  { id: "cls-bun_container", name: "bun_container", color: "#a3e635", shortcut: "p" },
  { id: "cls-onion_slice", name: "onion_slice", color: "#4ade80", shortcut: "j" },
  { id: "cls-lettuce_zone", name: "Lettuce Zone", color: "#ec4899", shortcut: "m" },
  { id: "cls-onion_zone", name: "Onion Zone", color: "#3b82f6", shortcut: "h" },
];

const DEFAULT_IMAGE_ID = "img-default";

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  selectedAnnotationIds: [],
  activeVertex: null,
  activeTool: "select",
  activeLabelId: "cls-bottom_bun",
  zoomLevel: 1,
  canvasOffset: { x: 0, y: 0 },
  history: [[]],
  historyIndex: 0,
  labelClasses: DEFAULT_CLASSES,
  cursorPosition: { x: 0, y: 0 },
  imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=2000",
  activeImageId: DEFAULT_IMAGE_ID,
  images: [
    {
      id: DEFAULT_IMAGE_ID,
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=2000",
      name: "burger_sample_01.jpg",
      width: 2000,
      height: 1333,
      annotationCount: 0,
      status: "todo",
    },
  ],
  copiedAnnotations: [],

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
  setImageUrl: (url) => set({ imageUrl: url }),

  addImage: (imageData) => {
    const newImage: ProjectImage = {
      ...imageData,
      id: uuidv4(),
      annotationCount: 0,
      status: "todo",
    };
    set((state) => ({ images: [...state.images, newImage] }));
    // Auto-switch to the newly added image
    get().setActiveImage(newImage.id);
  },

  removeImage: (id) => {
    const { images, activeImageId } = get();
    const remaining = images.filter((img) => img.id !== id);
    const updates: Partial<AnnotationState> = { images: remaining };
    // If we removed the active image, switch to the first remaining one
    if (activeImageId === id && remaining.length > 0) {
      updates.imageUrl = remaining[0].url;
      updates.activeImageId = remaining[0].id;
      updates.annotations = [];
      updates.history = [[]];
      updates.historyIndex = 0;
    }
    set(updates as any);
  },

  setActiveImage: (id) => {
    const { images } = get();
    const img = images.find((i) => i.id === id);
    if (!img) return;
    set({
      activeImageId: id,
      imageUrl: img.url,
      // Reset canvas position when switching images
      canvasOffset: { x: 0, y: 0 },
      zoomLevel: 1,
      selectedAnnotationIds: [],
      activeVertex: null,
    });
  },

  copyAnnotations: (ids) => {
    const { annotations } = get();
    const toCopy = annotations.filter((a) => ids.includes(a.id));
    set({ copiedAnnotations: toCopy });
  },

  pasteAnnotations: () => {
    const { copiedAnnotations, annotations } = get();
    if (copiedAnnotations.length === 0) return;
    
    const offset = 20; // Paste with slight offset
    const pasted = copiedAnnotations.map((a) => {
      const newAnn = { ...a, id: uuidv4() };
      if (newAnn.type === 'box') {
        return { ...newAnn, x: newAnn.x + offset, y: newAnn.y + offset };
      } else if (newAnn.type === 'polygon') {
        return {
          ...newAnn,
          points: newAnn.points.map((p) => ({ x: p.x + offset, y: p.y + offset })),
        };
      } else if (newAnn.type === 'keypoint') {
        return {
          ...newAnn,
          point: { x: newAnn.point.x + offset, y: newAnn.point.y + offset },
        };
      } else if (newAnn.type === 'circle') {
        return { ...newAnn, x: newAnn.x + offset, y: newAnn.y + offset };
      }
      return newAnn;
    });
    
    set({
      annotations: [...annotations, ...pasted],
      selectedAnnotationIds: pasted.map((a) => a.id),
    });
    get().saveHistory();
  },

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
