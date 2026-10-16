import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  baseCookieOptions,
  getSessionCookieName,
} from "@/lib/session/cookies";
import {
  createSessionPayload,
  sealSessionPayload,
  unsealSessionPayload,
} from "@/lib/session/crypto";
import { testClaims, testSessionKey } from "@/tests/helpers/auth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sealed session cookies", () => {
  it("round-trips a valid session", async () => {
    const payload = createSessionPayload(testClaims(), "access-token");
    const sealed = await sealSessionPayload(payload, testSessionKey);

    await expect(unsealSessionPayload(sealed, testSessionKey)).resolves.toEqual(
      payload,
    );
  });

  it("rejects a tampered cookie", async () => {
    const payload = createSessionPayload(testClaims(), "access-token");
    const sealed = await sealSessionPayload(payload, testSessionKey);
    const segments = sealed.split(".");
    const tamperIndex = Math.floor(segments[3].length / 2);
    const original = segments[3][tamperIndex];
    segments[3] = `${segments[3].slice(0, tamperIndex)}${
      original === "a" ? "b" : "a"
    }${segments[3].slice(tamperIndex + 1)}`;

    await expect(
      unsealSessionPayload(segments.join("."), testSessionKey),
    ).resolves.toBeNull();
  });

  it("rejects an expired session", async () => {
    const payload = createSessionPayload(
      testClaims({ exp: Math.floor(Date.now() / 1000) - 10 }),
      "access-token",
    );
    const sealed = await sealSessionPayload(payload, testSessionKey);

    await expect(unsealSessionPayload(sealed, testSessionKey)).resolves.toBeNull();
  });

  it("keeps a session with long profile fields below 3500 bytes", async () => {
    const payload = createSessionPayload(
      testClaims({ name: "N".repeat(300), department: "D".repeat(300) }),
      "token-value",
    );
    const sealed = await sealSessionPayload(payload, testSessionKey);

    expect(Buffer.byteLength(sealed)).toBeLessThan(3500);
  });
});

describe("session cookie attributes", () => {
  it("uses HttpOnly, SameSite=Lax, and Secure in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(baseCookieOptions(900)).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    expect(getSessionCookieName()).toBe("__Host-attendie_session");
  });

  it("does not expose the access token in a non-HttpOnly cookie", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      getSessionCookieName(),
      "encrypted-session-value",
      baseCookieOptions(900),
    );
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).not.toContain("access-token");
  });
});
