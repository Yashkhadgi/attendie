import type { NextRequest } from "next/server";
import { connection, NextResponse } from "next/server";

import { authErrorUrl } from "@/lib/auth/redirects";
import { exchangeAuthorizationCode } from "@/lib/eklink/exchange";
import { getEklinkConfig } from "@/lib/eklink/config";
import { isAllowedEklinkRole } from "@/lib/eklink/claims";
import { verifyAccessToken } from "@/lib/eklink/verify";
import { OAUTH_COOKIE_NAME, expiredCookieOptions } from "@/lib/session/cookies";
import {
  safeEqual,
  stateDigest,
  unsealOAuthState,
} from "@/lib/session/crypto";
import { setSessionCookie } from "@/lib/session";

const consumedStates = new Map<string, number>();

function cleanupConsumedStates(now = Math.floor(Date.now() / 1000)): void {
  for (const [digest, exp] of consumedStates) {
    if (exp <= now) {
      consumedStates.delete(digest);
    }
  }
}

function redirectFromConfig(path: string): NextResponse {
  const config = getEklinkConfig();
  const response = NextResponse.redirect(new URL(path, config.appUrl));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function clearOAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(OAUTH_COOKIE_NAME, "", expiredCookieOptions());
  return response;
}

function redirectToError(reason: string): NextResponse {
  return clearOAuthCookie(redirectFromConfig(authErrorUrl(reason)));
}

export async function GET(request: NextRequest) {
  await connection();
  const config = getEklinkConfig();
  const providerError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (providerError) {
    return redirectToError("provider");
  }

  if (!code || !state) {
    return redirectToError("missing_state");
  }

  const oauthCookie = request.cookies.get(OAUTH_COOKIE_NAME)?.value;
  const oauthState = await unsealOAuthState(oauthCookie ?? "", config.sessionKey);
  if (!oauthState || !safeEqual(oauthState.state, state)) {
    return redirectToError("bad_state");
  }

  cleanupConsumedStates();
  const digest = stateDigest(state);
  if (consumedStates.has(digest)) {
    return redirectToError("replayed_state");
  }
  consumedStates.set(digest, oauthState.exp);

  try {
    const tokenResponse = await exchangeAuthorizationCode(code, config);
    const claims = await verifyAccessToken(tokenResponse.access_token, { config });

    if (!isAllowedEklinkRole(claims.role)) {
      return clearOAuthCookie(redirectFromConfig("/no-access"));
    }

    const response = clearOAuthCookie(
      NextResponse.redirect(new URL(oauthState.next, config.appUrl)),
    );
    response.headers.set("Cache-Control", "no-store");
    await setSessionCookie(response, claims, tokenResponse.access_token);
    return response;
  } catch {
    return redirectToError("callback_failed");
  }
}
