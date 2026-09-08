import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("nexa_session")?.value;

  // 1. Check if route is protected (/app/* or /admin/*)
  const isAppRoute = pathname.startsWith("/app");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAppRoute || isAdminRoute) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Prevent authenticated users from getting stuck on login/signup
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  if (isAuthRoute && sessionToken) {
    // If already has session cookie, allow viewing or redirect to /app
    // If explicitly navigated, redirect to /app
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (!request.nextUrl.searchParams.has("force")) {
      return NextResponse.redirect(new URL(redirectParam || "/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/login", "/signup"],
};
