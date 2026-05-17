"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLoadingProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  className?: string;
}

export function AppLoading({
  title = "Preparing workspace",
  subtitle = "Syncing projects, labels, and session data.",
  fullScreen = false,
  className,
}: AppLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background text-foreground",
        fullScreen ? "min-h-screen w-screen" : "w-full py-24",
        className,
      )}
    >
      <div className="w-full max-w-sm px-6">
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-card shadow-2xl shadow-foreground/10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.20),transparent_58%)]" />
          <img src="/logo.png" alt="" className="relative h-8 w-8 rounded object-cover" />
          <div className="absolute inset-0 animate-[loadingSweep_1.8s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-foreground/10 to-transparent" />
        </div>

        <div className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
          </div>
          <p className="text-[12px] leading-5 text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mt-6 space-y-2">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 animate-[loadingBar_1.4s_ease-in-out_infinite] rounded-full bg-primary/80" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-2 rounded-full bg-muted" />
            <div className="h-2 rounded-full bg-muted" />
            <div className="h-2 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
