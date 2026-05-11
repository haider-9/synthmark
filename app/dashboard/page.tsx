"use client";

import Link from "next/link";
import { useAuthStore, userInitials } from "@/stores/useAuthStore";
import { ROLE_CONFIG, UserRole } from "@/types/auth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
      <p className="text-[12px] text-[#555] mb-2">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-[#444] mt-1">{sub}</p>}
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const isActive = ["Active", "Online", "Approved", "In Progress"].includes(
    status,
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#777]">
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isActive ? "bg-[#3a3a3a]" : "bg-[#2c2c2c]",
        )}
      />
      {status}
    </span>
  );
}

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-[11px] font-medium text-[#555] uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USERS = [
  {
    name: "Alex Chen",
    email: "admin@synthmark.ai",
    role: "admin" as UserRole,
    active: "2 min ago",
    status: "Active",
  },
  {
    name: "Sarah Kim",
    email: "pm@synthmark.ai",
    role: "project_manager" as UserRole,
    active: "1 hr ago",
    status: "Active",
  },
  {
    name: "Marcus Reed",
    email: "annotator@synthmark.ai",
    role: "annotator" as UserRole,
    active: "3 hr ago",
    status: "Active",
  },
  {
    name: "Priya Patel",
    email: "reviewer@synthmark.ai",
    role: "reviewer" as UserRole,
    active: "5 hr ago",
    status: "Active",
  },
  {
    name: "Tom Walsh",
    email: "viewer@synthmark.ai",
    role: "viewer" as UserRole,
    active: "1 day ago",
    status: "Active",
  },
];

const MOCK_PROJECTS = [
  { name: "Medical Imaging v2", tasks: 1240, progress: 73 },
  { name: "Autonomous Driving", tasks: 890, progress: 45 },
  { name: "Satellite Imagery", tasks: 2100, progress: 91 },
  { name: "Document OCR", tasks: 560, progress: 28 },
  { name: "Wildlife Detection", tasks: 340, progress: 12 },
];

const MOCK_TASKS = [
  {
    name: "Label batch #47",
    project: "Medical Imaging v2",
    due: "Today",
    status: "In Progress",
  },
  {
    name: "Segment vehicles",
    project: "Autonomous Driving",
    due: "Tomorrow",
    status: "Todo",
  },
  {
    name: "Annotate tiles #12",
    project: "Satellite Imagery",
    due: "Dec 20",
    status: "Todo",
  },
  {
    name: "OCR document set 12",
    project: "Document OCR",
    due: "Dec 22",
    status: "Pending",
  },
  {
    name: "Detect wildlife zones",
    project: "Wildlife Detection",
    due: "Dec 25",
    status: "Todo",
  },
];

const MOCK_REVIEWS = [
  {
    name: "Batch #44 — Medical Imaging",
    submitter: "Marcus Reed",
    time: "2 hr ago",
  },
  {
    name: "Batch #12 — Satellite",
    submitter: "Marcus Reed",
    time: "4 hr ago",
  },
  {
    name: "Vehicle labels batch 7",
    submitter: "J. Torres",
    time: "6 hr ago",
  },
  {
    name: "Document set OCR #9",
    submitter: "M. Reed",
    time: "1 day ago",
  },
  {
    name: "Wildlife annotations #3",
    submitter: "A. Novak",
    time: "2 days ago",
  },
];

// ─── Progress row (shared between PM + Viewer) ────────────────────────────────

