import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const organization = session.user.organization ?? null;
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(organization ? eq(user.organization, organization) : eq(user.id, session.user.id))
      .orderBy(desc(user.createdAt));

    return NextResponse.json({ members: rows });
  } catch (err) {
    console.error("[GET /api/team]", err);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
