import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: sessionData.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        accountState: true,
        emailVerified: true,
        mfaEnabled: true,
        autonomyLevel: true,
        pauseMemory: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, autonomyLevel, pauseMemory } = body;

    const updated = await db.user.update({
      where: { id: sessionData.user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(autonomyLevel ? { autonomyLevel } : {}),
        ...(typeof pauseMemory === "boolean" ? { pauseMemory } : {}),
      },
    });

    await recordAuditLog({
      actorUserId: sessionData.user.id,
      actorRole: sessionData.user.role,
      targetUserId: sessionData.user.id,
      action: "SETTINGS_UPDATED",
      resource: "user",
      resourceId: sessionData.user.id,
      details: { autonomyLevel, pauseMemory },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
