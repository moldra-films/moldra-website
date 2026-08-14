import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for the mock session cookie
  const hasSession = request.cookies.has("moldra-session");
  const role = request.cookies.get("moldra-role")?.value || "client";

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (hasSession && role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/client", request.url));
    }
  }

  // Protect client routes
  if (pathname.startsWith("/client")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Redirect authenticated users trying to access login page
  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/client", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/login"],
};
