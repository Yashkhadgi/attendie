import { describe, expect, it } from "vitest";

import { sanitizeNextPath } from "@/lib/auth/redirects";

describe("sanitizeNextPath", () => {
  it.each([
    "//evil.com",
    "https://evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
  ])("rejects unsafe destination %s", (destination) => {
    expect(sanitizeNextPath(destination)).toBe("/dashboard");
  });

  it("accepts an internal dashboard path", () => {
    expect(sanitizeNextPath("/dashboard")).toBe("/dashboard");
  });
});
