import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { runWorkflow } from "@/lib/workflows/workflowEngine";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const triggerSource = body.trigger || "MANUAL";

    const result = await runWorkflow(params.id, sessionData.user.id, triggerSource);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Workflow run error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute workflow" },
      { status: 500 }
    );
  }
}
