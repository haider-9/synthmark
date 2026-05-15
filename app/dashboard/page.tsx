"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, ClipboardList, BarChart3 } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { useAuthStore, userInitials } from "@/stores/useAuthStore";
import { ROLE_CONFIG } from "@/types/auth";
import { AppLoading } from "@/components/ui/app-loading";

interface DashboardData {
  stats: {
    users: number;
    projects: number;
    activeProjects: number;
    datasetItems: number;
    completedItems: number;
    completionRate: number;
    annotations: number;
    assignedTasks: number;
    openTasks: number;
    pendingReviews: number;
    approvedReviews: number;
  };
  projects: { name: string; tasks: number; progress: number }[];
  tasks: { id: string; title: string; status: string; dueAt: string | null; projectName: string | null }[];
  reviews: { id: string; status: string; feedback: string | null; taskTitle: string | null; projectName: string | null }[];
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
      <p className="text-[12px] text-[#555] mb-2">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-[#444] mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-[11px] font-medium text-[#555] uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

function ProjectRow({ name, tasks, progress }: { name: string; tasks: number; progress: number }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white truncate">{name}</p>
        <p className="text-[11px] text-[#555] mt-0.5">{tasks.toLocaleString()} images</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[12px] text-[#555] tabular-nums w-8 text-right">{progress}%</span>
        <div className="h-1 w-28 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div className="h-full bg-[#333] rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-10 text-center">
      <p className="text-[13px] text-[#555]">{title}</p>
      <Link href={href} className="inline-flex mt-4 text-[12px] text-primary hover:text-primary/80">
        {cta}
      </Link>
    </div>
  );
}

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) return res.json().then((body) => Promise.reject(body.error ?? "Failed to load dashboard"));
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(typeof err === "string" ? err : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const cfg = ROLE_CONFIG[user.role];
  const stats = data?.stats;

  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start gap-3 mb-8">
          <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-semibold text-[#666] leading-none">{userInitials(user)}</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{greeting()}, {user.firstName}.</h1>
            <p className="text-[13px] text-[#555] mt-0.5">{cfg.label}</p>
          </div>
        </div>

        {loading ? (
          <AppLoading title="Building dashboard" subtitle="Gathering project progress and work queues." />
        ) : error || !data || !stats ? (
          <EmptyState title={error ?? "Dashboard data is unavailable."} href="/projects" cta="Open projects" />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Projects" value={String(stats.projects)} sub={`${stats.activeProjects} active`} />
              <StatCard label="Images" value={String(stats.datasetItems)} sub={`${stats.completedItems} completed`} />
              <StatCard label="Annotations" value={stats.annotations.toLocaleString()} sub="saved to datasets" />
              <StatCard label="Completion" value={`${stats.completionRate}%`} sub={`${stats.openTasks} open tasks`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <SectionTitle>Projects</SectionTitle>
                {data.projects.length ? (
                  <div className="bg-[#111] border border-[#1e1e1e] rounded-xl divide-y divide-[#1a1a1a]">
                    {data.projects.map((project) => <ProjectRow key={project.name} {...project} />)}
                  </div>
                ) : (
                  <EmptyState title="No projects yet." href="/projects" cta="Create a project" />
                )}
              </div>

              <div>
                <SectionTitle>Work Queue</SectionTitle>
                <div className="bg-[#111] border border-[#1e1e1e] rounded-xl divide-y divide-[#1a1a1a]">
                  {data.tasks.length ? data.tasks.map((task) => (
                    <Link key={task.id} href="/tasks" className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#161616]">
                      <div className="min-w-0">
                        <p className="text-[13px] text-white truncate">{task.title}</p>
                        <p className="text-[11px] text-[#555] mt-0.5">{task.projectName ?? "Project"}</p>
                      </div>
                      <span className="text-[11px] text-[#555] capitalize">{task.status.replace("_", " ")}</span>
                    </Link>
                  )) : (
                    <div className="px-5 py-8 text-center text-[13px] text-[#555]">No assigned tasks.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/projects" className="bg-[#111] border border-[#1e1e1e] hover:border-[#333] rounded-xl p-4 flex items-center gap-3">
                <FolderOpen className="h-4 w-4 text-[#777]" />
                <span className="text-[13px] text-white">Manage projects</span>
              </Link>
              <Link href="/tasks" className="bg-[#111] border border-[#1e1e1e] hover:border-[#333] rounded-xl p-4 flex items-center gap-3">
                <ClipboardList className="h-4 w-4 text-[#777]" />
                <span className="text-[13px] text-white">{stats.assignedTasks} assigned tasks</span>
              </Link>
              <Link href="/analytics" className="bg-[#111] border border-[#1e1e1e] hover:border-[#333] rounded-xl p-4 flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-[#777]" />
                <span className="text-[13px] text-white">{stats.pendingReviews} pending reviews</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
