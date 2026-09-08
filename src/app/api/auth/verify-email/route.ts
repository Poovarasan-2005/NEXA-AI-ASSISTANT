import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const verificationRecord = await db.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: "Invalid or expired verification token." }, { status: 400 });
    }

    if (verificationRecord.usedAt) {
      return NextResponse.json({ message: "Email has already been verified. You can log in." }, { status: 200 });
    }

    if (new Date() > verificationRecord.expiresAt) {
      return NextResponse.json({ error: "Verification token has expired. Please request a new one." }, { status: 400 });
    }

    // Activate user
    await db.user.update({
      where: { id: verificationRecord.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        accountState: "ACTIVE",
      },
    });

    await db.emailVerificationToken.update({
      where: { id: verificationRecord.id },
      data: { usedAt: new Date() },
    });

    await recordAuditLog({
      actorUserId: verificationRecord.userId,
      actorRole: "USER",
      targetUserId: verificationRecord.userId,
      action: "EMAIL_VERIFIED",
      resource: "user",
      resourceId: verificationRecord.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Your account is now active.",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