function ProjectRow({
  name,
  tasks,
  progress,
}: {
  name: string;
  tasks: number;
  progress: number;
}) {
  return (
    <div className="px-5 py-3 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white truncate">{name}</p>
        <p className="text-[11px] text-[#555] mt-0.5">
          {tasks.toLocaleString()} tasks
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[12px] text-[#555] tabular-nums w-8 text-right">
          {progress}%
        </span>
        <div className="h-1 w-28 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#333] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Role dashboards ──────────────────────────────────────────────────────────

function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Users" value="247" sub="+12 this month" />
        <StatCard label="Projects" value="38" sub="6 active" />
        <StatCard label="Annotations" value="1.2M" sub="across all projects" />
        <StatCard label="Storage Used" value="68%" sub="340 GB of 500 GB" />
      </div>

      {/* Users table */}
      <div>
        <SectionTitle>Users</SectionTitle>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Name", "Email", "Role", "Last active", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left text-[11px] font-medium text-[#444] uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr
                  key={u.email}
                  className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#161616] transition-colors"
                >
                  <td className="px-4 py-3 text-[13px] text-white">{u.name}</td>
                  <td className="px-4 py-3 text-[12px] text-[#555]">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#555]">
                    {ROLE_CONFIG[u.role].shortLabel}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#555]">
                    {u.active}
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot status={u.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System health */}
      <div>
        <SectionTitle>System Health</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "API Response", value: "42 ms" },
            { label: "Storage Used", value: "68%" },
            { label: "GPU Queue", value: "3 jobs" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4"
            >
              <p className="text-[11px] text-[#555] mb-1.5">{label}</p>
              <p className="text-[15px] font-semibold text-white tabular-nums">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PMDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active Projects" value="5" sub="of 38 total" />
        <StatCard
          label="Tasks Assigned"
          value="847"
          sub="across all projects"
        />
        <StatCard
          label="Overall Progress"
          value="68%"
          sub="on active projects"
        />
      </div>

      <div>
        <SectionTitle>Projects</SectionTitle>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl divide-y divide-[#1a1a1a]">
          {MOCK_PROJECTS.map((p) => (
            <ProjectRow key={p.name} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnotatorDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Tasks Assigned" value="12" sub="4 due today" />
        <StatCard label="Completed Today" value="4" sub="32 this week" />
        <StatCard label="Accuracy Score" value="97.3%" sub="last 100 tasks" />
      </div>

      <div>
        <SectionTitle>Your Tasks</SectionTitle>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl divide-y divide-[#1a1a1a]">
          {MOCK_TASKS.map((t) => (
            <div
              key={t.name}
              className="px-5 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white truncate">{t.name}</p>
                <p className="text-[11px] text-[#555] mt-0.5">{t.project}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[12px] text-[#555]">{t.due}</span>
                <StatusDot status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewerDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending Review" value="18" sub="across 4 projects" />
        <StatCard label="Approved Today" value="32" sub="214 this week" />
        <StatCard label="Rejection Rate" value="4.2%" sub="last 7 days" />
      </div>

      <div>
        <SectionTitle>Review Queue</SectionTitle>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl divide-y divide-[#1a1a1a]">
          {MOCK_REVIEWS.map((r) => (
            <div
              key={r.name}
              className="px-5 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white truncate">{r.name}</p>
                <p className="text-[11px] text-[#555] mt-0.5">{r.submitter}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[12px] text-[#555]">{r.time}</span>
                <button className="text-[12px] text-[#777] border border-[#2a2a2a] px-3 py-1 rounded-md hover:text-white hover:border-[#444] transition-colors">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewerDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Projects" value="38" sub="across all teams" />
        <StatCard label="Annotations" value="1.2M" sub="total labeled items" />
        <StatCard label="Exports" value="14" sub="approved datasets" />
      </div>

      <div>
        <SectionTitle>Projects</SectionTitle>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl divide-y divide-[#1a1a1a]">
          {MOCK_PROJECTS.map((p) => (
            <ProjectRow key={p.name} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Role router ──────────────────────────────────────────────────────────────

function RoleContent({ role }: { role: UserRole }) {
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "project_manager":
      return <PMDashboard />;
    case "annotator":
      return <AnnotatorDashboard />;
    case "reviewer":
      return <ReviewerDashboard />;
    case "viewer":
      return <ViewerDashboard />;
  }
}

// ─── Inner page (rendered only after AuthGuard passes) ────────────────────────

function Dashboard() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const cfg = ROLE_CONFIG[user.role];
  const initials = userInitials(user);

  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-8">
          <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-semibold text-[#666] leading-none">
              {initials}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              {greeting()}, {user.firstName}.
            </h1>
            <p className="text-[13px] text-[#555] mt-0.5">{cfg.label}</p>
          </div>
        </div>

        {/* ── Sample project banner ──────────────────────────────────────── */}
        <Link
          href="/project/sample-project"
          className="flex items-center justify-between gap-4 mb-8 rounded-xl border border-[#1e1e1e] bg-[#111] hover:border-[#2a2a2a] hover:bg-[#141414] px-5 py-4 transition-colors group"
        >
          <div className="flex items-center gap-4">
            {/* Mini canvas preview */}
            <div className="h-10 w-10 shrink-0 rounded-lg bg-[#0a0a0a] border border-[#1e1e1e] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <polygon
                  points="12,3 21,8 21,16 12,21 3,16 3,8"
                  fill="none"
                  stroke="#555"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="2" fill="#555" />
              </svg>
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-white">
                Sample Project — Autonomous Vehicles
              </p>
              <p className="text-[12px] text-[#555] mt-0.5">
                Open the annotation editor and try all tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#555] group-hover:text-[#888] transition-colors shrink-0">
            Open Editor
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>

        {/* ── Role content ─────────────────────────────────────────────────── */}
        <RoleContent role={user.role} />
      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
