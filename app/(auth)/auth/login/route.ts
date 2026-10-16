import { randomBytes } from "crypto";
import { connection } from "next/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth/redirects";
import { getEklinkConfig } from "@/lib/eklink/config";
import { OAUTH_COOKIE_NAME, baseCookieOptions } from "@/lib/session/cookies";
import { sealOAuthState } from "@/lib/session/crypto";

export async function GET(request: NextRequest) {
  await connection();
  const config = getEklinkConfig();
  const state = randomBytes(32).toString("base64url");
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const expiresAt = Math.floor(Date.now() / 1000) + 600;
  const oauthCookie = await sealOAuthState(
    { state, next: nextPath, exp: expiresAt },
    config.sessionKey,
  );
  const authorizeUrl = new URL("/authorize", config.eklinkUrl);

  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(OAUTH_COOKIE_NAME, oauthCookie, baseCookieOptions(600));

  return response;
}
