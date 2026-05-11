'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User, UserRole } from '@/types/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthGuardProps {
  children: React.ReactNode;
  /** Roles allowed to view this page. If empty, any authenticated user passes. */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users. Default: '/auth/sign-in' */
  redirectTo?: string;
}

// ─── Loading spinner (full-screen) ───────────────────────────────────────────

function FullScreenSpinner() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// ─── Guard ────────────────────────────────────────────────────────────────────

/**
 * Wraps protected pages.
 *
 * - Redirects unauthenticated users to `redirectTo` (with `?from=<current-path>`).
 * - Redirects authenticated users whose role is not in `allowedRoles` to /dashboard.
 * - Shows a full-screen spinner while the check is in flight.
 * - Returns null on the first render to prevent an SSR/hydration mismatch
 *   (the Zustand persisted store is only rehydrated client-side).
 */
export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = '/auth/sign-in',
}: AuthGuardProps) {
  // ── Hydration guard ────────────────────────────────────────────────────────
  // The auth store is persisted to localStorage and rehydrated only on the
  // client, so `isAuthenticated` is always `false` during SSR/first-paint.
  // We wait until after mount before making any routing decision.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Store ──────────────────────────────────────────────────────────────────
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user: User | null = useAuthStore((s) => s.user);

  // ── Navigation ────────────────────────────────────────────────────────────
  const router   = useRouter();
  const pathname = usePathname();

  // ── Redirect effect ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    // Not logged in → send to sign-in, preserving current path for post-login redirect
    if (!isAuthenticated || !user) {
      router.replace(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Logged in but wrong role → send to dashboard (least-privilege fallback)
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthenticated, user, allowedRoles, redirectTo, pathname, router]);

  // ── Render ────────────────────────────────────────────────────────────────

  // Before hydration: render nothing to avoid flicker / mismatch
  if (!mounted) return null;

  // Derive authorization synchronously from store state
  const isAuthorized =
    isAuthenticated &&
    user !== null &&
    (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(user.role));

  // Not yet authorized (redirect is in flight) → show spinner
  if (!isAuthorized) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
