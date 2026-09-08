import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getUserWorkflows, saveWorkflow, WORKFLOW_PRESETS } from "@/lib/workflows/workflowEngine";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workflows = await getUserWorkflows(sessionData.user.id);

    return NextResponse.json({
      success: true,
      workflows,
      presets: WORKFLOW_PRESETS,
    });
  } catch (error: any) {
    console.error("Workflows GET error:", error);
    return new NextResponse("Failed to fetch workflows", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, name, description, projectId, status, triggerType, scheduleCron, nodes = [], edges = [] } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Workflow name is required" }, { status: 400 });
    }

    const saved = await saveWorkflow(sessionData.user.id, {
      id,
      name: name.trim(),
      description: description?.trim(),
      projectId,
      status,
      triggerType,
      scheduleCron,
      nodes,
      edges,
    });

    return NextResponse.json({ success: true, workflow: saved });
  } catch (error: any) {
    console.error("Workflows POST error:", error);
    return new NextResponse("Failed to save workflow", { status: 500 });
  }
}
