"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AppLoading } from "@/components/ui/app-loading";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string | null;
  updatedAt: string;
}

function TeamContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => {
        if (!res.ok) return res.json().then((body) => Promise.reject(body.error ?? "Failed to load team"));
        return res.json();
      })
      .then((data) => setMembers(data.members ?? []))
      .catch((err) => setError(typeof err === "string" ? err : "Failed to load team"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Team</h1>
          <p className="text-[13px] text-[#555] mt-1">
            {loading ? "Loading..." : `${members.length} member${members.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {loading ? (
          <AppLoading title="Loading team" subtitle="Finding members in your workspace." />
        ) : error ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-10 text-center text-[13px] text-[#555]">{error}</div>
        ) : members.length === 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-20 flex flex-col items-center justify-center text-center gap-3">
            <Users className="h-8 w-8 text-[#444]" />
            <p className="text-[13px] text-[#555]">No team members found.</p>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {["Name", "Email", "Role", "Organization", "Last updated"].map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#444] uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#161616]">
                    <td className="px-4 py-3 text-[13px] text-white">{member.name}</td>
                    <td className="px-4 py-3 text-[12px] text-[#555]">{member.email}</td>
                    <td className="px-4 py-3 text-[12px] text-[#777] capitalize">{member.role.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-[12px] text-[#555]">{member.organization ?? "Personal workspace"}</td>
                    <td className="px-4 py-3 text-[12px] text-[#555]">{new Date(member.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TeamPage() {
  return (
    <AuthGuard>
      <TeamContent />
    </AuthGuard>
  );
}
