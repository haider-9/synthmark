"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User, UserRole } from "@/types/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

function FullScreenSpinner() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = "/auth/sign-in",
}: AuthGuardProps) {
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSessionReady = useAuthStore((s) => s.isSessionReady);
  const user: User | null = useAuthStore((s) => s.user);
  const checkSession = useAuthStore((s) => s.checkSession);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!mounted || !isSessionReady) return;

    if (!isAuthenticated || !user) {
      router.replace(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [mounted, isSessionReady, isAuthenticated, user, allowedRoles, redirectTo, pathname, router]);

  if (!mounted || !isSessionReady) return <FullScreenSpinner />;

  const isAuthorized =
    isAuthenticated &&
    user !== null &&
    (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(user.role));

  if (!isAuthorized) return <FullScreenSpinner />;

  return <>{children}</>;
}
