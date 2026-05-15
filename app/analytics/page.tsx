"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AppLoading } from "@/components/ui/app-loading";

interface CountRow {
  status?: string;
  type?: string;
  value: number;
}

interface AnalyticsData {
  projects: { id: string; name: string }[];
  statusCounts: CountRow[];
  annotationCounts: CountRow[];
  taskCounts: CountRow[];
}

function CountBars({ rows, labelKey }: { rows: CountRow[]; labelKey: "status" | "type" }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const label = (row[labelKey] ?? "unknown").replace("_", " ");
        return (
          <div key={label}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="text-[#777] capitalize">{label}</span>
              <span className="text-[#555] tabular-nums">{row.value}</span>
            </div>
            <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => {
        if (!res.ok) return res.json().then((body) => Promise.reject(body.error ?? "Failed to load analytics"));
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(typeof err === "string" ? err : "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const imageTotal = data?.statusCounts.reduce((sum, row) => sum + row.value, 0) ?? 0;
    const annotationTotal = data?.annotationCounts.reduce((sum, row) => sum + row.value, 0) ?? 0;
    const taskTotal = data?.taskCounts.reduce((sum, row) => sum + row.value, 0) ?? 0;
    return { imageTotal, annotationTotal, taskTotal };
  }, [data]);

  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="text-[13px] text-[#555] mt-1">Live annotation, image, and task totals.</p>
        </div>

        {loading ? (
          <AppLoading title="Loading analytics" subtitle="Aggregating labels, tasks, and image status." />
        ) : error || !data ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-10 text-center text-[13px] text-[#555]">{error}</div>
        ) : totals.imageTotal === 0 && totals.annotationTotal === 0 && totals.taskTotal === 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-20 flex flex-col items-center justify-center text-center gap-3">
            <BarChart3 className="h-8 w-8 text-[#444]" />
            <p className="text-[13px] text-[#555]">No analytics yet. Upload images and save annotations to populate this view.</p>
            <Link href="/projects" className="text-[12px] text-primary hover:text-primary/80">Open projects</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
              <p className="text-[12px] text-[#555] mb-4">Image Status</p>
              <CountBars rows={data.statusCounts} labelKey="status" />
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
              <p className="text-[12px] text-[#555] mb-4">Annotation Types</p>
              <CountBars rows={data.annotationCounts} labelKey="type" />
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
              <p className="text-[12px] text-[#555] mb-4">Task Status</p>
              <CountBars rows={data.taskCounts} labelKey="status" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}
