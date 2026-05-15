import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { annotations, labelClasses, projects } from "@/db/schema";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; labelId: string }> }
) {
  try {
    const { id, labelId } = await params;
    const access = await requireProject(id);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

    const body = await request.json();
    const updates: { name?: string; color?: string } = {};
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.color === "string" && body.color.trim()) updates.color = body.color.trim();

    const [labelClass] = await db
      .update(labelClasses)
      .set(updates)
      .where(and(eq(labelClasses.id, labelId), eq(labelClasses.projectId, id)))
      .returning();

    if (!labelClass) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ labelClass });
  } catch (err) {
    console.error("[PATCH /api/projects/[id]/labels/[labelId]]", err);
    return NextResponse.json({ error: "Failed to update label class" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; labelId: string }> }
) {
  try {
    const { id, labelId } = await params;
    const access = await requireProject(id);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

    const existing = await db
      .select({ id: annotations.id })
      .from(annotations)
      .where(eq(annotations.labelClassId, labelId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Class is used by annotations" }, { status: 409 });
    }

    await db
      .delete(labelClasses)
      .where(and(eq(labelClasses.id, labelId), eq(labelClasses.projectId, id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/projects/[id]/labels/[labelId]]", err);
    return NextResponse.json({ error: "Failed to delete label class" }, { status: 500 });
  }
}
