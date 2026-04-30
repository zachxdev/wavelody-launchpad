// HS256 JWT sign + verify on top of the Web Crypto API. No external
// dependency — the Workers runtime ships crypto.subtle and so does Node 18+,
// which is what the unit tests run in.

import type { JwtPayload, Tier } from "./types";

export class JwtError extends Error {
  constructor(
    public readonly reason:
      | "malformed"
      | "signature"
      | "expired"
      | "payload",
    message: string,
  ) {
    super(message);
    this.name = "JwtError";
  }
}

const HEADER = { alg: "HS256", typ: "JWT" } as const;
const ENCODED_HEADER = base64urlEncodeString(JSON.stringify(HEADER));

const VALID_TIERS: ReadonlySet<Tier> = new Set<Tier>([
  "reviewer",
  "friend",
  "public",
]);

function base64urlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlEncodeString(input: string): string {
  return base64urlEncodeBytes(new TextEncoder().encode(input));
}

function base64urlDecodeBytes(input: string): Uint8Array {
  const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function base64urlDecodeString(input: string): string {
  return new TextDecoder().decode(base64urlDecodeBytes(input));
}

async function importHmacKey(
  secret: string,
  usage: "sign" | "verify",
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

export async function signJwt(
  payload: JwtPayload,
  secret: string,
): Promise<string> {
  const encPayload = base64urlEncodeString(JSON.stringify(payload));
  const data = `${ENCODED_HEADER}.${encPayload}`;
  const key = await importHmacKey(secret, "sign");
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return `${data}.${base64urlEncodeBytes(new Uint8Array(sig))}`;
}

export async function verifyJwt(
  token: string,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): Promise<JwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new JwtError("malformed", "Malformed JWT");
  }
  const [encHeader, encPayload, encSig] = parts;
  if (!encHeader || !encPayload || !encSig) {
    throw new JwtError("malformed", "Malformed JWT");
  }

  const key = await importHmacKey(secret, "verify");
  const data = `${encHeader}.${encPayload}`;
  let sigBytes: Uint8Array;
  try {
    sigBytes = base64urlDecodeBytes(encSig);
  } catch {
    throw new JwtError("malformed", "Malformed JWT signature");
  }
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(data),
  );
  if (!ok) {
    throw new JwtError("signature", "Invalid signature");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(base64urlDecodeString(encPayload));
  } catch {
    throw new JwtError("payload", "Invalid payload JSON");
  }
  const payload = parsePayload(raw);
  if (payload.exp < now) {
    throw new JwtError("expired", "Token expired");
  }
  return payload;
}

function parsePayload(raw: unknown): JwtPayload {
  if (!raw || typeof raw !== "object") {
    throw new JwtError("payload", "Invalid payload shape");
  }
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.sub !== "string" ||
    typeof obj.jti !== "string" ||
    typeof obj.iat !== "number" ||
    typeof obj.exp !== "number" ||
    typeof obj.tier !== "string" ||
    !VALID_TIERS.has(obj.tier as Tier)
  ) {
    throw new JwtError("payload", "Invalid payload shape");
  }
  return {
    sub: obj.sub,
    jti: obj.jti,
    iat: obj.iat,
    exp: obj.exp,
    tier: obj.tier as Tier,
  };
}

// Decode the payload without verifying the signature. Useful for clients
// that only need to read claims (e.g., expiry) and trust the server's
// signature check on subsequent calls.
export function decodeJwtUnsafe(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const raw = JSON.parse(base64urlDecodeString(parts[1])) as unknown;
    return parsePayload(raw);
  } catch {
    return null;
  }
}
