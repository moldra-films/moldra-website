import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for the mock session cookie or Supabase cookies
  const hasSession = request.cookies.has("moldra-session");

  // Protect admin and client routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/client")) {
    if (!hasSession) {
      // Redirect to unified login page if unauthenticated
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users trying to access login page
  if (pathname === "/login" && hasSession) {
    // Determine route from simple cookie role helper if available
    const role = request.cookies.get("moldra-role")?.value || "client";
    const redirectUrl = new URL(role === "admin" ? "/admin" : "/client", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/login"],
};
