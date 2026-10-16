import { createHash, timingSafeEqual } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { z } from "zod";

import { eklinkClaimsSchema, type EklinkClaims } from "@/lib/eklink/claims";

const textEncoder = new TextEncoder();

export const sessionPayloadSchema = z.object({
  claims: eklinkClaimsSchema,
  access_token: z.string().min(1),
  exp: z.number().int().positive(),
});

export const oauthStateSchema = z.object({
  state: z.string().min(1),
  next: z.string().min(1),
  exp: z.number().int().positive(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
export type OAuthStatePayload = z.infer<typeof oauthStateSchema>;

export function decodeSecret(secret: string): Buffer {
  const normalized = secret.trim();
  const decoded = Buffer.from(normalized, "base64");

  if (decoded.length < 32) {
    throw new Error("Invalid server configuration");
  }

  return decoded;
}

export function deriveEncryptionKey(decodedSecret: Buffer): Uint8Array {
  return createHash("sha256").update(decodedSecret).digest();
}

export function safeEqual(a: string, b: string): boolean {
  const left = textEncoder.encode(a);
  const right = textEncoder.encode(b);

  if (left.byteLength !== right.byteLength) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function stateDigest(state: string): string {
  return createHash("sha256").update(state).digest("base64url");
}

export async function sealSessionPayload(
  payload: SessionPayload,
  key: Uint8Array,
): Promise<string> {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
    .encrypt(key);
}

export async function unsealSessionPayload(
  token: string,
  key: Uint8Array,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, key);
    return sessionPayloadSchema.parse(payload);
  } catch {
    return null;
  }
}

export async function sealOAuthState(
  payload: OAuthStatePayload,
  key: Uint8Array,
): Promise<string> {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
    .encrypt(key);
}

export async function unsealOAuthState(
  token: string,
  key: Uint8Array,
): Promise<OAuthStatePayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, key);
    return oauthStateSchema.parse(payload);
  } catch {
    return null;
  }
}

export function createSessionPayload(
  claims: EklinkClaims,
  accessToken: string,
): SessionPayload {
  return {
    claims,
    access_token: accessToken,
    exp: claims.exp,
  };
}
