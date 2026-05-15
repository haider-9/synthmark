import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { datasetItems, projects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const imageCount = parseInt(formData.get("imageCount") as string) || 0;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Verify user has access to this project
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Add images to project
    if (imageCount > 0) {
      const datasetItemsToInsert = [];

      for (let i = 0; i < imageCount; i++) {
        const imageUrl = formData.get(`imageUrl_${i}`) as string;
        const fileName = formData.get(`fileName_${i}`) as string;

        if (imageUrl) {
          datasetItemsToInsert.push({
            projectId,
            imageUrl,
            fileName: fileName || `image-${i + 1}`,
            width: 1920,
            height: 1080,
          });
        }
      }

      if (datasetItemsToInsert.length > 0) {
        await db.insert(datasetItems).values(datasetItemsToInsert);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding images:", error);
    return NextResponse.json(
      { error: "Failed to add images" },
      { status: 500 }
    );
  }
}
