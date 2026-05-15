import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, labelClasses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

// Default burger classes for new projects
const DEFAULT_BURGER_CLASSES = [
  { name: "bottom_bun", color: "#eab308" },
  { name: "cheese_slice", color: "#bef264" },
  { name: "patty", color: "#22c55e" },
  { name: "tomato_slice", color: "#06b6d4" },
  { name: "lettuce_leaf", color: "#bfdbfe" },
  { name: "top_bun", color: "#a855f7" },
  { name: "lettuce_container", color: "#ec4899" },
  { name: "tomato_container", color: "#f43f5e" },
  { name: "cheese_rack", color: "#f97316" },
  { name: "patty_rack", color: "#facc15" },
  { name: "burger_box", color: "#84cc16" },
  { name: "onion_container", color: "#eab308" },
  { name: "bun_container", color: "#a3e635" },
  { name: "onion_slice", color: "#4ade80" },
  { name: "lettuce_zone", color: "#ec4899" },
  { name: "onion_zone", color: "#3b82f6" },
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const imageCount = parseInt(formData.get("imageCount") as string) || 0;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Create project
    const [project] = await db
      .insert(projects)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: session.user.id,
      })
      .returning();

    // Create default label classes
    const classesToInsert = DEFAULT_BURGER_CLASSES.map((cls) => ({
      projectId: project.id,
      name: cls.name,
      color: cls.color,
    }));

    await db.insert(labelClasses).values(classesToInsert);

    // If image URLs provided, create dataset items
    if (imageCount > 0) {
      try {
        const { datasetItems } = await import("@/db/schema");
        const datasetItemsToInsert = [];

        for (let i = 0; i < imageCount; i++) {
          const imageUrl = formData.get(`imageUrl_${i}`) as string;
          const fileName = formData.get(`fileName_${i}`) as string;

          if (imageUrl) {
            datasetItemsToInsert.push({
              projectId: project.id,
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
      } catch (error) {
        console.error("Error processing images:", error);
        // Continue without images if processing fails
      }
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.createdBy, session.user.id))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json({ projects: userProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}