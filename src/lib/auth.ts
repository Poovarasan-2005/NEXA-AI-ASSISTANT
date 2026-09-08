import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { recordAuditLog } from "./audit";

export const SESSION_COOKIE_NAME = "nexa_session";
const SESSION_DURATION_DAYS = 30;

// Rate limiting in-memory storage for brute force prevention
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, limit = 5, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function parseUserAgent(ua: string): string {
  if (!ua) return "Unknown Device";
  let browser = "Browser";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edge")) browser = "Edge";

  let os = "OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} on ${os}`;
}

export async function createSession(userId: string, userAgent = "", ipAddress = "127.0.0.1") {
  const sessionToken = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const deviceInfo = parseUserAgent(userAgent);

  const session = await db.session.create({
    data: {
      userId,
      token: sessionToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    },
  });

  return session;
}

export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if revoked or expired
    if (session.revokedAt || new Date() > session.expiresAt) {
      return null;
    }

    // Check user account status
    if (session.user.accountState !== "ACTIVE") {
      return null;
    }

    // Update lastActiveAt periodically (e.g. if older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (session.lastActiveAt < fiveMinutesAgo) {
      db.session.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      }).catch((e) => console.error("Session update error:", e));
    }

    const permissions = session.user.role.permissions.map((rp) => rp.permission.name);

    return {
      session: {
        id: session.id,
        token: session.token,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
        accountState: session.user.accountState,
        emailVerified: session.user.emailVerified,
        mfaEnabled: session.user.mfaEnabled,
        autonomyLevel: session.user.autonomyLevel,
        pauseMemory: session.user.pauseMemory,
        role: session.user.role.name,
        permissions,
      },
    };
  } catch (error) {
    console.error("Error reading server session:", error);
    return null;
  }
}

export async function revokeSession(sessionToken: string, actorUserId?: string, actorRole = "USER") {
  const session = await db.session.findUnique({ where: { token: sessionToken } });
  if (!session) return false;

  await db.session.update({
    where: { token: sessionToken },
    data: { revokedAt: new Date() },
  });

  await recordAuditLog({
    actorUserId: actorUserId || session.userId,
    actorRole,
    targetUserId: session.userId,
    action: "SESSION_REVOKED",
    resource: "session",
    resourceId: session.id,
    details: { deviceInfo: session.deviceInfo, ipAddress: session.ipAddress },
  });

  return true;
}

export async function revokeAllUserSessions(userId: string, exceptToken?: string, actorUserId?: string, actorRole = "USER") {
  await db.session.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptToken ? { token: { not: exceptToken } } : {}),
    },
    data: { revokedAt: new Date() },
  });

  await recordAuditLog({
    actorUserId: actorUserId || userId,
    actorRole,
    targetUserId: userId,
    action: "SESSION_REVOKED_ALL",
    resource: "session",
    resourceId: userId,
  });

  return true;
}
