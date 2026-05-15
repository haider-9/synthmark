import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { annotations, datasetItems, projects, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ownedProjects = await db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(eq(projects.createdBy, session.user.id));

    const projectIds = ownedProjects.map((project) => project.id);
    if (projectIds.length === 0) {
      return NextResponse.json({ projects: [], statusCounts: [], annotationCounts: [], taskCounts: [] });
    }

    const [statusCounts, annotationCounts, taskCounts] = await Promise.all([
      db
        .select({ status: datasetItems.status, value: count() })
        .from(datasetItems)
        .where(inArray(datasetItems.projectId, projectIds))
        .groupBy(datasetItems.status),
      db
        .select({ type: annotations.type, value: count() })
        .from(annotations)
        .innerJoin(datasetItems, eq(annotations.datasetItemId, datasetItems.id))
        .where(inArray(datasetItems.projectId, projectIds))
        .groupBy(annotations.type),
      db
        .select({ status: tasks.status, value: count() })
        .from(tasks)
        .where(inArray(tasks.projectId, projectIds))
        .groupBy(tasks.status),
    ]);

    return NextResponse.json({
      projects: ownedProjects,
      statusCounts,
      annotationCounts,
      taskCounts,
    });
  } catch (err) {
    console.error("[GET /api/analytics]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
