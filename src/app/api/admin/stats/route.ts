import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(sessionData.user)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      activeSessions,
      totalTasks,
      pendingApprovals,
      failedLogins,
      totalAuditLogs,
      totalTools,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { accountState: "ACTIVE" } }),
      db.user.count({ where: { accountState: "SUSPENDED" } }),
      db.session.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
      db.task.count(),
      db.approval.count({ where: { status: "PENDING" } }),
      db.authEvent.count({ where: { eventType: "LOGIN_FAILURE" } }),
      db.auditLog.count(),
      db.tool.count(),
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        activeSessions,
        totalTasks,
        pendingApprovals,
        failedLogins,
        totalAuditLogs,
        totalTools,
        systemHealth: "OPTIMAL",
        uptimeSeconds: Math.round(process.uptime()),
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin metrics." }, { status: 500 });
  }
}
