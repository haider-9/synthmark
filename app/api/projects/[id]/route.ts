import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, labelClasses, datasetItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, count } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.createdBy, session.user.id)));

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const classes = await db
      .select()
      .from(labelClasses)
      .where(eq(labelClasses.projectId, id));

    const images = await db
      .select()
      .from(datasetItems)
      .where(eq(datasetItems.projectId, id));

    return NextResponse.json({ project, labelClasses: classes, images });
  } catch (err) {
    console.error("[GET /api/projects/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.createdBy, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/projects/[id]]", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
