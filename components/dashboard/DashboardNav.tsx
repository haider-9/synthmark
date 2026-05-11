"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sparkles, PenLine } from "lucide-react";
import { useAuthStore, userInitials } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/team", label: "Team" },
  { href: "/analytics", label: "Analytics" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const initials = user ? userInitials(user) : "";

  function handleSignOut() {
    signOut();
    router.push("/auth/sign-in");
  }

  return (
    <header className="h-12 border-b border-[#1a1a1a] bg-[#0d0d0d] px-6 flex items-center justify-between shrink-0">
      {/* ── Left: brand + nav ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-5">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#555]" />
          <span className="text-[13px] font-semibold text-[#888] tracking-tight">
            synthmark
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-4 bg-[#1e1e1e]" />

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-[13px] px-3 py-1.5 rounded-md transition-colors",
                  isActive
                    ? "text-white bg-[#161616]"
                    : "text-[#555] hover:text-[#aaa] hover:bg-[#161616]",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Right: user info + sign out ───────────────────────────────────── */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-semibold text-[#666] leading-none">
                {initials}
              </span>
            </div>
            <div>
              <p className="text-[13px] text-[#aaa] leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-[#555] mt-0.5 capitalize">
                {user.role.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Open editor */}
          <Link
            href="/project/sample-project"
            className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#222] px-3 py-1.5 rounded-lg transition-colors"
          >
            <PenLine className="h-3 w-3" />
            Open Editor
          </Link>

          {/* Divider */}
          <div className="w-px h-4 bg-[#1e1e1e]" />

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[12px] text-[#444] hover:text-[#888] transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
