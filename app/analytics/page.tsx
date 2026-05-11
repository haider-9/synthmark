'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

// ─── Content ──────────────────────────────────────────────────────────────────

function AnalyticsContent() {
  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="text-[13px] text-[#555] mt-1">
            Annotation statistics and reports will appear here.
          </p>
        </div>

        {/* Empty state */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-20 flex flex-col items-center justify-center text-center">
          <p className="text-[13px] text-[#555]">
            Data is still being collected. Check back once your team has
            completed some annotation tasks.
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}
