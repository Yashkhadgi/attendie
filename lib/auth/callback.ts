import "server-only";

import type { JWTVerifyGetKey } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authErrorUrl, sanitizeNextPath } from "@/lib/auth/redirects";
import { isAllowedEklinkRole } from "@/lib/eklink/claims";
import { getEklinkConfig, type EklinkConfig } from "@/lib/eklink/config";
import { exchangeAuthorizationCode } from "@/lib/eklink/exchange";
import { verifyAccessToken } from "@/lib/eklink/verify";
import { setSessionCookie } from "@/lib/session";
import { OAUTH_COOKIE_NAME, expiredCookieOptions } from "@/lib/session/cookies";
import { safeEqual, unsealOAuthState } from "@/lib/session/crypto";

type CallbackDependencies = {
  config?: EklinkConfig;
  fetch?: typeof fetch;
  keyResolver?: JWTVerifyGetKey;
};

function redirectFromConfig(config: EklinkConfig, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, config.appUrl));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function clearOAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(OAUTH_COOKIE_NAME, "", expiredCookieOptions());
  return response;
}

function errorResponse(config: EklinkConfig, reason: string): NextResponse {
  return clearOAuthCookie(
    redirectFromConfig(config, authErrorUrl(reason)),
  );
}

export async function handleOAuthCallback(
  request: NextRequest,
  dependencies: CallbackDependencies = {},
): Promise<NextResponse> {
  const config = dependencies.config ?? getEklinkConfig();
  const providerError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (providerError) {
    return errorResponse(config, "provider");
  }

  if (!code || !state) {
    return errorResponse(config, "missing_state");
  }

  const oauthCookie = request.cookies.get(OAUTH_COOKIE_NAME)?.value;
  const oauthState = await unsealOAuthState(
    oauthCookie ?? "",
    config.sessionKey,
  );
  if (!oauthState || !safeEqual(oauthState.state, state)) {
    return errorResponse(config, "bad_state");
  }

  try {
    const tokenResponse = await exchangeAuthorizationCode(
      code,
      config,
      dependencies.fetch,
    );
    const claims = await verifyAccessToken(tokenResponse.access_token, {
      config,
      keyResolver: dependencies.keyResolver,
    });

    if (!isAllowedEklinkRole(claims.role)) {
      return clearOAuthCookie(redirectFromConfig(config, "/no-access"));
    }

    const response = clearOAuthCookie(
      redirectFromConfig(config, sanitizeNextPath(oauthState.next)),
    );
    await setSessionCookie(
      response,
      claims,
      tokenResponse.access_token,
      config.sessionKey,
    );
    return response;
  } catch {
    return errorResponse(config, "callback_failed");
  }
}
