import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const organization =
      typeof body.organization === "string" && body.organization.trim()
        ? body.organization.trim()
        : null;
    const image =
      typeof body.avatar === "string" && body.avatar.trim()
        ? body.avatar.trim()
        : null;
    const bannerImage =
      typeof body.bannerImage === "string" && body.bannerImage.trim()
        ? body.bannerImage.trim()
        : null;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First and last name are required" }, { status: 400 });
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        organization,
        image,
        bannerImage,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        image: user.image,
        bannerImage: user.bannerImage,
        organization: user.organization,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
