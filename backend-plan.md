# Synthmark Backend Implementation Plan

## Stack

| Layer             | Choice                          | Why                                           |
| ----------------- | ------------------------------- | --------------------------------------------- |
| Framework         | Next.js App Router + API Routes | SSR + API layer in one app                    |
| Auth              | better-auth                     | Session auth, OAuth, RBAC, email verification |
| Database          | Neon                            | Serverless PostgreSQL                         |
| ORM               | Drizzle ORM                     | Lightweight, SQL-first, type-safe             |
| File Storage      | Cloudinary                      | Image upload + transformations                |
| Email             | Resend                          | Verification + password reset emails          |
| Validation        | Zod                             | Shared client/server validation               |
| State             | Zustand                         | Lightweight editor state                      |
| Rate Limiting     | Upstash Redis (later)           | Prevent abuse                                 |
| Realtime (future) | WebSockets / Ably               | Collaboration layer                           |

---

# Core Architecture Changes

## Removed `profiles` duplication

Old architecture duplicated:

* better-auth user table
* profiles table

New architecture:

* better-auth `user` table is canonical
* lightweight extension table only

This avoids:

* stale emails
* sync issues
* duplicate identity management

---

# Updated User Model

## better-auth user table

Use better-auth as source of truth:

```ts
user
├── id
├── email
├── emailVerified
├── firstName
├── lastName
├── role
├── image
├── createdAt
└── updatedAt
```

---

## App-specific extension table

```ts
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  organization: text("organization"),

  onboardingCompleted: boolean("onboarding_completed")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
```

---

# Phase 1 — Database & ORM Setup

## Step 1.1 — Install Dependencies

```bash
npm install drizzle-orm @neondatabase/serverless zod resend cloudinary
npm install better-auth @better-auth/drizzle-adapter
npm install -D drizzle-kit @better-auth/cli
```

---

## Step 1.2 — drizzle.config.ts

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URI!,
  },
});
```

---

# Phase 2 — Auth Architecture (Updated)

# IMPORTANT AUTH CHANGES

## Use official better-auth Drizzle adapter

```ts
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
```

NOT:

```ts
better-auth/adapters/drizzle
```

---

## Generate auth schema via CLI

Do NOT manually create auth tables.

Use:

```bash
npx @better-auth/cli generate
```

This generates:

* user
* session
* account
* verification

---

# Email Verification Architecture

## Signup Flow

```txt
User signs up
↓
User created
↓
Verification token generated
↓
Verification email sent via Resend
↓
User clicks verification link
↓
emailVerified=true
↓
Dashboard access unlocked
```

---

# Resend Setup

## Install

```bash
npm install resend
```

---

## Environment Variables

```env
RESEND_API_KEY=
EMAIL_FROM="Synthmark <auth@synthmark.ai>"
```

---

## Email Client

```ts
// lib/email.ts
import { Resend } from "resend";

export const resend = new Resend(
  process.env.RESEND_API_KEY!
);
```

---

# better-auth Configuration (Updated)

## lib/auth.ts

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import { resend } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({
      user,
      url,
    }) => {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Verify your email",
        html: `
          <h2>Verify your email</h2>
          <a href="${url}">
            Verify Email
          </a>
        `,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "annotator",
        input: true,
      },

      firstName: {
        type: "string",
        required: true,
        input: true,
      },

      lastName: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
});
```

---

# Auth Client (Updated)

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});
```

---

# Middleware / Proxy Architecture

## IMPORTANT CHANGE

Avoid validating DB sessions inside middleware.

Instead:

* lightweight cookie check in middleware
* real validation inside routes/pages

---

## middleware.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/verify-email",
];

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const isPublic = publicRoutes.includes(
    request.nextUrl.pathname
  );

  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(
      new URL("/auth/sign-in", request.url)
    );
  }

  return NextResponse.next();
}
```

---

# Database Schema Improvements

# ALL foreign keys should use cascade deletes

Example:

```ts
.references(() => projects.id, {
  onDelete: "cascade",
})
```

---

# Add indexes everywhere important

## Example

```ts
index("dataset_project_idx")
  .on(table.projectId)

index("annotations_item_idx")
  .on(table.datasetItemId)

index("project_members_user_idx")
  .on(table.userId)
```

Critical for:

* editor speed
* dashboard queries
* annotation loading

---

# Add unique constraints

## Prevent duplicate memberships

```ts
uniqueIndex("project_member_unique")
  .on(table.projectId, table.userId)
```

---

## Prevent duplicate label names

```ts
uniqueIndex("label_per_project_unique")
  .on(table.projectId, table.name)
```

---

# Updated Annotation Architecture

# Keep JSONB

Correct decision.

---

# Replace "delete all + insert all"

Old approach causes:

* race conditions
* broken IDs
* collaboration issues
* audit/history loss

---

# New Annotation Save Strategy

Each annotation gets stable UUID.

Client sends:

