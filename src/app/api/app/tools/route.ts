import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tools = await db.tool.findMany({
      orderBy: { riskLevel: "asc" },
    });

    return NextResponse.json({ tools });
  } catch (error: any) {
    console.error("Fetch tools error:", error);
    return NextResponse.json({ error: "Failed to fetch tools registry." }, { status: 500 });
  }
}
