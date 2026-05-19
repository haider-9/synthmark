"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import {
  AlertCircle,
  Images,
  Tag,
  Pencil,
  ArrowLeft,
  CheckCircle2,
  Clock,
  SkipForward,
  Circle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadZone } from "@/components/projects/ImageUploadZone";
import { AppLoading } from "@/components/ui/app-loading";

interface LabelClass {
  id: string;
  name: string;
  color: string;
}

interface ProjectImage {
  id: string;
  fileName: string;
  imageUrl?: string;
  status: "todo" | "in_progress" | "completed" | "skipped";
  thumbnailUrl?: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  images: ProjectImage[];
  labelClasses: LabelClass[];
}

const STATUS_CONFIG = {
  todo: { label: "To do", icon: Circle, color: "text-muted-foreground" },
  in_progress: { label: "In progress", icon: Clock, color: "text-amber-500" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
  skipped: { label: "Skipped", icon: SkipForward, color: "text-muted-foreground" },
} as const;

function ProjectOverviewContent({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleImageUploaded = (img: {
    id: string;
    fileName: string;
    imageUrl: string;
    width: number;
    height: number;
    status: "todo";
  }) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            images: [
              ...prev.images,
              {
                id: img.id,
                fileName: img.fileName,
                imageUrl: img.imageUrl,
                status: img.status,
              },
            ],
          }
        : prev,
    );
  };

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) {
          return r
            .json()
            .then((b) => Promise.reject(b.error ?? `HTTP ${r.status}`));
        }
        return r.json();
      })
      .then((data) => setProject(data))
      .catch((err) =>
        setError(typeof err === "string" ? err : "Failed to load project"),
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardNav />
        <main className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6">
          <AppLoading variant="project" title="Loading project" />
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-foreground">Failed to load project</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const statusCounts = project.images.reduce(
    (acc, img) => {
      acc[img.status] = (acc[img.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const totalImages = project.images.length;
  const completedImages = statusCounts.completed ?? 0;
  const inProgressImages = statusCounts.in_progress ?? 0;
  const progressPct =
    totalImages > 0 ? Math.round((completedImages / totalImages) * 100) : 0;
  const createdDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(project.createdAt));
  const statusEntries = Object.entries(STATUS_CONFIG) as [
    keyof typeof STATUS_CONFIG,
    typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG],
  ][];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6">
        <button
          onClick={() => router.push("/projects")}
          className="mb-4 flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </button>

        <header className="border-b border-border pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span>Project</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{createdDate}</span>
              </div>
              <h1 className="mt-1 truncate text-2xl font-semibold text-foreground">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("project-upload-zone")?.click()}
                className="gap-2 text-[13px]"
              >
                <Images className="h-4 w-4" />
                Add images
              </Button>
              <Button
                onClick={() => router.push(`/project/${projectId}/editor`)}
                className="gap-2 text-[13px] font-medium"
              >
                <Pencil className="h-4 w-4" />
                Open editor
              </Button>
            </div>
          </div>
        </header>

        <div className="my-5 grid border-y border-border bg-card/40 sm:grid-cols-4">
          {[
            { label: "Images", value: totalImages },
            { label: "Classes", value: project.labelClasses.length },
            { label: "In progress", value: inProgressImages },
            { label: "Complete", value: `${completedImages}/${totalImages}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="border-b border-border px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>

        {totalImages > 0 && (
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[12px] font-medium text-muted-foreground">
                Annotation completion
              </p>
              <span className="font-mono text-[12px] text-muted-foreground">
                {progressPct}%
              </span>
            </div>
            <div className="h-1 overflow-hidden bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-border/70 lg:border-r lg:pr-5">
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Queue
              </p>
              <div className="space-y-1">
                {statusEntries.map(([key, cfg]) => {
                  const count = statusCounts[key] ?? 0;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={key}
                      className="flex h-8 items-center justify-between text-[12px]"
                    >
                      <span className={`flex items-center gap-2 ${cfg.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <Tag className="h-3 w-3" />
                Labels
              </p>
              <div className="space-y-1.5">
                {project.labelClasses.length > 0 ? (
                  project.labelClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-2 text-[12px]">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: cls.color }}
                      />
                      <span className="truncate text-foreground/80">{cls.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-muted-foreground">No labels configured</p>
                )}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Image contact sheet
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  Scan the queue, upload more images, or jump into annotation.
                </p>
              </div>
              {project.images.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/project/${projectId}/editor`)}
                  className="h-8 gap-2 text-[12px]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Annotate
                </Button>
              )}
            </div>

            <ImageUploadZone
              projectId={projectId}
              onUploaded={handleImageUploaded}
              className="mb-3 min-h-20 rounded-md"
              triggerId="project-upload-zone"
            />

            {project.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {project.images.map((img) => {
                  const cfg = STATUS_CONFIG[img.status];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={img.id}
                      onClick={() => router.push(`/project/${projectId}/editor`)}
                      className="group min-w-0 rounded-md border border-transparent p-1.5 text-left transition-colors hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <div className="relative aspect-square overflow-hidden rounded bg-muted">
                        {img.imageUrl ? (
                          <NextImage
                            src={img.imageUrl}
                            alt={img.fileName}
                            fill
                            unoptimized
                            sizes="(min-width: 1280px) 14vw, (min-width: 768px) 20vw, 50vw"
                            className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center rounded bg-background/90 px-1.5 py-1 backdrop-blur">
                          <span className={`flex min-w-0 items-center gap-1 text-[10px] ${cfg.color}`}>
                            <Icon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{cfg.label}</span>
                          </span>
                        </div>
                      </div>
                      <span className="mt-1.5 block truncate text-[11px] text-muted-foreground group-hover:text-foreground">
                        {img.fileName}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="min-h-64 border border-border bg-card/40 px-6 py-8">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium text-foreground">No images uploaded</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Upload images to start annotating this project.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  return (
    <AuthGuard>
      <ProjectOverviewContent projectId={projectId} />
    </AuthGuard>
  );
}