```ts
{
  created: [],
  updated: [],
  deleted: [],
}
```

---

# Annotation Table (Updated)

```ts
export const annotations = pgTable("annotations", {
  id: uuid("id").defaultRandom().primaryKey(),

  datasetItemId: uuid("dataset_item_id")
    .references(() => datasetItems.id, {
      onDelete: "cascade",
    })
    .notNull(),

  labelClassId: uuid("label_class_id")
    .references(() => labelClasses.id)
    .notNull(),

  type: text("type", {
    enum: [
      "polygon",
      "box",
      "circle",
      "keypoint",
      "line",
    ],
  }).notNull(),

  data: jsonb("data").notNull(),

  version: integer("version")
    .default(1)
    .notNull(),

  createdBy: text("created_by")
    .references(() => user.id),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),

  deletedAt: timestamp("deleted_at"),
});
```

---

# Add Soft Deletes

Important for:

* audit history
* accidental recovery
* enterprise workflows

Add:

```ts
deletedAt: timestamp("deleted_at")
```

To:

* projects
* annotations
* tasks
* dataset items

---

# Add Activity Logs

## New Table

```ts
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .references(() => user.id),

  action: text("action").notNull(),

  entityType: text("entity_type").notNull(),

  entityId: text("entity_id").notNull(),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
```

Tracks:

* annotation edits
* approvals
* exports
* member invites

---

# Add Annotation Version History

```ts
export const annotationVersions =
  pgTable("annotation_versions", {
    id: uuid("id").defaultRandom().primaryKey(),

    annotationId: uuid("annotation_id")
      .references(() => annotations.id),

    data: jsonb("data").notNull(),

    version: integer("version").notNull(),

    createdBy: text("created_by")
      .references(() => user.id),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  });
```

---

# Cloudinary Improvements

## Store publicId instead of raw URLs

Instead of:

```ts
imageUrl
```

Store:

```ts
cloudinaryPublicId
```

Then generate transformations dynamically.

---

## Example

```ts
cloudinary.url(publicId, {
  width: 400,
  crop: "fill",
});
```

Benefits:

* thumbnails
* compression
* responsive images
* cheaper bandwidth

---

# Upload Security

Validate:

* mime type
* file size
* dimensions

Example:

```ts
if (!file.type.startsWith("image/")) {
  return Response.json(
    { error: "Invalid file" },
    { status: 400 }
  );
}
```

---

# Export API Improvements

## Add streaming exports later

For huge datasets:

* avoid loading everything into memory

Future:

* zip streaming
* async export jobs

---

# State Management Improvements

# Move autosave out of components

Use:

* Zustand middleware
  OR
* dedicated sync service

Avoid large editor components becoming state orchestration monsters.

---

# Security Improvements

## Add role helper

```ts
export function requireRole(
  user,
  allowedRoles: string[]
) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}
```

---

# API Authorization Rule

Frontend guards are UX only.

Every API route must verify:

* session
* role
* ownership

---

# Performance Improvements

## Add pagination everywhere

Especially:

* dataset items
* projects
* tasks
* activity logs

---

# Example

```txt
GET /api/projects/:id/items?cursor=...
```

---

# Add optimistic updates

Editor should:

* update instantly
* sync in background
* rollback on failure

---

# Add save conflict protection

Use:

* version fields
* updatedAt checks

Prevent overwriting newer annotation states.

---

# Realtime Architecture (Future)

Future-ready structure for:

* collaborative annotation
* reviewer presence
* annotation locking

Potential stack:

* WebSockets
* Ably
* Pusher

---

# Final Recommended Folder Structure

```txt
app/
├── api/
├── dashboard/
├── projects/
├── tasks/
├── analytics/
├── auth/
└── project/[id]/

db/
├── schema.ts
├── index.ts
└── migrations/

lib/
├── auth.ts
├── auth-client.ts
├── email.ts
├── validations.ts
├── permissions.ts
└── cloudinary.ts

stores/
├── useAnnotationStore.ts
└── useUIStore.ts

services/
├── annotation-sync.ts
└── export-service.ts
```

---

# Updated Key Decisions

| Decision                 | Choice                  | Reason                          |
| ------------------------ | ----------------------- | ------------------------------- |
| Auth Source of Truth     | better-auth user table  | Avoid duplicated profile sync   |
| Email Service            | Resend                  | Best DX for MVP                 |
| Email Verification       | Required                | Security + enterprise readiness |
| Annotation Storage       | JSONB                   | Flexible schema                 |
| Annotation Save Strategy | Incremental diff        | Better scalability              |
| Deletes                  | Soft delete             | Recovery + audit                |
| Autosave                 | Background sync service | Cleaner architecture            |
| Middleware               | Cookie check only       | Lower latency                   |
| Upload Storage           | Cloudinary public IDs   | Dynamic transforms              |
| API Style                | REST API Routes         | Cleaner separation              |

---