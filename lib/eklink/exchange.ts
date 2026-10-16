import "server-only";

import { getEklinkConfig, type EklinkConfig } from "@/lib/eklink/config";

type TokenResponse = {
  access_token: string;
};

async function postTokenRequest(
  endpoint: string,
  body: URLSearchParams,
  config: EklinkConfig,
): Promise<TokenResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(new URL(endpoint, config.eklinkUrl), {
      method: "POST",
      body,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  return postTokenRequest("/token", body, config);
}
