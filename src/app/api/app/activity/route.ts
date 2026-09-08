import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await db.activityEvent.findMany({
      where: { userId: sessionData.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Fetch activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity log." }, { status: 500 });
  }
}
