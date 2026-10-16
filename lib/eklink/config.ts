import "server-only";

import { z } from "zod";

import { decodeSecret, deriveEncryptionKey } from "@/lib/session/crypto";

const envSchema = z.object({
  APP_URL: z.string().url(),
  EKLINK_URL: z.string().url(),
  EKLINK_ISSUER: z.string().url().optional(),
  EKLINK_CLIENT_ID: z.string().min(1),
  EKLINK_CLIENT_SECRET: z.string().min(1),
  EKLINK_REDIRECT_URI: z.string().url(),
  SESSION_SECRET: z.string().min(1),
});

export type EklinkConfig = {
  appUrl: URL;
  eklinkUrl: URL;
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sessionKey: Uint8Array;
};

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getEklinkConfig(): EklinkConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Invalid server configuration");
  }

  const decodedSecret = decodeSecret(parsed.data.SESSION_SECRET);
  const eklinkUrl = new URL(withoutTrailingSlash(parsed.data.EKLINK_URL));
  const issuer = withoutTrailingSlash(parsed.data.EKLINK_ISSUER ?? eklinkUrl.toString());

  return {
    appUrl: new URL(withoutTrailingSlash(parsed.data.APP_URL)),
    eklinkUrl,
    issuer,
    clientId: parsed.data.EKLINK_CLIENT_ID,
    clientSecret: parsed.data.EKLINK_CLIENT_SECRET,
    redirectUri: parsed.data.EKLINK_REDIRECT_URI,
    sessionKey: deriveEncryptionKey(decodedSecret),
  };
}
