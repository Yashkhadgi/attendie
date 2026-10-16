import { NextResponse } from "next/server";

import { getEklinkConfig } from "@/lib/eklink/config";
import { clearSessionCookie } from "@/lib/session";

export function GET() {
  return new NextResponse("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: "POST",
      "Cache-Control": "no-store",
    },
  });
}

export function POST() {
  const config = getEklinkConfig();
  const response = NextResponse.redirect(
    new URL("/auth/signed-out", config.appUrl),
  );
  response.headers.set("Cache-Control", "no-store");
  clearSessionCookie(response);
  return response;
}
