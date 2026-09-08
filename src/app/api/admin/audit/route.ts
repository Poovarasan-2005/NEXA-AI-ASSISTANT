import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(sessionData.user, "audit:read")) {
      return NextResponse.json({ error: "Forbidden: Audit read permission required." }, { status: 403 });
    }

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Admin audit fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs." }, { status: 500 });
  }
}
