# Wavelody — Speedrun demo site

Speedrun-only codename for the Sympharia demo site. Public name is
Wavelody; internal product is Sympharia. The demo proves three claims that
distinguish Sympharia from end-to-end audio generators (Suno, Udio,
MusicGen):

1. Prompt → composed music that sounds good
2. The composition is **inspectable and editable** before render
3. Same engine, two skins (Vibemuse referenced, not built)

The full build spec lives in Notion (`Wavelody — Speedrun Demo Site Build
Spec`). This README documents what currently ships and how to operate the
auth + rate-limit backend during the Speedrun review window.

## Repository layout

```
src/                       Frontend (Lovable-generated landing + Claude Code workspace)
  pages/                   Landing, AuthSuccess, Workspace
  components/landing/      Lovable-owned, do not iterate
  components/shell/        Workspace shell (TopBar, mixer, prompt dock, transport)
  components/editor/       Piano roll + MDSL grid score views
  lib/audio/               Tone.js transport + per-voice stem playback
  lib/musicdsl/            Parser, serializer, AST types (MusicDSL v2.2)
  lib/auth/                Client-side auth helpers (postAuth / getSession)
api/                       Cloudflare Workers backend (Phase 7+)
  auth.ts                  POST /api/auth — code → JWT
  me.ts                    GET  /api/me   — read quota state
  generate.ts edit.ts      Stubbed endpoints (Phase 7); Phase 8 fills in
    render.ts critique.ts  the Claude / Gemini / RunPod proxies
  middleware.ts            JWT verify + quota gate + killswitch + inflight lock
  jwt.ts                   HS256 sign + verify (Web Crypto, no external dep)
  index.ts                 Worker entrypoint, routes /api/*
scripts/                   Node CLI tools for the wavelody-codes namespace
  generate-codes.ts        Mint reviewer / friend / public codes
  list-codes.ts            Inspect codes + counters during the review window
  killswitch.ts            Flip the global $-ceiling killswitch
  lib/cf-kv.ts             Cloudflare KV REST client
wrangler.toml              Worker config (deploy lives in Phase 9)
```

## Quality gates

Run before every push:

```bash
npm run lint              # eslint .
npm run test              # vitest run (frontend + api)
npm run build             # vite build
npm run typecheck:api     # tsc -p tsconfig.api.json --noEmit
npm run typecheck:scripts # tsc -p tsconfig.scripts.json --noEmit
```

The gate has been clean through Phase 7. New code is TypeScript strict
with zero `any`.

## Local development

```bash
npm install
npm run dev               # Vite dev server on http://localhost:8080
```

The frontend posts to `/api/auth` etc. To exercise the real backend
locally, run a Worker dev server alongside (Phase 9 documents the
`wrangler dev` setup); for unit testing the auth / middleware paths the
in-memory KV mock at `api/test/kv-mock.ts` is enough.

## Operating the auth + rate-limit backend

### Tier table (Build Spec v1.7)

| Tier | Generations | Edits | Expires | Code prefix |
| --- | --- | --- | --- | --- |
| Reviewer | 20 | 60 | 30 days | `speedrun-` |
| Friend | 10 | 30 | 60 days | `friend-` |
| Public | 3 | 5 | 7 days | `pub-` |

### Required environment

The CLI scripts read the Cloudflare KV REST API directly. Set these in
your shell before running any of `generate-codes`, `list-codes`, or
`killswitch`:

```bash
export CF_ACCOUNT_ID=...
export CF_API_TOKEN=...        # token with KV Storage:Edit on the namespace
export KV_NAMESPACE_ID=...     # the wavelody-codes namespace id
```

### Generate the initial code batch

Per spec, mint:
- 10 reviewer codes (named partners)
- 10 friend codes
- 20 public codes

```bash
# Reviewer codes — one per partner, named:
npx tsx scripts/generate-codes.ts --tier reviewer \
  --suffix andrew-c --label "Andrew Chen, a16z"

# Friend codes:
npx tsx scripts/generate-codes.ts --tier friend \
  --suffix jakob --label "Jakob Sandvik"

# Public codes — bulk, anonymous:
npx tsx scripts/generate-codes.ts --bulk public --count 20
```

Each invocation prints one tab-separated line per code
(`code  tier  label  expires_at`) — pipe to a file or paste straight
into a Notion table.

### Inspect codes during the review window

```bash
npx tsx scripts/list-codes.ts                    # all codes
npx tsx scripts/list-codes.ts --tier reviewer    # filter by tier
npx tsx scripts/list-codes.ts --json             # machine-readable
```

Output is sorted reviewer → friend → public, then `last_seen_at` desc so
codes that were active recently float to the top. Counter columns show
`gens_used/gens_max edits_used/edits_max`.

### Flip the killswitch

When the daily RunPod / API spend approaches the conservative $50/day
ceiling, flip the killswitch to ON. `/api/generate` and `/api/render`
will return 503 with a "Demo paused for the day, back tomorrow." body.
`/api/edit` and `/api/critique` are unaffected (cheap by comparison).

```bash
npx tsx scripts/killswitch.ts on
npx tsx scripts/killswitch.ts off
npx tsx scripts/killswitch.ts status
```

Phase 8 will wire automatic cost accounting; until then this is a manual
lever you watch the spend and flip yourself.

## What ships in Phase 7

- `POST /api/auth` — code → 7-day HS256 JWT + SessionInfo
- `GET  /api/me` — current quota state (counters + max + expires_at)
- `POST /api/generate` — stub (501); auth + killswitch + inflight +
  generation-quota gate is live and increments `generations_used`
- `POST /api/edit` — stub (501); auth + edit-quota gate is live
- `POST /api/render` — stub (501); auth + killswitch + generation-quota
  gate is live
- `POST /api/critique` — stub (501); auth + dual-quota gate is live
- Sliding 7-day refresh: every authed call returns `X-Refreshed-Token`
  with a fresh JWT for the client to swap into sessionStorage
- `AccessCodeForm` posts to the real backend, surfaces server messages
  on 401 / 429 / 5xx, falls back to a network-error message on
  `TypeError`. Successful auth lands in `sessionStorage[wavelody-session]`
  as `{ token, info }` and the workspace gates rendering on
  `getSession()` decoding the JWT shape + checking expiry.

Phase 7 does **not** deploy. Phase 9 owns deploy
(`wrangler deploy` + Cloudflare Pages build).

## Running just the api tests

```bash
npm run test -- api/      # vitest, node environment per file
```

Tests use an in-memory KV shim (`api/test/kv-mock.ts`) cast to
`KVNamespace` at the test boundary — no network, no real KV.
