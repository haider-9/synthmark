'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen,
} from 'lucide-react';

interface MainLayoutProps {
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
  canvas: React.ReactNode;
  topToolbar: React.ReactNode;
  bottomBar: React.ReactNode;
}

export function MainLayout({ leftSidebar, rightSidebar, canvas, topToolbar, bottomBar }: MainLayoutProps) {
  const [leftOpen, setLeftOpen]   = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden select-none">

        {/* ── Top toolbar ─────────────────────────────────────────────── */}
        <header id="top-toolbar" className="h-11 border-b border-border/60 flex items-center px-3 bg-card flex-shrink-0 z-20">
          {topToolbar}
        </header>

        {/* ── Main area ───────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar */}
          <aside
            id="sidebar-left"
            className="flex flex-col border-r border-border/60 bg-card flex-shrink-0 overflow-hidden"
            style={{
              width: leftOpen ? 256 : 36,
              transition: 'width 180ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {leftOpen ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-3 h-9 border-b border-border/60 flex-shrink-0">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Layers
                  </span>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                          onClick={() => setLeftOpen(false)}>
                          <PanelLeftClose className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent side="right" className="text-xs">Collapse</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex-1 overflow-hidden">{leftSidebar}</div>
              </div>
            ) : (
              /* Collapsed rail */
              <div className="flex flex-col items-center pt-2 gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setLeftOpen(true)}>
                        <PanelLeftOpen className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  <TooltipContent side="right" className="text-xs">Expand layers</TooltipContent>
                </Tooltip>
              </div>
            )}
          </aside>

          {/* Canvas */}
          <main id="canvas-container" className="flex-1 relative overflow-hidden bg-background">
            {canvas}
          </main>

          {/* Right sidebar */}
          <aside
            id="sidebar-right"
            className="flex flex-col border-l border-border/60 bg-card flex-shrink-0 overflow-hidden"
            style={{
              width: rightOpen ? 256 : 36,
              transition: 'width 180ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {rightOpen ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between px-3 h-9 border-b border-border/60 flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                          onClick={() => setRightOpen(false)}>
                          <PanelRightClose className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent side="left" className="text-xs">Collapse</TooltipContent>
                  </Tooltip>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Properties
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">{rightSidebar}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center pt-2 gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setRightOpen(true)}>
                        <PanelRightOpen className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  <TooltipContent side="left" className="text-xs">Expand properties</TooltipContent>
                </Tooltip>
              </div>
            )}
          </aside>
        </div>

        {/* ── Status bar ──────────────────────────────────────────────── */}
        <footer className="h-7 border-t border-border/60 flex items-center px-4 text-[11px] text-muted-foreground bg-card flex-shrink-0">
          {bottomBar}
        </footer>

      </div>
    </TooltipProvider>
  );
}
