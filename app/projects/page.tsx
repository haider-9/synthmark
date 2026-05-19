"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { FolderOpen, Plus, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppLoading } from "@/components/ui/app-loading";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

function ProjectsContent() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, [dialogOpen]); // refetch after dialog closes (new project may have been created)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Projects</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              {loading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 text-[13px] font-medium"
          >
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <AppLoading variant="projects" title="Loading projects" />
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="bg-card border border-border rounded-xl p-20 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">No projects yet</p>
              <p className="text-[13px] text-muted-foreground mt-1">Create your first project to get started.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 mt-2 border-border text-muted-foreground hover:text-foreground hover:border-border"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Create project
            </Button>
          </div>
        ) : (
          /* Project grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/project/${project.id}`)}
                className="group text-left bg-card border border-border hover:border-border rounded-xl p-5 transition-all duration-150 hover:bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-4 w-4 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-muted-foreground transition-colors mt-1" />
                </div>
                <h3 className="text-sm font-semibold text-foreground truncate mb-1">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-[12px] text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-auto">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsContent />
    </AuthGuard>
  );
}
