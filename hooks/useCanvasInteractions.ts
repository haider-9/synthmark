'use client';

import { useCallback } from 'react';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { Point } from '@/types/annotation';

export function useCanvasInteractions() {

  /**
   * Called on every drag-move of a polygon vertex.
   * Reads fresh state via getState() — no stale closure.
   * Does NOT save history on every frame (too noisy).
   */
  const handleVertexDragMove = useCallback(
    (annId: string, index: number, newPos: Point) => {
      const ann = useAnnotationStore.getState().annotations.find((a) => a.id === annId);
      if (!ann || ann.type !== 'polygon') return;

      const newPoints = [...ann.points];
      newPoints[index] = { x: newPos.x, y: newPos.y };

      useAnnotationStore.setState((state) => ({
        annotations: state.annotations.map((a) =>
          a.id === annId ? { ...a, points: newPoints } : a
        ),
      }));
    },
    [] // no deps — always reads fresh via getState()
  );

  /**
   * Called when user clicks an edge midpoint to insert a new vertex.
   */
  const handleEdgeClick = useCallback(
    (annId: string, index: number, pos: Point) => {
      const ann = useAnnotationStore.getState().annotations.find((a) => a.id === annId);
      if (!ann || ann.type !== 'polygon') return;

      const newPoints = [...ann.points];
      newPoints.splice(index + 1, 0, { x: pos.x, y: pos.y });
      useAnnotationStore.getState().updateAnnotation(annId, { points: newPoints });
    },
    []
  );

  /**
   * Save history after a vertex drag ends.
   */
  const handleVertexDragEnd = useCallback(() => {
    useAnnotationStore.getState().saveHistory();
  }, []);

  return { handleVertexDragMove, handleEdgeClick, handleVertexDragEnd };
}
