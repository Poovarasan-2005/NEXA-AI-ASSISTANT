import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getServerSession, verifyPassword } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate TOTP Secret
    const secret = speakeasy.generateSecret({
      name: `NEXA AI (${sessionData.user.email})`,
      issuer: "NEXA AI OS",
      length: 20,
    });

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    // Save temporary secret to user record
    await db.user.update({
      where: { id: sessionData.user.id },
      data: { mfaSecret: secret.base32 },
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCodeDataUrl,
    });
  } catch (error: any) {
    console.error("MFA setup error:", error);
    return NextResponse.json({ error: "Failed to initialize MFA setup." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "6-digit verification code required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: sessionData.user.id } });
    if (!user || !user.mfaSecret) {
      return NextResponse.json({ error: "MFA setup has not been initiated." }, { status: 400 });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: token.trim(),
      window: 1,
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid verification code. Please check your authenticator app." }, { status: 400 });
    }

    // Generate 8 backup recovery codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    // Enable MFA
    await db.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        backupCodes: JSON.stringify(backupCodes),
      },
    });

    await recordAuditLog({
      actorUserId: user.id,
      actorRole: sessionData.user.role,
      targetUserId: user.id,
      action: "MFA_ENABLED",
      resource: "user",
      resourceId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Multi-Factor Authentication enabled successfully!",
      backupCodes,
    });
  } catch (error: any) {
    console.error("MFA verify error:", error);
    return NextResponse.json({ error: "Failed to verify MFA." }, { status: 500 });
  }
}

// Step-up authentication to disable MFA
export async function DELETE(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password required for step-up authentication." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: sessionData.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: null,
      },
    });

    await recordAuditLog({
      actorUserId: user.id,
      actorRole: sessionData.user.role,
      targetUserId: user.id,
      action: "MFA_DISABLED",
      resource: "user",
      resourceId: user.id,
    });

    return NextResponse.json({ success: true, message: "MFA has been disabled." });
  } catch (error: any) {
    console.error("MFA disable error:", error);
    return NextResponse.json({ error: "Failed to disable MFA." }, { status: 500 });
  }
}
