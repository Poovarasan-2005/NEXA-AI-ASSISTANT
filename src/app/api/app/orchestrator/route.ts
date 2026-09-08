import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { runOrchestration } from "@/lib/ai/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, projectId, preferredModel, personalMode, isSimulation, approvedApprovalId } = body;

    if (!prompt && !approvedApprovalId) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const result = await runOrchestration({
      userId: sessionData.user.id,
      prompt: prompt || "Resuming approved action",
      projectId,
      preferredModel,
      personalMode,
      isSimulation: Boolean(isSimulation),
      approvedApprovalId,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Orchestrator error:", error);
    return NextResponse.json({ error: error.message || "Execution error" }, { status: 500 });
  }
}
