import "server-only";

import { createElement, Fragment, type ReactNode } from "react";
import type { NextRequest } from "next/server";

import { Navbar } from "@/components/Navbar";
import { SessionKeepAlive } from "@/components/SessionKeepAlive";
import {
  requireSession as requireCookieSession,
  requireSessionForRequest,
} from "@/lib/session";

type SessionGateProps = {
  children: ReactNode;
};

export async function SessionGate({ children }: SessionGateProps) {
  const session = await requireCookieSession();

  return createElement(
    Fragment,
    null,
    createElement(Navbar, {
      user: {
        name: session.claims.name,
        role: session.claims.role,
      },
    }),
    createElement(SessionKeepAlive),
    createElement("main", { className: "flex-1" }, children),
  );
}

export function requireSession(input?: string | NextRequest) {
  if (typeof input === "object") {
    return requireSessionForRequest(input);
  }

  return requireCookieSession(input);
}
