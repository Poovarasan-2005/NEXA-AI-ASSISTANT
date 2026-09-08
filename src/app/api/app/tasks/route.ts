import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await db.task.findMany({
      where: { userId: sessionData.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        approvals: true,
        executions: {
          include: { tool: true },
        },
      },
      take: 30,
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch task history." }, { status: 500 });
  }
}
