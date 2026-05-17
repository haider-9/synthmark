"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import {
  AlertCircle,
  FolderOpen,
  Images,
  Tag,
  Pencil,
  ArrowLeft,
  CheckCircle2,
  Clock,
  SkipForward,
  Circle,
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

  const handleImageUploaded = (img: { id: string; fileName: string; imageUrl: string; width: number; height: number; status: "todo" }) => {
    setProject((prev) =>
      prev
        ? { ...prev, images: [...prev.images, { id: img.id, fileName: img.fileName, imageUrl: img.imageUrl, status: img.status }] }
        : prev
    );
  };

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) return r.json().then((b) => Promise.reject(b.error ?? `HTTP ${r.status}`));
        return r.json();
      })
      .then((data) => setProject(data))
      .catch((err) => setError(typeof err === "string" ? err : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardNav />
        <AppLoading title="Loading project" subtitle="Opening images, label classes, and progress." />
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
    (acc, img) => { acc[img.status] = (acc[img.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const totalImages = project.images.length;
  const completedImages = statusCounts.completed ?? 0;
  const progressPct = totalImages > 0 ? Math.round((completedImages / totalImages) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Back + header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All projects
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
                {project.description && (
                  <p className="text-[13px] text-muted-foreground mt-0.5">{project.description}</p>
                )}
              </div>
            </div>

            <Button
              onClick={() => router.push(`/project/${projectId}/editor`)}
              className="gap-2 text-[13px] font-medium shrink-0"
            >
              <Pencil className="h-4 w-4" />
              Open editor
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Images, label: "Images", value: totalImages },
            { icon: Tag, label: "Label classes", value: project.labelClasses.length },
            { icon: CheckCircle2, label: "Completed", value: `${completedImages} / ${totalImages}` },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {totalImages > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-medium text-foreground">Annotation progress</p>
              <span className="text-[12px] font-mono text-muted-foreground">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center gap-4 mt-3">
              {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => {
                const count = statusCounts[key] ?? 0;
                if (count === 0) return null;
                const Icon = cfg.icon;
                return (
                  <div key={key} className={`flex items-center gap-1.5 text-[11px] ${cfg.color}`}>
                    <Icon className="h-3 w-3" />
                    <span>{count} {cfg.label.toLowerCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Label classes */}
        {project.labelClasses.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <p className="text-[13px] font-medium text-foreground mb-3">Label classes</p>
            <div className="flex flex-wrap gap-2">
              {project.labelClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-medium"
                  style={{
                    borderColor: cls.color + "40",
                    backgroundColor: cls.color + "15",
                    color: cls.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  {cls.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <p className="text-[13px] font-medium text-foreground">Images</p>
            <span className="text-[11px] text-muted-foreground tabular-nums">{project.images.length} total</span>
          </div>

          {/* Upload zone */}
          <div className="p-4 border-b border-border">
            <ImageUploadZone projectId={projectId} onUploaded={handleImageUploaded} />
          </div>

          {project.images.length > 0 && (
            <div className="divide-y divide-border">
              {project.images.slice(0, 20).map((img) => {
                const cfg = STATUS_CONFIG[img.status];
                const Icon = cfg.icon;
                return (
                  <div
                    key={img.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-card transition-colors"
                  >
                    <span className="text-[13px] text-muted-foreground truncate max-w-xs">{img.fileName}</span>
                    <div className={`flex items-center gap-1.5 text-[11px] ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      <span>{cfg.label}</span>
                    </div>
                  </div>
                );
              })}
              {project.images.length > 20 && (
                <div className="px-5 py-3 text-[12px] text-muted-foreground">
                  +{project.images.length - 20} more images
                </div>
              )}
            </div>
          )}
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
