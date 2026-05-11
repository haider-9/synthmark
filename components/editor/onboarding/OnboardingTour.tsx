"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function OnboardingTour() {
  useEffect(() => {
    const isDone = localStorage.getItem("synthmark-onboarding-done");
    if (isDone) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: "rgba(0, 0, 0, 0.75)",
      steps: [
        {
          element: "#top-toolbar",
          popover: {
            title: "Welcome to Synthmark!",
            description: "This is your primary toolbar where you can select tools, undo/redo actions, and export your work.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: ".bg-muted\\/40.rounded-md.p-0\\.5", // This targets the Tool Palette group
          popover: {
            title: "Annotation Tools",
            description: "Choose from Bounding Boxes, Polygons, Lasso, Circles, and Keypoints to annotate your images. Use shortcuts like 'B', 'P', 'L', 'C' to switch quickly.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#canvas-container",
          popover: {
            title: "The Canvas",
            description: "Draw your annotations directly on the image. You can use Space to pan and Scroll to zoom. Use the new Lasso tool for free-hand drawing!",
            side: "left",
            align: "center",
          },
        },
        {
          element: "#sidebar-left",
          popover: {
            title: "Layers & Objects",
            description: "Manage your annotations here. You can toggle visibility, lock layers, or delete them.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#sidebar-right",
          popover: {
            title: "Properties & Labels",
            description: "Define label classes and edit properties of the selected annotation.",
            side: "left",
            align: "start",
          },
        },
        {
          popover: {
            title: "Ready to go!",
            description: "You're all set. Start by drawing your first object or use the Auto-label feature for AI assistance.",
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem("synthmark-onboarding-done", "true");
      },
    });

    // Small delay to ensure everything is rendered
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
