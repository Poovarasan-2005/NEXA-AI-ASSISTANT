import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getServerSession();

    if (!sessionData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: sessionData.user,
      session: {
        id: sessionData.session.id,
        deviceInfo: sessionData.session.deviceInfo,
        expiresAt: sessionData.session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
