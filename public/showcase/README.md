# Showcase audio

These mp3s back the two showcase pieces.

- `*.mp3` (top level) — **The Living Engine** — eight versions used by
  `/the-living-engine` and `/the-living-engine/iterations`.
- `lullaby/*.mp3` — **The Wandering Lullaby** — ten versions used by
  `/the-wandering-lullaby` and `/the-wandering-lullaby/iterations`.

The files are committed to the repo so Cloudflare Pages can serve them on
deploy. They live at `/showcase/v{N}.mp3` and `/showcase/lullaby/v{N}.mp3`
in the published site.

## Re-source after a fresh checkout

The originals live in the [MusicDSL](https://github.com/zachxdev/MusicDSL)
repo. To rebuild from scratch:

```powershell
$src = "D:\GitHub\MusicDSL"
$dst = "D:\GitHub\wavelody-launchpad\public\showcase"
New-Item -ItemType Directory -Force "$dst\lullaby" | Out-Null

# The Living Engine — eight versions
$ravel = @{
  "smoke-master-v1-piano-pattern.mp3"                          = "v1.mp3"
  "smoke-master-v7-piano-ravel-suite.mp3"                      = "v7.mp3"
  "smoke-master-v8-piano-ravel-suite-revised.mp3"              = "v8.mp3"
  "smoke-master-v9-piano-ravel-suite-melted-clock.mp3"         = "v9.mp3"
  "smoke-master-v10-piano-ravel-suite-friction.mp3"            = "v10.mp3"
  "smoke-master-v11-piano-ravel-suite-crystallization.mp3"     = "v11.mp3"
  "smoke-master-v12-piano-ravel-suite-acoustic-bridge.mp3"     = "v12.mp3"
  "smoke-master-v13-piano-ravel-suite-living-engine.mp3"       = "v13.mp3"
}
foreach ($k in $ravel.Keys) {
  Copy-Item "$src\$k" "$dst\$($ravel[$k])" -Force
}

# The Wandering Lullaby — ten versions
1..10 | ForEach-Object {
  Copy-Item "$src\smoke-master-v$_-piano-medley-lyrical-fantasy.mp3" "$dst\lullaby\v$_.mp3" -Force
}
```
