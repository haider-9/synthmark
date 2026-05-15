import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, datasetItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

// GET /api/projects/[id]/images — list all images for a project
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Verify ownership
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.createdBy, session.user.id)));

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const images = await db
      .select()
      .from(datasetItems)
      .where(eq(datasetItems.projectId, id));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("[GET /api/projects/[id]/images]", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

// POST /api/projects/[id]/images — add an image (already uploaded to Cloudinary)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Verify ownership
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.createdBy, session.user.id)));

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { imageUrl, thumbnailUrl, fileName, width, height } = await request.json();

    if (!imageUrl || !fileName) {
      return NextResponse.json({ error: "imageUrl and fileName are required" }, { status: 400 });
    }

    const [image] = await db
      .insert(datasetItems)
      .values({
        projectId: id,
        imageUrl,
        thumbnailUrl: thumbnailUrl ?? null,
        fileName,
        width: width ?? 0,
        height: height ?? 0,
        status: "todo",
      })
      .returning();

    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/[id]/images]", err);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
