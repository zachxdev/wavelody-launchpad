// In-memory R2 shim for the render-cache tests. Like kv-mock, we only
// implement the subset the production code uses (head, put, get) and
// cast to R2Bucket via asR2() at the test boundary.

interface StoredObject {
  body: ArrayBuffer;
  httpMetadata?: { contentType?: string };
}

export class MockR2 {
  private store = new Map<string, StoredObject>();

  async head(key: string): Promise<{ key: string } | null> {
    return this.store.has(key) ? { key } : null;
  }

  async get(key: string): Promise<{ body: ArrayBuffer } | null> {
    const v = this.store.get(key);
    return v ? { body: v.body } : null;
  }

  async put(
    key: string,
    body: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<void> {
    const buf =
      body instanceof ArrayBuffer
        ? body
        : (body.buffer.slice(
            body.byteOffset,
            body.byteOffset + body.byteLength,
          ) as ArrayBuffer);
    this.store.set(key, { body: buf, httpMetadata: options?.httpMetadata });
  }

  // Test helpers — not part of R2Bucket.
  raw(): ReadonlyMap<string, StoredObject> {
    return this.store;
  }

  size(): number {
    return this.store.size;
  }
}

export function asR2(mock: MockR2): R2Bucket {
  return mock as unknown as R2Bucket;
}
