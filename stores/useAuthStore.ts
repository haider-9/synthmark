'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, SignUpData } from '@/types/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// ─── Mock user DB (localStorage) ─────────────────────────────────────────────

const USERS_KEY = 'synthmark_users';
const PASSWORDS_KEY = 'synthmark_passwords';

function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(USERS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function getPasswords(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const s = localStorage.getItem(PASSWORDS_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function persistUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function persistPasswords(passwords: Record<string, string>) {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
}

function upsertUser(user: User) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  persistUsers(users);
}

/** Seed five demo accounts (runs once). */
function seedDemoAccounts() {
  if (getUsers().length > 0) return;

  const now = new Date().toISOString();
  const demos: Array<{ user: User; password: string }> = [
    {
      user: { id: uuidv4(), email: 'admin@synthmark.ai', firstName: 'Alex', lastName: 'Chen', role: 'admin', organization: 'Synthmark HQ', createdAt: now, lastLoginAt: now },
      password: 'Admin123!',
    },
    {
      user: { id: uuidv4(), email: 'pm@synthmark.ai', firstName: 'Sarah', lastName: 'Kim', role: 'project_manager', organization: 'Synthmark HQ', createdAt: now, lastLoginAt: now },
      password: 'Manager123!',
    },
    {
      user: { id: uuidv4(), email: 'annotator@synthmark.ai', firstName: 'Marcus', lastName: 'Reed', role: 'annotator', organization: 'Synthmark HQ', createdAt: now, lastLoginAt: now },
      password: 'Annotate123!',
    },
    {
      user: { id: uuidv4(), email: 'reviewer@synthmark.ai', firstName: 'Priya', lastName: 'Patel', role: 'reviewer', organization: 'Synthmark HQ', createdAt: now, lastLoginAt: now },
      password: 'Review123!',
    },
    {
      user: { id: uuidv4(), email: 'viewer@synthmark.ai', firstName: 'Tom', lastName: 'Walsh', role: 'viewer', organization: 'Synthmark HQ', createdAt: now, lastLoginAt: now },
      password: 'Viewer123!',
    },
  ];

  const passwords: Record<string, string> = {};
  demos.forEach(({ user, password }) => {
    passwords[user.email.toLowerCase()] = password;
  });

  persistUsers(demos.map((d) => d.user));
  persistPasswords(passwords);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Sign in ──────────────────────────────────────────────────────────
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 850)); // simulate latency

        seedDemoAccounts();

        const users = getUsers();
        const passwords = getPasswords();
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
          set({ isLoading: false, error: 'No account found with that email address.' });
          return false;
        }

        const storedPassword = passwords[email.toLowerCase()];
        if (storedPassword && storedPassword !== password) {
          set({ isLoading: false, error: 'Incorrect password. Please try again.' });
          return false;
        }

        const updated: User = { ...user, lastLoginAt: new Date().toISOString() };
        upsertUser(updated);
        set({ user: updated, isAuthenticated: true, isLoading: false, error: null });
        return true;
      },

      // ── Sign up ──────────────────────────────────────────────────────────
      signUp: async (data) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 1000));

        seedDemoAccounts();

        const users = getUsers();
        if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
          set({ isLoading: false, error: 'An account with this email already exists.' });
          return false;
        }

        const now = new Date().toISOString();
        const newUser: User = {
          id: uuidv4(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          organization: data.organization,
          createdAt: now,
          lastLoginAt: now,
        };

        const passwords = getPasswords();
        passwords[data.email.toLowerCase()] = data.password;
        upsertUser(newUser);
        persistPasswords(passwords);

        set({ user: newUser, isAuthenticated: true, isLoading: false, error: null });
        return true;
      },

      // ── Sign out ─────────────────────────────────────────────────────────
      signOut: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),

      updateUser: (updates) => {
        const { user } = get();
        if (!user) return;
        const updated: User = { ...user, ...updates };
        upsertUser(updated);
        set({ user: updated });
      },
    }),
    {
      name: 'synthmark_auth_v1',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Dashboard route for a given role. */
export function roleDashboardPath(role: UserRole): string {
  return '/dashboard';
}

/** Returns initials from a User for the avatar fallback. */
export function userInitials(user: User): string {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}
