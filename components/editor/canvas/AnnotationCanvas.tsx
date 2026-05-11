"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { BoundingBox, Polygon, Keypoint, Point } from "@/types/annotation";
import { polygonsOverlap } from "@/lib/polygon-utils";
import { v4 as uuidv4 } from "uuid";

const TOOL_CURSORS: Record<string, string> = {
  select: "default",
  pan: "grab",
  box: "crosshair",
  polygon: "crosshair",
  keypoint: "crosshair",
  erase: "cell",
  merge: "copy",
  line: "crosshair",
};
const SNAP_RADIUS = 10;
const DBL_CLICK_MS = 300;

function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function dist(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ─── Diamond vertex handle ────────────────────────────────────────────────────
function DiamondVertex({
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
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}

// ─── Edge midpoint ────────────────────────────────────────────────────────────
function EdgeMidpoint({
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
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.arc(0, 0, 9 / zoom, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}

// ─── Box annotation ───────────────────────────────────────────────────────────
function BoxAnnotationComp({
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
      />
      {/* Label tag above box */}
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
            const sx = node.scaleX(),
              sy = node.scaleY();
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
}
const BoxAnnotationMemo = React.memo(BoxAnnotationComp);

// ─── Polygon annotation ───────────────────────────────────────────────────────
function PolygonAnnotationComp({
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
  const cx = ann.points.reduce((s, p) => s + p.x, 0) / ann.points.length;
  const cy = ann.points.reduce((s, p) => s + p.y, 0) / ann.points.length;
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
      />

      {/* Centroid label pill */}
      <Group listening={false}>
        <Rect
          x={cx - tagW / 2}
          y={cy - tagH / 2}
          width={tagW}
          height={tagH}
          fill={color}
          opacity={0.92}
          cornerRadius={tagH / 2}
          shadowColor="rgba(0,0,0,0.5)"
          shadowBlur={5 / zoom}
          shadowOpacity={1}
        />
        <Text
          x={cx - tagW / 2 + 6 / zoom}
          y={cy - tagH / 2 + 3.5 / zoom}
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
}
const PolygonAnnotationMemo = React.memo(PolygonAnnotationComp);

// ─── Keypoint annotation ──────────────────────────────────────────────────────
function KeypointAnnotationComp({
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
      />
    </Group>
  );
}
const KeypointAnnotationMemo = React.memo(KeypointAnnotationComp);

// ─── Circle annotation ────────────────────────────────────────────────────────
function CircleAnnotationComp({
  ann,
  isSelected,
  color,
  labelName,
  zoom,
  onSelect,
  onDragEnd,
}: {
  ann: import("@/types/annotation").CircleAnnotation;
  isSelected: boolean;
  color: string;
  labelName: string;
  zoom: number;
  onSelect: (e: any) => void;
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
      />
      <Group listening={false}>
        <Rect
          x={ann.x - tagW / 2}
          y={ann.y - ann.radius - tagH - 4 / zoom}
          width={tagW}
          height={tagH}
          fill={color}
          cornerRadius={3 / zoom}
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
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
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
}
const CircleAnnotationMemo = React.memo(CircleAnnotationComp);

// ─── Main Canvas ──────────────────────────────────────────────────────────────

export function AnnotationCanvas() {
  const {
    annotations,
    addAnnotation,
    updateAnnotation,
    activeTool,
    zoomLevel,
    setZoomLevel,
    setCanvasOffset,
    selectedAnnotationIds,
    setSelectedAnnotationIds,
    toggleSelectedAnnotationId,
    labelClasses,
    activeLabelId,
    setCursorPosition,
    activeVertex,
    setActiveVertex,
  } = useAnnotationStore();

  const { handleVertexDragMove, handleEdgeClick, handleVertexDragEnd } =
    useCanvasInteractions();
  const { handleSubtract } = usePolygonOps();

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const [newBox, setNewBox] = useState<BoundingBox | null>(null);
  const newBoxRef = useRef<BoundingBox | null>(null);

  const polyRef = useRef<Point[]>([]);
  const [, setPolyVersion] = useState(0);
  const bumpPoly = () => setPolyVersion((v) => v + 1);

  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [snapPoint, setSnapPoint] = useState<Point | null>(null);

  const [newCircle, setNewCircle] = useState<import("@/types/annotation").CircleAnnotation | null>(null);
  const newCircleRef = useRef<import("@/types/annotation").CircleAnnotation | null>(null);
  const isLassoDrawingRef = useRef(false);

  const activeToolRef = useRef(activeTool);
  const activeLabelIdRef = useRef(activeLabelId);
  const zoomRef = useRef(zoomLevel);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);
  useEffect(() => {
    activeLabelIdRef.current = activeLabelId;
  }, [activeLabelId]);
  useEffect(() => {
    zoomRef.current = zoomLevel;
  }, [zoomLevel]);

  const lastClickTimeRef = useRef(0);
  const lastClickPosRef = useRef<Point>({ x: 0, y: 0 });

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries)
        setStageSize({
          width: e.contentRect.width,
          height: e.contentRect.height,
        });
    });
    ro.observe(el);
    setStageSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src =
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000";
    img.onload = () => setImage(img);
  }, []);

  const getLabelColor = useCallback(
    (id: string) => labelClasses.find((c) => c.id === id)?.color ?? "#6366f1",
    [labelClasses],
  );
  const getLabelName = useCallback(
    (id: string) => labelClasses.find((c) => c.id === id)?.name ?? "Unknown",
    [labelClasses],
  );

  // Finalize polygon
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
          if (ann.type === "polygon" && ann.isVisible && !ann.isLocked)
            handleSubtract(ann.id, [...points]);
        });
      }
      polyRef.current = [];
      bumpPoly();
      setSnapPoint(null);
    },
    [addAnnotation, handleSubtract],
  );

  // Click handler — polygon points + select
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

      if (elapsed < DBL_CLICK_MS && moveDist < 10 / zoomRef.current) {
        const pts = polyRef.current;
        const toFinalize = pts.length >= 1 ? pts.slice(0, -1) : pts;
        if (toFinalize.length >= 3) finalizePolygon(toFinalize);
        lastClickTimeRef.current = 0;
        return;
      }

      const current = polyRef.current;
      if (
        current.length >= 3 &&
        dist(pos, current[0]) < SNAP_RADIUS / zoomRef.current
      ) {
        finalizePolygon(current);
        lastClickTimeRef.current = 0;
        return;
      }

      polyRef.current = [...current, { x: pos.x, y: pos.y }];
      bumpPoly();
      lastClickTimeRef.current = now;
      lastClickPosRef.current = pos;
    },
    [finalizePolygon, setSelectedAnnotationIds],
  );

  // Mouse down — box + keypoint
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const tool = activeToolRef.current;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;

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
        setNewBox(box);
      }
      if (tool === "circle") {
        const circle: import("@/types/annotation").CircleAnnotation = {
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
        setNewCircle(circle);
      }
      if (tool === "lasso") {
        isLassoDrawingRef.current = true;
        polyRef.current = [{ x: pos.x, y: pos.y }];
        bumpPoly();
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
    [addAnnotation],
  );

  // Mouse move
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;

      setCursorPosition({ x: Math.round(pos.x), y: Math.round(pos.y) });
      setMousePos(pos);

      const tool = activeToolRef.current;
      if (tool === "box" && newBoxRef.current) {
        const updated = {
          ...newBoxRef.current,
          width: pos.x - newBoxRef.current.x,
          height: pos.y - newBoxRef.current.y,
        };
        newBoxRef.current = updated;
        setNewBox(updated);
      }
      if (tool === "circle" && newCircleRef.current) {
        const radius = dist(pos, { x: newCircleRef.current.x, y: newCircleRef.current.y });
        const updated = { ...newCircleRef.current, radius };
        newCircleRef.current = updated;
        setNewCircle(updated);
      }
      if (tool === "lasso" && isLassoDrawingRef.current) {
        const last = polyRef.current[polyRef.current.length - 1];
        if (dist(pos, last) > 5 / zoomRef.current) {
          polyRef.current = [...polyRef.current, { x: pos.x, y: pos.y }];
          bumpPoly();
        }
      }
      if (
        (tool === "polygon" || tool === "erase") &&
        polyRef.current.length >= 3
      ) {
        setSnapPoint(
          dist(pos, polyRef.current[0]) < SNAP_RADIUS / zoomRef.current
            ? polyRef.current[0]
            : null,
        );
      } else {
        setSnapPoint(null);
      }
    },
    [setCursorPosition],
  );

  // Mouse up — commit box
  const handleMouseUp = useCallback(() => {
    const tool = activeToolRef.current;
    if (tool === "pan") {
      const stage = stageRef.current;
      if (stage) setCanvasOffset({ x: stage.x(), y: stage.y() });
      return;
    }
    if (tool === "box" && newBoxRef.current) {
      const b = newBoxRef.current;
      const norm: BoundingBox = {
        ...b,
        x: b.width < 0 ? b.x + b.width : b.x,
        y: b.height < 0 ? b.y + b.height : b.y,
        width: Math.abs(b.width),
        height: Math.abs(b.height),
      };
      if (norm.width > 5 && norm.height > 5) addAnnotation(norm);
      newBoxRef.current = null;
      setNewBox(null);
    }
    if (tool === "circle" && newCircleRef.current) {
      if (newCircleRef.current.radius > 5) {
        addAnnotation(newCircleRef.current);
      }
      newCircleRef.current = null;
      setNewCircle(null);
    }
    if (tool === "lasso" && isLassoDrawingRef.current) {
      isLassoDrawingRef.current = false;
      if (polyRef.current.length >= 3) {
        finalizePolygon(polyRef.current);
      } else {
        polyRef.current = [];
        bumpPoly();
      }
    }
  }, [addAnnotation, setCanvasOffset, finalizePolygon]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
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
    },
    [setZoomLevel, setCanvasOffset],
  );

  // Annotation select
  const handleAnnotationSelect = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
      e.cancelBubble = true;
      const tool = activeToolRef.current;

      if (tool === "merge" || tool === "erase") {
        const { annotations, selectedAnnotationIds } =
          useAnnotationStore.getState();

        const clicked = annotations.find((a) => a.id === id);
        if (!clicked || clicked.type !== "polygon") return;

        // First click in the operation — select it freely.
        const selectedPolys = selectedAnnotationIds
          .map((sid) => annotations.find((a) => a.id === sid))
          .filter((a): a is Polygon => a?.type === "polygon");

        if (selectedPolys.length === 0) {
          // Nothing selected yet — anchor this polygon.
          setSelectedAnnotationIds([id]);
          return;
        }

        // Already selected — deselect (toggle off).
        if (selectedAnnotationIds.includes(id)) {
          toggleSelectedAnnotationId(id);
          return;
        }

        // Only allow adding this polygon if it overlaps at least one
        // already-selected polygon.
        const clickedPoly = clicked as Polygon;
        const overlapsAny = selectedPolys.some((sel) =>
          polygonsOverlap(sel.points, clickedPoly.points),
        );

        if (overlapsAny) {
          toggleSelectedAnnotationId(id);
        }
        // Silently ignore non-overlapping clicks — no selection change.
        return;
      }

      if (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey) {
        toggleSelectedAnnotationId(id);
      } else {
        setSelectedAnnotationIds([id]);
      }
    },
    [setSelectedAnnotationIds, toggleSelectedAnnotationId],
  );

  // Escape cancels drawing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        polyRef.current = [];
        bumpPoly();
        newBoxRef.current = null;
        setNewBox(null);
        setSnapPoint(null);
        setActiveVertex(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tempPoints = polyRef.current;
  const effectiveMouse = snapPoint ?? mousePos;
  const drawColor =
    activeTool === "erase"
      ? "#ef4444"
      : getLabelColor(activeLabelId ?? "cls-1");

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{ cursor: TOOL_CURSORS[activeTool] ?? "default" }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoomLevel}
        scaleY={zoomLevel}
        draggable={activeTool === "pan"}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      >
        {/* Layer 1: Static Background */}
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

        {/* Layer 2: Main Annotations */}
        <Layer id="annotation-layer">
          {annotations.map((ann) => {
            if (!ann.isVisible) return null;
            const isSelected = selectedAnnotationIds.includes(ann.id);
            const color = getLabelColor(ann.labelId);
            const labelName = getLabelName(ann.labelId);

            if (ann.type === "box")
              return (
                <BoxAnnotationMemo
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
            if (ann.type === "polygon")
              return (
                <PolygonAnnotationMemo
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
            if (ann.type === "circle")
              return (
                <CircleAnnotationMemo
                  key={ann.id}
                  ann={ann as any}
                  isSelected={isSelected}
                  color={color}
                  labelName={labelName}
                  zoom={zoomLevel}
                  onSelect={(e) => handleAnnotationSelect(e, ann.id)}
                  onDragEnd={(id, x, y) => updateAnnotation(id, { x, y })}
                />
              );
            if (ann.type === "keypoint")
              return (
                <KeypointAnnotationMemo
                  key={ann.id}
                  ann={ann as Keypoint}
                  isSelected={isSelected}
                  color={color}
                  zoom={zoomLevel}
                  onSelect={(e) => handleAnnotationSelect(e, ann.id)}
                />
              );
            return null;
          })}
        </Layer>

        {/* Layer 3: Interaction & UI (Active Drawing) */}
        <Layer id="interaction-layer">
          {/* In-progress box */}
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
            />
          )}

          {/* In-progress circle */}
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
            />
          )}

          {/* In-progress polygon/lasso */}
          {tempPoints.length > 0 && (
            <Group listening={false}>
              <Line
                points={tempPoints.flatMap((p) => [p.x, p.y])}
                stroke={drawColor}
                strokeWidth={activeTool === "lasso" ? 2 / zoomLevel : 1.5 / zoomLevel}
                dash={activeTool === "lasso" ? [] : [6 / zoomLevel, 3 / zoomLevel]}
                lineJoin="round"
                closed={activeTool === "lasso"}
              />
              {activeTool !== "lasso" && (
                <Line
                  points={[
                    tempPoints[tempPoints.length - 1].x,
                    tempPoints[tempPoints.length - 1].y,
                    effectiveMouse.x,
                    effectiveMouse.y,
                  ]}
                  stroke={drawColor}
                  strokeWidth={1 / zoomLevel}
                  opacity={0.45}
                />
              )}
              {activeTool !== "lasso" && tempPoints.map((p, idx) => (
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
                />
              ))}
              {snapPoint && activeTool !== "lasso" && (
                <Circle
                  x={snapPoint.x}
                  y={snapPoint.y}
                  radius={10 / zoomLevel}
                  stroke="#ffffff"
                  strokeWidth={1.5 / zoomLevel}
                  fill={hexAlpha(drawColor, 0.2)}
                  dash={[3 / zoomLevel, 3 / zoomLevel]}
                />
              )}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}
