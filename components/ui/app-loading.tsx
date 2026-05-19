"use client";

import { cn } from "@/lib/utils";

type AppLoadingVariant =
  | "workspace"
  | "dashboard"
  | "projects"
  | "project"
  | "analytics"
  | "tasks"
  | "team"
  | "editor";

interface AppLoadingProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: AppLoadingVariant;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn("animate-pulse bg-muted", className)} />;
}

function MetricStrip({ count = 4 }: { count?: number }) {
  return (
    <div className="grid border-y border-border bg-card/40 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="border-b border-border px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
        >
          <SkeletonBlock className="h-3 w-20 rounded" />
          <SkeletonBlock className="mt-3 h-6 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

function ListRows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4 px-1 py-3">
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-4 w-2/5 rounded" />
            <SkeletonBlock className="mt-2 h-3 w-1/4 rounded" />
          </div>
          <SkeletonBlock className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-5">
            <SkeletonBlock className="mb-3 h-3 w-20 rounded" />
            <SkeletonBlock className="h-8 w-16 rounded" />
            <SkeletonBlock className="mt-3 h-3 w-24 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <section key={idx}>
            <SkeletonBlock className="mb-3 h-3 w-20 rounded" />
            <ListRows count={4} />
          </section>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <SkeletonBlock className="h-4 w-4 rounded" />
            <SkeletonBlock className="h-4 w-32 max-w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between">
            <SkeletonBlock className="h-9 w-9 rounded-lg" />
            <SkeletonBlock className="h-4 w-4 rounded" />
          </div>
          <SkeletonBlock className="h-4 w-3/5 rounded" />
          <SkeletonBlock className="mt-3 h-3 w-full rounded" />
          <SkeletonBlock className="mt-2 h-3 w-2/3 rounded" />
          <SkeletonBlock className="mt-5 h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div>
      <SkeletonBlock className="mb-4 h-4 w-24 rounded" />

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <SkeletonBlock className="h-3 w-40 rounded" />
            <SkeletonBlock className="mt-3 h-8 w-72 max-w-full rounded" />
            <SkeletonBlock className="mt-3 h-4 w-[520px] max-w-full rounded" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-28 rounded-md" />
            <SkeletonBlock className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </header>

      <div className="my-5">
        <MetricStrip />
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <SkeletonBlock className="h-3 w-36 rounded" />
          <SkeletonBlock className="h-3 w-10 rounded" />
        </div>
        <SkeletonBlock className="h-1 w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-border/70 lg:border-r lg:pr-5">
          <SkeletonBlock className="mb-3 h-3 w-14 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <SkeletonBlock className="h-4 w-24 rounded" />
                <SkeletonBlock className="h-4 w-6 rounded" />
              </div>
            ))}
          </div>

          <SkeletonBlock className="mb-3 mt-6 h-3 w-14 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonBlock key={idx} className="h-4 w-28 rounded" />
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <SkeletonBlock className="h-4 w-36 rounded" />
              <SkeletonBlock className="mt-2 h-3 w-64 max-w-full rounded" />
            </div>
            <SkeletonBlock className="h-8 w-24 rounded-md" />
          </div>

          <SkeletonBlock className="mb-3 h-20 w-full rounded-md" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="p-1.5">
                <SkeletonBlock className="aspect-square rounded" />
                <SkeletonBlock className="mt-2 h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-border bg-card p-5">
          <SkeletonBlock className="mb-5 h-3 w-24 rounded" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div key={rowIdx}>
                <div className="mb-2 flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-24 rounded" />
                  <SkeletonBlock className="h-3 w-8 rounded" />
                </div>
                <SkeletonBlock className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {Array.from({ length: 7 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-4 w-2/5 rounded" />
            <SkeletonBlock className="mt-2 h-3 w-1/4 rounded" />
            <SkeletonBlock className="mt-3 h-3 w-3/5 rounded" />
          </div>
          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <SkeletonBlock className="h-3 w-20 rounded" />
            <SkeletonBlock className="h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_1.2fr_0.9fr] gap-4 border-b border-border px-4 py-2.5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <SkeletonBlock key={idx} className="h-3 w-20 rounded" />
        ))}
      </div>
      {Array.from({ length: 7 }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[1.2fr_1.4fr_0.9fr_1.2fr_0.9fr] gap-4 border-b border-border px-4 py-3 last:border-0"
        >
          {Array.from({ length: 5 }).map((_, cellIdx) => (
            <SkeletonBlock key={cellIdx} className="h-4 w-full rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="dark flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-11 items-center gap-3 border-b border-border/60 bg-card px-3">
        <SkeletonBlock className="h-6 w-28 rounded" />
        <SkeletonBlock className="h-6 w-px" />
        {Array.from({ length: 8 }).map((_, idx) => (
          <SkeletonBlock key={idx} className="h-7 w-7 rounded-md" />
        ))}
        <div className="ml-auto flex gap-2">
          <SkeletonBlock className="h-7 w-20 rounded-md" />
          <SkeletonBlock className="h-7 w-24 rounded-md" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-64 border-r border-border/60 bg-card">
          <div className="flex h-9 items-center justify-between border-b border-border/60 px-3">
            <SkeletonBlock className="h-3 w-16 rounded" />
            <SkeletonBlock className="h-5 w-5 rounded" />
          </div>
          <div className="space-y-3 p-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonBlock key={idx} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </aside>

        <main className="relative flex-1 bg-background p-8">
          <div className="absolute left-8 top-8 flex gap-2">
            <SkeletonBlock className="h-7 w-24 rounded-md" />
            <SkeletonBlock className="h-7 w-20 rounded-md" />
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="aspect-[4/3] w-[62%] max-w-3xl border border-border bg-card/50 p-4">
              <SkeletonBlock className="h-full w-full" />
            </div>
          </div>
        </main>

        <aside className="w-64 border-l border-border/60 bg-card">
          <div className="flex h-9 items-center justify-between border-b border-border/60 px-3">
            <SkeletonBlock className="h-5 w-5 rounded" />
            <SkeletonBlock className="h-3 w-20 rounded" />
          </div>
          <div className="space-y-5 p-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx}>
                <SkeletonBlock className="mb-3 h-3 w-24 rounded" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-8 w-full rounded-md" />
                  <SkeletonBlock className="h-8 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className="flex h-7 items-center justify-between border-t border-border/60 bg-card px-4">
        <SkeletonBlock className="h-3 w-48 rounded" />
        <SkeletonBlock className="h-3 w-64 rounded" />
      </footer>
    </div>
  );
}

function WorkspaceSkeleton({ fullScreen }: { fullScreen: boolean }) {
  return (
    <div className={cn("bg-background text-foreground", fullScreen && "min-h-screen")}>
      {fullScreen && (
        <div className="flex h-12 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-5">
            <SkeletonBlock className="h-5 w-24 rounded" />
            <SkeletonBlock className="hidden h-4 w-px sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              {Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonBlock key={idx} className="h-7 w-20 rounded-md" />
              ))}
            </div>
          </div>
          <SkeletonBlock className="h-8 w-32 rounded-md" />
        </div>
      )}

      <div className={cn("mx-auto w-full max-w-5xl py-4", fullScreen && "px-6 py-10")}>
        <DashboardSkeleton />
      </div>
    </div>
  );
}

export function AppLoading({
  title = "Loading workspace",
  fullScreen = false,
  className,
  variant = "workspace",
}: AppLoadingProps) {
  const content = (() => {
    switch (variant) {
      case "dashboard":
        return <DashboardSkeleton />;
      case "projects":
        return <ProjectsSkeleton />;
      case "project":
        return <ProjectSkeleton />;
      case "analytics":
        return <AnalyticsSkeleton />;
      case "tasks":
        return <TasksSkeleton />;
      case "team":
        return <TeamSkeleton />;
      case "editor":
        return <EditorSkeleton />;
      default:
        return <WorkspaceSkeleton fullScreen={fullScreen} />;
    }
  })();

  return (
    <div role="status" aria-label={title} className={className}>
      {content}
    </div>
  );
}
