"use client";

import { create } from "zustand";
import { authClient } from "@/lib/auth-client";
import type { User, UserRole, SignUpData } from "@/types/auth";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  /** Loading state for auth actions (sign in / sign up) — starts false */
  isLoading: boolean;
  /** Whether the initial session hydration has completed — starts false */
  isSessionReady: boolean;
  error: string | null;

  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  /** Hydrate session from server cookies — used by AuthGuard */
  checkSession: () => Promise<void>;
}

interface SessionUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  role: string;
  firstName: string;
  lastName: string;
  organization: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SignUpPayload {
  email: string;
  password: string;
  name: string;
  role: string;
  firstName: string;
  lastName: string;
  organization?: string;
}

function mapSessionUser(sessionUser: SessionUser | null): User | null {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    firstName: sessionUser.firstName ?? sessionUser.name?.split(" ")[0] ?? "",
    lastName: sessionUser.lastName ?? sessionUser.name?.split(" ").slice(1).join(" ") ?? "",
    role: (sessionUser.role as UserRole) ?? "annotator",
    avatar: sessionUser.avatar ?? undefined,
    organization: sessionUser.organization ?? undefined,
    createdAt: sessionUser.createdAt ?? new Date().toISOString(),
    lastLoginAt: sessionUser.updatedAt ?? new Date().toISOString(),
  };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) return String((err as { message: string }).message);
  return "An unexpected error occurred";
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isSessionReady: false,
  error: null,

  signIn: async (email, password, rememberMe = true) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });
      if (error) {
        set({ isLoading: false, error: error.message ?? error.code ?? "Sign in failed" });
        return false;
      }
      if (!data?.user) {
        set({ isLoading: false, error: "No user data returned" });
        return false;
      }
      const user = mapSessionUser(data.user as unknown as SessionUser);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
      return false;
    }
  },

  signUp: async (signUpData) => {
    set({ isLoading: true, error: null });
    try {
      const payload: SignUpPayload = {
        email: signUpData.email,
        password: signUpData.password,
        name: `${signUpData.firstName} ${signUpData.lastName}`,
        role: signUpData.role,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        organization: signUpData.organization ?? undefined,
      };
      const { data, error } = await authClient.signUp.email(payload);
      if (error) {
        set({ isLoading: false, error: error.message ?? error.code ?? "Sign up failed" });
        return false;
      }
      if (!data?.user) {
        set({ isLoading: false, error: "No user data returned" });
        return false;
      }
      const user = mapSessionUser(data.user as unknown as SessionUser);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
      return false;
    }
  },

  signOut: async () => {
    try {
      await authClient.signOut();
    } catch {
      // proceed regardless
    }
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),

  updateUser: (updates) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, ...updates } });
  },

  checkSession: async () => {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        const user = mapSessionUser(data.user as unknown as SessionUser);
        set({ user, isAuthenticated: true, isSessionReady: true });
      } else if (!get().isAuthenticated) {
        set({ user: null, isAuthenticated: false, isSessionReady: true });
      } else {
        set({ isSessionReady: true });
      }
    } catch {
      if (!get().isAuthenticated) {
        set({ user: null, isAuthenticated: false, isSessionReady: true });
      } else {
        set({ isSessionReady: true });
      }
    }
  },
}));

export function roleDashboardPath(role: UserRole): string {
  return "/dashboard";
}

export function userInitials(user: User): string {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}
