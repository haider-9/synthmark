import polygonClipping from "polygon-clipping";
import { Point } from "../types/annotation";

/**
 * Converts a list of Point objects to the format expected by polygon-clipping: [[x, y], [x, y], ...]
 */
export const pointsToPC = (points: Point[]): [number, number][] => {
  return points.map((p) => [p.x, p.y]);
};

/**
 * Converts the format from polygon-clipping back to a list of Point objects.
 */
export const pcToPoints = (pcPoints: [number, number][]): Point[] => {
  return pcPoints.map(([x, y]) => ({ x, y }));
};

/**
 * Performs a union operation on two polygons.
 */
export const unionPolygons = (p1: Point[], p2: Point[]): Point[][] => {
  const result = polygonClipping.union([pointsToPC(p1)], [pointsToPC(p2)]);
  // Result is MultiPolygon: Polygon[] -> Ring[] -> [x, y][]
  return result.map((poly) => pcToPoints(poly[0])); // Returning only the exterior rings for now
};

/**
 * Performs a difference operation (p1 - p2).
 */
export const subtractPolygons = (p1: Point[], p2: Point[]): Point[][] => {
  const result = polygonClipping.difference([pointsToPC(p1)], [pointsToPC(p2)]);
  return result.map((poly) => pcToPoints(poly[0]));
};

/**
 * Returns true when two polygons share any overlapping area.
 * Used by merge / subtract to prevent operating on non-touching shapes.
 */
export const polygonsOverlap = (p1: Point[], p2: Point[]): boolean => {
  try {
    const result = polygonClipping.intersection(
      [pointsToPC(p1)],
      [pointsToPC(p2)],
    );
    return result.length > 0;
  } catch {
    return false;
  }
};

/**
 * Simplifies a polygon using a simple distance-based threshold (optional, for later).
 */
export const simplifyPolygon = (
  points: Point[],
  tolerance: number = 1,
): Point[] => {
  if (points.length <= 2) return points;

  const result = [points[0]];
  let prev = points[0];

  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const dist = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2),
    );
    if (dist > tolerance) {
      result.push(curr);
      prev = curr;
    }
  }

  return result;
};
