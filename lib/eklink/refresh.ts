import "server-only";

import { getEklinkConfig, type EklinkConfig } from "@/lib/eklink/config";

type RefreshResponse = {
  access_token: string;
};

export async function refreshAccessToken(
  accessToken: string,
  config: EklinkConfig = getEklinkConfig(),
): Promise<RefreshResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    access_token: accessToken,
  });

  try {
    const response = await fetch(new URL("/token/refresh", config.eklinkUrl), {
      method: "POST",
      body,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const data = (await response.json()) as Partial<RefreshResponse>;
    if (!data.access_token) {
      throw new Error("Refresh failed");
    }

    return { access_token: data.access_token };
  } finally {
    clearTimeout(timeout);
  }
}
