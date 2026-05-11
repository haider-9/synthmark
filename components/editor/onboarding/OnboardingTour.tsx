'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function OnboardingTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('synthmark-tour-seen');
    if (hasSeenTour) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: '#editor-toolbar',
          popover: {
            title: 'Toolbar',
            description: 'Select your annotation tools here. You can choose between Bounding Boxes, Polygons, Circles, Polylines, Brush, and Lasso tools.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#editor-toolbar',
          popover: {
            title: 'Advanced Tools',
            description: 'The Brush tool allows freeform drawing, while Lasso helps you quickly create complex polygons by tracing.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#editor-canvas',
          popover: {
            title: 'Annotation Canvas',
            description: 'This is where the magic happens. Click and drag to draw boxes or circles, and click to place points for polygons and lines.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#editor-left-sidebar',
          popover: {
            title: 'Layers Panel',
            description: 'Manage all your created annotations here. You can toggle visibility, lock layers, or delete them.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#editor-right-sidebar',
          popover: {
            title: 'Properties Panel',
            description: 'Define your label classes and adjust properties of the selected annotation.',
            side: 'left',
            align: 'start'
          }
        },
        {
          popover: {
            title: 'Ready to go!',
            description: 'Use the keyboard shortcuts (hover over tools to see them) for a faster workflow. Happy labeling!',
          }
        }
      ],
      onDestroyed: () => {
        localStorage.setItem('synthmark-tour-seen', 'true');
      }
    });

    // Small delay to ensure layout is ready
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
