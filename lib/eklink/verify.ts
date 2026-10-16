import "server-only";

import {
  createRemoteJWKSet,
  type JWTVerifyGetKey,
  jwtVerify,
} from "jose";

import { eklinkClaimsSchema, type EklinkClaims } from "@/lib/eklink/claims";
import { getEklinkConfig, type EklinkConfig } from "@/lib/eklink/config";

type VerifyAccessTokenOptions = {
  config?: EklinkConfig;
  keyResolver?: JWTVerifyGetKey;
};

const remoteKeyResolvers = new Map<string, JWTVerifyGetKey>();

function getRemoteKeyResolver(url: URL): JWTVerifyGetKey {
  const cacheKey = url.toString();
  const existing = remoteKeyResolvers.get(cacheKey);
  if (existing) {
    return existing;
  }

  const resolver = createRemoteJWKSet(url);
  remoteKeyResolvers.set(cacheKey, resolver);
  return resolver;
}

export async function verifyAccessToken(
  accessToken: string,
  options: VerifyAccessTokenOptions = {},
): Promise<EklinkClaims> {
  const config = options.config ?? getEklinkConfig();
  const jwksUrl = new URL("/.well-known/jwks.json", config.eklinkUrl);
  const keyResolver = options.keyResolver ?? getRemoteKeyResolver(jwksUrl);

  const { payload } = await jwtVerify(accessToken, keyResolver, {
    issuer: config.issuer,
    audience: config.clientId,
    algorithms: ["RS256", "ES256"],
  });

  return eklinkClaimsSchema.parse(payload);
}
