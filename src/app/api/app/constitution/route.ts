import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserConstitution } from "@/lib/ai/constitutionEngine";
import { recordAuditLog, recordActivityEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await getUserConstitution(sessionData.user.id);
    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    console.error("Failed to fetch constitution:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ruleId, enforced, content, action } = body;

    if (action === "ADD") {
      const newContent = body.content?.trim();
      if (!newContent) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
      }

      const existing = await db.constitutionRule.findMany({
        where: { userId: sessionData.user.id },
      });
      const nextNumber = existing.length + 1;

      const created = await db.constitutionRule.create({
        data: {
          userId: sessionData.user.id,
          ruleNumber: nextNumber,
          content: newContent,
          category: body.category || "GENERAL",
          enforced: true,
        },
      });

      await recordActivityEvent({
        userId: sessionData.user.id,
        type: "POLICY_UPDATED",
        title: `AI Constitution Rule #${nextNumber} Added`,
        description: `New user rule: "${newContent.slice(0, 60)}..."`,
      });

      return NextResponse.json({ success: true, rule: created });
    }

    if (ruleId) {
      const updated = await db.constitutionRule.update({
        where: { id: ruleId },
        data: {
          ...(typeof enforced === "boolean" ? { enforced } : {}),
          ...(content ? { content: content.trim() } : {}),
        },
      });

      await recordActivityEvent({
        userId: sessionData.user.id,
        type: "POLICY_UPDATED",
        title: `AI Constitution Rule #${updated.ruleNumber} Modified`,
        description: `Enforced status: ${updated.enforced}`,
      });

      return NextResponse.json({ success: true, rule: updated });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to update constitution rule:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
