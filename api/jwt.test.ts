// @vitest-environment node
import { describe, expect, it } from "vitest";
import { decodeJwtUnsafe, JwtError, signJwt, verifyJwt } from "./jwt";
import type { JwtPayload } from "./types";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

function makePayload(overrides: Partial<JwtPayload> = {}): JwtPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: "speedrun-andrew-c",
    tier: "reviewer",
    jti: "00000000-0000-4000-8000-000000000000",
    iat: now,
    exp: now + 3600,
    ...overrides,
  };
}

describe("jwt", () => {
  it("signs + verifies round trip with same payload", async () => {
    const payload = makePayload();
    const token = await signJwt(payload, SECRET);
    expect(token.split(".").length).toBe(3);
    const verified = await verifyJwt(token, SECRET);
    expect(verified).toEqual(payload);
  });

  it("rejects wrong-secret signature", async () => {
    const token = await signJwt(makePayload(), SECRET);
    await expect(verifyJwt(token, "different-secret")).rejects.toBeInstanceOf(
      JwtError,
    );
    await expect(verifyJwt(token, "different-secret")).rejects.toMatchObject({
      reason: "signature",
    });
  });

  it("rejects expired token", async () => {
    const payload = makePayload({ exp: Math.floor(Date.now() / 1000) - 1 });
    const token = await signJwt(payload, SECRET);
    await expect(verifyJwt(token, SECRET)).rejects.toMatchObject({
      reason: "expired",
    });
  });

  it("rejects tampered payload", async () => {
    const token = await signJwt(makePayload(), SECRET);
    // Flip the "sub" claim: re-encode with the same signature.
    const [h, p, s] = token.split(".");
    const tampered = JSON.parse(
      Buffer.from(p, "base64").toString("utf8"),
    ) as JwtPayload;
    tampered.sub = "speedrun-someone-else";
    const newPayload = Buffer.from(JSON.stringify(tampered))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const tamperedToken = `${h}.${newPayload}.${s}`;
    await expect(verifyJwt(tamperedToken, SECRET)).rejects.toMatchObject({
      reason: "signature",
    });
  });

  it("rejects malformed token (not three parts)", async () => {
    await expect(verifyJwt("only.two", SECRET)).rejects.toMatchObject({
      reason: "malformed",
    });
    await expect(verifyJwt("a.b.c.d", SECRET)).rejects.toMatchObject({
      reason: "malformed",
    });
  });

  it("decodeJwtUnsafe returns the payload without verifying signature", async () => {
    const payload = makePayload();
    const token = await signJwt(payload, SECRET);
    expect(decodeJwtUnsafe(token)).toEqual(payload);
    expect(decodeJwtUnsafe("garbage")).toBeNull();
  });
});
