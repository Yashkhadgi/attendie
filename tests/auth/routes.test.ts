import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GET as logoutGet,
  POST as logoutPost,
} from "@/app/(auth)/auth/logout/route";
import { GET as directoryGet } from "@/app/api/v1/directory/route";
import { GET as eventsGet } from "@/app/api/v1/events/route";
import { POST as pickerPost } from "@/app/api/v1/picker/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

function setTestEnvironment() {
  vi.stubEnv("APP_URL", "https://attendie.test");
  vi.stubEnv("EKLINK_URL", "https://eklink.test");
  vi.stubEnv("EKLINK_ISSUER", "https://eklink.test");
  vi.stubEnv("EKLINK_CLIENT_ID", "test-client");
  vi.stubEnv("EKLINK_CLIENT_SECRET", "test-secret");
  vi.stubEnv("EKLINK_REDIRECT_URI", "https://attendie.test/auth/callback");
  vi.stubEnv("SESSION_SECRET", Buffer.alloc(32, 7).toString("base64"));
}

describe("logout route", () => {
  it("rejects GET", () => {
    const response = logoutGet();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });

  it("accepts POST and clears the session", () => {
    setTestEnvironment();
    const response = logoutPost();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://attendie.test/auth/signed-out",
    );
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });
});

describe("API session guards", () => {
  it.each([
    ["directory", directoryGet, "GET"],
    ["events", eventsGet, "GET"],
    ["picker", pickerPost, "POST"],
  ])("returns 401 from %s without a session", async (_name, handler, method) => {
    const request = new NextRequest(`https://attendie.test/api/v1/${_name}`, {
      method,
    });

    const response = await handler(request);

    expect(response.status).toBe(401);
  });
});
