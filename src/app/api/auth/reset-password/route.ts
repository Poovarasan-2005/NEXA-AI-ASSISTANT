import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, revokeAllUserSessions } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const resetRecord = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired password reset token." }, { status: 400 });
    }

    if (resetRecord.usedAt) {
      return NextResponse.json({ error: "This password reset link has already been used." }, { status: 400 });
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const newHash = await hashPassword(password);

    // Update password
    await db.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: newHash },
    });

    // Mark token used
    await db.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all active sessions for security
    await revokeAllUserSessions(resetRecord.userId, undefined, resetRecord.userId, "USER");

    await recordAuditLog({
      actorUserId: resetRecord.userId,
      actorRole: "USER",
      targetUserId: resetRecord.userId,
      action: "PASSWORD_RESET_COMPLETED",
      resource: "user",
      resourceId: resetRecord.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. Please log in with your new password.",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
