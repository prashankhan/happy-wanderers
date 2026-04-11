import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

const handleAuth = auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (!req.auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // NextAuth’s wrapped handler is typed for route handlers; at runtime the proxy/middleware path only needs the request.
  return handleAuth(request, event as never);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
