"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Line,
  Circle,
  Group,
  Transformer,
  RegularPolygon,
  Text,
} from "react-konva";
import Konva from "konva";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { useCanvasInteractions } from "@/hooks/useCanvasInteractions";
import { usePolygonOps } from "@/hooks/usePolygonOps";
import {
  BoundingBox,
  Polygon,
  Keypoint,
  Point,
  CircleAnnotation as CircleAnnotationType,
  Annotation,
} from "@/types/annotation";
import { v4 as uuidv4 } from "uuid";

// ─── Constants ────────────────────────────────────────────────────────────────
const TOOL_CURSORS: Record<string, string> = {
  select: "default",
  pan: "grab",
  box: "crosshair",
  polygon: "crosshair",
  lasso: "crosshair",
  circle: "crosshair",
  keypoint: "crosshair",
  erase: "cell",
  merge: "copy",
  line: "crosshair",
};
const SNAP_RADIUS = 10;
const DBL_CLICK_MS = 300;
const MOUSE_MOVE_THROTTLE = 16; // ~60fps
const LASSO_MIN_DIST = 8; // Minimum distance between lasso points
const AUTOSAVE_DELAY = 100; // Auto-save after 100ms of inactivity

// ─── Utility Functions ────────────────────────────────────────────────────────
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ─── Diamond Vertex Component ─────────────────────────────────────────────────
const DiamondVertex = React.memo(function DiamondVertex({
  x,
  y,
  color,
  zoom,
  draggable,
  onDragMove,
  onClick,
}: {
  x: number;
  y: number;
  color: string;
  zoom: number;
  draggable?: boolean;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}) {
  const r = 5.5 / zoom;
  return (
    <RegularPolygon
      x={x}
      y={y}
      sides={4}
      radius={r}
      rotation={45}
      fill={color}
      stroke="rgba(0,0,0,0.6)"
      strokeWidth={1 / zoom}
      shadowColor="rgba(0,0,0,0.7)"
      shadowBlur={5 / zoom}
      shadowOpacity={1}
      draggable={draggable}
      onDragMove={onDragMove}
      onClick={onClick}
      perfectDrawEnabled={false}
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
});

// ─── Edge Midpoint Component ──────────────────────────────────────────────────
const EdgeMidpoint = React.memo(function EdgeMidpoint({
  x,
  y,
  color,
  zoom,
  onClick,
}: {
  x: number;
  y: number;
  color: string;
  zoom: number;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}) {
  return (
    <Circle
      x={x}
      y={y}
      radius={3 / zoom}
      fill="rgba(255,255,255,0.85)"
      stroke={color}
      strokeWidth={1.2 / zoom}
      opacity={0.8}
      onClick={(e) => {
        e.cancelBubble = true;
        onClick(e);
      }}
      perfectDrawEnabled={false}
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.arc(0, 0, 9 / zoom, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
});

// ─── Polygon Annotation Component ─────────────────────────────────────────────
const PolygonAnnotation = React.memo(function PolygonAnnotation({
  ann,
  isSelected,
  color,
  labelName,
  zoom,
  onSelect,
  onVertexDrag,
  onEdgeClick,
  activeVertexIdx,
  onVertexClick,
}: {
  ann: Polygon;
  isSelected: boolean;
  color: string;
  labelName: string;
  zoom: number;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onVertexDrag: (annId: string, idx: number, pos: Point) => void;
  onEdgeClick: (annId: string, idx: number, pos: Point) => void;
  activeVertexIdx: number | null;
  onVertexClick: (idx: number) => void;
}) {
  const fillColor = hexAlpha(color, isSelected ? 0.28 : 0.15);
  const strokeColor = isSelected ? "#ffffff" : color;

  // Centroid for label
  const centroid = useMemo(() => {
    const cx = ann.points.reduce((s, p) => s + p.x, 0) / ann.points.length;
    const cy = ann.points.reduce((s, p) => s + p.y, 0) / ann.points.length;
    return { cx, cy };
  }, [ann.points]);

  const tagW = (labelName.length * 7 + 14) / zoom;
  const tagH = 17 / zoom;

  return (
    <Group>
      <Line
        points={ann.points.flatMap((p) => [p.x, p.y])}
        stroke={strokeColor}
        strokeWidth={(isSelected ? 2 : 1.5) / zoom}
        fill={fillColor}
        closed
        onClick={onSelect}
        shadowColor={color}
        shadowBlur={isSelected ? 14 / zoom : 4 / zoom}
        shadowOpacity={isSelected ? 0.65 : 0.25}
        hitStrokeWidth={10 / zoom}
        lineJoin="round"
        perfectDrawEnabled={false}
      />

      {/* Centroid label pill */}
      <Group listening={false}>
        <Rect
          x={centroid.cx - tagW / 2}
          y={centroid.cy - tagH / 2}
          width={tagW}
          height={tagH}
          fill={color}
          opacity={0.92}
          cornerRadius={tagH / 2}
          shadowColor="rgba(0,0,0,0.5)"
          shadowBlur={5 / zoom}
          shadowOpacity={1}
          perfectDrawEnabled={false}
        />
        <Text
          x={centroid.cx - tagW / 2 + 6 / zoom}
          y={centroid.cy - tagH / 2 + 3.5 / zoom}
          text={labelName}
          fontSize={10 / zoom}
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontStyle="600"
          fill="#ffffff"
        />
      </Group>

      {/* Edge midpoints */}
      {isSelected &&
        ann.points.map((p, idx) => {
          const next = ann.points[(idx + 1) % ann.points.length];
          return (
            <EdgeMidpoint
              key={`${ann.id}-mid-${idx}`}
              x={(p.x + next.x) / 2}
              y={(p.y + next.y) / 2}
              color={color}
              zoom={zoom}
              onClick={() =>
                onEdgeClick(ann.id, idx, {
                  x: (p.x + next.x) / 2,
                  y: (p.y + next.y) / 2,
                })
              }
            />
          );
        })}

      {/* Diamond vertex handles */}
      {isSelected &&
        ann.points.map((p, idx) => {
          const isActiveVtx = activeVertexIdx === idx;
          return (
            <DiamondVertex
              key={`${ann.id}-v-${idx}`}
              x={p.x}
              y={p.y}
              color={isActiveVtx ? "#ffffff" : color}
              zoom={zoom}
              draggable={!ann.isLocked}
              onDragMove={(e) => {
                const pos = e.target.getStage()?.getRelativePointerPosition();
                if (pos) onVertexDrag(ann.id, idx, pos);
              }}
              onClick={(e) => {
                e.cancelBubble = true;
                onVertexClick(idx);
              }}
            />
          );
        })}
    </Group>
  );
});

// ─── Keypoint Annotation Component ────────────────────────────────────────────
const KeypointAnnotation = React.memo(function KeypointAnnotation({
  ann,
  isSelected,
  color,
  zoom,
  onSelect,
}: {
  ann: Keypoint;
  isSelected: boolean;
  color: string;
  zoom: number;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}) {
  const r = 6 / zoom;
  return (
    <Group>
      <Circle
        x={ann.point.x}
        y={ann.point.y}
        radius={r * 1.9}
        fill={hexAlpha(color, 0.18)}
        stroke={color}
        strokeWidth={1 / zoom}
        listening={false}
        perfectDrawEnabled={false}
      />
      <Circle
        x={ann.point.x}
        y={ann.point.y}
        radius={r}
        fill={color}
        stroke={isSelected ? "#ffffff" : "rgba(0,0,0,0.4)"}
        strokeWidth={(isSelected ? 2 : 1) / zoom}
        onClick={onSelect}
        shadowColor={color}
        shadowBlur={isSelected ? 12 / zoom : 0}
        shadowOpacity={0.7}
        perfectDrawEnabled={false}
      />
      <Line
        points={[
          ann.point.x - 10 / zoom,
          ann.point.y,
          ann.point.x + 10 / zoom,
          ann.point.y,
        ]}
        stroke={color}
        strokeWidth={1 / zoom}
        opacity={0.55}
        listening={false}
        perfectDrawEnabled={false}
      />
      <Line
        points={[
          ann.point.x,
          ann.point.y - 10 / zoom,
          ann.point.x,
          ann.point.y + 10 / zoom,
        ]}
        stroke={color}
        strokeWidth={1 / zoom}
        opacity={0.55}
        listening={false}
        perfectDrawEnabled={false}
      />
    </Group>
  );
});

// ─── Box Annotation Component ─────────────────────────────────────────────────
const BoxAnnotation = React.memo(function BoxAnnotation({
  ann,
  isSelected,
  color,
  labelName,
  zoom,
  onSelect,
  onDragEnd,
}: {
  ann: BoundingBox;
  isSelected: boolean;
  color: string;
  labelName: string;
  zoom: number;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const tagW = Math.min(labelName.length * 6.8 + 12, 130) / zoom;
  const tagH = 17 / zoom;

  return (
    <Group>
      <Rect
        ref={shapeRef}
        x={ann.x}
        y={ann.y}
        width={ann.width}
        height={ann.height}
        stroke={isSelected ? "#ffffff" : color}
        strokeWidth={(isSelected ? 2 : 1.5) / zoom}
        fill={hexAlpha(color, isSelected ? 0.22 : 0.13)}
        draggable={!ann.isLocked}
        onClick={onSelect}
        onDragEnd={(e) => onDragEnd(ann.id, e.target.x(), e.target.y())}
        shadowColor={color}
        shadowBlur={isSelected ? 12 / zoom : 0}
        shadowOpacity={0.5}
        perfectDrawEnabled={false}
      />
      <Group listening={false}>
        <Rect
          x={ann.x}
          y={ann.y - tagH - 2 / zoom}
          width={tagW}
          height={tagH}
          fill={color}
          cornerRadius={3 / zoom}
          shadowColor="rgba(0,0,0,0.4)"
          shadowBlur={4 / zoom}
          shadowOpacity={1}
          perfectDrawEnabled={false}
        />
        <Text
          x={ann.x + 5 / zoom}
          y={ann.y - tagH}
          text={labelName}
          fontSize={10 / zoom}
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontStyle="600"
          fill="#ffffff"
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          borderStroke={color}
          borderStrokeWidth={1.5 / zoom}
          anchorSize={8 / zoom}
          anchorStroke={color}
          anchorFill="#ffffff"
          anchorCornerRadius={2}
          keepRatio={false}
          onTransformEnd={() => {
            const node = shapeRef.current;
            if (!node) return;
            const sx = node.scaleX();
            const sy = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            useAnnotationStore.getState().updateAnnotation(ann.id, {
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * sx),
              height: Math.max(5, node.height() * sy),
            });
          }}
        />
      )}
    </Group>
  );
});

// ─── Circle Annotation Component ──────────────────────────────────────────────
const CircleAnnotation = React.memo(function CircleAnnotation({
  ann,
  isSelected,
  color,
  labelName,
  zoom,
  onSelect,
  onDragEnd,
}: {
  ann: CircleAnnotationType;
  isSelected: boolean;
  color: string;
  labelName: string;
  zoom: number;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  const shapeRef = useRef<Konva.Circle>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const tagW = (labelName.length * 6.8 + 12) / zoom;
  const tagH = 17 / zoom;

  return (
    <Group>
      <Circle
        ref={shapeRef}
        x={ann.x}
        y={ann.y}
        radius={ann.radius}
        stroke={isSelected ? "#ffffff" : color}
        strokeWidth={(isSelected ? 2 : 1.5) / zoom}
        fill={hexAlpha(color, isSelected ? 0.22 : 0.13)}
        draggable={!ann.isLocked}
        onClick={onSelect}
        onDragEnd={(e) => onDragEnd(ann.id, e.target.x(), e.target.y())}
        shadowColor={color}
        shadowBlur={isSelected ? 12 / zoom : 0}
        shadowOpacity={0.5}
        perfectDrawEnabled={false}
      />
      <Group listening={false}>
        <Rect
          x={ann.x - tagW / 2}
          y={ann.y - ann.radius - tagH - 4 / zoom}
          width={tagW}
          height={tagH}
          fill={color}
          cornerRadius={3 / zoom}
          perfectDrawEnabled={false}
        />
        <Text
          x={ann.x - tagW / 2 + 5 / zoom}
          y={ann.y - ann.radius - tagH - 2 / zoom}
          text={labelName}
          fontSize={10 / zoom}
          fill="#ffffff"
          fontStyle="600"
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          borderStroke={color}
          anchorSize={8 / zoom}
          keepRatio={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          onTransformEnd={() => {
            const node = shapeRef.current;
            if (!node) return;
            const scale = node.scaleX();
            node.scaleX(1);
            node.scaleY(1);
            useAnnotationStore.getState().updateAnnotation(ann.id, {
              x: node.x(),
              y: node.y(),
              radius: Math.max(5, node.radius() * scale),
            });
          }}
        />
      )}
    </Group>
  );
});

// ─── Auto-Save Hook ───────────────────────────────────────────────────────────
function useAutoSave(
  annotations: Annotation[],
  delay: number = AUTOSAVE_DELAY,
) {
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    const currentData = JSON.stringify(annotations);

    // Skip if data hasn't changed
    if (currentData === lastSavedRef.current) return;

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("annotation-autosave", currentData);
        lastSavedRef.current = currentData;
        console.log(
          "✅ Annotations auto-saved",
          new Date().toLocaleTimeString(),
        );
      } catch (error) {
        console.error("❌ Auto-save failed:", error);
      }
    }, delay);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [annotations, delay]);
}

