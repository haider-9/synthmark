import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { labelClasses, projects } from "@/db/schema";
import { auth } from "@/lib/auth";

async function requireProject(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const, status: 401 as const };

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.createdBy, session.user.id)));

  if (!project) return { error: "Not found" as const, status: 404 as const };
  return { project, session };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await requireProject(id);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

    const { name, color } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Class name is required" }, { status: 400 });

    const [labelClass] = await db
      .insert(labelClasses)
      .values({
        projectId: id,
        name: name.trim(),
        color: color || "#3b82f6",
      })
      .returning();

    return NextResponse.json({ labelClass }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/[id]/labels]", err);
    return NextResponse.json({ error: "Failed to create label class" }, { status: 500 });
  }
}
