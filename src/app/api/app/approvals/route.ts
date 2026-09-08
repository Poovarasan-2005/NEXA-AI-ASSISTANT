import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { recordAuditLog, recordActivityEvent } from "@/lib/audit";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const approvals = await db.approval.findMany({
      where: { userId: sessionData.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        task: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    return NextResponse.json({ approvals });
  } catch (error: any) {
    console.error("Fetch approvals error:", error);
    return NextResponse.json({ error: "Failed to fetch approvals." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { approvalId, action, comment } = body;

    if (!approvalId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Valid approvalId and action required." }, { status: 400 });
    }

    // IDOR Protection: Verify approval belongs to current user
    const approval = await db.approval.findUnique({
      where: { id: approvalId },
      include: { task: true },
    });

    if (!approval || approval.userId !== sessionData.user.id) {
      return NextResponse.json({ error: "Approval request not found." }, { status: 404 });
    }

    if (approval.status !== "PENDING") {
      return NextResponse.json({ error: `This approval has already been ${approval.status.toLowerCase()}.` }, { status: 400 });
    }

    const isApproved = action === "APPROVE";
    const newStatus = isApproved ? "APPROVED" : "REJECTED";

    await db.approval.update({
      where: { id: approvalId },
      data: {
        status: newStatus,
        resolvedAt: new Date(),
        comment: comment || null,
      },
    });

    if (approval.taskId) {
      if (isApproved) {
        await db.task.update({
          where: { id: approval.taskId },
          data: {
            status: "COMPLETED",
            progress: 100,
            currentStep: "Approved by user and executed successfully.",
            resultSummary: `Action '${approval.actionName}' confirmed and executed.`,
          },
        });
      } else {
        await db.task.update({
          where: { id: approval.taskId },
          data: {
            status: "CANCELLED",
            currentStep: "Cancelled by user approval firewall.",
            resultSummary: `Action rejected: ${comment || "No comment provided."}`,
          },
        });
      }
    }

    await recordActivityEvent({
      userId: sessionData.user.id,
      type: isApproved ? "APPROVAL_GRANTED" : "APPROVAL_REJECTED",
      title: `${isApproved ? "Approved" : "Rejected"}: ${approval.actionName}`,
      description: comment || (isApproved ? "Action granted authorization to execute." : "Action aborted by user."),
      metadata: { approvalId: approval.id, taskId: approval.taskId, riskLevel: approval.riskLevel },
    });

    await recordAuditLog({
      actorUserId: sessionData.user.id,
      actorRole: sessionData.user.role,
      targetUserId: sessionData.user.id,
      action: isApproved ? "APPROVAL_GRANTED" : "APPROVAL_REJECTED",
      resource: "approval",
      resourceId: approval.id,
      details: { actionName: approval.actionName, riskLevel: approval.riskLevel },
    });

    return NextResponse.json({
      success: true,
      message: `Action ${newStatus.toLowerCase()} successfully.`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error("Resolve approval error:", error);
    return NextResponse.json({ error: "Failed to process approval." }, { status: 500 });
  }
}
