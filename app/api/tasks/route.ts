import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        dueAt: tasks.dueAt,
        projectId: tasks.projectId,
        projectName: projects.name,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(or(eq(tasks.assignedTo, session.user.id), eq(projects.createdBy, session.user.id)))
      .orderBy(desc(tasks.createdAt));

    return NextResponse.json({ tasks: rows });
  } catch (err) {
    console.error("[GET /api/tasks]", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
