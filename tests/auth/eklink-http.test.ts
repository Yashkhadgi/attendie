import { describe, expect, it, vi } from "vitest";

import { exchangeAuthorizationCode } from "@/lib/eklink/exchange";
import { refreshAccessToken } from "@/lib/eklink/refresh";
import { testConfig } from "@/tests/helpers/auth";

function successfulFetch() {
  return vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return Response.json({ access_token: "synthetic-access-value" });
    },
  );
}

function requestDetails(fetchMock: ReturnType<typeof successfulFetch>) {
  const [input, init] = fetchMock.mock.calls[0];
  return {
    url: new URL(input instanceof Request ? input.url : input.toString()),
    init,
    body: JSON.parse(init?.body as string) as Record<string, unknown>,
  };
}

describe("EkLink token HTTP contract", () => {
  it("exchanges an authorization code with the exact JSON request", async () => {
    const fetchMock = successfulFetch();

    await exchangeAuthorizationCode(
      "synthetic-code",
      testConfig,
      fetchMock as typeof fetch,
    );

    const { url, init, body } = requestDetails(fetchMock);
    expect(url.pathname).toBe("/token");
    expect(init?.method).toBe("POST");
    expect(init?.redirect).toBe("manual");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(body).toEqual({
      grant_type: "authorization_code",
      code: "synthetic-code",
      redirect_uri: testConfig.redirectUri,
      client_id: testConfig.clientId,
      client_secret: testConfig.clientSecret,
    });
    expect(Object.keys(body)).toEqual([
      "grant_type",
      "code",
      "redirect_uri",
      "client_id",
      "client_secret",
    ]);
  });

  it("refreshes access with the exact JSON request", async () => {
    const fetchMock = successfulFetch();

    await refreshAccessToken(
      "synthetic-access-value",
      testConfig,
      fetchMock as typeof fetch,
    );

    const { url, init, body } = requestDetails(fetchMock);
    expect(url.pathname).toBe("/token/refresh");
    expect(init?.method).toBe("POST");
    expect(init?.redirect).toBe("manual");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(body).toEqual({
      client_id: testConfig.clientId,
      client_secret: testConfig.clientSecret,
      access_token: "synthetic-access-value",
    });
    expect(Object.keys(body)).toEqual([
      "client_id",
      "client_secret",
      "access_token",
    ]);
  });
});
