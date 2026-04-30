// In-memory KV shim that the middleware tests run against. The full
// @cloudflare/workers-types KVNamespace interface has many typed overloads
// we don't implement; the mock provides the methods we actually use
// (get / put / delete / list / getWithMetadata) and tests cast the mock
// to KVNamespace via asKv() at the test boundary.
//
// KVNamespace and KVNamespaceListResult come from the ambient
// @cloudflare/workers-types/2023-07-01 globals declared in tsconfig.api.json's
// "types"; importing them from the package root would pick up a newer typed
// shape and conflict with the global one.

export class MockKv {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(): Promise<KVNamespaceListResult<unknown, string>> {
    return {
      keys: [...this.store.keys()].map((name) => ({ name })),
      list_complete: true,
      cacheStatus: null,
    };
  }

  async getWithMetadata(
    key: string,
  ): Promise<{ value: string | null; metadata: null; cacheStatus: null }> {
    return {
      value: this.store.get(key) ?? null,
      metadata: null,
      cacheStatus: null,
    };
  }

  // Test-only helpers — not part of the KVNamespace interface.
  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  raw(): ReadonlyMap<string, string> {
    return this.store;
  }

  size(): number {
    return this.store.size;
  }
}

export function asKv(mock: MockKv): KVNamespace {
  return mock as unknown as KVNamespace;
}
