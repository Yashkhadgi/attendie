import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth/redirects";
import { getSessionCookieName } from "@/lib/session/cookies";

function withPathHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-attendie-path",
    sanitizeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
  );
  return requestHeaders;
}

export function proxy(request: NextRequest) {
  const requestHeaders = withPathHeader(request);
  const hasSessionCookie = request.cookies.has(getSessionCookieName());

  if (!hasSessionCookie && request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!hasSessionCookie) {
    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const loginUrl = new URL("/auth/login", appUrl);
    loginUrl.searchParams.set(
      "next",
      sanitizeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notifications/:path*",
    "/inbox/:path*",
    "/events/:path*",
    "/organisations/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/picker/:path*",
    "/api/v1/:path*",
  ],
};
