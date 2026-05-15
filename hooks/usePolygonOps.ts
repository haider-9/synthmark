'use client';

import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { Polygon, Point } from '@/types/annotation';
import { subtractPolygons, unionPolygons } from '@/lib/polygon-utils';
import { v4 as uuidv4 } from 'uuid';

export function usePolygonOps() {

  const getPolygon = (id: string): Polygon | null => {
    const a = useAnnotationStore.getState().annotations.find((x) => x.id === id);
    return a?.type === 'polygon' ? (a as Polygon) : null;
  };

  /** Erase-tool: draw a shape and cut it from an existing polygon */
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
      console.warn('[usePolygonOps] subtract failed:', err);
    }
  };

  /** Select two polygons → A minus B. Subject is removed and replaced with remainder, cutter stays. */
  const handleSubtractSelected = (subjectId: string, cutterId: string) => {
    const subject = getPolygon(subjectId);
    const cutter  = getPolygon(cutterId);
    if (!subject || !cutter) {
      console.warn('[usePolygonOps] subtractSelected: polygon not found', { subjectId, cutterId });
      return;
    }
    try {
      const rings = subtractPolygons(subject.points, cutter.points);
      const newPolys: Polygon[] = rings.map((ring) => ({
        ...(subject as Polygon),
        id: uuidv4(),
        points: ring,
      }));
      // Remove ONLY subject — cutter stays intact
      useAnnotationStore.getState().replaceAnnotations([subjectId], newPolys);
    } catch (err) {
      console.warn('[usePolygonOps] subtractSelected failed:', err);
    }
  };

  /** Union all selected polygons into one */
  const handleMerge = (ids: string[]) => {
    const polys = ids.map(getPolygon).filter((p): p is Polygon => p !== null);
    if (polys.length < 2) return;
    try {
      let mergedPoints = polys[0].points;
      for (let i = 1; i < polys.length; i++) {
        const result = unionPolygons(mergedPoints, polys[i].points);
        if (result.length > 0) mergedPoints = result[0];
      }
      const merged: Polygon = { ...polys[0], id: uuidv4(), points: mergedPoints };
      useAnnotationStore.getState().replaceAnnotations(ids, [merged]);
    } catch (err) {
      console.warn('[usePolygonOps] merge failed:', err);
    }
  };

  return { handleSubtract, handleSubtractSelected, handleMerge };
}
