import { createHash } from "node:crypto";

import type { EklinkClaims } from "@/lib/eklink/claims";
import type { EklinkConfig } from "@/lib/eklink/config";

export const testSessionKey = createHash("sha256")
  .update("attendie-test-session-key")
  .digest();

export const testConfig: EklinkConfig = {
  appUrl: new URL("https://attendie.test"),
  eklinkUrl: new URL("https://eklink.test"),
  issuer: "https://eklink.test",
  clientId: "attendie-test-client",
  clientSecret: "test-client-secret",
  redirectUri: "https://attendie.test/auth/callback",
  sessionKey: testSessionKey,
};

export function testClaims(
  overrides: Partial<EklinkClaims> = {},
): EklinkClaims {
  return {
    sub: "person-1",
    login_id: "student-1",
    email: "student@example.test",
    name: "Test Student",
    role: "student",
    department: "Computer Science",
    batch: "2026",
    section: "A",
    ver: 1,
    exp: Math.floor(Date.now() / 1000) + 900,
    ...overrides,
  };
}