// ─── Main Canvas Component ────────────────────────────────────────────────────
function AnnotationCanvasComponent({
  onCursorMove,
}: {
  onCursorMove?: (pos: { x: number; y: number }) => void;
}) {
  // Store state
  const annotations = useAnnotationStore((s) => s.annotations);
  const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
  const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const zoomLevel = useAnnotationStore((s) => s.zoomLevel);
  const setZoomLevel = useAnnotationStore((s) => s.setZoomLevel);
  const canvasOffset = useAnnotationStore((s) => s.canvasOffset);
  const setCanvasOffset = useAnnotationStore((s) => s.setCanvasOffset);
  const selectedAnnotationIds = useAnnotationStore(
    (s) => s.selectedAnnotationIds,
  );
  const setSelectedAnnotationIds = useAnnotationStore(
    (s) => s.setSelectedAnnotationIds,
  );
  const toggleSelectedAnnotationId = useAnnotationStore(
    (s) => s.toggleSelectedAnnotationId,
  );
  const labelClasses = useAnnotationStore((s) => s.labelClasses);
  const activeLabelId = useAnnotationStore((s) => s.activeLabelId);
  const activeVertex = useAnnotationStore((s) => s.activeVertex);
  const setActiveVertex = useAnnotationStore((s) => s.setActiveVertex);
  const imageUrl = useAnnotationStore((s) => s.imageUrl) ?? "";

  // Custom hooks
  const { handleVertexDragMove, handleEdgeClick } = useCanvasInteractions();
  const { handleSubtract } = usePolygonOps();

  // Auto-save hook
  useAutoSave(annotations, AUTOSAVE_DELAY);

  // Refs
  const stageRef = useRef<Konva.Stage>(null);
  const interactionLayerRef = useRef<Konva.Layer>(null);
  const previewLineRef = useRef<Konva.Line>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [loadedImage, setLoadedImage] = useState<{
    url: string;
    element: HTMLImageElement;
  } | null>(null);
  const [draftPolyPoints, setDraftPolyPoints] = useState<Point[]>([]);
  const [draftBox, setDraftBox] = useState<BoundingBox | null>(null);
  const [draftCircle, setDraftCircle] =
    useState<CircleAnnotationType | null>(null);

  // Drawing state refs (no state for performance)
  const polyRef = useRef<Point[]>([]);
  const newBoxRef = useRef<BoundingBox | null>(null);
  const newCircleRef = useRef<CircleAnnotationType | null>(null);
  const isLassoDrawingRef = useRef(false);

  // Marquee selection refs
  const marqueeRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const marqueeOriginRef = useRef<Point | null>(null);
  const isMarqueeRef = useRef(false);
  const [marqueeState, setMarqueeState] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  // Performance refs
  const activeToolRef = useRef(activeTool);
  const activeLabelIdRef = useRef(activeLabelId);
  const zoomRef = useRef(zoomLevel);
  const lastMouseMoveRef = useRef(0);
  const mousePosRef = useRef<Point>({ x: 0, y: 0 });
  const lastCursorRef = useRef<Point>({ x: Number.NaN, y: Number.NaN });
  const cursorFrameRef = useRef<number | null>(null);

  // Double-click detection
  const lastClickTimeRef = useRef(0);
  const lastClickPosRef = useRef<Point>({ x: 0, y: 0 });

  // Sync refs with store state
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);
  useEffect(() => {
    activeLabelIdRef.current = activeLabelId;
  }, [activeLabelId]);
  useEffect(() => {
    zoomRef.current = zoomLevel;
  }, [zoomLevel]);

  // Keep render-only draft shapes out of refs so React 19's ref rules stay happy.
  const syncDraftShapes = useCallback(() => {
    setDraftPolyPoints([...polyRef.current]);
    setDraftBox(newBoxRef.current ? { ...newBoxRef.current } : null);
    setDraftCircle(newCircleRef.current ? { ...newCircleRef.current } : null);
  }, []);

  // ─── Update polygon preview line ────────────────────────────────────────────
  const updatePolygonPreview = useCallback((pos: Point | null) => {
    const tool = activeToolRef.current;
    const isPointTool = tool === "polygon" || tool === "erase";
    const points = polyRef.current;
    const previewLine = previewLineRef.current;

    if (!isPointTool || points.length === 0 || !pos) {
      if (previewLine?.visible()) {
        previewLine.visible(false);
        interactionLayerRef.current?.batchDraw();
      }
      return;
    }

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const snapTarget =
      points.length >= 3 &&
      dist(pos, firstPoint) < SNAP_RADIUS / zoomRef.current
        ? firstPoint
        : null;
    const target = snapTarget ?? pos;

    previewLine?.points([lastPoint.x, lastPoint.y, target.x, target.y]);
    previewLine?.visible(true);

    interactionLayerRef.current?.batchDraw();
  }, []);

  // ─── Finalize polygon ─────────────────────────────────────────────────────
  const finalizePolygon = useCallback(
    (points: Point[]) => {
      if (points.length < 3) return;

      const tool = activeToolRef.current;
      const labelId = activeLabelIdRef.current ?? "cls-1";

      if (tool === "polygon") {
        addAnnotation({
          id: uuidv4(),
          type: "polygon",
          points,
          isVisible: true,
          isLocked: false,
          labelId,
        });
      } else if (tool === "erase") {
        useAnnotationStore.getState().annotations.forEach((ann) => {
          if (ann.type === "polygon" && ann.isVisible && !ann.isLocked) {
            handleSubtract(ann.id, [...points]);
          }
        });
      }

      polyRef.current = [];
      updatePolygonPreview(null);
      syncDraftShapes();
    },
    [addAnnotation, handleSubtract, updatePolygonPreview, syncDraftShapes],
  );

  // ─── Label color/name helpers ─────────────────────────────────────────────
  const labelColorMap = useMemo(() => {
    const map = new Map<string, string>();
    labelClasses.forEach((c) => map.set(c.id, c.color));
    return map;
  }, [labelClasses]);

  const labelNameMap = useMemo(() => {
    const map = new Map<string, string>();
    labelClasses.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [labelClasses]);

  const getLabelColor = useCallback(
    (id: string) => labelColorMap.get(id) ?? "#6366f1",
    [labelColorMap],
  );

  const getLabelName = useCallback(
    (id: string) => labelNameMap.get(id) ?? "Unknown",
    [labelNameMap],
  );

  // ─── Get annotation bounds for marquee selection ──────────────────────────
  const getAnnotationBounds = useCallback(
    (
      ann: Annotation,
    ): { x: number; y: number; w: number; h: number } | null => {
      if (ann.type === "box") {
        const b = ann as BoundingBox;
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      }
      if (ann.type === "circle") {
        const c = ann as CircleAnnotationType;
        return {
          x: c.x - c.radius,
          y: c.y - c.radius,
          w: c.radius * 2,
          h: c.radius * 2,
        };
      }
      if (ann.type === "polygon") {
        const p = ann as Polygon;
        const xs = p.points.map((pt) => pt.x);
        const ys = p.points.map((pt) => pt.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      }
      if (ann.type === "keypoint") {
        const k = ann as Keypoint;
        return { x: k.point.x - 6, y: k.point.y - 6, w: 12, h: 12 };
      }
      return null;
    },
    [],
  );

  // ─── Event Handlers ───────────────────────────────────────────────────────

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const tool = activeToolRef.current;

      if (tool === "select") {
        const empty =
          e.target === e.target.getStage() ||
          e.target.hasName("background-image");
        if (empty) {
          setSelectedAnnotationIds([]);
          setActiveVertex(null);
        }
        return;
      }

      if (tool !== "polygon" && tool !== "erase") return;

      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;

      const now = Date.now();
      const elapsed = now - lastClickTimeRef.current;
      const moveDist = dist(pos, lastClickPosRef.current);

      // Double-click detection
      if (elapsed < DBL_CLICK_MS && moveDist < 10 / zoomRef.current) {
        const pts = polyRef.current;
        const toFinalize = pts.length >= 1 ? pts.slice(0, -1) : pts;
        if (toFinalize.length >= 3) {
          finalizePolygon(toFinalize);
        }
        lastClickTimeRef.current = 0;
        return;
      }

      // Check for snap to close
      const current = polyRef.current;
      if (
        current.length >= 3 &&
        dist(pos, current[0]) < SNAP_RADIUS / zoomRef.current
      ) {
        finalizePolygon(current);
        lastClickTimeRef.current = 0;
        return;
      }

      lastClickTimeRef.current = now;
      lastClickPosRef.current = pos;
    },
    [finalizePolygon, setActiveVertex, setSelectedAnnotationIds],
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const tool = activeToolRef.current;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;

      if (tool === "select") {
        const isEmptyTarget =
          e.target === stage || e.target.hasName("background-image");
        if (isEmptyTarget) {
          isMarqueeRef.current = true;
          marqueeOriginRef.current = pos;
          const m = { x: pos.x, y: pos.y, w: 0, h: 0 };
          marqueeRef.current = m;
          setMarqueeState(m);
        }
        return;
      }

      if (tool === "box") {
        const box: BoundingBox = {
          id: uuidv4(),
          type: "box",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          isVisible: true,
          isLocked: false,
          labelId: activeLabelIdRef.current ?? "cls-1",
        };
        newBoxRef.current = box;
        syncDraftShapes();
      }

      if (tool === "circle") {
        const circle: CircleAnnotationType = {
          id: uuidv4(),
          type: "circle",
          x: pos.x,
          y: pos.y,
          radius: 0,
          isVisible: true,
          isLocked: false,
          labelId: activeLabelIdRef.current ?? "cls-1",
        };
        newCircleRef.current = circle;
        syncDraftShapes();
      }

      if (tool === "lasso") {
        isLassoDrawingRef.current = true;
        polyRef.current = [{ x: pos.x, y: pos.y }];
        syncDraftShapes();
      }

      if (tool === "polygon" || tool === "erase") {
        const current = polyRef.current;
        if (
          current.length >= 3 &&
          dist(pos, current[0]) < SNAP_RADIUS / zoomRef.current
        ) {
          finalizePolygon(current);
        } else {
          polyRef.current.push({ x: pos.x, y: pos.y });
          interactionLayerRef.current?.batchDraw();
          updatePolygonPreview(pos);
          syncDraftShapes();
        }
      }

      if (tool === "keypoint") {
        addAnnotation({
          id: uuidv4(),
          type: "keypoint",
          point: pos,
          isVisible: true,
          isLocked: false,
          labelId: activeLabelIdRef.current ?? "cls-1",
        });
      }
    },
    [addAnnotation, finalizePolygon, updatePolygonPreview, syncDraftShapes],
  );

  const handleMouseMove = useCallback(() => {
    const now = performance.now();

    // Throttle to ~60fps
    if (now - lastMouseMoveRef.current < MOUSE_MOVE_THROTTLE) return;
    lastMouseMoveRef.current = now;

    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    const rx = Math.round(pos.x);
    const ry = Math.round(pos.y);
    mousePosRef.current = { x: rx, y: ry };

    // Update cursor position callback
    if (rx !== lastCursorRef.current.x || ry !== lastCursorRef.current.y) {
      lastCursorRef.current = { x: rx, y: ry };
      if (cursorFrameRef.current === null) {
        cursorFrameRef.current = requestAnimationFrame(() => {
          cursorFrameRef.current = null;
          onCursorMove?.(lastCursorRef.current);
        });
      }
    }

    const tool = activeToolRef.current;

    // Marquee selection
    if (tool === "select" && isMarqueeRef.current && marqueeOriginRef.current) {
      const origin = marqueeOriginRef.current;
      const m = {
        x: Math.min(pos.x, origin.x),
        y: Math.min(pos.y, origin.y),
        w: Math.abs(pos.x - origin.x),
        h: Math.abs(pos.y - origin.y),
      };
      marqueeRef.current = m;
      setMarqueeState(m);
      return;
    }

    // Box drawing
    if (tool === "box" && newBoxRef.current) {
      newBoxRef.current.width = pos.x - newBoxRef.current.x;
      newBoxRef.current.height = pos.y - newBoxRef.current.y;
      syncDraftShapes();
      interactionLayerRef.current?.batchDraw();
      return;
    }

    // Circle drawing
    if (tool === "circle" && newCircleRef.current) {
      newCircleRef.current.radius = dist(pos, {
        x: newCircleRef.current.x,
        y: newCircleRef.current.y,
      });
      syncDraftShapes();
      interactionLayerRef.current?.batchDraw();
      return;
    }

    // Lasso drawing
    if (tool === "lasso" && isLassoDrawingRef.current) {
      const last = polyRef.current[polyRef.current.length - 1];
      const minDist = LASSO_MIN_DIST / zoomRef.current;
      if (dist(pos, last) > minDist) {
        polyRef.current.push({ x: pos.x, y: pos.y });
        syncDraftShapes();
        interactionLayerRef.current?.batchDraw();
      }
      return;
    }

    // Polygon preview
    updatePolygonPreview(pos);
  }, [onCursorMove, updatePolygonPreview, syncDraftShapes]);

  const handleMouseUp = useCallback(() => {
    const tool = activeToolRef.current;

    // Marquee selection
    if (tool === "select" && isMarqueeRef.current) {
      isMarqueeRef.current = false;
      const m = marqueeRef.current;
      marqueeRef.current = null;
      setMarqueeState(null);
      marqueeOriginRef.current = null;

      if (m && (m.w > 4 || m.h > 4)) {
        const hit = annotations
          .filter((ann) => ann.isVisible)
          .filter((ann) => {
            const b = getAnnotationBounds(ann);
            if (!b) return false;
            return (
              b.x < m.x + m.w &&
              b.x + b.w > m.x &&
              b.y < m.y + m.h &&
              b.y + b.h > m.y
            );
          })
          .map((ann) => ann.id);
        setSelectedAnnotationIds(hit);
      }
      return;
    }

    // Pan tool
    if (tool === "pan") {
      const stage = stageRef.current;
      if (stage) setCanvasOffset({ x: stage.x(), y: stage.y() });
      return;
    }

    // Box creation
    if (tool === "box" && newBoxRef.current) {
      const b = newBoxRef.current;
      const norm: BoundingBox = {
        ...b,
        x: b.width < 0 ? b.x + b.width : b.x,
        y: b.height < 0 ? b.y + b.height : b.y,
        width: Math.abs(b.width),
        height: Math.abs(b.height),
      };
      if (norm.width > 5 && norm.height > 5) {
        addAnnotation(norm);
      }
      newBoxRef.current = null;
      syncDraftShapes();
    }

    // Circle creation
    if (tool === "circle" && newCircleRef.current) {
      if (newCircleRef.current.radius > 5) {
        addAnnotation(newCircleRef.current);
      }
      newCircleRef.current = null;
      syncDraftShapes();
    }

    // Lasso completion
    if (tool === "lasso" && isLassoDrawingRef.current) {
      isLassoDrawingRef.current = false;
      if (polyRef.current.length >= 3) {
        finalizePolygon(polyRef.current);
      } else {
        polyRef.current = [];
        syncDraftShapes();
      }
    }
  }, [
    addAnnotation,
    setCanvasOffset,
    finalizePolygon,
    syncDraftShapes,
    setSelectedAnnotationIds,
    getAnnotationBounds,
    annotations,
  ]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      if (e.evt.ctrlKey) {
        // Pinch-to-zoom
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const anchor = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = Math.max(
          0.05,
          Math.min(40, e.evt.deltaY < 0 ? oldScale * 1.08 : oldScale / 1.08),
        );

        setZoomLevel(newScale);
        const newPos = {
          x: pointer.x - anchor.x * newScale,
          y: pointer.y - anchor.y * newScale,
        };

        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
        setCanvasOffset(newPos);
      } else {
        // Pan
        stage.position({
          x: stage.x() - e.evt.deltaX,
          y: stage.y() - e.evt.deltaY,
        });
        setCanvasOffset({ x: stage.x(), y: stage.y() });
      }
    },
    [setZoomLevel, setCanvasOffset],
  );

  const handleAnnotationSelect = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
      e.cancelBubble = true;
      const tool = activeToolRef.current;

      if (tool === "merge" || tool === "erase") {
        const clicked = annotations.find((a) => a.id === id);
        if (!clicked || clicked.type !== "polygon") return;
        toggleSelectedAnnotationId(id);
        return;
      }

      if (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey) {
        toggleSelectedAnnotationId(id);
      } else {
        setSelectedAnnotationIds([id]);
      }
    },
    [setSelectedAnnotationIds, toggleSelectedAnnotationId, annotations],
  );

  // ─── Resize Observer ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    ro.observe(el);
    setStageSize({ width: el.clientWidth, height: el.clientHeight });

    return () => ro.disconnect();
  }, []);

  // ─── Load Image ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!imageUrl) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setLoadedImage({ url: imageUrl, element: img });
    img.onerror = () => setLoadedImage(null);
  }, [imageUrl]);

  // ─── Escape Key Handler ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        polyRef.current = [];
        newBoxRef.current = null;
        newCircleRef.current = null;
        updatePolygonPreview(null);
        setActiveVertex(null);
        syncDraftShapes();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setActiveVertex, updatePolygonPreview, syncDraftShapes]);

  // ─── Cleanup RAF ──────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (cursorFrameRef.current !== null) {
        cancelAnimationFrame(cursorFrameRef.current);
      }
    };
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  const tempPoints = draftPolyPoints;
  const newBox = draftBox;
  const newCircle = draftCircle;
  const image = loadedImage?.url === imageUrl ? loadedImage.element : null;
  const drawColor =
    activeTool === "erase"
      ? "#ef4444"
      : getLabelColor(activeLabelId ?? "cls-1");
  const isMarqueeActive = marqueeState !== null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{
        cursor: isMarqueeActive
          ? "crosshair"
          : (TOOL_CURSORS[activeTool] ?? "default"),
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={canvasOffset.x}
        y={canvasOffset.y}
        scaleX={zoomLevel}
        scaleY={zoomLevel}
        draggable={activeTool === "pan"}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      >
        {/* Background Layer */}
        <Layer id="background-layer">
          {image && (
            <KonvaImage
              image={image}
              name="background-image"
              x={0}
              y={0}
              listening={activeTool === "select" || activeTool === "pan"}
            />
          )}
        </Layer>

        {/* Annotation Layer */}
        <Layer id="annotation-layer">
          {annotations.map((ann) => {
            if (!ann.isVisible) return null;

            const isSelected = selectedAnnotationIds.includes(ann.id);
            const color = getLabelColor(ann.labelId);
            const labelName = getLabelName(ann.labelId);

            switch (ann.type) {
              case "box":
                return (
                  <BoxAnnotation
                    key={ann.id}
                    ann={ann as BoundingBox}
                    isSelected={isSelected}
                    color={color}
                    labelName={labelName}
                    zoom={zoomLevel}
                    onSelect={(e) => handleAnnotationSelect(e, ann.id)}
                    onDragEnd={(id, x, y) => updateAnnotation(id, { x, y })}
                  />
                );

              case "polygon":
                return (
                  <PolygonAnnotation
                    key={ann.id}
                    ann={ann as Polygon}
                    isSelected={isSelected}
                    color={color}
                    labelName={labelName}
                    zoom={zoomLevel}
                    onSelect={(e) => {
                      setActiveVertex(null);
                      handleAnnotationSelect(e, ann.id);
                    }}
                    onVertexDrag={handleVertexDragMove}
                    onEdgeClick={handleEdgeClick}
                    activeVertexIdx={
                      activeVertex?.annId === ann.id ? activeVertex.idx : null
                    }
                    onVertexClick={(idx) =>
                      setActiveVertex({ annId: ann.id, idx })
                    }
                  />
                );

              case "circle":
                return (
                  <CircleAnnotation
                    key={ann.id}
                    ann={ann as CircleAnnotationType}
                    isSelected={isSelected}
                    color={color}
                    labelName={labelName}
                    zoom={zoomLevel}
                    onSelect={(e) => handleAnnotationSelect(e, ann.id)}
                    onDragEnd={(id, x, y) => updateAnnotation(id, { x, y })}
                  />
                );

              case "keypoint":
                return (
                  <KeypointAnnotation
                    key={ann.id}
                    ann={ann as Keypoint}
                    isSelected={isSelected}
                    color={color}
                    zoom={zoomLevel}
                    onSelect={(e) => handleAnnotationSelect(e, ann.id)}
                  />
                );

              default:
                return null;
            }
          })}
        </Layer>

        {/* Interaction Layer */}
        <Layer id="interaction-layer" ref={interactionLayerRef}>
          {/* Marquee Selection */}
          {marqueeState && marqueeState.w > 2 && marqueeState.h > 2 && (
            <Rect
              x={marqueeState.x}
              y={marqueeState.y}
              width={marqueeState.w}
              height={marqueeState.h}
              stroke="rgba(99,102,241,0.9)"
              strokeWidth={1 / zoomLevel}
              dash={[5 / zoomLevel, 3 / zoomLevel]}
              fill="rgba(99,102,241,0.08)"
              listening={false}
              perfectDrawEnabled={false}
            />
          )}

          {/* In-Progress Box */}
          {newBox && (
            <Rect
              x={newBox.width < 0 ? newBox.x + newBox.width : newBox.x}
              y={newBox.height < 0 ? newBox.y + newBox.height : newBox.y}
              width={Math.abs(newBox.width)}
              height={Math.abs(newBox.height)}
              stroke={getLabelColor(newBox.labelId)}
              strokeWidth={1.5 / zoomLevel}
              dash={[6 / zoomLevel, 3 / zoomLevel]}
              fill={hexAlpha(getLabelColor(newBox.labelId), 0.1)}
              listening={false}
              perfectDrawEnabled={false}
              shadowForStrokeEnabled={false}
            />
          )}

          {/* In-Progress Circle */}
          {newCircle && (
            <Circle
              x={newCircle.x}
              y={newCircle.y}
              radius={newCircle.radius}
              stroke={getLabelColor(newCircle.labelId)}
              strokeWidth={1.5 / zoomLevel}
              dash={[6 / zoomLevel, 3 / zoomLevel]}
              fill={hexAlpha(getLabelColor(newCircle.labelId), 0.1)}
              listening={false}
              perfectDrawEnabled={false}
              shadowForStrokeEnabled={false}
            />
          )}

          {/* In-Progress Polygon/Lasso */}
          {tempPoints.length > 0 && (
            <Group listening={false}>
              <Line
                points={tempPoints.flatMap((p) => [p.x, p.y])}
                stroke={drawColor}
                strokeWidth={
                  activeTool === "lasso" ? 2 / zoomLevel : 1.5 / zoomLevel
                }
                dash={
                  activeTool === "lasso" ? [] : [6 / zoomLevel, 3 / zoomLevel]
                }
                lineJoin="round"
                closed={activeTool === "lasso"}
                perfectDrawEnabled={false}
                shadowForStrokeEnabled={false}
                hitStrokeWidth={0}
              />

              {activeTool !== "lasso" && (
                <>
                  {/* Preview line to cursor */}
                  <Line
                    ref={previewLineRef}
                    points={[0, 0, 0, 0]}
                    stroke={drawColor}
                    strokeWidth={1 / zoomLevel}
                    opacity={0.45}
                    listening={false}
                    perfectDrawEnabled={false}
                    shadowForStrokeEnabled={false}
                    hitStrokeWidth={0}
                  />

                  {/* Vertex markers */}
                  {tempPoints.map((p, idx) => (
                    <RegularPolygon
                      key={`tmp-${idx}`}
                      x={p.x}
                      y={p.y}
                      sides={4}
                      radius={(idx === 0 ? 6 : 4.5) / zoomLevel}
                      rotation={45}
                      fill={idx === 0 ? "#ffffff" : drawColor}
                      stroke={drawColor}
                      strokeWidth={1.5 / zoomLevel}
                      shadowColor="rgba(0,0,0,0.5)"
                      shadowBlur={3 / zoomLevel}
                      shadowOpacity={1}
                      listening={false}
                      perfectDrawEnabled={false}
                    />
                  ))}
                </>
              )}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export const AnnotationCanvas = React.memo(AnnotationCanvasComponent);
