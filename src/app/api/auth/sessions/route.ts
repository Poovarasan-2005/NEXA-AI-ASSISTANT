import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession, revokeSession, revokeAllUserSessions } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await db.session.findMany({
      where: {
        userId: sessionData.user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
      isCurrent: s.token === sessionData.session.token,
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error: any) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, action } = body;

    if (action === "revoke_others") {
      await revokeAllUserSessions(sessionData.user.id, sessionData.session.token, sessionData.user.id);
      return NextResponse.json({ success: true, message: "All other sessions have been signed out." });
    }

    if (sessionId) {
      const session = await db.session.findUnique({ where: { id: sessionId } });
      if (!session || session.userId !== sessionData.user.id) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
      }

      await revokeSession(session.token, sessionData.user.id);
      return NextResponse.json({ success: true, message: "Session signed out." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Revoke session error:", error);
    return NextResponse.json({ error: "Failed to revoke session." }, { status: 500 });
  }
}
