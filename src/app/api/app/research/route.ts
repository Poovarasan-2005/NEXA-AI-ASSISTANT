import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { runDeepResearch, getUserFactLedgers } from "@/lib/research/deepResearchEngine";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ledgers = await getUserFactLedgers(sessionData.user.id);
    return NextResponse.json({ success: true, ledgers, researchLedgers: ledgers });
  } catch (error: any) {
    console.error("Research GET error:", error);
    return new NextResponse("Failed to fetch research ledgers", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { topic = "Zero-Trust Sovereign AI Operating System Architecture" } = body;

    const researchResult = await runDeepResearch(topic, sessionData.user.id);
    return NextResponse.json({ success: true, research: researchResult, factLedger: researchResult });
  } catch (error: any) {
    console.error("Research POST error:", error);
    return new NextResponse("Failed to execute deep research", { status: 500 });
  }
}
