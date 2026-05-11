"use client";

import { useEffect, useRef } from "react";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { usePolygonOps } from "@/hooks/usePolygonOps";

export function useKeyboardShortcuts() {
  const {
    setActiveTool,
    undo,
    redo,
    deleteAnnotations,
    selectedAnnotationIds,
    activeTool,
    annotations,
    activeVertex,
    deleteActiveVertex,
  } = useAnnotationStore();

  const { handleMerge, handleSubtractSelected } = usePolygonOps();

  // Track previous tool for space-pan toggle
  const prevToolRef = useRef(activeTool);

  useEffect(() => {
    if (activeTool !== "pan") {
      prevToolRef.current = activeTool;
    }
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrl && !shift && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }

      if (
        ctrl &&
        (shift ? e.key === "Z" || e.key.toLowerCase() === "z" : false)
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+Shift+Z
      if (ctrl && shift && (e.key === "Z" || e.key === "z")) {
        e.preventDefault();
        redo();
        return;
      }

      switch (e.key) {
        case "Enter": {
          // Confirm the pending merge or subtract-selected operation
          const selPolys = selectedAnnotationIds.filter(
            (id) => annotations.find((a) => a.id === id)?.type === "polygon",
          );
          if (activeTool === "merge" && selPolys.length >= 2) {
            e.preventDefault();
            handleMerge(selPolys);
          } else if (activeTool === "erase" && selPolys.length === 2) {
            e.preventDefault();
            handleSubtractSelected(selPolys[0], selPolys[1]);
          }
          break;
        }
        case "Delete":
        case "Backspace":
          if (activeVertex) {
            // A single vertex is focused — delete just that point
            deleteActiveVertex();
          } else if (selectedAnnotationIds.length > 0) {
            deleteAnnotations(selectedAnnotationIds);
          }
          break;
        case "v":
        case "V":
          setActiveTool("select");
          break;
        case "b":
        case "B":
          setActiveTool("box");
          break;
        case "p":
        case "P":
          setActiveTool("polygon");
          break;
        case "k":
        case "K":
          setActiveTool("keypoint");
          break;
        case "e":
        case "E": {
          // If exactly 2 polygons selected → subtract first minus second
          const selPolys = selectedAnnotationIds.filter(
            (id) => annotations.find((a) => a.id === id)?.type === "polygon",
          );
          if (selPolys.length === 2) {
            handleSubtractSelected(selPolys[0], selPolys[1]);
          } else {
            setActiveTool("erase");
          }
          break;
        }
        case "m":
        case "M": {
          const selPolys2 = selectedAnnotationIds.filter(
            (id) => annotations.find((a) => a.id === id)?.type === "polygon",
          );
          if (selPolys2.length >= 2) {
            handleMerge(selPolys2);
          } else {
            setActiveTool("merge");
          }
          break;
        }
        case " ":
          e.preventDefault();
          if (activeTool !== "pan") {
            prevToolRef.current = activeTool;
            setActiveTool("pan");
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " && activeTool === "pan") {
        setActiveTool(prevToolRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteAnnotations,
    selectedAnnotationIds,
    handleMerge,
    handleSubtractSelected,
    annotations,
    activeVertex,
    deleteActiveVertex,
  ]);
}
