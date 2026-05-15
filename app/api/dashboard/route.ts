import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  annotations,
  datasetItems,
  projects,
  reviews,
  tasks,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownedProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(eq(projects.createdBy, session.user.id))
      .orderBy(desc(projects.createdAt));

    const projectIds = ownedProjects.map((project) => project.id);

    const [
      userCountRows,
      itemRows,
      annotationRows,
      assignedTaskRows,
      taskStatusRows,
      reviewRows,
      recentTasks,
      recentReviews,
    ] = await Promise.all([
      db.select({ value: count() }).from(user),
      projectIds.length
        ? db
            .select({
              status: datasetItems.status,
              value: count(),
            })
            .from(datasetItems)
            .where(inArray(datasetItems.projectId, projectIds))
            .groupBy(datasetItems.status)
        : Promise.resolve([]),
      projectIds.length
        ? db
            .select({ value: count() })
            .from(annotations)
            .innerJoin(datasetItems, eq(annotations.datasetItemId, datasetItems.id))
            .where(inArray(datasetItems.projectId, projectIds))
        : Promise.resolve([{ value: 0 }]),
      db
        .select({ value: count() })
        .from(tasks)
        .where(eq(tasks.assignedTo, session.user.id)),
      projectIds.length
        ? db
            .select({ status: tasks.status, value: count() })
            .from(tasks)
            .where(inArray(tasks.projectId, projectIds))
            .groupBy(tasks.status)
        : Promise.resolve([]),
      db
        .select({ status: reviews.status, value: count() })
        .from(reviews)
        .where(eq(reviews.reviewerId, session.user.id))
        .groupBy(reviews.status),
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
          dueAt: tasks.dueAt,
          projectName: projects.name,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(eq(tasks.assignedTo, session.user.id))
        .orderBy(desc(tasks.createdAt))
        .limit(5),
      db
        .select({
          id: reviews.id,
          status: reviews.status,
          feedback: reviews.feedback,
          taskTitle: tasks.title,
          projectName: projects.name,
        })
        .from(reviews)
        .leftJoin(tasks, eq(reviews.taskId, tasks.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(eq(reviews.reviewerId, session.user.id))
        .orderBy(desc(reviews.createdAt))
        .limit(5),
    ]);

    const totalItems = itemRows.reduce((sum, row) => sum + row.value, 0);
    const completedItems =
      itemRows.find((row) => row.status === "completed")?.value ?? 0;

    const projectProgress = projectIds.length
      ? await db
          .select({
            id: projects.id,
            name: projects.name,
            tasks: count(datasetItems.id),
            completed: sql<number>`count(${datasetItems.id}) filter (where ${datasetItems.status} = 'completed')`,
          })
          .from(projects)
          .leftJoin(datasetItems, eq(datasetItems.projectId, projects.id))
          .where(and(eq(projects.createdBy, session.user.id), inArray(projects.id, projectIds)))
          .groupBy(projects.id)
          .orderBy(desc(projects.createdAt))
          .limit(5)
      : [];

    return NextResponse.json({
      stats: {
        users: userCountRows[0]?.value ?? 0,
        projects: ownedProjects.length,
        activeProjects: projectProgress.filter((project) => project.tasks > project.completed).length,
        datasetItems: totalItems,
        completedItems,
        completionRate: totalItems ? Math.round((completedItems / totalItems) * 100) : 0,
        annotations: annotationRows[0]?.value ?? 0,
        assignedTasks: assignedTaskRows[0]?.value ?? 0,
        openTasks: taskStatusRows
          .filter((row) => row.status !== "completed" && row.status !== "reviewed")
          .reduce((sum, row) => sum + row.value, 0),
        pendingReviews: reviewRows.find((row) => row.status === "pending")?.value ?? 0,
        approvedReviews: reviewRows.find((row) => row.status === "approved")?.value ?? 0,
      },
      projects: projectProgress.map((project) => ({
        name: project.name,
        tasks: project.tasks,
        progress: project.tasks ? Math.round((project.completed / project.tasks) * 100) : 0,
      })),
      tasks: recentTasks,
      reviews: recentReviews,
    });
  } catch (err) {
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
