'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

// ─── Content ──────────────────────────────────────────────────────────────────

function TasksContent() {
  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Tasks</h1>
          <p className="text-[13px] text-[#555] mt-1">
            Your assigned tasks will appear here.
          </p>
        </div>

        {/* Empty state */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-20 flex flex-col items-center justify-center text-center">
          <p className="text-[13px] text-[#555]">
            No tasks assigned yet. Check back when a project manager assigns
            work to you.
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function TasksPage() {
  return (
    <AuthGuard>
      <TasksContent />
    </AuthGuard>
  );
}
