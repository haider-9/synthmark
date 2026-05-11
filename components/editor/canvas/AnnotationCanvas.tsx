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
import { Polygon, Keypoint, Point } from "@/types/annotation";
import { polygonsOverlap } from "@/lib/polygon-utils";
import { v4 as uuidv4 } from "uuid";

const TOOL_CURSORS: Record<string, string> = {
  select: "default",
  pan: "grab",
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

  const polyRef = useRef<Point[]>([]);
  const [, setPolyVersion] = useState(0);
  const bumpPoly = () => setPolyVersion((v) => v + 1);

  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [snapPoint, setSnapPoint] = useState<Point | null>(null);

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

  // Mouse down
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const tool = activeToolRef.current;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;

      if (tool === "polygon" || tool === "erase") {
        polyRef.current = [...polyRef.current, pos];
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
  }, [setCanvasOffset]);

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
        const { annotations } = useAnnotationStore.getState();
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
    [setSelectedAnnotationIds, toggleSelectedAnnotationId],
  );

  // Escape cancels drawing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        polyRef.current = [];
        bumpPoly();
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
          {/* In-progress polygon */}
          {tempPoints.length > 0 && (
            <Group listening={false}>
              <Line
                points={tempPoints.flatMap((p) => [p.x, p.y])}
                stroke={drawColor}
                strokeWidth={1.5 / zoomLevel}
                dash={[6 / zoomLevel, 3 / zoomLevel]}
                lineJoin="round"
              />
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
                />
              ))}
              {snapPoint && (
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
