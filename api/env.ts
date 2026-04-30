// Worker runtime bindings. Imports KVNamespace from @cloudflare/workers-types,
// so this module is for Worker code only — do not import it from scripts/.

export interface Env {
  WAVELODY_CODES: KVNamespace;
  WAVELODY_JWT_SECRET: string;
}
