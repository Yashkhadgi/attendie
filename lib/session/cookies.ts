import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const OAUTH_COOKIE_NAME = "attendie_oauth";

export function getSessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Host-attendie_session"
    : "attendie_session";
}

export function baseCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function expiredCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}
