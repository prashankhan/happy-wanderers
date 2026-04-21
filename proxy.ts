import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

const handleAuth = auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (!req.auth) {
      // Do not reveal admin API surface to unauthenticated probes.
      return new NextResponse("Not Found", { status: 404 });
    }
    const response = NextResponse.next();
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive, nosnippet");
    return response;
  }

  if (pathname === "/admin/login") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    const response = NextResponse.next();
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive, nosnippet");
    return response;
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-robots-tag", "noindex, nofollow, noarchive, nosnippet");
  return response;
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // NextAuth’s wrapped handler is typed for route handlers; at runtime the proxy/middleware path only needs the request.
  return handleAuth(request, event as never);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
