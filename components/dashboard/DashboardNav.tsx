"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore, userInitials } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/team", label: "Team" },
  { href: "/analytics", label: "Analytics" },
  { href: "/profile", label: "Profile" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const initials = user ? userInitials(user) : "";

  async function handleSignOut() {
    const promise = signOut();
    toast.promise(promise, {
      loading: "Signing out...",
      success: "Signed out",
      error: "Sign out failed",
    });
    await promise;
    router.push("/auth/sign-in");
  }

  return (
    <header className="h-12 border-b border-[#1a1a1a] bg-[#0d0d0d] px-6 flex items-center justify-between shrink-0">
      {/* ── Left: brand + nav ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-5">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Synthmark" className="h-5 w-5 object-cover" />
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
          <Link href="/profile" className="flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors hover:bg-[#161616]">
            <div className="h-6 w-6 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-[9px] font-semibold text-[#666] leading-none">
                  {initials}
                </span>
              )}
            </div>
            <div>
              <p className="text-[13px] text-[#aaa] leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-[#555] mt-0.5 capitalize">
                {user.role.replace(/_/g, " ")}
              </p>
            </div>
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
