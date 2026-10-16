import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    await requireSession(request);
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Events API is coming in Phase 4." },
    { status: 501 },
  );
}
