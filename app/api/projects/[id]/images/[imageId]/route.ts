import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, datasetItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

// PATCH /api/projects/[id]/images/[imageId] — update status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, imageId } = await params;

    // Verify project ownership
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.createdBy, session.user.id)));

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const allowed = ["status", "assignedTo"] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const [updated] = await db
      .update(datasetItems)
      .set(updates)
      .where(and(eq(datasetItems.id, imageId), eq(datasetItems.projectId, id)))
      .returning();

    return NextResponse.json({ image: updated });
  } catch (err) {
    console.error("[PATCH /api/projects/[id]/images/[imageId]]", err);
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/images/[imageId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, imageId } = await params;

    // Verify project ownership
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.createdBy, session.user.id)));

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db
      .delete(datasetItems)
      .where(and(eq(datasetItems.id, imageId), eq(datasetItems.projectId, id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/projects/[id]/images/[imageId]]", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
