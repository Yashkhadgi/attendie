import {
  generateKeyPair,
  SignJWT,
  type JWTVerifyGetKey,
} from "jose";
import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { handleOAuthCallback } from "@/lib/auth/callback";
import { OAUTH_COOKIE_NAME, getSessionCookieName } from "@/lib/session/cookies";
import { sealOAuthState } from "@/lib/session/crypto";
import { testClaims, testConfig } from "@/tests/helpers/auth";

let signingKey: CryptoKey;
let keyResolver: JWTVerifyGetKey;

beforeAll(async () => {
  const keyPair = await generateKeyPair("RS256");
  signingKey = keyPair.privateKey;
  keyResolver = async () => keyPair.publicKey;
});

async function accessToken(role = "student") {
  return new SignJWT(testClaims({ role }))
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer(testConfig.issuer)
    .setAudience(testConfig.clientId)
    .setExpirationTime(Math.floor(Date.now() / 1000) + 900)
    .sign(signingKey);
}

function tokenFetch(token: string): typeof fetch {
  return vi.fn(async () =>
    Response.json({ access_token: token }),
  ) as unknown as typeof fetch;
}

async function oauthCookie(state = "expected-state") {
  return sealOAuthState(
    {
      state,
      next: "/dashboard",
      exp: Math.floor(Date.now() / 1000) + 600,
    },
    testConfig.sessionKey,
  );
}

async function callbackRequest(
  query: string,
  cookie?: string | null,
) {
  const headers = new Headers();
  const cookieValue = cookie === undefined ? await oauthCookie() : cookie;
  if (cookieValue) {
    headers.set("cookie", `${OAUTH_COOKIE_NAME}=${cookieValue}`);
  }
  return new NextRequest(`https://attendie.test/auth/callback?${query}`, {
    headers,
  });
}

function expectOAuthCookieCleared(response: Response) {
  const setCookie = response.headers.get("set-cookie") ?? "";
  expect(setCookie).toContain(`${OAUTH_COOKIE_NAME}=`);
  expect(setCookie).toMatch(/Max-Age=0/i);
  expect(setCookie).toContain("HttpOnly");
}

describe("OAuth callback", () => {
  it.each([
    ["missing state", "code=code", undefined],
    ["missing oauth cookie", "code=code&state=expected-state", null],
    ["wrong state", "code=code&state=wrong-state", undefined],
  ])("rejects %s and clears the oauth cookie", async (_name, query, cookie) => {
    const request = await callbackRequest(query, cookie);

    const response = await handleOAuthCallback(request, { config: testConfig });

    expect(response.headers.get("location")).toContain("/auth/error");
    expectOAuthCookieCleared(response);
  });

  it("clears the oauth cookie when the provider returns an error", async () => {
    const response = await handleOAuthCallback(
      await callbackRequest("error=access_denied"),
      { config: testConfig },
    );

    expectOAuthCookieCleared(response);
  });

  it("clears the oauth cookie when token exchange fails", async () => {
    const failedFetch = vi.fn(async () => new Response(null, { status: 400 }));
    const response = await handleOAuthCallback(
      await callbackRequest("code=code&state=expected-state"),
      { config: testConfig, fetch: failedFetch as typeof fetch },
    );

    expectOAuthCookieCleared(response);
  });

  it("clears the oauth cookie when token verification fails", async () => {
    const response = await handleOAuthCallback(
      await callbackRequest("code=code&state=expected-state"),
      { config: testConfig, fetch: tokenFetch("not-a-jwt"), keyResolver },
    );

    expectOAuthCookieCleared(response);
  });

  it("succeeds with a valid token and clears the oauth cookie", async () => {
    const response = await handleOAuthCallback(
      await callbackRequest("code=code&state=expected-state"),
      {
        config: testConfig,
        fetch: tokenFetch(await accessToken()),
        keyResolver,
      },
    );
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.headers.get("location")).toBe(
      "https://attendie.test/dashboard",
    );
    expect(setCookie).toContain(`${getSessionCookieName()}=`);
    expectOAuthCookieCleared(response);
  });

  it("redirects an unknown role to no-access without a session cookie", async () => {
    const response = await handleOAuthCallback(
      await callbackRequest("code=code&state=expected-state"),
      {
        config: testConfig,
        fetch: tokenFetch(await accessToken("visitor")),
        keyResolver,
      },
    );
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.headers.get("location")).toBe(
      "https://attendie.test/no-access",
    );
    expect(setCookie).not.toContain(`${getSessionCookieName()}=`);
    expectOAuthCookieCleared(response);
  });
});
