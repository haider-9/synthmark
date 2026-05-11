'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

// ─── Content ──────────────────────────────────────────────────────────────────

function ProjectsContent() {
  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Projects</h1>
            <p className="text-[13px] text-[#555] mt-1">
              Your projects will appear here.
            </p>
          </div>
          <button className="text-[13px] bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-[#e8e8e8] transition-colors">
            New project
          </button>
        </div>

        {/* Empty state */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-20 flex flex-col items-center justify-center text-center">
          <p className="text-[13px] text-[#555]">
            No projects yet. Create your first project to get started.
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsContent />
    </AuthGuard>
  );
}
