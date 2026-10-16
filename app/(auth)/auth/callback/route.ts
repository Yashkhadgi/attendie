import type { NextRequest } from "next/server";
import { connection } from "next/server";

import { handleOAuthCallback } from "@/lib/auth/callback";

export async function GET(request: NextRequest) {
  await connection();
  return handleOAuthCallback(request);
}
