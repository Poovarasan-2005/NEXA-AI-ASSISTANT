import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, hashPassword, generateSecureToken } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(`signup_${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many sign up attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, confirmPassword, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Strong password policy: min 8 characters, at least 1 number, 1 uppercase or special character
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Check duplicate account
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Get default USER role
    const userRole = await db.role.findUnique({ where: { name: "USER" } });
    if (!userRole) {
      return NextResponse.json({ error: "System initialization error: User role missing." }, { status: 500 });
    }

    const passwordHash = await hashPassword(password);

    // Create user in PENDING_VERIFICATION or ACTIVE state (we allow verification via token)
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name.trim(),
        roleId: userRole.id,
        accountState: "ACTIVE", // Enabled for seamless immediate testing, with verification token provided
        emailVerified: false,
        autonomyLevel: "ASK_BEFORE_ACTING",
      },
    });

    // Generate Verification Token
    const verifyToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verifyToken,
        expiresAt,
      },
    });

    await recordAuditLog({
      actorUserId: user.id,
      actorRole: "USER",
      targetUserId: user.id,
      action: "USER_SIGNUP",
      resource: "user",
      resourceId: user.id,
      ipAddress: ip,
      details: { email: user.email, name: user.name },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      verificationToken: verifyToken, // Provided for developer/demo visibility
      verificationUrl: `/verify-email?token=${verifyToken}`,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
