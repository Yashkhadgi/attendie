import "server-only";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth/redirects";
import { getEklinkConfig } from "@/lib/eklink/config";
import type { EklinkClaims } from "@/lib/eklink/claims";
import {
  baseCookieOptions,
  expiredCookieOptions,
  getSessionCookieName,
} from "@/lib/session/cookies";
import {
  createSessionPayload,
  sealSessionPayload,
  unsealSessionPayload,
  type SessionPayload,
} from "@/lib/session/crypto";

const SESSION_MAX_AGE_SECONDS = 900;

function sessionMaxAge(exp: number, now = Math.floor(Date.now() / 1000)): number {
  return Math.max(0, Math.min(exp - now, SESSION_MAX_AGE_SECONDS));
}

export async function createSessionCookieValue(
  claims: EklinkClaims,
  accessToken: string,
): Promise<{ value: string; maxAge: number }> {
  const config = getEklinkConfig();
  const payload = createSessionPayload(claims, accessToken);
  const maxAge = sessionMaxAge(payload.exp);

  if (maxAge <= 0) {
    throw new Error("Session expired");
  }

  return {
    value: await sealSessionPayload(payload, config.sessionKey),
    maxAge,
  };
}

export async function setSessionCookie(
  response: NextResponse,
  claims: EklinkClaims,
  accessToken: string,
): Promise<void> {
  const { value, maxAge } = await createSessionCookieValue(claims, accessToken);
  response.cookies.set(getSessionCookieName(), value, baseCookieOptions(maxAge));
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(
    getSessionCookieName(),
    "",
    expiredCookieOptions(),
  );
}

export async function readSessionCookieValue(
  value: string | undefined,
): Promise<SessionPayload | null> {
  if (!value) {
    return null;
  }

  const config = getEklinkConfig();
  const payload = await unsealSessionPayload(value, config.sessionKey);
  if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return readSessionCookieValue(cookieStore.get(getSessionCookieName())?.value);
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  return readSessionCookieValue(request.cookies.get(getSessionCookieName())?.value);
}

async function getCurrentPath(): Promise<string> {
  const headerStore = await headers();
  return sanitizeNextPath(headerStore.get("x-attendie-path"));
}

export async function requireSession(
  nextPath?: string,
): Promise<SessionPayload> {
  const session = await getSession();
  if (session) {
    return session;
  }

  const safeNextPath = sanitizeNextPath(nextPath ?? (await getCurrentPath()));
  redirect(`/auth/login?next=${encodeURIComponent(safeNextPath)}`);
}

export async function requireSessionForRequest(
  request: NextRequest,
): Promise<SessionPayload> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
