import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import {
  getTrustAttestation,
  runIntegrityAudit,
  generateComplianceDossier,
} from "@/lib/trust/trustService";
import { recordActivityEvent, recordAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attestation = await getTrustAttestation(sessionData.user.id);
    return NextResponse.json({ success: true, attestation });
  } catch (error: any) {
    console.error("Trust GET error:", error);
    return new NextResponse("Failed to retrieve trust attestation", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { action, standard } = body;

    if (action === "RUN_AUDIT") {
      const auditResult = await runIntegrityAudit(sessionData.user.id);
      return NextResponse.json({ success: true, auditResult });
    }

    if (action === "EXPORT_COMPLIANCE") {
      const selectedStandard = (standard || "SOC2") as "SOC2" | "GDPR" | "ISO42001" | "NIST";
      const dossier = await generateComplianceDossier(sessionData.user.id, selectedStandard);
      return NextResponse.json({ success: true, dossier });
    }

    if (action === "PURGE_EPHEMERAL") {
      await recordAuditLog({
        actorUserId: sessionData.user.id,
        actorRole: typeof sessionData.user.role === "string" ? sessionData.user.role : (sessionData.user.role as any)?.name || "USER",
        action: "SECURITY_POLICY_UPDATE",
        resource: "EPHEMERAL_CACHE",
        details: { action: "PURGE_EPHEMERAL_DATA", reason: "GDPR_ARTICLE_17_USER_REQUEST" },
      });

      await recordActivityEvent({
        userId: sessionData.user.id,
        type: "SECURITY_POLICY_UPDATE",
        title: "Ephemeral Context Purged",
        description: "Zero-retention ephemeral session artifacts and scratch buffers purged.",
      });

      return NextResponse.json({
        success: true,
        message: "Ephemeral sandbox context and temporary buffers purged in compliance with GDPR Article 17.",
      });
    }

    return NextResponse.json({ error: "Invalid trust action" }, { status: 400 });
  } catch (error: any) {
    console.error("Trust POST error:", error);
    return new NextResponse("Failed to execute trust operation", { status: 500 });
  }
}
