import { generateKeyPair, SignJWT, type JWTVerifyGetKey } from "jose";
import { beforeAll, describe, expect, it } from "vitest";

import { verifyAccessToken } from "@/lib/eklink/verify";
import { testClaims, testConfig } from "@/tests/helpers/auth";

let signingKey: CryptoKey;
let verificationKey: CryptoKey;
let alternateSigningKey: CryptoKey;
let keyResolver: JWTVerifyGetKey;

beforeAll(async () => {
  const primary = await generateKeyPair("RS256");
  const alternate = await generateKeyPair("RS256");
  signingKey = primary.privateKey;
  verificationKey = primary.publicKey;
  alternateSigningKey = alternate.privateKey;
  keyResolver = async () => verificationKey;
});

async function signToken(
  claimOverrides: Record<string, unknown> = {},
  options: { audience?: string; issuer?: string; key?: CryptoKey } = {},
) {
  return new SignJWT({ ...testClaims(), ...claimOverrides })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer(options.issuer ?? testConfig.issuer)
    .setAudience(options.audience ?? testConfig.clientId)
    .setExpirationTime(
      (claimOverrides.exp as number | undefined) ??
        Math.floor(Date.now() / 1000) + 900,
    )
    .sign(options.key ?? signingKey);
}

describe("verifyAccessToken", () => {
  it("accepts a valid token signed by a local keypair", async () => {
    const claims = await verifyAccessToken(await signToken(), {
      config: testConfig,
      keyResolver,
    });

    expect(claims.sub).toBe("person-1");
    expect(claims.role).toBe("student");
  });

  it("rejects the wrong audience", async () => {
    await expect(
      verifyAccessToken(await signToken({}, { audience: "other-client" }), {
        config: testConfig,
        keyResolver,
      }),
    ).rejects.toThrow();
  });

  it("rejects the wrong issuer", async () => {
    await expect(
      verifyAccessToken(await signToken({}, { issuer: "https://other.test" }), {
        config: testConfig,
        keyResolver,
      }),
    ).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    await expect(
      verifyAccessToken(
        await signToken({ exp: Math.floor(Date.now() / 1000) - 10 }),
        { config: testConfig, keyResolver },
      ),
    ).rejects.toThrow();
  });

  it("rejects a bad signature", async () => {
    await expect(
      verifyAccessToken(
        await signToken({}, { key: alternateSigningKey }),
        { config: testConfig, keyResolver },
      ),
    ).rejects.toThrow();
  });

  it("rejects alg none", async () => {
    const encode = (value: unknown) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    const token = `${encode({ alg: "none" })}.${encode({
      ...testClaims(),
      iss: testConfig.issuer,
      aud: testConfig.clientId,
    })}.`;

    await expect(
      verifyAccessToken(token, { config: testConfig, keyResolver }),
    ).rejects.toThrow();
  });

  it("rejects missing required claims", async () => {
    await expect(
      verifyAccessToken(await signToken({ email: undefined }), {
        config: testConfig,
        keyResolver,
      }),
    ).rejects.toThrow();
  });
});
