import "server-only";

import { getEklinkConfig, type EklinkConfig } from "@/lib/eklink/config";

type TokenResponse = {
  access_token: string;
};

async function postTokenRequest(
  endpoint: string,
  body: Record<string, string>,
  config: EklinkConfig,
  fetchImpl: typeof fetch,
): Promise<TokenResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetchImpl(new URL(endpoint, config.eklinkUrl), {
      method: "POST",
      body: JSON.stringify(body),
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Token request failed");
    }

    const data = (await response.json()) as Partial<TokenResponse>;
    if (!data.access_token) {
      throw new Error("Token request failed");
    }

    return { access_token: data.access_token };
  } finally {
    clearTimeout(timeout);
  }
}

export async function exchangeAuthorizationCode(
  code: string,
  config = getEklinkConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<TokenResponse> {
  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  };

  return postTokenRequest("/token", body, config, fetchImpl);
}
