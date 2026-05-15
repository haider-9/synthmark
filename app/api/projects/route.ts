import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, labelClasses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

const DEFAULT_LABEL_CLASSES = [
  { name: "bottom_bun",        color: "#eab308" },
  { name: "cheese_slice",      color: "#bef264" },
  { name: "patty",             color: "#22c55e" },
  { name: "tomato_slice",      color: "#06b6d4" },
  { name: "lettuce_leaf",      color: "#bfdbfe" },
  { name: "top_bun",           color: "#a855f7" },
  { name: "lettuce_container", color: "#ec4899" },
  { name: "tomato_container",  color: "#f43f5e" },
  { name: "cheese_rack",       color: "#f97316" },
  { name: "patty_rack",        color: "#facc15" },
  { name: "burger_box",        color: "#84cc16" },
  { name: "onion_container",   color: "#eab308" },
  { name: "bun_container",     color: "#a3e635" },
  { name: "onion_slice",       color: "#4ade80" },
  { name: "lettuce_zone",      color: "#ec4899" },
  { name: "onion_zone",        color: "#3b82f6" },
];

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.createdBy, session.user.id))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json({ projects: rows });
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const [project] = await db
      .insert(projects)
      .values({ name: name.trim(), description: description?.trim() ?? null, createdBy: session.user.id })
      .returning();

    // Seed default label classes
    await db.insert(labelClasses).values(
      DEFAULT_LABEL_CLASSES.map((c) => ({ projectId: project.id, name: c.name, color: c.color }))
    );

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects]", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
