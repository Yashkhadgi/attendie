import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAllowedEklinkRole } from "@/lib/eklink/claims";
import { getEklinkConfig } from "@/lib/eklink/config";
import { refreshAccessToken } from "@/lib/eklink/refresh";
import { verifyAccessToken } from "@/lib/eklink/verify";
import { clearSessionCookie, getSessionFromRequest, setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  const config = getEklinkConfig();
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { ok: false },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const refreshed = await refreshAccessToken(session.access_token, config);
    const claims = await verifyAccessToken(refreshed.access_token, { config });
    if (!isAllowedEklinkRole(claims.role)) {
      throw new Error("Role is not allowed");
    }
    const response = NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    await setSessionCookie(
      response,
      claims,
      refreshed.access_token,
      config.sessionKey,
    );
    return response;
  } catch {
    const response = NextResponse.json(
      { ok: false },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
    clearSessionCookie(response);
    return response;
  }
}
