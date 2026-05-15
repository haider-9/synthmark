import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { annotations, datasetItems, projects } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { Annotation, AnnotationType } from "@/types/annotation";

async function requireImage(projectId: string, imageId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const, status: 401 as const };

  const [image] = await db
    .select({ id: datasetItems.id })
    .from(datasetItems)
    .innerJoin(projects, eq(datasetItems.projectId, projects.id))
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.createdBy, session.user.id),
        eq(datasetItems.id, imageId),
      ),
    );

  if (!image) return { error: "Not found" as const, status: 404 as const };
  return { image, session };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    const access = await requireImage(id, imageId);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

    const rows = await db
      .select()
      .from(annotations)
      .where(eq(annotations.datasetItemId, imageId));

    return NextResponse.json({
      annotations: rows.map((row) => ({
        ...(row.data as Record<string, unknown>),
        id: row.id,
        type: row.type,
        labelId: row.labelClassId,
        isVisible: row.isVisible,
        isLocked: row.isLocked,
      })),
    });
  } catch (err) {
    console.error("[GET /api/projects/[id]/images/[imageId]/annotations]", err);
    return NextResponse.json({ error: "Failed to fetch annotations" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    const access = await requireImage(id, imageId);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

    const body = await request.json();
    const nextAnnotations = Array.isArray(body.annotations)
      ? (body.annotations as Annotation[])
      : [];

    await db.delete(annotations).where(eq(annotations.datasetItemId, imageId));

    if (nextAnnotations.length > 0) {
      await db.insert(annotations).values(
        nextAnnotations.map((annotation) => ({
          id: annotation.id,
          datasetItemId: imageId,
          labelClassId: annotation.labelId,
          type: annotation.type as AnnotationType,
          data: annotation,
          isVisible: annotation.isVisible,
          isLocked: annotation.isLocked,
          createdBy: access.session.user.id,
          updatedAt: new Date(),
        })),
      );
    }

    const status = nextAnnotations.length > 0 ? "in_progress" : "todo";
    await db
      .update(datasetItems)
      .set({ status })
      .where(and(eq(datasetItems.id, imageId), eq(datasetItems.projectId, id)));

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("[PUT /api/projects/[id]/images/[imageId]/annotations]", err);
    return NextResponse.json({ error: "Failed to save annotations" }, { status: 500 });
  }
}
