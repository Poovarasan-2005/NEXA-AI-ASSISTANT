import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, revokeSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await revokeSession(token);
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
