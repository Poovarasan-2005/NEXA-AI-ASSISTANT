import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      // Return recent decision ledger entries for the user
      const ledgers = await db.decisionLedger.findMany({
        where: {
          task: { userId: sessionData.user.id },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return NextResponse.json({
        success: true,
        ledgers: ledgers.map((l) => ({
          ...l,
          contextUsed: l.contextUsed ? JSON.parse(l.contextUsed) : [],
          memoriesConsulted: l.memoriesConsulted ? JSON.parse(l.memoriesConsulted) : [],
          toolsInvoked: l.toolsInvoked ? JSON.parse(l.toolsInvoked) : [],
          rulesEnforced: l.rulesEnforced ? JSON.parse(l.rulesEnforced) : [],
          verificationChecklist: l.verificationChecklist ? JSON.parse(l.verificationChecklist) : [],
        })),
      });
    }

    // Verify task belongs to user (anti-IDOR)
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { decisionLedger: true, actionContract: true },
    });

    if (!task || task.userId !== sessionData.user.id) {
      return NextResponse.json({ error: "Task or Decision Ledger not found" }, { status: 404 });
    }

    if (!task.decisionLedger) {
      return NextResponse.json({ error: "No decision ledger recorded for this task" }, { status: 404 });
    }

    const ledger = task.decisionLedger;

    return NextResponse.json({
      success: true,
      decisionLedger: {
        id: ledger.id,
        taskId: ledger.taskId,
        goal: ledger.goal,
        planSummary: ledger.planSummary,
        contextUsed: ledger.contextUsed ? JSON.parse(ledger.contextUsed) : [],
        memoriesConsulted: ledger.memoriesConsulted ? JSON.parse(ledger.memoriesConsulted) : [],
        toolsInvoked: ledger.toolsInvoked ? JSON.parse(ledger.toolsInvoked) : [],
        rulesEnforced: ledger.rulesEnforced ? JSON.parse(ledger.rulesEnforced) : [],
        modelSelectionRationale: ledger.modelSelectionRationale,
        verificationChecklist: ledger.verificationChecklist ? JSON.parse(ledger.verificationChecklist) : [],
        finalOutcome: ledger.finalOutcome,
        actionContract: task.actionContract
          ? {
              id: task.actionContract.id,
              goal: task.actionContract.goal,
              agents: JSON.parse(task.actionContract.agents),
              tools: JSON.parse(task.actionContract.tools),
              allowedActions: JSON.parse(task.actionContract.allowedActions),
              forbiddenActions: JSON.parse(task.actionContract.forbiddenActions),
              riskLevel: task.actionContract.riskLevel,
              expiresAt: task.actionContract.expiresAt,
            }
          : null,
        createdAt: ledger.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch decision ledger:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
