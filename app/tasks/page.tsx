"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ClipboardList } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AppLoading } from "@/components/ui/app-loading";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueAt: string | null;
  projectId: string;
  projectName: string | null;
}

function TasksContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => {
        if (!res.ok) return res.json().then((body) => Promise.reject(body.error ?? "Failed to load tasks"));
        return res.json();
      })
      .then((data) => setTasks(data.tasks ?? []))
      .catch((err) => setError(typeof err === "string" ? err : "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">Tasks</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {loading ? "Loading..." : `${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {loading ? (
          <AppLoading title="Loading tasks" subtitle="Checking assignments and review status." />
        ) : error ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-[13px] text-muted-foreground">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-20 flex flex-col items-center justify-center text-center gap-3">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">No tasks are assigned yet.</p>
            <Link href="/projects" className="text-[12px] text-primary hover:text-primary/80">Open projects</Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/project/${task.projectId}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{task.projectName ?? "Project"}</p>
                  {task.description && <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                </div>
                <div className="shrink-0 flex items-center gap-4">
                  {task.dueAt && (
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueAt).toLocaleDateString()}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground capitalize">{task.status.replace("_", " ")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <TasksContent />
    </AuthGuard>
  );
}
