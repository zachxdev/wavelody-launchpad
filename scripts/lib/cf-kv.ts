// Tiny client for the Cloudflare KV REST API. Used by the CLI scripts
// (generate-codes, list-codes, killswitch) so they can manage the
// wavelody-codes namespace without spinning up `wrangler dev`.
//
// Required env (set in the shell before running):
//   CF_ACCOUNT_ID    — Cloudflare account id
//   CF_API_TOKEN     — token with KV Storage:Edit on the namespace
//   KV_NAMESPACE_ID  — the wavelody-codes namespace id

export interface CfKvConfig {
  accountId: string;
  apiToken: string;
  namespaceId: string;
}

export function loadConfig(): CfKvConfig {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const namespaceId = process.env.KV_NAMESPACE_ID;
  if (!accountId || !apiToken || !namespaceId) {
    throw new Error(
      "Missing env: CF_ACCOUNT_ID, CF_API_TOKEN, KV_NAMESPACE_ID — set them in your shell before running.",
    );
  }
  return { accountId, apiToken, namespaceId };
}

function baseUrl(cfg: CfKvConfig): string {
  return (
    `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}` +
    `/storage/kv/namespaces/${cfg.namespaceId}`
  );
}

function authHeaders(cfg: CfKvConfig): Record<string, string> {
  return { Authorization: `Bearer ${cfg.apiToken}` };
}

export async function putKey(
  cfg: CfKvConfig,
  key: string,
  value: string,
): Promise<void> {
  const url = `${baseUrl(cfg)}/values/${encodeURIComponent(key)}`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(cfg), "Content-Type": "text/plain" },
    body: value,
  });
  if (!resp.ok) {
    throw new Error(
      `KV PUT ${key} failed (${resp.status}): ${await resp.text()}`,
    );
  }
}

export async function getKey(
  cfg: CfKvConfig,
  key: string,
): Promise<string | null> {
  const url = `${baseUrl(cfg)}/values/${encodeURIComponent(key)}`;
  const resp = await fetch(url, { headers: authHeaders(cfg) });
  if (resp.status === 404) return null;
  if (!resp.ok) {
    throw new Error(
      `KV GET ${key} failed (${resp.status}): ${await resp.text()}`,
    );
  }
  return resp.text();
}

export async function deleteKey(
  cfg: CfKvConfig,
  key: string,
): Promise<void> {
  const url = `${baseUrl(cfg)}/values/${encodeURIComponent(key)}`;
  const resp = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(cfg),
  });
  if (!resp.ok && resp.status !== 404) {
    throw new Error(
      `KV DELETE ${key} failed (${resp.status}): ${await resp.text()}`,
    );
  }
}

export interface ListedKey {
  name: string;
  expiration?: number;
  metadata?: Record<string, unknown>;
}

interface ListResponse {
  result: ListedKey[];
  result_info: { count: number; cursor: string };
  success: boolean;
}

export async function listKeys(
  cfg: CfKvConfig,
  prefix?: string,
): Promise<ListedKey[]> {
  const out: ListedKey[] = [];
  let cursor: string | undefined;
  do {
    const params = new URLSearchParams();
    if (prefix) params.set("prefix", prefix);
    if (cursor) params.set("cursor", cursor);
    const url = `${baseUrl(cfg)}/keys?${params.toString()}`;
    const resp = await fetch(url, { headers: authHeaders(cfg) });
    if (!resp.ok) {
      throw new Error(
        `KV list failed (${resp.status}): ${await resp.text()}`,
      );
    }
    const body = (await resp.json()) as ListResponse;
    out.push(...body.result);
    cursor = body.result_info.cursor || undefined;
  } while (cursor);
  return out;
}
