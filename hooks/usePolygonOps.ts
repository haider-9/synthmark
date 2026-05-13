"use client";

import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { Polygon, Point } from "@/types/annotation";
import { subtractPolygons } from "@/lib/polygon-utils";
import { v4 as uuidv4 } from "uuid";

/**
 * All operations use replaceAnnotations() — a single atomic store update that
 * removes old polygons and inserts new ones in one setState call, with one
 * history entry. This avoids stale-closure and mid-operation re-render issues.
 */
export function usePolygonOps() {
  const getPolygon = (id: string): Polygon | null => {
    const a = useAnnotationStore
      .getState()
      .annotations.find((x) => x.id === id);
    return a?.type === "polygon" ? (a as Polygon) : null;
  };

  // ─── Erase-tool subtract: draw a shape, cut from an existing polygon ─────────
  const handleSubtract = (sourceId: string, subtractorPoints: Point[]) => {
    const source = getPolygon(sourceId);
    if (!source) return;
    try {
      const rings = subtractPolygons(source.points, subtractorPoints);
      const newPolys: Polygon[] = rings.map((ring) => ({
        ...(source as Polygon),
        id: uuidv4(),
        points: ring,
      }));
      useAnnotationStore.getState().replaceAnnotations([sourceId], newPolys);
    } catch (err) {
      console.warn("[usePolygonOps] subtract failed:", err);
    }
  };

  // ─── Subtract selected: A minus B ────────────────────────────────────────────
  const handleSubtractSelected = (subjectId: string, cutterId: string) => {
    const subject = getPolygon(subjectId);
    const cutter = getPolygon(cutterId);
    if (!subject || !cutter) {
      console.warn("[usePolygonOps] subtractSelected: polygon not found", {
        subjectId,
        cutterId,
      });
      return;
    }
    try {
      const rings = subtractPolygons(subject.points, cutter.points);
      // Subject becomes 0-N pieces; cutter is always removed
      const newPolys: Polygon[] = rings.map((ring) => ({
        ...(subject as Polygon),
        id: uuidv4(),
        points: ring,
      }));
      // Only remove the subject — the cutter stays in place on A's boundary.
      useAnnotationStore.getState().replaceAnnotations([subjectId], newPolys);
    } catch (err) {
      console.warn("[usePolygonOps] subtractSelected failed:", err);
    }
  };

  // ─── Merge: union all selected polygons ─────────────────────────────────────
  const handleMerge = (ids: string[]) => {
    const polys = ids.map(getPolygon).filter((p): p is Polygon => p !== null);
    if (polys.length < 2) return;

    try {
      const toPC = (pts: Point[]) => pts.map((p) => [p.x, p.y]);
      const fromPC = (coords: number[][]) => coords.map(([x, y]) => ({ x, y }));
      const allPC = polys.map((p) => [toPC(p.points)]);
      // @ts-expect-error polygon-clipping types are very incomplete
      const result = polygonClipping.union(...allPC);

      const newPolys: Polygon[] = result.map((poly: any) => ({
        ...polys[0],
        id: uuidv4(),
        points: fromPC(poly[0]),
      }));

      useAnnotationStore.getState().replaceAnnotations(ids, newPolys);
    } catch (err) {
      console.warn("[usePolygonOps] merge failed:", err);
    }
  };

  return { handleSubtract, handleSubtractSelected, handleMerge };
}
