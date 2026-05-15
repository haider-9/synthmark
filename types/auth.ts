export type UserRole =
  | 'admin'
  | 'project_manager'
  | 'annotator'
  | 'reviewer'
  | 'viewer';

export interface RoleConfig {
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  permissions: string[];
  color: string;
  bgGradient: string;
  borderColor: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bannerImage?: string;
  organization?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  organization?: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  admin: {
    label: 'Administrator',
    shortLabel: 'Admin',
    tagline: 'Full platform control',
    description:
      'Unrestricted access to every feature. Manage users, billing, system settings, and all projects across the workspace.',
    permissions: [
      'User & team management',
      'Billing & subscriptions',
      'All project access',
      'System configuration',
      'API key management',
    ],
    color: '#a855f7',
    bgGradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-500/30',
  },
  project_manager: {
    label: 'Project Manager',
    shortLabel: 'PM',
    tagline: 'Lead teams & projects',
    description:
      'Create and manage annotation projects, assign tasks to annotators, set label classes, and track team progress.',
    permissions: [
      'Create & manage projects',
      'Assign tasks to team',
      'Define label classes',
      'Review workflows',
      'Analytics & data exports',
    ],
    color: '#3b82f6',
    bgGradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
    borderColor: 'border-blue-500/30',
  },
  annotator: {
    label: 'Annotator',
    shortLabel: 'Annotator',
    tagline: 'Label data with precision',
    description:
      'Access your assigned annotation tasks and use the full suite of labeling tools — polygons, boxes, keypoints and more.',
    permissions: [
      'Access assigned tasks',
      'Full annotation toolset',
      'Personal progress dashboard',
      'Submit work for review',
    ],
    color: '#10b981',
    bgGradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    borderColor: 'border-emerald-500/30',
  },
  reviewer: {
    label: 'Reviewer',
    shortLabel: 'Reviewer',
    tagline: 'Ensure annotation quality',
    description:
      'Review submitted annotations, approve or reject work with inline comments, and maintain dataset quality standards.',
    permissions: [
      'Review all submissions',
      'Approve or reject work',
      'Quality metrics dashboard',
      'Leave inline feedback',
      'View all projects',
    ],
    color: '#f59e0b',
    bgGradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/30',
  },
  viewer: {
    label: 'Viewer',
    shortLabel: 'Viewer',
    tagline: 'Read-only access',
    description:
      'Browse projects, view annotations and reports, and download approved exports — without making any changes.',
    permissions: [
      'View all projects',
      'Browse annotations',
      'View analytics',
      'Download approved exports',
    ],
    color: '#6366f1',
    bgGradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    borderColor: 'border-indigo-500/30',
  },
};
