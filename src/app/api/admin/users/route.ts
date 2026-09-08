import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession, revokeAllUserSessions } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(sessionData.user)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        role: { select: { name: true } },
        _count: {
          select: {
            sessions: { where: { revokedAt: null, expiresAt: { gt: new Date() } } },
            tasks: true,
            memories: true,
          },
        },
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role.name,
      accountState: u.accountState,
      emailVerified: u.emailVerified,
      mfaEnabled: u.mfaEnabled,
      createdAt: u.createdAt,
      activeSessions: u._count.sessions,
      totalTasks: u._count.tasks,
      totalMemories: u._count.memories,
    }));

    return NextResponse.json({ users: formatted });
  } catch (error: any) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(sessionData.user)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, accountState, roleName, reason } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required." }, { status: 400 });
    }

    // Prevent self-suspension
    if (targetUserId === sessionData.user.id && accountState === "SUSPENDED") {
      return NextResponse.json({ error: "Administrative protection: You cannot suspend your own account." }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updateData: any = {};

    if (accountState) {
      updateData.accountState = accountState;
    }

    if (roleName) {
      const newRole = await db.role.findUnique({ where: { name: roleName } });
      if (newRole) {
        updateData.roleId = newRole.id;
      }
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: updateData,
      include: { role: true },
    });

    // If account was suspended or locked, immediately revoke all active sessions!
    if (accountState === "SUSPENDED" || accountState === "LOCKED") {
      await revokeAllUserSessions(targetUserId, undefined, sessionData.user.id, "ADMIN");
    }

    // Log admin audit action
    await recordAuditLog({
      actorUserId: sessionData.user.id,
      actorRole: sessionData.user.role,
      targetUserId: targetUser.id,
      action: accountState ? `ACCOUNT_${accountState}` : "ROLE_CHANGED",
      resource: "user",
      resourceId: targetUser.id,
      details: {
        previousState: targetUser.accountState,
        newState: accountState || targetUser.accountState,
        previousRole: targetUser.role.name,
        newRole: roleName || targetUser.role.name,
        reason: reason || "Administrative action",
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} updated successfully.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        accountState: updatedUser.accountState,
        role: updatedUser.role.name,
      },
    });
  } catch (error: any) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
