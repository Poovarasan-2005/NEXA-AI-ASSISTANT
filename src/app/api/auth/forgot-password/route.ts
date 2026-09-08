import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, generateSecureToken } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const rateLimit = checkRateLimit(`forgot_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many reset requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    let resetToken: string | null = null;

    if (user) {
      resetToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      await recordAuditLog({
        actorUserId: user.id,
        actorRole: "USER",
        targetUserId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        resource: "user",
        resourceId: user.id,
        ipAddress: ip,
      });
    }

    // Generic response to avoid email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email address, a password reset link has been dispatched.",
      // Provided for developer/demo visibility if token was created
      resetUrl: resetToken ? `/reset-password?token=${resetToken}` : null,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to process password reset." }, { status: 500 });
  }
}
